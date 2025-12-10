"""
Notifications API Router - Industrial Alert System Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from ..services.alert_service import alert_service
from ..dependencies.auth import get_current_user, IndustrialUser

router = APIRouter(prefix="/notifications", tags=["notifications"])


# ==================== MODELS ====================

class NotificationResponse(BaseModel):
    id: str
    title: str
    message: Optional[str] = None
    type: str
    link: Optional[str] = None
    is_read: bool
    requires_acknowledgment: bool
    acknowledged_at: Optional[str] = None
    created_at: str

class NotificationListResponse(BaseModel):
    notifications: List[dict]
    unread_count: int

class SimulateMeltdownRequest(BaseModel):
    severity: Optional[str] = "CRITICAL"  # CRITICAL, WARNING
    message: Optional[str] = None


# ==================== ENDPOINTS ====================

@router.get("/", response_model=NotificationListResponse)
async def get_notifications(
    limit: int = 20,
    include_read: bool = True,
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Get notifications for the current user.
    Real-time updates are handled by Supabase Realtime on the frontend.
    """
    notifications = alert_service.get_user_notifications(
        user_id=current_user.id,
        limit=limit,
        include_read=include_read
    )
    
    unread_count = alert_service.get_unread_count(current_user.id)
    
    return {
        "notifications": notifications,
        "unread_count": unread_count
    }


@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: IndustrialUser = Depends(get_current_user)
):
    """Mark a single notification as read."""
    success = alert_service.mark_as_read(notification_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to mark as read")
    
    return {"success": True, "message": "Notification marked as read"}


@router.post("/read-all")
async def mark_all_notifications_read(
    current_user: IndustrialUser = Depends(get_current_user)
):
    """Mark all notifications as read for the current user."""
    success = alert_service.mark_all_read(current_user.id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to mark all as read")
    
    return {"success": True, "message": "All notifications marked as read"}


@router.post("/{notification_id}/acknowledge")
async def acknowledge_notification(
    notification_id: str,
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Acknowledge a critical notification.
    This is required for CRITICAL alerts and records who acknowledged it.
    """
    success = alert_service.acknowledge_alert(notification_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to acknowledge alert")
    
    return {
        "success": True,
        "message": "Alert acknowledged",
        "notification_id": notification_id
    }


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: IndustrialUser = Depends(get_current_user)
):
    """Delete a notification."""
    success = alert_service.delete_notification(notification_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete notification")
    
    return {"success": True, "message": "Notification deleted"}


# ==================== DEMO ENDPOINTS ====================

@router.post("/simulate-meltdown")
async def simulate_meltdown(
    request: SimulateMeltdownRequest = None,
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    🔥 DEMO ENDPOINT: Simulate a critical industrial alert.
    
    Triggers a fake "Boiler Meltdown" alert for demonstration purposes.
    Use this during hackathon presentations to show the notification system.
    """
    user_name = current_user.full_name or current_user.email or "Operator"
    
    severity = request.severity if request else "CRITICAL"
    custom_message = request.message if request else None
    
    if severity == "CRITICAL":
        title = "🚨 PRESSURE CRITICAL"
        message = custom_message or f"Boiler B7 pressure exceeds 500 PSI. Immediate action required! Assigned to: {user_name}"
    else:
        title = "⚠️ PRESSURE WARNING"
        message = custom_message or f"Boiler B7 pressure approaching threshold (480 PSI). Monitor closely."
    
    notification = alert_service.trigger_alert(
        user_id=current_user.id,
        title=title,
        message=message,
        level=severity,
        link="/iot",  # Navigate to IoT dashboard
        source_type="DEMO",
        source_id="boiler_b7",
        metadata={
            "demo": True,
            "machine": "Boiler B7",
            "reading": "520 PSI" if severity == "CRITICAL" else "480 PSI",
            "threshold": "500 PSI"
        }
    )
    
    if not notification:
        raise HTTPException(status_code=500, detail="Failed to create alert")
    
    return {
        "success": True,
        "message": f"🔥 Meltdown simulation triggered! Check your notification bell.",
        "notification": notification
    }


@router.post("/trigger-escalation-check")
async def trigger_escalation_check(
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Manually trigger the escalation check (Dead Man's Switch).
    In production, this would run on a cron schedule.
    """
    # Only allow admins to trigger this
    role = current_user.role.upper() if current_user.role else ""
    if role not in ["ADMIN", "MANAGER", "SENIOR_ENGINEER"]:
        raise HTTPException(
            status_code=403, 
            detail="Only admins/managers can trigger escalation checks"
        )
    
    escalated_count = alert_service.check_dead_mans_switch()
    
    return {
        "success": True,
        "message": f"Escalation check complete",
        "escalated_count": escalated_count
    }
