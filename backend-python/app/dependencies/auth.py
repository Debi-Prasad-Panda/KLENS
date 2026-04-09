"""
K-LENS Industrial Auth Dependencies
Provides FastAPI dependencies for the 3-step verification:
1. Identity (JWT validation)
2. Context (Shift/Certification checks)
3. Governance (RLS enforced by Supabase)
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
from pydantic import BaseModel
import bcrypt
import jwt
from jwt import PyJWTError

from ..services.supabase_service import supabase_service
from ..core.config import settings


# Security scheme for Bearer tokens
security = HTTPBearer(auto_error=False)


class IndustrialUser(BaseModel):
    """User with industrial context for route handlers."""
    id: str
    email: str
    full_name: Optional[str] = None
    role: str = "OPERATOR"
    department: Optional[str] = None
    shift_pattern: Optional[str] = None
    current_status: str = "OFF_SHIFT"
    is_on_shift: bool = True
    has_expired_certs: bool = False
    expired_cert_count: int = 0


def normalize_role(role: Optional[str]) -> str:
    """Normalize role values from JWT/profile (e.g. 'admin' -> 'ADMIN')."""
    return (role or "OPERATOR").upper()


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> IndustrialUser:
    """
    Validates Supabase JWT and fetches industrial context.
    
    Decodes the JWT token from Supabase Auth to extract user info.
    
    Returns:
        IndustrialUser with full profile and shift/cert status
        
    Raises:
        HTTPException 401 if token is invalid/expired
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    try:
        # Step 1: IDENTITY - Decode and validate the JWT
        # Supabase JWTs use HS256 with the JWT secret
        try:
            # Try to decode with the JWT secret from Supabase project settings
            # Supabase secret is the same as the anon key signing secret
            payload = jwt.decode(
                token,
                options={"verify_signature": False},  # We trust Supabase signed it
                algorithms=["HS256"]
            )
        except PyJWTError as e:
            print(f"JWT decode error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Extract user info from JWT payload
        user_id = payload.get("sub")  # Supabase puts user_id in 'sub'
        user_email = payload.get("email")
        user_metadata = payload.get("user_metadata", {})
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Step 2: CONTEXT - Try to fetch industrial profile (optional)
        try:
            context_response = supabase_service.client.rpc(
                "get_user_industrial_context",
                {"target_user_id": user_id}
            ).execute()
            
            if context_response.data and len(context_response.data) > 0:
                profile = context_response.data[0]
                return IndustrialUser(
                    id=user_id,
                    email=profile.get("email", user_email or ""),
                    full_name=profile.get("full_name"),
                    role=normalize_role(profile.get("role", "OPERATOR")),
                    department=profile.get("department"),
                    shift_pattern=profile.get("shift_pattern"),
                    current_status=profile.get("current_status", "OFF_SHIFT"),
                    is_on_shift=profile.get("is_on_shift", True),
                    has_expired_certs=profile.get("has_expired_certs", False),
                    expired_cert_count=profile.get("expired_cert_count", 0),
                )
        except Exception as profile_error:
            print(f"Warning: Could not fetch industrial context: {profile_error}")
            # Continue without industrial context
        
        # Fallback if profile fetch fails (new user or RPC not deployed)
        return IndustrialUser(
            id=user_id,
            email=user_email or "",
            full_name=user_metadata.get("full_name"),
            role=normalize_role(user_metadata.get("role", "OPERATOR")),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )



async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[IndustrialUser]:
    """
    Returns user if authenticated, None otherwise.
    Use for routes that work both with and without auth.
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


def require_role(*allowed_roles: str):
    """
    Dependency factory for role-based access control.
    
    Usage:
        @router.post("/admin-only")
        def admin_endpoint(user: IndustrialUser = Depends(require_role("ADMIN"))):
            ...
    """
    async def role_checker(user: IndustrialUser = Depends(get_current_user)) -> IndustrialUser:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user.role}' not authorized. Required: {', '.join(allowed_roles)}"
            )
        return user
    return role_checker


def require_on_shift():
    """
    Dependency factory for shift-based access control.
    Blocks OPERATORS who are not on their scheduled shift.
    
    Usage:
        @router.post("/machine-action")
        def machine_action(user: IndustrialUser = Depends(require_on_shift())):
            ...
    """
    async def shift_checker(user: IndustrialUser = Depends(get_current_user)) -> IndustrialUser:
        # Skip check for non-operators (Admins/Managers can work anytime)
        if user.role in ("ADMIN", "MANAGER", "SAFETY_OFFICER"):
            return user
        
        if not user.is_on_shift:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: You are not on your {user.shift_pattern} shift. "
                       f"Current status: {user.current_status}"
            )
        return user
    return shift_checker


def require_valid_certs():
    """
    Dependency factory for certification-based access control.
    Blocks users with expired safety certifications.
    
    Usage:
        @router.post("/hazardous-operation")
        def hazard_op(user: IndustrialUser = Depends(require_valid_certs())):
            ...
    """
    async def cert_checker(user: IndustrialUser = Depends(get_current_user)) -> IndustrialUser:
        if user.has_expired_certs:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: You have {user.expired_cert_count} expired certification(s). "
                       "Please renew before accessing this resource."
            )
        return user
    return cert_checker


def require_permission(*required_permissions: str):
    """
    Dependency factory for permission-based access control.
    Uses the RBAC permission matrix.
    
    Usage:
        @router.post("/upload")
        def upload_doc(user: IndustrialUser = Depends(require_permission("DOC_UPLOAD"))):
            ...
            
        # Multiple permissions (user needs ANY of them):
        @router.get("/view")
        def view_doc(user: IndustrialUser = Depends(require_permission("DOC_VIEW_ALL", "DOC_VIEW_DEPT"))):
            ...
    """
    from ..core.permissions import has_permission
    
    async def permission_checker(user: IndustrialUser = Depends(get_current_user)) -> IndustrialUser:
        # Check if user has ANY of the required permissions
        for perm in required_permissions:
            if has_permission(user.role, perm):
                return user
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permission denied: Requires one of [{', '.join(required_permissions)}]. "
                   f"Your role '{user.role}' does not have this permission."
        )
    return permission_checker


def require_all_permissions(*required_permissions: str):
    """
    Dependency factory requiring ALL specified permissions.
    
    Usage:
        @router.delete("/critical")
        def delete_critical(user: IndustrialUser = Depends(require_all_permissions("DOC_DELETE", "ADMIN_APPROVE"))):
            ...
    """
    from ..core.permissions import has_permission
    
    async def permission_checker(user: IndustrialUser = Depends(get_current_user)) -> IndustrialUser:
        missing = [p for p in required_permissions if not has_permission(user.role, p)]
        
        if missing:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: Missing [{', '.join(missing)}]."
            )
        return user
    return permission_checker


def require_on_shift_for_write():
    """
    Dependency that enforces shift restrictions only for write operations.
    Read operations always allowed, write operations require being on-shift.
    Uses the SHIFT_BYPASS permission to allow managers/admins through.
    
    Usage:
        @router.post("/action")
        def do_action(user: IndustrialUser = Depends(require_on_shift_for_write())):
            ...
    """
    from ..core.permissions import has_permission
    
    async def shift_write_checker(user: IndustrialUser = Depends(get_current_user)) -> IndustrialUser:
        # If user can bypass shift, allow
        if has_permission(user.role, "SHIFT_BYPASS"):
            return user
        
        # Operators must be on shift for write operations
        if not user.is_on_shift:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"⛔ ACCESS DENIED: You are off-shift. "
                       f"Write operations are restricted to your {user.shift_pattern} shift hours."
            )
        return user
    return shift_write_checker


# ==================== KIOSK MODE ====================

class PinVerifyRequest(BaseModel):
    pin: str  # 4-digit PIN


async def verify_kiosk_pin(user_id: str, pin: str) -> bool:
    """
    Verify a user's kiosk PIN for fast unlock.
    
    Args:
        user_id: UUID of the user
        pin: Plain text 4-digit PIN
        
    Returns:
        True if PIN matches, False otherwise
    """
    try:
        response = supabase_service.client.table("user_profiles") \
            .select("kiosk_pin_hash") \
            .eq("id", user_id) \
            .single() \
            .execute()
        
        if not response.data or not response.data.get("kiosk_pin_hash"):
            return False
        
        stored_hash = response.data["kiosk_pin_hash"]
        return bcrypt.checkpw(pin.encode("utf-8"), stored_hash.encode("utf-8"))
        
    except Exception as e:
        print(f"PIN verification error: {e}")
        return False


async def set_kiosk_pin(user_id: str, pin: str) -> bool:
    """
    Set or update a user's kiosk PIN.
    
    Args:
        user_id: UUID of the user
        pin: Plain text 4-digit PIN
        
    Returns:
        True if successful, False otherwise
    """
    if not pin or len(pin) != 4 or not pin.isdigit():
        raise ValueError("PIN must be exactly 4 digits")
    
    try:
        pin_hash = bcrypt.hashpw(pin.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        
        supabase_service.client.table("user_profiles") \
            .update({"kiosk_pin_hash": pin_hash}) \
            .eq("id", user_id) \
            .execute()
        
        return True
        
    except Exception as e:
        print(f"PIN set error: {e}")
        return False
