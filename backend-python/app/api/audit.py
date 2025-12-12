"""
Audit Logging API - Records and retrieves user actions
Provides real-time tracking for the Audit Trail feature
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from enum import Enum

# Import Supabase client and auth dependency
from ..services.supabase_service import supabase_service
from ..dependencies.auth import get_current_user, IndustrialUser


router = APIRouter(prefix="/audit", tags=["Audit Trail"])


# ==================== Enums ====================

class AuditAction(str, Enum):
    VIEW = "VIEW"
    CREATE = "CREATE"
    EDIT = "EDIT"
    DELETE = "DELETE"
    REVERT = "REVERT"
    APPROVE = "APPROVE"
    REJECT = "REJECT"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    EXPORT = "EXPORT"
    PERMISSION_CHANGE = "PERMISSION_CHANGE"
    UPLOAD = "UPLOAD"
    DOWNLOAD = "DOWNLOAD"
    SEARCH = "SEARCH"
    SYSTEM = "SYSTEM"


class AuditCategory(str, Enum):
    DOCUMENT = "DOCUMENT"
    USER = "USER"
    SYSTEM = "SYSTEM"
    SECURITY = "SECURITY"
    COMPLIANCE = "COMPLIANCE"


class AuditSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


# ==================== Schemas ====================

class AuditLogCreate(BaseModel):
    action: AuditAction
    category: AuditCategory
    severity: AuditSeverity = AuditSeverity.INFO
    resource_type: str
    resource_id: Optional[str] = None
    resource_name: str
    metadata: Optional[Dict[str, Any]] = None


class AuditLogResponse(BaseModel):
    id: str
    action: str
    category: str
    severity: str
    user_id: str
    user_name: str
    user_email: str
    user_role: str
    resource_type: str
    resource_id: Optional[str]
    resource_name: str
    metadata: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime


class AuditStatsResponse(BaseModel):
    total: int
    today: int
    critical_count: int
    unique_users: int
    action_counts: Dict[str, int]


# ==================== Helper Functions ====================

def get_client_ip(request) -> str:
    """Extract client IP from request headers"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# ==================== Endpoints ====================

