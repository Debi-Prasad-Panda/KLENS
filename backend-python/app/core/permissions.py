"""
K-LENS RBAC Permission System
Industrial-grade Role-Based Access Control with scope validation
"""

from enum import Enum
from typing import List, Optional, Set
from functools import lru_cache


class Role(str, Enum):
    """Industrial role hierarchy"""
    ADMIN = "ADMIN"           # IT / System Admin - Full technical control
    MANAGER = "MANAGER"       # Plant Manager - Full operational control
    ENGINEER = "ENGINEER"     # Senior Engineer - Technical specialist
    SAFETY_OFFICER = "SAFETY_OFFICER"  # Compliance Guard - Global read, compliance write
    OPERATOR = "OPERATOR"     # Frontline Worker - Shift-locked, restricted access


class Permission(str, Enum):
    """All available permissions in K-LENS"""
    # User Management
    USER_CREATE = "USER_CREATE"
    USER_DELETE = "USER_DELETE"
    USER_EDIT = "USER_EDIT"
    USER_VIEW_ALL = "USER_VIEW_ALL"
    USER_ASSIGN_SHIFT = "USER_ASSIGN_SHIFT"
    USER_RESET_MFA = "USER_RESET_MFA"
    
    # Documents
    DOC_UPLOAD = "DOC_UPLOAD"
    DOC_EDIT = "DOC_EDIT"
    DOC_DELETE = "DOC_DELETE"
    DOC_APPROVE_DELETE = "DOC_APPROVE_DELETE"
    DOC_VERSION = "DOC_VERSION"
    DOC_VIEW_ALL = "DOC_VIEW_ALL"
    DOC_VIEW_DEPT = "DOC_VIEW_DEPT"
    DOC_VIEW_ASSIGNED = "DOC_VIEW_ASSIGNED"
    DOC_TAG_RISK = "DOC_TAG_RISK"
    DOC_AUDIT_VIEW = "DOC_AUDIT_VIEW"
    
    # Knowledge Graph
    GRAPH_CONFIG = "GRAPH_CONFIG"
    GRAPH_VIEW_ALL = "GRAPH_VIEW_ALL"
    GRAPH_VIEW_DEPT = "GRAPH_VIEW_DEPT"
    GRAPH_VIEW_RISK = "GRAPH_VIEW_RISK"
    GRAPH_VIEW_LOCAL = "GRAPH_VIEW_LOCAL"
    
    # IoT & UNS
    IOT_CONFIG = "IOT_CONFIG"
    IOT_VIEW_ALL = "IOT_VIEW_ALL"
    IOT_CALIBRATE = "IOT_CALIBRATE"
    IOT_ALERTS_VIEW = "IOT_ALERTS_VIEW"
    IOT_MONITOR = "IOT_MONITOR"
    
    # Emergency & Override
    EMERGENCY_GRANT = "EMERGENCY_GRANT"
    EMERGENCY_REQUEST = "EMERGENCY_REQUEST"
    EMERGENCY_AUDIT = "EMERGENCY_AUDIT"
    
    # Compliance
    COMPLIANCE_VIEW = "COMPLIANCE_VIEW"
    COMPLIANCE_WRITE = "COMPLIANCE_WRITE"
    COMPLIANCE_FLAG = "COMPLIANCE_FLAG"
    
    # Shift Management
    SHIFT_BYPASS = "SHIFT_BYPASS"
    SHIFT_VIEW_ALL = "SHIFT_VIEW_ALL"
    SHIFT_MANAGE = "SHIFT_MANAGE"
    
    # Admin
    ADMIN_SETTINGS = "ADMIN_SETTINGS"
    ADMIN_GHOST_VIEW = "ADMIN_GHOST_VIEW"
    ADMIN_TRACE = "ADMIN_TRACE"
    ADMIN_APPROVE = "ADMIN_APPROVE"


