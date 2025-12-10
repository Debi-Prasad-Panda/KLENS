"""
Profile API - K-LENS Digital Identity Hub
Endpoints for user profile, emergency SOS, and shift handover.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta

from ..core.database import get_db
from ..models.user_profile import UserProfile, EmergencySOSLog, ShiftHandover, ShiftStatus
from ..dependencies.auth import get_current_user, IndustrialUser

router = APIRouter(prefix="/profile", tags=["profile"])


# ==================== PYDANTIC SCHEMAS ====================

class UserProfileResponse(BaseModel):
    """Full profile response for Digital Badge"""
    id: int
    user_id: str
    
    # Identity
    employee_id: Optional[str] = None
    clearance_level: int = 1
    
    # Health & Safety
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    blood_type: Optional[str] = None
    medical_tags: List[str] = []
    safety_score: int = 100
    
    # Shift Context
    shift_status: str = "OFF_SHIFT"
    current_shift_start: Optional[datetime] = None
    current_shift_end: Optional[datetime] = None
    current_location: Optional[str] = None
    shift_time_remaining: Optional[str] = None  # Computed field: "2h 30m"
    
    # AI Persona
    expertise_tags: List[str] = []
    voice_settings: dict = {}
    
    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    """Request to update profile fields"""
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    blood_type: Optional[str] = None
    medical_tags: Optional[List[str]] = None
    current_location: Optional[str] = None
    expertise_tags: Optional[List[str]] = None
    voice_settings: Optional[dict] = None


class ShiftStatusUpdateRequest(BaseModel):
    """Request to update shift status"""
    status: str  # "ON_SHIFT", "ON_BREAK", "OFF_SHIFT"
    shift_end_hours: Optional[float] = 8.0  # Default 8-hour shift


class EmergencySOSRequest(BaseModel):
    """Emergency SOS trigger request"""
    message: Optional[str] = None
    location: Optional[str] = None


class EmergencySOSResponse(BaseModel):
    """Emergency SOS response"""
    success: bool
    sos_id: int
    message: str
    notified_supervisors: List[str] = []


class HandoverRequest(BaseModel):
    """Shift handover initiation request"""
    target_user_id: Optional[str] = None
    notes: Optional[str] = None
    pending_tasks: Optional[List[str]] = None


class HandoverResponse(BaseModel):
    """Shift handover response"""
    handover_id: int
    status: str
    from_user_id: str
    to_user_id: Optional[str] = None


# ==================== HELPER FUNCTIONS ====================

def compute_time_remaining(shift_end: datetime) -> Optional[str]:
    """Compute human-readable time remaining in shift"""
    if not shift_end:
        return None
    
    now = datetime.now(shift_end.tzinfo) if shift_end.tzinfo else datetime.now()
    delta = shift_end - now
    
    if delta.total_seconds() <= 0:
        return "Shift ended"
    
    hours, remainder = divmod(int(delta.total_seconds()), 3600)
    minutes = remainder // 60
    
    if hours > 0:
        return f"{hours}h {minutes}m"
    return f"{minutes}m"


def get_or_create_profile(db: Session, user_id: str) -> UserProfile:
    """Get existing profile or create default one"""
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    if not profile:
        # Create default profile
        # Generate employee ID from user_id hash
        emp_num = abs(hash(user_id)) % 10000
        profile = UserProfile(
            user_id=user_id,
            employee_id=f"EMP-{emp_num:04d}",
            clearance_level=1,
            shift_status=ShiftStatus.OFF_SHIFT.value,
            safety_score=100,
            medical_tags=[],
            expertise_tags=[],
            voice_settings={"speed": 1.0, "auto_listen": False}
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return profile


# ==================== ENDPOINTS ====================

@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(
    current_user: IndustrialUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's full profile for Digital Badge display"""
    user_id = current_user.id
    if not user_id:
        raise HTTPException(status_code=401, detail="Could not identify user")
    
    profile = get_or_create_profile(db, user_id)
    
    # Build response with computed fields
    response = UserProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        employee_id=profile.employee_id,
        clearance_level=profile.clearance_level,
        emergency_contact_name=profile.emergency_contact_name,
        emergency_contact_phone=profile.emergency_contact_phone,
        blood_type=profile.blood_type,
        medical_tags=profile.medical_tags or [],
        safety_score=profile.safety_score,
        shift_status=profile.shift_status,
        current_shift_start=profile.current_shift_start,
        current_shift_end=profile.current_shift_end,
        current_location=profile.current_location,
        shift_time_remaining=compute_time_remaining(profile.current_shift_end),
        expertise_tags=profile.expertise_tags or [],
        voice_settings=profile.voice_settings or {}
    )
    
    return response


