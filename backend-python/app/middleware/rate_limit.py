"""
Rate Limiting Middleware for K-LENS API
Implements IP-based and user-based rate limiting using Redis.

OWASP Best Practices:
- Prevents brute force attacks on authentication endpoints
- Mitigates DoS attacks by limiting requests per time window
- Implements sliding window algorithm for accurate rate limiting
- Returns standard 429 Too Many Requests with Retry-After header
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Optional, Dict, Tuple
import redis
import time
import hashlib
from ..core.config import settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware with IP and user-based throttling.
    
    Rate Limits (configurable):
    - Authentication endpoints: 5 requests per minute (IP-based)
    - Upload endpoints: 10 requests per minute (user-based)
    - Search endpoints: 30 requests per minute (user-based)
    - Chat endpoints: 20 requests per minute (user-based)
    - Default: 100 requests per minute (IP-based)
    
    Uses Redis for distributed rate limiting (production-ready).
    Falls back to in-memory dict if Redis is unavailable (development).
    """
    
    def __init__(self, app):
        super().__init__(app)
        
        # Initialize Redis connection
        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=2
            )
            # Test connection
            self.redis_client.ping()
            self.use_redis = True
            print("✅ Rate Limiting: Redis connected")
        except Exception as e:
            print(f"⚠️ Rate Limiting: Redis unavailable ({e}), using in-memory fallback")
            self.use_redis = False
            self.memory_store: Dict[str, list] = {}
        
        # Rate limit configurations: {endpoint_pattern: (requests, seconds, scope)}
        # scope: "ip" or "user"
        self.rate_limits = {
            # Authentication - strict IP-based limits to prevent brute force
            "/api/auth/login": (5, 60, "ip"),
            "/api/auth/register": (3, 60, "ip"),
            "/api/auth-legacy/login": (5, 60, "ip"),
            "/api/auth-legacy/register": (3, 60, "ip"),
            
            # Upload - user-based limits to prevent spam
            "/api/upload": (10, 60, "user"),
            
            # Search - reasonable limits for AI-powered search
            "/api/search": (30, 60, "user"),
            
            # Chat - AI chat limits to manage API costs
            "/api/chat": (20, 60, "user"),
            
            # Document operations - user-based
            "/api/documents": (50, 60, "user"),
            
            # Admin operations - stricter limits
            "/api/users": (20, 60, "user"),
            "/api/roles": (20, 60, "user"),
            
            # Default limit for other endpoints
            "_default": (100, 60, "ip"),
        }
    
    def _get_rate_limit(self, path: str) -> Tuple[int, int, str]:
        """
        Get rate limit configuration for a given path.
        
        Returns:
            Tuple of (max_requests, time_window_seconds, scope)
        """
        # Check for exact match first
        for pattern, config in self.rate_limits.items():
            if pattern == "_default":
                continue
            if path.startswith(pattern):
                return config
        
        # Return default
        return self.rate_limits["_default"]
    
    def _get_client_identifier(self, request: Request, scope: str) -> str:
        """
        Get unique identifier for rate limiting based on scope.
        
        Args:
            request: FastAPI request object
            scope: Either "ip" or "user"
        
        Returns:
            Unique identifier string
        """
        if scope == "user":
            # Try to get user ID from state (set by auth dependency)
            user = getattr(request.state, "user", None)
            if user:
                user_id = getattr(user, "id", None) or getattr(user, "user_id", None)
                if user_id:
                    return f"user:{user_id}"
        
        # Fall back to IP-based
        # Support both direct connections and proxy headers
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"
        
        return f"ip:{client_ip}"
    
    def _check_rate_limit_redis(
        self, 
        key: str, 
        max_requests: int, 
        window_seconds: int
    ) -> Tuple[bool, int, int]:
        """
        Check rate limit using Redis (sliding window algorithm).
        
        Returns:
            Tuple of (is_allowed, remaining_requests, retry_after_seconds)
        """
        try:
            current_time = time.time()
            window_start = current_time - window_seconds
            
            # Redis key for this rate limit
            redis_key = f"ratelimit:{key}"
            
            # Remove old entries outside the window
            self.redis_client.zremrangebyscore(redis_key, 0, window_start)
            
            # Count requests in current window
            request_count = self.redis_client.zcard(redis_key)
            
            if request_count >= max_requests:
                # Get oldest request in window to calculate retry time
                oldest = self.redis_client.zrange(redis_key, 0, 0, withscores=True)
                if oldest:
                    retry_after = int(oldest[0][1] + window_seconds - current_time) + 1
                else:
                    retry_after = window_seconds
                
                return False, 0, retry_after
            
            # Add current request
            self.redis_client.zadd(redis_key, {str(current_time): current_time})
            
            # Set expiration on the key
            self.redis_client.expire(redis_key, window_seconds)
            
            remaining = max_requests - request_count - 1
            return True, remaining, 0
            
        except Exception as e:
            print(f"Rate limit Redis error: {e}")
            # On error, allow the request (fail open for availability)
            return True, max_requests, 0
    
    def _check_rate_limit_memory(
        self, 
        key: str, 
        max_requests: int, 
        window_seconds: int
    ) -> Tuple[bool, int, int]:
        """
        Check rate limit using in-memory store (fallback for development).
        
        Returns:
            Tuple of (is_allowed, remaining_requests, retry_after_seconds)
        """
        current_time = time.time()
        window_start = current_time - window_seconds
        
        # Get or create request list for this key
        if key not in self.memory_store:
            self.memory_store[key] = []
        
        # Remove old requests outside the window
        self.memory_store[key] = [
            req_time for req_time in self.memory_store[key]
            if req_time > window_start
        ]
        
        request_count = len(self.memory_store[key])
        
        if request_count >= max_requests:
            # Calculate retry time based on oldest request
            retry_after = int(self.memory_store[key][0] + window_seconds - current_time) + 1
            return False, 0, retry_after
        
        # Add current request
        self.memory_store[key].append(current_time)
        
        remaining = max_requests - request_count - 1
        return True, remaining, 0
    
    async def dispatch(self, request: Request, call_next):
        """
        Main middleware dispatch method.
        """
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/"]:
            return await call_next(request)
        
        # Get rate limit config for this endpoint
        max_requests, window_seconds, scope = self._get_rate_limit(request.url.path)
        
        # Get client identifier
        client_id = self._get_client_identifier(request, scope)
        
        # Create rate limit key
        rate_limit_key = f"{request.url.path}:{client_id}"
        
        # Check rate limit
        if self.use_redis:
            is_allowed, remaining, retry_after = self._check_rate_limit_redis(
                rate_limit_key, max_requests, window_seconds
            )
        else:
            is_allowed, remaining, retry_after = self._check_rate_limit_memory(
                rate_limit_key, max_requests, window_seconds
            )
        
        # Add rate limit headers to response
        headers = {
            "X-RateLimit-Limit": str(max_requests),
            "X-RateLimit-Remaining": str(remaining),
            "X-RateLimit-Reset": str(int(time.time()) + window_seconds),
        }
        
        if not is_allowed:
            # Return 429 Too Many Requests with graceful error message
            headers["Retry-After"] = str(retry_after)
            
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Please try again in {retry_after} seconds.",
                    "retry_after": retry_after,
                    "limit": max_requests,
                    "window": f"{window_seconds} seconds"
                },
                headers=headers
            )
        
        # Process request and add headers to response
        response = await call_next(request)
        
        # Add rate limit headers to successful response
        for header_key, header_value in headers.items():
            response.headers[header_key] = header_value
        
        return response
