"""
K-LENS Industrial Auth API
Supabase-powered authentication with industrial context.
Replaces the old SQLAlchemy-based auth system.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime

from ..dependencies.auth import (
    get_current_user,
    require_role,
    verify_kiosk_pin,
    set_kiosk_pin,
    IndustrialUser,
)
from ..services.supabase_service import supabase_service
from ..utils.validation import (
    validate_email_address,
    validate_password_strength,
    validate_user_role,
    validate_shift_status,
    sanitize_text,
    validate_no_xss,
    StrictBaseModel,
    MAX_NAME_LENGTH,
    MAX_DEPARTMENT_LENGTH,
    MAX_ROLE_LENGTH,
)


router = APIRouter(prefix="/auth", tags=["auth"])


# ==================== REQUEST/RESPONSE MODELS ====================

class LoginRequest(StrictBaseModel):
    """Login request with strict validation"""
    email: str = Field(
        ...,
        min_length=3,
        max_length=254,
        description="User email address"
    )
    password: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="User password"
    )
    
    @field_validator('email')
    @classmethod
    def validate_email_field(cls, v: str) -> str:
        return validate_email_address(v)


class RegisterRequest(StrictBaseModel):
    """Registration request with strict validation"""
    email: str = Field(
        ...,
        min_length=3,
        max_length=254,
        description="User email address"
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="User password (min 8 chars, must include upper, lower, digit, special)"
    )
    full_name: str = Field(
        ...,
        min_length=1,
        max_length=MAX_NAME_LENGTH,
        description="Full name"
    )
    role: str = Field(
        "OPERATOR",
        min_length=1,
        max_length=MAX_ROLE_LENGTH,
        description="User role"
    )
    department: Optional[str] = Field(
        None,
        max_length=MAX_DEPARTMENT_LENGTH,
        description="Department name"
    )
    
    @field_validator('email')
    @classmethod
    def validate_email_field(cls, v: str) -> str:
        return validate_email_address(v)
    
    @field_validator('password')
    @classmethod
    def validate_password_field(cls, v: str) -> str:
        return validate_password_strength(v)
    
    @field_validator('full_name')
    @classmethod
    def validate_full_name_field(cls, v: str) -> str:
        validate_no_xss(v)
        return sanitize_text(v, MAX_NAME_LENGTH)
    
    @field_validator('role')
    @classmethod
    def validate_role_field(cls, v: str) -> str:
        return validate_user_role(v)
    
    @field_validator('department')
    @classmethod
    def validate_department_field(cls, v: Optional[str]) -> Optional[str]:
        if v:
            validate_no_xss(v)
            return sanitize_text(v, MAX_DEPARTMENT_LENGTH)
        return v


class UpdateProfileRequest(StrictBaseModel):
    """Profile update request with strict validation"""
    full_name: Optional[str] = Field(
        None,
        max_length=MAX_NAME_LENGTH,
        description="Full name"
    )
    department: Optional[str] = Field(
        None,
        max_length=MAX_DEPARTMENT_LENGTH,
        description="Department"
    )
    shift_pattern: Optional[str] = Field(
        None,
        max_length=50,
        description="Shift pattern"
    )
    avatar_url: Optional[str] = Field(
        None,
        max_length=500,
        description="Avatar URL"
    )
    
    @field_validator('full_name', 'department', 'shift_pattern')
    @classmethod
    def validate_text_fields(cls, v: Optional[str]) -> Optional[str]:
        if v:
            validate_no_xss(v)
            return sanitize_text(v, 100)
        return v


class UpdateShiftStatusRequest(StrictBaseModel):
    """Shift status update with validation"""
    status: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Shift status"
    )
    
    @field_validator('status')
    @classmethod
    def validate_status_field(cls, v: str) -> str:
        return validate_shift_status(v)


class SetPinRequest(StrictBaseModel):
    """PIN set request with validation"""
    pin: str = Field(
        ...,
        min_length=4,
        max_length=6,
        pattern=r'^\d{4,6}$',
        description="4-6 digit PIN"
    )  # 4-digit PIN


class VerifyPinRequest(StrictBaseModel):
    """PIN verification request with validation"""
    pin: str = Field(
        ...,
        min_length=4,
        max_length=6,
        pattern=r'^\d{4,6}$',
        description="4-6 digit PIN"
    )


class AddCertificationRequest(StrictBaseModel):
    """Certification add request with strict validation"""
    cert_name: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Certification name"
    )
    expiry_date: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Expiry date (ISO format)"
    )
    cert_issuer: Optional[str] = Field(
        None,
        max_length=200,
        description="Certification issuer"
    )
    issue_date: Optional[str] = Field(
        None,
        max_length=50,
        description="Issue date (ISO format)"
    )
    document_url: Optional[str] = Field(
        None,
        max_length=500,
        description="Document URL"
    )
    
    @field_validator('cert_name', 'cert_issuer')
    @classmethod
    def validate_text_fields(cls, v: Optional[str]) -> Optional[str]:
        if v:
            validate_no_xss(v)
            return sanitize_text(v, 200)
        return v


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    role: str
    department: Optional[str]
    shift_pattern: Optional[str]
    current_status: str
    is_on_shift: bool
    has_expired_certs: bool


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ==================== AUTH ENDPOINTS ====================

@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    """
    Register a new user via Supabase Auth.
    Profile is auto-created via database trigger.
    """
    try:
        # Sign up via Supabase Auth
        response = supabase_service.client.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "full_name": request.full_name,
                    "role": request.role,
                }
            }
        })
        
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed. Email may already be registered."
            )
        
        # Update profile with additional fields if provided
        if request.department:
            supabase_service.update_user_profile(
                str(response.user.id),
                {"department": request.department}
            )
        
        # Return token and user info
        return AuthResponse(
            access_token=response.session.access_token if response.session else "",
            user=UserResponse(
                id=str(response.user.id),
                email=response.user.email,
                full_name=request.full_name,
                role=request.role,
                department=request.department,
                shift_pattern=None,
                current_status="OFF_SHIFT",
                is_on_shift=True,
                has_expired_certs=False,
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Login via Supabase Auth.
    Returns access token and user with industrial context.
    """
    try:
        # Sign in via Supabase
        response = supabase_service.client.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })
        
        if not response.user or not response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        user_id = str(response.user.id)
        
        # Fetch industrial context
        try:
            context_response = supabase_service.client.rpc(
                "get_user_industrial_context",
                {"target_user_id": user_id}
            ).execute()
            
            if context_response.data and len(context_response.data) > 0:
                profile = context_response.data[0]
                return AuthResponse(
                    access_token=response.session.access_token,
                    user=UserResponse(
                        id=user_id,
                        email=profile.get("email", request.email),
                        full_name=profile.get("full_name"),
                        role=profile.get("role", "OPERATOR"),
                        department=profile.get("department"),
                        shift_pattern=profile.get("shift_pattern"),
                        current_status=profile.get("current_status", "OFF_SHIFT"),
                        is_on_shift=profile.get("is_on_shift", True),
                        has_expired_certs=profile.get("has_expired_certs", False),
                    )
                )
        except Exception as e:
            print(f"Warning: Could not fetch industrial context: {e}")
        
        # Fallback response
        return AuthResponse(
            access_token=response.session.access_token,
            user=UserResponse(
                id=user_id,
                email=request.email,
                full_name=response.user.user_metadata.get("full_name"),
                role=response.user.user_metadata.get("role", "OPERATOR"),
                department=None,
                shift_pattern=None,
                current_status="OFF_SHIFT",
                is_on_shift=True,
                has_expired_certs=False,
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )


@router.post("/logout")
async def logout(user: IndustrialUser = Depends(get_current_user)):
    """Sign out the current user."""
    try:
        supabase_service.client.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        print(f"Logout error: {e}")
        return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(user: IndustrialUser = Depends(get_current_user)):
    """Get the current user's profile with industrial context."""
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        department=user.department,
        shift_pattern=user.shift_pattern,
        current_status=user.current_status,
        is_on_shift=user.is_on_shift,
        has_expired_certs=user.has_expired_certs,
    )


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    request: UpdateProfileRequest,
    user: IndustrialUser = Depends(get_current_user)
):
    """Update the current user's profile."""
    updates = request.model_dump(exclude_none=True)
    
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    result = supabase_service.update_user_profile(user.id, updates)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
    
    # Return updated user
    return await get_current_user_info(user)