@router.put("/me", response_model=UserProfileResponse)
async def update_my_profile(
    request: ProfileUpdateRequest,
    current_user: IndustrialUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile fields"""
    user_id = current_user.id
    if not user_id:
        raise HTTPException(status_code=401, detail="Could not identify user")
    
    profile = get_or_create_profile(db, user_id)
    
    # Update only provided fields
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(profile, field, value)
    
    # Update location timestamp if location changed
    if request.current_location:
        profile.last_location_update = datetime.utcnow()
    
    db.commit()
    db.refresh(profile)
    
    return await get_my_profile(current_user, db)


@router.post("/shift-status")
async def update_shift_status(
    request: ShiftStatusUpdateRequest,
    current_user: IndustrialUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update shift status (ON_SHIFT, ON_BREAK, OFF_SHIFT)"""
    user_id = current_user.id
    if not user_id:
        raise HTTPException(status_code=401, detail="Could not identify user")
    
    # Validate status
    valid_statuses = [s.value for s in ShiftStatus]
    if request.status not in valid_statuses:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )
    
    profile = get_or_create_profile(db, user_id)
    profile.shift_status = request.status
    
    if request.status == ShiftStatus.ON_SHIFT.value:
        profile.current_shift_start = datetime.utcnow()
        profile.current_shift_end = datetime.utcnow() + timedelta(hours=request.shift_end_hours)
    elif request.status == ShiftStatus.OFF_SHIFT.value:
        profile.current_shift_start = None
        profile.current_shift_end = None
    
    db.commit()
    
    return {
        "success": True,
        "shift_status": profile.shift_status,
        "shift_end": profile.current_shift_end.isoformat() if profile.current_shift_end else None
    }


