"""
User Management API - Workforce Identity & Governance
Admin endpoints for managing users, Ghost Mode, and certifications.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from ..dependencies.auth import get_current_user, require_role, IndustrialUser
from ..services.supabase_service import supabase_service

router = APIRouter(prefix="/users", tags=["user-management"])


# ===================== SCHEMAS =====================

class UserProfile(BaseModel):
    id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: str = "OPERATOR"
    department: Optional[str] = None
    employee_id: Optional[str] = None
    shift_pattern: Optional[str] = None
    current_status: str = "OFF_SHIFT"
    is_active: bool = True
    is_archived: bool = False
    archived_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    is_on_shift: bool = True
    expired_certs_count: int = 0
    certs_expiring_soon: int = 0


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[str] = None
    shift_pattern: Optional[str] = None


class WorkforceStats(BaseModel):
    active_users: int = 0
    ghost_users: int = 0
    on_shift_users: int = 0
    expired_certs_count: int = 0
    users_with_expired_certs: int = 0


class CertificationCreate(BaseModel):
    cert_name: str
    issued_date: Optional[str] = None
    expiry_date: str
    doc_proof_url: Optional[str] = None


# ===================== ENDPOINTS =====================

@router.get("/", response_model=List[UserProfile])
async def get_all_users(
    include_archived: bool = False,
    admin: IndustrialUser = Depends(require_role("ADMIN", "MANAGER"))
):
    """
    Get all users for the admin panel.
    Managers and Admins only.
    """
    try:
        # Try the RPC function first
        response = supabase_service.client.rpc("get_all_users_for_admin").execute()
        
        if response.data:
            users = response.data
            if not include_archived:
                users = [u for u in users if not u.get("is_archived", False)]
            return users
            
    except Exception as e:
        print(f"RPC failed, falling back to direct query: {e}")
        
    # Fallback to direct query
    query = supabase_service.client.table("user_profiles").select("*")
    if not include_archived:
        query = query.eq("is_archived", False)
        
    response = query.order("created_at", desc=True).execute()
    return response.data or []


@router.get("/stats", response_model=WorkforceStats)
async def get_workforce_stats(
    admin: IndustrialUser = Depends(require_role("ADMIN", "MANAGER"))
):
    """
    Get workforce dashboard statistics.
    """
    try:
        # Try the view
        response = supabase_service.client.from_("workforce_stats").select("*").single().execute()
        if response.data:
            return WorkforceStats(**response.data)
    except Exception as e:
        print(f"Stats view failed: {e}")
    
    # Fallback to manual counts
    try:
        profiles = supabase_service.client.table("user_profiles").select("*").execute()
        users = profiles.data or []
        
        return WorkforceStats(
            active_users=len([u for u in users if u.get("is_active") and not u.get("is_archived")]),
            ghost_users=len([u for u in users if u.get("is_archived")]),
            on_shift_users=len([u for u in users if u.get("current_status") == "ON_SHIFT"]),
            expired_certs_count=0,
            users_with_expired_certs=0
        )
    except Exception as e:
        print(f"Stats calculation failed: {e}")
        return WorkforceStats()


@router.get("/{user_id}", response_model=UserProfile)
async def get_user(
    user_id: str,
    admin: IndustrialUser = Depends(require_role("ADMIN", "MANAGER"))
):
    """Get a specific user's details."""
    response = supabase_service.client.table("user_profiles") \
        .select("*") \
        .eq("id", user_id) \
        .single() \
        .execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return response.data


@router.patch("/{user_id}", response_model=UserProfile)
async def update_user(
    user_id: str,
    update: UserUpdate,
    admin: IndustrialUser = Depends(require_role("ADMIN"))
):
    """
    Update a user's profile.
    Admin only.
    """
    update_data = update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    response = supabase_service.client.table("user_profiles") \
        .update(update_data) \
        .eq("id", user_id) \
        .execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return response.data[0]