# ==================== SHIFT STATUS ENDPOINTS ====================

@router.post("/shift-status")
async def update_shift_status(
    request: UpdateShiftStatusRequest,
    user: IndustrialUser = Depends(get_current_user)
):
    """Update the current user's shift status."""
    success = supabase_service.update_shift_status(user.id, request.status)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be: ON_SHIFT, ON_BREAK, or OFF_SHIFT"
        )
    
    return {"message": f"Status updated to {request.status}"}


@router.get("/shift-schedules")
async def get_shift_schedules():
    """Get all defined shift schedules."""
    schedules = supabase_service.get_shift_schedules()
    return {"schedules": schedules}


# ==================== KIOSK PIN ENDPOINTS ====================

@router.post("/kiosk/set-pin")
async def set_pin(
    request: SetPinRequest,
    user: IndustrialUser = Depends(get_current_user)
):
    """Set or update the user's kiosk PIN for fast unlock."""
    if not request.pin or len(request.pin) != 4 or not request.pin.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PIN must be exactly 4 digits"
        )
    
    success = await set_kiosk_pin(user.id, request.pin)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to set PIN"
        )
    
    return {"message": "PIN set successfully"}


@router.post("/kiosk/verify-pin")
async def verify_pin(
    request: VerifyPinRequest,
    user: IndustrialUser = Depends(get_current_user)
):
    """Verify the user's kiosk PIN for fast unlock."""
    valid = await verify_kiosk_pin(user.id, request.pin)
    
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid PIN"
        )
    
    return {"message": "PIN verified", "valid": True}


