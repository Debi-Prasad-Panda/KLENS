"""
Access Rules - Pydantic models for Granular Access Control.
Supports 4 access levels: public, department, managers_only, custom.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum


class AccessLevel(str, Enum):
    """
    Access levels for documents:
    - public: Everyone in the company can access
    - department: Only users in the specified department
    - managers_only: Only managers in the specified department
    - custom: Specific users by email address
    """
    public = "public"
    department = "department"
    managers_only = "managers_only"
    custom = "custom"


class AccessRules(BaseModel):
    """
    Access rules for document uploads.
    These are stored in the metadata JSONB column.
    """
    access_level: AccessLevel = AccessLevel.public
    target_department: Optional[str] = None
    allowed_users: Optional[List[str]] = None  # List of email addresses
    
    class Config:
        use_enum_values = True
    
    def to_metadata_dict(self, user_id: str, user_email: str) -> dict:
        """
        Convert access rules to metadata dictionary for storage.
        Includes uploader information for ownership tracking.
        """
        metadata = {
            "access_level": self.access_level,
            "uploaded_by_id": user_id,
            "uploaded_by_email": user_email
        }
        
        if self.target_department:
            metadata["target_department"] = self.target_department
            
        if self.allowed_users:
            metadata["allowed_users"] = self.allowed_users
            
        return metadata


class AccessRulesRequest(BaseModel):
    """
    Request model for access rules in form data.
    Used when parsing JSON string from frontend.
    """
    access_level: AccessLevel = AccessLevel.public
    target_department: Optional[str] = None
    allowed_users: Optional[List[str]] = None