@router.post("/emergency-sos", response_model=EmergencySOSResponse)
async def trigger_emergency_sos(
    request: EmergencySOSRequest,
    current_user: IndustrialUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    🆘 EMERGENCY SOS - Trigger alert to supervisors
    This logs the emergency and would notify relevant personnel.
    """
    user_id = current_user.id
    user_email = current_user.email or "unknown"
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Could not identify user")
    
    # Get profile for employee ID and location
    profile = get_or_create_profile(db, user_id)
    
    # Create SOS log entry
    sos_log = EmergencySOSLog(
        user_id=user_id,
        employee_id=profile.employee_id,
        location=request.location or profile.current_location or "Unknown",
        message=request.message or "Emergency SOS triggered",
        status="ACTIVE"
    )
    db.add(sos_log)
    db.commit()
    db.refresh(sos_log)
    
    # TODO: In production, this would:
    # 1. Send push notifications to supervisors
    # 2. Trigger WebSocket alert to admin dashboard
    # 3. Log to external incident management system
    # 4. Potentially trigger facility alarms
    
    print(f"🆘 EMERGENCY SOS from {profile.employee_id} ({user_email}) at {sos_log.location}")
    print(f"   Message: {sos_log.message}")
    
    return EmergencySOSResponse(
        success=True,
        sos_id=sos_log.id,
        message=f"Emergency SOS triggered. Help is on the way.",
        notified_supervisors=["admin@example.com", "safety@example.com"]  # Mock supervisors
    )


@router.post("/handover", response_model=HandoverResponse)
async def initiate_handover(
    request: HandoverRequest,
    current_user: IndustrialUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    🔄 Initiate shift handover workflow
    Creates a handover record for shift transition.
    """
    user_id = current_user.id
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Could not identify user")
    
    # Create handover record
    handover = ShiftHandover(
        from_user_id=user_id,
        to_user_id=request.target_user_id,
        notes=request.notes,
        pending_tasks=request.pending_tasks or [],
        status="PENDING" if not request.target_user_id else "IN_PROGRESS"
    )
    db.add(handover)
    db.commit()
    db.refresh(handover)
    
    print(f"🔄 Shift handover initiated by {user_id}")
    if request.target_user_id:
        print(f"   Target: {request.target_user_id}")
    
    return HandoverResponse(
        handover_id=handover.id,
        status=handover.status,
        from_user_id=user_id,
        to_user_id=request.target_user_id
    )


@router.get("/handover/{handover_id}")
async def get_handover_status(
    handover_id: int,
    current_user: IndustrialUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get status of a shift handover"""
    handover = db.query(ShiftHandover).filter(ShiftHandover.id == handover_id).first()
    
    if not handover:
        raise HTTPException(status_code=404, detail="Handover not found")
    
    return {
        "id": handover.id,
        "status": handover.status,
        "from_user_id": handover.from_user_id,
        "to_user_id": handover.to_user_id,
        "notes": handover.notes,
        "pending_tasks": handover.pending_tasks,
        "initiated_at": handover.initiated_at.isoformat() if handover.initiated_at else None,
        "completed_at": handover.completed_at.isoformat() if handover.completed_at else None
    }


@router.post("/handover/{handover_id}/complete")
async def complete_handover(
    handover_id: int,
    current_user: IndustrialUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete a shift handover"""
    user_id = current_user.id
    
    handover = db.query(ShiftHandover).filter(ShiftHandover.id == handover_id).first()
    
    if not handover:
        raise HTTPException(status_code=404, detail="Handover not found")
    
    # Mark as completed
    handover.status = "COMPLETED"
    handover.completed_at = datetime.utcnow()
    if not handover.to_user_id:
        handover.to_user_id = user_id
    
    db.commit()
    
    return {"success": True, "message": "Handover completed successfully"}


@router.get("/{user_id}", response_model=UserProfileResponse)
async def get_user_profile(
    user_id: str,
    current_user: IndustrialUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get another user's profile (manager view only).
    Note: Medical info is hidden unless current user is admin/manager.
    """
    current_role = current_user.role.upper() if current_user.role else ""
    
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    response = UserProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        employee_id=profile.employee_id,
        clearance_level=profile.clearance_level,
        safety_score=profile.safety_score,
        shift_status=profile.shift_status,
        current_shift_start=profile.current_shift_start,
        current_shift_end=profile.current_shift_end,
        current_location=profile.current_location,
        shift_time_remaining=compute_time_remaining(profile.current_shift_end),
        expertise_tags=profile.expertise_tags or []
    )
    
    # Only show sensitive info to managers/admins
    if current_role in ["ADMIN", "MANAGER", "SAFETY_OFFICER"]:
        response.emergency_contact_name = profile.emergency_contact_name
        response.emergency_contact_phone = profile.emergency_contact_phone
        response.blood_type = profile.blood_type
        response.medical_tags = profile.medical_tags or []
    
    return response


# ==================== PREFERENCES ENDPOINTS ====================

class PreferencesRequest(BaseModel):
    """User preferences update request"""
    voice_settings: Optional[dict] = None
    notification_prefs: Optional[dict] = None
    display_prefs: Optional[dict] = None
    quiet_hours_enabled: Optional[bool] = None
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None


@router.get("/preferences")
async def get_preferences(
    current_user: IndustrialUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's preferences"""
    profile = get_or_create_profile(db, current_user.id)
    
    return {
        "voice_settings": profile.voice_settings or {
            "auto_listen": False,
            "speech_rate": 1.0,
            "wake_word": "Hey K-LENS",
            "read_summaries": True
        },
        "notification_prefs": profile.notification_prefs or {
            "doc_approvals": "both",
            "safety_alerts": "both",
            "training_reminders": "push",
            "shift_changes": "email"
        },
        "display_prefs": profile.display_prefs or {
            "theme": "dark",
            "font_size": "medium",
            "high_contrast": False,
            "reduced_motion": False
        },
        "quiet_hours_enabled": profile.quiet_hours_enabled or False,
        "quiet_hours_start": profile.quiet_hours_start or "22:00",
        "quiet_hours_end": profile.quiet_hours_end or "07:00"
    }


@router.put("/preferences")
async def update_preferences(
    request: PreferencesRequest,
    current_user: IndustrialUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's preferences"""
    profile = get_or_create_profile(db, current_user.id)
    
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(profile, field, value)
    
    db.commit()
    
    return {"success": True, "message": "Preferences updated successfully"}


# ==================== ANALYTICS ENDPOINTS ====================

@router.get("/analytics")
async def get_analytics(
    current_user: IndustrialUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's personal analytics data.
    In production, this would aggregate from various sources.
    """
    profile = get_or_create_profile(db, current_user.id)
    
    # Mock analytics data - in production, aggregate from logs/activity tables
    return {
        "metrics": {
            "documents_processed": {"value": 47, "change": 15, "trend": "up"},
            "avg_response_time": {"value": "2.3h", "change": -8, "trend": "down"},
            "compliance_score": {"value": profile.safety_score, "change": 2, "trend": "up"},
            "hours_worked": {"value": 168, "scheduled": 176}
        },
        "activity_by_type": [
            {"type": "SOPs", "count": 18},
            {"type": "Manuals", "count": 12},
            {"type": "Reports", "count": 9},
            {"type": "Policies", "count": 5},
            {"type": "Other", "count": 3}
        ],
        "activity_by_day": [
            {"day": "Mon", "count": 12},
            {"day": "Tue", "count": 8},
            {"day": "Wed", "count": 15},
            {"day": "Thu", "count": 6},
            {"day": "Fri", "count": 10},
            {"day": "Sat", "count": 2},
            {"day": "Sun", "count": 0}
        ],
        "safety": {
            "incidents": 0,
            "days_without_incident": 127,
            "training_completion": 85,
            "certs_due_in_30_days": 1
        },
        "ai_stats": {
            "questions_asked": 156,
            "avg_confidence": 94,
            "top_topics": ["Equipment Maintenance", "Safety Protocols", "Document Search"]
        }
    }


@router.get("/activity-summary")
async def get_activity_summary(
    period: str = "month",
    current_user: IndustrialUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get activity summary for charts.
    Period can be 'week', 'month', or 'year'.
    """
    # Mock hourly activity data
    hourly_activity = [
        {"hour": "6am", "count": 2},
        {"hour": "8am", "count": 8},
        {"hour": "10am", "count": 15},
        {"hour": "12pm", "count": 5},
        {"hour": "2pm", "count": 12},
        {"hour": "4pm", "count": 9},
        {"hour": "6pm", "count": 3}
    ]
    
    return {
        "period": period,
        "total_activities": 1402 if period == "year" else (234 if period == "month" else 53),
        "hourly_activity": hourly_activity,
        "peak_hour": "10am",
        "peak_day": "Wednesday"
    }