# ==================== CERTIFICATION ENDPOINTS ====================

@router.get("/certifications")
async def get_my_certifications(
    include_expired: bool = False,
    user: IndustrialUser = Depends(get_current_user)
):
    """Get the current user's certifications."""
    certs = supabase_service.get_user_certifications(user.id, include_expired)
    return {"certifications": certs}


@router.post("/certifications")
async def add_certification(
    request: AddCertificationRequest,
    user: IndustrialUser = Depends(require_role("ADMIN", "MANAGER"))
):
    """
    Add a certification for a user.
    Admin/Manager only.
    """
    # For now, add to the current user (in production, accept user_id param)
    result = supabase_service.add_user_certification(
        user_id=user.id,
        cert_name=request.cert_name,
        expiry_date=request.expiry_date,
        cert_issuer=request.cert_issuer,
        issue_date=request.issue_date,
        document_url=request.document_url,
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add certification"
        )
    
    return {"certification": result}


@router.get("/certifications/expiring")
async def get_expiring_certifications(
    days: int = 30,
    user: IndustrialUser = Depends(require_role("ADMIN", "MANAGER", "SAFETY_OFFICER"))
):
    """
    Get all certifications expiring within N days.
    Admin/Manager/Safety Officer only.
    """
    certs = supabase_service.get_expiring_certifications(days)
    return {"expiring_certifications": certs, "days_ahead": days}


# ==================== ADMIN ENDPOINTS ====================

@router.get("/users")
async def list_users(
    shift: Optional[str] = None,
    status: Optional[str] = None,
    user: IndustrialUser = Depends(require_role("ADMIN", "MANAGER"))
):
    """
    List users with optional filtering.
    Admin/Manager only.
    """
    if shift:
        users = supabase_service.get_users_by_shift(shift, status)
    else:
        # Get all users (paginated in production)
        try:
            response = supabase_service.client.table("user_profiles") \
                .select("id, email, full_name, role, department, shift_pattern, current_status") \
                .execute()
            users = response.data or []
        except Exception as e:
            print(f"List users error: {e}")
            users = []
    
    return {"users": users}


@router.get("/users/{user_id}")
async def get_user_by_id(
    user_id: str,
    admin: IndustrialUser = Depends(require_role("ADMIN", "MANAGER"))
):
    """
    Get a specific user's profile.
    Admin/Manager only.
    """
    profile = supabase_service.get_user_profile(user_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"user": profile}