# Static role-permission mapping (in-memory for fast lookups)
ROLE_PERMISSIONS: dict[Role, Set[Permission]] = {
    Role.ADMIN: set(Permission),  # Admin has ALL permissions
    
    Role.MANAGER: {
        Permission.USER_VIEW_ALL,
        Permission.USER_ASSIGN_SHIFT,
        Permission.DOC_VIEW_ALL,
        Permission.DOC_APPROVE_DELETE,
        Permission.DOC_AUDIT_VIEW,
        Permission.GRAPH_VIEW_ALL,
        Permission.IOT_VIEW_ALL,
        Permission.EMERGENCY_REQUEST,
        Permission.COMPLIANCE_VIEW,
        Permission.SHIFT_BYPASS,
        Permission.SHIFT_VIEW_ALL,
        Permission.SHIFT_MANAGE,
        Permission.ADMIN_TRACE,
        Permission.ADMIN_APPROVE,
    },
    
    Role.ENGINEER: {
        Permission.DOC_UPLOAD,
        Permission.DOC_EDIT,
        Permission.DOC_VERSION,
        Permission.DOC_VIEW_DEPT,
        Permission.DOC_TAG_RISK,
        Permission.GRAPH_VIEW_DEPT,
        Permission.IOT_CALIBRATE,
        Permission.IOT_VIEW_ALL,
        Permission.EMERGENCY_REQUEST,
        Permission.COMPLIANCE_VIEW,
        Permission.SHIFT_BYPASS,
    },
    
    Role.SAFETY_OFFICER: {
        Permission.DOC_VIEW_ALL,
        Permission.DOC_AUDIT_VIEW,
        Permission.GRAPH_VIEW_RISK,
        Permission.GRAPH_VIEW_ALL,
        Permission.IOT_ALERTS_VIEW,
        Permission.IOT_VIEW_ALL,
        Permission.EMERGENCY_AUDIT,
        Permission.COMPLIANCE_VIEW,
        Permission.COMPLIANCE_WRITE,
        Permission.COMPLIANCE_FLAG,
        Permission.SHIFT_BYPASS,
        Permission.SHIFT_VIEW_ALL,
    },
    
    Role.OPERATOR: {
        Permission.DOC_VIEW_ASSIGNED,
        Permission.GRAPH_VIEW_LOCAL,
        Permission.IOT_MONITOR,
        Permission.EMERGENCY_REQUEST,
        Permission.COMPLIANCE_VIEW,
    },
}


def has_permission(role: str, permission: str | Permission) -> bool:
    """
    Check if a role has a specific permission.
    
    Args:
        role: User's role string
        permission: Permission to check (string or enum)
        
    Returns:
        True if role has permission, False otherwise
    """
    try:
        role_enum = Role((role or "").upper())
    except ValueError:
        return False
    
    if isinstance(permission, str):
        try:
            permission = Permission(permission)
        except ValueError:
            return False
    
    role_perms = ROLE_PERMISSIONS.get(role_enum, set())
    return permission in role_perms


def get_role_permissions(role: str) -> List[str]:
    """
    Get all permissions for a role.
    
    Args:
        role: User's role string
        
    Returns:
        List of permission strings
    """
    try:
        role_enum = Role((role or "").upper())
    except ValueError:
        return []
    
    role_perms = ROLE_PERMISSIONS.get(role_enum, set())
    return [p.value for p in role_perms]


def can_bypass_shift(role: str) -> bool:
    """
    Check if a role can bypass shift restrictions.
    
    Args:
        role: User's role string
        
    Returns:
        True if role can bypass shift, False otherwise
    """
    return has_permission(role, Permission.SHIFT_BYPASS)


def get_role_display_name(role: str) -> str:
    """Get human-readable role name"""
    display_names = {
        "ADMIN": "System Administrator",
        "MANAGER": "Plant Manager",
        "ENGINEER": "Senior Engineer",
        "SAFETY_OFFICER": "Safety Officer",
        "OPERATOR": "Operator",
    }
    return display_names.get(role, role)


def get_role_description(role: str) -> str:
    """Get role description"""
    descriptions = {
        "ADMIN": "Full technical control. Can manage users, reset MFA, view ghost accounts.",
        "MANAGER": "Full operational control. Can approve deletions, trace activity, manage shifts.",
        "ENGINEER": "Technical specialist. Can upload documents, calibrate sensors, tag risks.",
        "SAFETY_OFFICER": "Compliance guard. Global read access, can flag violations and audit.",
        "OPERATOR": "Frontline worker. Shift-locked, view assigned documents and local systems.",
    }
    return descriptions.get(role, "")


# Permission category groups for UI
PERMISSION_CATEGORIES = {
    "USER_MGMT": "User Management",
    "DOCUMENTS": "Documents",
    "KNOWLEDGE": "Knowledge Graph",
    "IOT": "IoT & UNS",
    "EMERGENCY": "Emergency",
    "COMPLIANCE": "Compliance",
    "SHIFT": "Shift Management",
    "ADMIN": "Administration",
}
