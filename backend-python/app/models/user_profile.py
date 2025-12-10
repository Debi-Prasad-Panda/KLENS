"""
UserProfile Model - K-LENS Digital Identity Hub
Extends User with industrial-specific fields: health, shift, identity, and skills.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum


class ShiftStatus(enum.Enum):
    """Worker's current shift state"""
    ON_SHIFT = "ON_SHIFT"
    ON_BREAK = "ON_BREAK"
    OFF_SHIFT = "OFF_SHIFT"


class ClearanceLevel(enum.Enum):
    """Security clearance tiers"""
    LEVEL_1 = 1  # Basic Access
    LEVEL_2 = 2  # Standard Access
    LEVEL_3 = 3  # Elevated Access
    LEVEL_4 = 4  # Restricted Access
    LEVEL_5 = 5  # Maximum Clearance


class UserProfile(Base):
    """
    Extended profile for industrial workers.
    Contains health/safety info, shift context, and AI persona settings.
    """
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True, nullable=False)  # Links to Supabase user UUID
    
    # ==================== IDENTITY ====================
    employee_id = Column(String, unique=True, index=True)  # e.g., "EMP-8821"
    clearance_level = Column(Integer, default=1)  # 1-5 security tier
    
    # ==================== HEALTH & SAFETY ====================
    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_phone = Column(String, nullable=True)
    blood_type = Column(String, nullable=True)  # O+, A-, B+, etc.
    medical_tags = Column(JSON, default=list)  # ["Diabetic", "Allergic to Penicillin"]
    safety_score = Column(Integer, default=100)  # 0-100, based on incident history
    
    # ==================== SHIFT CONTEXT ====================
    shift_status = Column(String, default=ShiftStatus.OFF_SHIFT.value)
    current_shift_start = Column(DateTime(timezone=True), nullable=True)
    current_shift_end = Column(DateTime(timezone=True), nullable=True)
    current_location = Column(String, nullable=True)  # "Zone B - Boiler Room"
    last_location_update = Column(DateTime(timezone=True), nullable=True)
    
    # ==================== AI PERSONA / SKILLS ====================
    expertise_tags = Column(JSON, default=list)  # ["Python", "Welding", "SCADA Systems"]
    voice_settings = Column(JSON, default=dict)  # {"speed": 1.2, "auto_listen": false, "wake_word": "Hey K-LENS"}
    
    # ==================== USER PREFERENCES ====================
    notification_prefs = Column(JSON, default=dict)  # {"doc_approvals": "both", "safety_alerts": "both", ...}
    display_prefs = Column(JSON, default=dict)  # {"theme": "dark", "font_size": "medium", "high_contrast": false}
    quiet_hours_enabled = Column(Boolean, default=False)
    quiet_hours_start = Column(String, nullable=True)  # "22:00"
    quiet_hours_end = Column(String, nullable=True)  # "07:00"
    
    # ==================== TIMESTAMPS ====================
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class EmergencySOSLog(Base):
    """
    Audit log for Emergency SOS triggers.
    Critical for safety compliance and incident tracking.
    """
    __tablename__ = "emergency_sos_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    employee_id = Column(String, nullable=True)
    triggered_at = Column(DateTime(timezone=True), server_default=func.now())
    location = Column(String, nullable=True)
    message = Column(String, nullable=True)
    status = Column(String, default="ACTIVE")  # ACTIVE, RESOLVED, FALSE_ALARM
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(String, nullable=True)


class ShiftHandover(Base):
    """
    Records shift handover workflows between workers.
    Tracks knowledge transfer and task continuity.
    """
    __tablename__ = "shift_handovers"

    id = Column(Integer, primary_key=True, index=True)
    from_user_id = Column(String, index=True, nullable=False)
    to_user_id = Column(String, index=True, nullable=True)  # Can be null for open handovers
    initiated_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="PENDING")  # PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    notes = Column(String, nullable=True)
    pending_tasks = Column(JSON, default=list)  # Tasks to hand over