@router.post("/{user_id}/archive")
async def archive_user(
    user_id: str,
    admin: IndustrialUser = Depends(require_role("ADMIN"))
):
    """
    Archive a user (Ghost Mode).
    Preserves data for compliance but revokes access.
    """
    # Check if user exists
    user = supabase_service.client.table("user_profiles") \
        .select("email, full_name") \
        .eq("id", user_id) \
        .single() \
        .execute()
    
    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Cannot archive yourself
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot archive your own account")
    
    # Try RPC first
    try:
        response = supabase_service.client.rpc("archive_user", {
            "target_user_id": user_id,
            "admin_user_id": admin.id
        }).execute()
    except Exception:
        # Fallback to direct update
        supabase_service.client.table("user_profiles") \
            .update({
                "is_active": False,
                "is_archived": True,
                "archived_at": datetime.utcnow().isoformat(),
                "archived_by": admin.id
            }) \
            .eq("id", user_id) \
            .execute()
    
    return {
        "success": True, 
        "message": f"User '{user.data.get('full_name') or user.data.get('email')}' has been archived (Ghost Mode)"
    }


@router.post("/{user_id}/restore")
async def restore_user(
    user_id: str,
    admin: IndustrialUser = Depends(require_role("ADMIN"))
):
    """
    Restore a Ghost user to active status.
    """
    try:
        supabase_service.client.rpc("restore_user", {
            "target_user_id": user_id
        }).execute()
    except Exception:
        supabase_service.client.table("user_profiles") \
            .update({
                "is_active": True,
                "is_archived": False,
                "archived_at": None,
                "archived_by": None
            }) \
            .eq("id", user_id) \
            .execute()
    
    return {"success": True, "message": "User restored successfully"}


@router.post("/{user_id}/promote")
async def promote_user(
    user_id: str,
    role: str,
    admin: IndustrialUser = Depends(require_role("ADMIN"))
):
    """
    Promote/demote a user's role.
    Admin only.
    """
    valid_roles = ["ADMIN", "MANAGER", "OPERATOR", "SAFETY_OFFICER"]
    if role not in valid_roles:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )
    
    # Cannot demote yourself
    if user_id == admin.id and role != "ADMIN":
        raise HTTPException(status_code=400, detail="Cannot demote your own account")
    
    response = supabase_service.client.table("user_profiles") \
        .update({"role": role, "updated_at": datetime.utcnow().isoformat()}) \
        .eq("id", user_id) \
        .execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "message": f"User role updated to {role}"}


# ===================== CERTIFICATIONS =====================

@router.get("/{user_id}/certifications")
async def get_user_certifications(
    user_id: str,
    admin: IndustrialUser = Depends(require_role("ADMIN", "MANAGER", "SAFETY_OFFICER"))
):
    """Get all certifications for a user."""
    response = supabase_service.client.table("user_certifications") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("expiry_date") \
        .execute()
    
    return response.data or []


@router.post("/{user_id}/certifications")
async def add_certification(
    user_id: str,
    cert: CertificationCreate,
    admin: IndustrialUser = Depends(require_role("ADMIN", "SAFETY_OFFICER"))
):
    """Add a new certification to a user."""
    response = supabase_service.client.table("user_certifications") \
        .insert({
            "user_id": user_id,
            "cert_name": cert.cert_name,
            "issued_date": cert.issued_date,
            "expiry_date": cert.expiry_date,
            "doc_proof_url": cert.doc_proof_url
        }) \
        .execute()
    
    return response.data[0] if response.data else {"success": True}


@router.delete("/{user_id}/certifications/{cert_id}")
async def delete_certification(
    user_id: str,
    cert_id: str,
    admin: IndustrialUser = Depends(require_role("ADMIN", "SAFETY_OFFICER"))
):
    """Delete a certification."""
    supabase_service.client.table("user_certifications") \
        .delete() \
        .eq("id", cert_id) \
        .eq("user_id", user_id) \
        .execute()
    
    return {"success": True, "message": "Certification deleted"}
