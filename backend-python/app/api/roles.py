"""
Role Management API - RBAC Configuration & Control
Admin endpoints for managing roles, permissions, and access control.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from ..dependencies.auth import get_current_user, require_role, IndustrialUser
from ..services.supabase_service import supabase_service

router = APIRouter(prefix="/roles", tags=["role-management"])


# ===================== SCHEMAS =====================

class Permission(BaseModel):
    """Single permission definition"""
    action: str
    description: str
    category: str
    risk_level: str = "LOW"


class RoleInfo(BaseModel):
    """Role metadata and permissions"""
    role: str
    display_name: str
    description: str
    color: str
    icon: str
    permissions: List[str] = []
    permission_count: int = 0


class RolePermissionUpdate(BaseModel):
    """Update role permissions"""
    role: str
    permissions_to_add: List[str] = []
    permissions_to_remove: List[str] = []


class UserPermissionOverride(BaseModel):
    """Override permissions for a specific user"""
    user_id: str
    permissions: List[str]


class PermissionCategory(BaseModel):
    """Permission category with its permissions"""
    category: str
    category_name: str
    permissions: List[Permission]


# Role metadata (matches frontend)
ROLE_METADATA = {
    "ADMIN": {
        "display_name": "System Administrator",
        "description": "Full technical control. Can manage users, reset MFA, view ghost accounts.",
        "color": "amber",
        "icon": "Crown"
    },
    "MANAGER": {
        "display_name": "Plant Manager",
        "description": "Full operational control. Can approve deletions, trace activity, manage shifts.",
        "color": "blue",
        "icon": "Shield"
    },
    "ENGINEER": {
        "display_name": "Senior Engineer",
        "description": "Technical specialist. Can upload documents, calibrate sensors, tag risks.",
        "color": "purple",
        "icon": "Wrench"
    },
    "SAFETY_OFFICER": {
        "display_name": "Safety Officer",
        "description": "Compliance guard. Global read access, can flag violations and audit.",
        "color": "emerald",
        "icon": "ShieldCheck"
    },
    "OPERATOR": {
        "display_name": "Operator",
        "description": "Frontline worker. Shift-locked, view assigned documents and local systems.",
        "color": "slate",
        "icon": "User"
    }
}

PERMISSION_CATEGORY_NAMES = {
    "USER_MGMT": "User Management",
    "DOCUMENTS": "Documents",
    "KNOWLEDGE": "Knowledge Graph",
    "IOT": "IoT & UNS",
    "EMERGENCY": "Emergency",
    "COMPLIANCE": "Compliance",
    "SHIFT": "Shift Management",
    "ADMIN": "Administration"
}


# ===================== ENDPOINTS =====================

@router.get("/", response_model=List[RoleInfo])
async def get_all_roles(
    admin: IndustrialUser = Depends(require_role("ADMIN", "MANAGER"))
):
    """
    Get all roles with their permissions.
    Returns role metadata and permission list for each role.
    """
    roles = []
    
    # Get all role-permission mappings from database
    try:
        role_perms = supabase_service.client.table("rbac_role_permissions") \
            .select("role, action") \
            .execute()
        
        # Group permissions by role
        role_permission_map = {}
        for rp in (role_perms.data or []):
            role = rp["role"]
            if role not in role_permission_map:
                role_permission_map[role] = []
            role_permission_map[role].append(rp["action"])
        
        # Build role info for each role
        for role_name, metadata in ROLE_METADATA.items():
            perms = role_permission_map.get(role_name, [])
            roles.append(RoleInfo(
                role=role_name,
                display_name=metadata["display_name"],
                description=metadata["description"],
                color=metadata["color"],
                icon=metadata["icon"],
                permissions=perms,
                permission_count=len(perms)
            ))
        
    except Exception as e:
        print(f"Error fetching roles: {e}")
        # Return roles with metadata only
        for role_name, metadata in ROLE_METADATA.items():
            roles.append(RoleInfo(
                role=role_name,
                display_name=metadata["display_name"],
                description=metadata["description"],
                color=metadata["color"],
                icon=metadata["icon"]
            ))
    
    return roles


@router.get("/permissions", response_model=List[Permission])
async def get_all_permissions(
    admin: IndustrialUser = Depends(require_role("ADMIN", "MANAGER"))
):
    """
    Get all available permissions.
    """
    try:
        response = supabase_service.client.table("rbac_permissions") \
            .select("*") \
            .order("category") \
            .execute()
        
        return [Permission(**p) for p in (response.data or [])]
    except Exception as e:
        print(f"Error fetching permissions: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch permissions")


@router.get("/permissions/categories", response_model=List[PermissionCategory])
async def get_permissions_by_category(
    admin: IndustrialUser = Depends(require_role("ADMIN", "MANAGER"))
):
    """
    Get all permissions grouped by category.
    """
    try:
        response = supabase_service.client.table("rbac_permissions") \
            .select("*") \
            .order("category") \
            .execute()
        
        # Group by category
        categories = {}
        for perm in (response.data or []):
            cat = perm["category"]
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(Permission(**perm))
        
        return [
            PermissionCategory(
                category=cat,
                category_name=PERMISSION_CATEGORY_NAMES.get(cat, cat),
                permissions=perms
            )
            for cat, perms in categories.items()
        ]
    except Exception as e:
        print(f"Error fetching permission categories: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch permissions")


@router.get("/{role_name}", response_model=RoleInfo)
async def get_role(
    role_name: str,
    admin: IndustrialUser = Depends(require_role("ADMIN", "MANAGER"))
):
    """
    Get a specific role with its permissions.
    """
    if role_name not in ROLE_METADATA:
        raise HTTPException(status_code=404, detail=f"Role '{role_name}' not found")
    
    metadata = ROLE_METADATA[role_name]
    
    try:
        response = supabase_service.client.table("rbac_role_permissions") \
            .select("action") \
            .eq("role", role_name) \
            .execute()
        
        permissions = [r["action"] for r in (response.data or [])]
        
        return RoleInfo(
            role=role_name,
            display_name=metadata["display_name"],
            description=metadata["description"],
            color=metadata["color"],
            icon=metadata["icon"],
            permissions=permissions,
            permission_count=len(permissions)
        )
    except Exception as e:
        print(f"Error fetching role: {e}")
        return RoleInfo(
            role=role_name,
            display_name=metadata["display_name"],
            description=metadata["description"],
            color=metadata["color"],
            icon=metadata["icon"]
        )


@router.put("/{role_name}/permissions")
async def update_role_permissions(
    role_name: str,
    update: RolePermissionUpdate,
    admin: IndustrialUser = Depends(require_role("ADMIN"))
):
    """
    Update permissions for a role.
    Admin only - this is a critical operation.
    """
    if role_name not in ROLE_METADATA:
        raise HTTPException(status_code=404, detail=f"Role '{role_name}' not found")
    
    if role_name != update.role:
        raise HTTPException(status_code=400, detail="Role name mismatch")
    
    try:
        # Remove permissions
        if update.permissions_to_remove:
            for action in update.permissions_to_remove:
                supabase_service.client.table("rbac_role_permissions") \
                    .delete() \
                    .eq("role", role_name) \
                    .eq("action", action) \
                    .execute()
        
        # Add permissions
        if update.permissions_to_add:
            for action in update.permissions_to_add:
                # Check if permission exists
                perm_check = supabase_service.client.table("rbac_permissions") \
                    .select("action") \
                    .eq("action", action) \
                    .execute()
                
                if not perm_check.data:
                    continue  # Skip invalid permissions
                
                # Check if already exists
                existing = supabase_service.client.table("rbac_role_permissions") \
                    .select("*") \
                    .eq("role", role_name) \
                    .eq("action", action) \
                    .execute()
                
                if not existing.data:
                    supabase_service.client.table("rbac_role_permissions") \
                        .insert({"role": role_name, "action": action}) \
                        .execute()
        
        # Log the action
        try:
            supabase_service.client.table("audit_logs").insert({
                "user_id": admin.id,
                "action": "ROLE_PERMISSION_UPDATE",
                "resource_type": "rbac_role_permissions",
                "resource_id": role_name,
                "details": {
                    "added": update.permissions_to_add,
                    "removed": update.permissions_to_remove
                }
            }).execute()
        except Exception:
            pass  # Non-critical
        
        return {
            "success": True,
            "message": f"Permissions updated for role {role_name}",
            "added": len(update.permissions_to_add),
            "removed": len(update.permissions_to_remove)
        }
        
    except Exception as e:
        print(f"Error updating role permissions: {e}")
        raise HTTPException(status_code=500, detail="Failed to update permissions")


@router.get("/matrix/all")
async def get_permission_matrix(
    admin: IndustrialUser = Depends(require_role("ADMIN", "MANAGER"))
):
    """
    Get the complete role-permission matrix.
    Returns all roles and permissions with their relationships.
    """
    try:
        # Get all permissions
        perms_response = supabase_service.client.table("rbac_permissions") \
            .select("*") \
            .order("category, action") \
            .execute()
        
        # Get all role-permission mappings
        mappings_response = supabase_service.client.table("rbac_role_permissions") \
            .select("role, action") \
            .execute()
        
        # Build matrix
        permissions = perms_response.data or []
        mappings = mappings_response.data or []
        
        # Create a set of (role, action) tuples for quick lookup
        mapping_set = {(m["role"], m["action"]) for m in mappings}
        
        # Build matrix data
        matrix = {
            "roles": list(ROLE_METADATA.keys()),
            "role_metadata": ROLE_METADATA,
            "categories": PERMISSION_CATEGORY_NAMES,
            "permissions": permissions,
            "matrix": {}
        }
        
        # For each permission, mark which roles have it
        for perm in permissions:
            action = perm["action"]
            matrix["matrix"][action] = {
                role: (role, action) in mapping_set
                for role in ROLE_METADATA.keys()
            }
        
        return matrix
        
    except Exception as e:
        print(f"Error fetching permission matrix: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch permission matrix")


@router.post("/user/{user_id}/permissions")
async def update_user_permissions(
    user_id: str,
    override: UserPermissionOverride,
    admin: IndustrialUser = Depends(require_role("ADMIN"))
):
    """
    Override permissions for a specific user.
    These permissions are in addition to the user's role-based permissions.
    """
    if user_id != override.user_id:
        raise HTTPException(status_code=400, detail="User ID mismatch")
    
    try:
        # Update user_profiles.permissions array
        response = supabase_service.client.table("user_profiles") \
            .update({
                "permissions": override.permissions,
                "updated_at": datetime.utcnow().isoformat()
            }) \
            .eq("id", user_id) \
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Log the action
        try:
            supabase_service.client.table("audit_logs").insert({
                "user_id": admin.id,
                "action": "USER_PERMISSION_OVERRIDE",
                "resource_type": "user_profiles",
                "resource_id": user_id,
                "details": {"permissions": override.permissions}
            }).execute()
        except Exception:
            pass
        
        return {
            "success": True,
            "message": f"User permissions updated",
            "permissions": override.permissions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating user permissions: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user permissions")


@router.get("/user/{user_id}/permissions")
async def get_user_permissions(
    user_id: str,
    admin: IndustrialUser = Depends(require_role("ADMIN", "MANAGER"))
):
    """
    Get all permissions for a user (role-based + overrides).
    """
    try:
        # Get user profile
        user_response = supabase_service.client.table("user_profiles") \
            .select("role, permissions") \
            .eq("id", user_id) \
            .single() \
            .execute()
        
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_role = user_response.data.get("role", "OPERATOR")
        user_overrides = user_response.data.get("permissions") or []
        
        # Get role permissions
        role_perms_response = supabase_service.client.table("rbac_role_permissions") \
            .select("action") \
            .eq("role", user_role) \
            .execute()
        
        role_permissions = [r["action"] for r in (role_perms_response.data or [])]
        
        # Combine unique permissions
        all_permissions = list(set(role_permissions + user_overrides))
        
        return {
            "user_id": user_id,
            "role": user_role,
            "role_permissions": role_permissions,
            "override_permissions": user_overrides,
            "effective_permissions": all_permissions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching user permissions: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch user permissions")