@router.post("/log", response_model=AuditLogResponse)
async def create_audit_log(
    log_data: AuditLogCreate,
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Create a new audit log entry.
    Called automatically by frontend when user performs actions.
    """
    try:
        # Build the log entry
        log_entry = {
            "action": log_data.action.value,
            "category": log_data.category.value,
            "severity": log_data.severity.value,
            "user_id": current_user.id,
            "user_name": current_user.full_name or "Unknown",
            "user_email": current_user.email or "unknown@local",
            "user_role": current_user.role or "OPERATOR",
            "resource_type": log_data.resource_type,
            "resource_id": log_data.resource_id,
            "resource_name": log_data.resource_name,
            "metadata": log_data.metadata or {},
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Insert into Supabase
        result = supabase_service.client.table("audit_logs").insert(log_entry).execute()
        
        if result.data:
            return AuditLogResponse(**result.data[0])
        else:
            raise HTTPException(status_code=500, detail="Failed to create audit log")
            
    except Exception as e:
        print(f"Audit log error: {e}")
        # Don't fail the request if audit logging fails
        # Return a mock response so frontend doesn't break
        return AuditLogResponse(
            id="local-" + datetime.utcnow().isoformat(),
            action=log_data.action.value,
            category=log_data.category.value,
            severity=log_data.severity.value,
            user_id=current_user.id or "unknown",
            user_name=current_user.full_name or "Unknown",
            user_email=current_user.email or "unknown@local",
            user_role=current_user.role or "OPERATOR",
            resource_type=log_data.resource_type,
            resource_id=log_data.resource_id,
            resource_name=log_data.resource_name,
            metadata=log_data.metadata,
            ip_address=None,
            user_agent=None,
            created_at=datetime.utcnow()
        )


@router.get("/logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
    action: Optional[str] = None,
    category: Optional[str] = None,
    severity: Optional[str] = None,
    user_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    search: Optional[str] = None,
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Get audit logs with filtering.
    Supports pagination, filtering by action/category/severity/user, and date range.
    """
    try:
        query = supabase_service.client.table("audit_logs").select("*")
        
        # Apply filters
        if action:
            query = query.eq("action", action)
        if category:
            query = query.eq("category", category)
        if severity:
            query = query.eq("severity", severity)
        if user_id:
            query = query.eq("user_id", user_id)
        if date_from:
            query = query.gte("created_at", date_from)
        if date_to:
            query = query.lte("created_at", date_to)
        if search:
            query = query.or_(f"resource_name.ilike.%{search}%,user_name.ilike.%{search}%")
        
        # Order by newest first and paginate
        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        
        result = query.execute()
        
        return [AuditLogResponse(**log) for log in result.data]
        
    except Exception as e:
        print(f"Error fetching audit logs: {e}")
        # Return empty list on error
        return []


@router.get("/stats", response_model=AuditStatsResponse)
async def get_audit_stats(
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Get audit statistics for dashboard.
    """
    try:
        # Get total count
        total_result = supabase_service.client.table("audit_logs").select("id", count="exact").execute()
        total = total_result.count or 0
        
        # Get today's count
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        today_result = supabase_service.client.table("audit_logs").select("id", count="exact").gte("created_at", today_start).execute()
        today = today_result.count or 0
        
        # Get critical count
        critical_result = supabase_service.client.table("audit_logs").select("id", count="exact").in_("severity", ["CRITICAL", "ERROR"]).execute()
        critical_count = critical_result.count or 0
        
        # Get unique users (last 30 days)
        thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
        users_result = supabase_service.client.table("audit_logs").select("user_id").gte("created_at", thirty_days_ago).execute()
        unique_users = len(set(log["user_id"] for log in users_result.data)) if users_result.data else 0
        
        # Get action counts
        action_result = supabase_service.client.table("audit_logs").select("action").execute()
        action_counts = {}
        for log in action_result.data:
            action = log["action"]
            action_counts[action] = action_counts.get(action, 0) + 1
        
        return AuditStatsResponse(
            total=total,
            today=today,
            critical_count=critical_count,
            unique_users=unique_users,
            action_counts=action_counts
        )
        
    except Exception as e:
        print(f"Error fetching audit stats: {e}")
        return AuditStatsResponse(
            total=0,
            today=0,
            critical_count=0,
            unique_users=0,
            action_counts={}
        )


@router.get("/security-alerts", response_model=List[AuditLogResponse])
async def get_security_alerts(
    limit: int = Query(20, le=100),
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Get recent security-related audit logs (CRITICAL and ERROR severity).
    """
    try:
        result = supabase_service.client.table("audit_logs") \
            .select("*") \
            .in_("severity", ["CRITICAL", "ERROR"]) \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()
        
        return [AuditLogResponse(**log) for log in result.data]
        
    except Exception as e:
        print(f"Error fetching security alerts: {e}")
        return []


@router.post("/log-login")
async def log_login(
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Log a user login event.
    Called after successful authentication.
    """
    log_data = AuditLogCreate(
        action=AuditAction.LOGIN,
        category=AuditCategory.SECURITY,
        severity=AuditSeverity.INFO,
        resource_type="SESSION",
        resource_name=f"Login: {current_user.email or 'unknown'}"
    )
    return await create_audit_log(log_data, current_user)


@router.post("/log-logout")
async def log_logout(
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Log a user logout event.
    Called before sign out.
    """
    log_data = AuditLogCreate(
        action=AuditAction.LOGOUT,
        category=AuditCategory.SECURITY,
        severity=AuditSeverity.INFO,
        resource_type="SESSION",
        resource_name=f"Logout: {current_user.email or 'unknown'}"
    )
    return await create_audit_log(log_data, current_user)
