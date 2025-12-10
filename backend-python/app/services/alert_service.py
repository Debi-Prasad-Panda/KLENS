"""
Alert Service - Industrial-Grade Notification Engine
Handles notification creation, acknowledgment, and escalation logic.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from ..services.supabase_service import supabase_service


class AlertService:
    """
    Manages industrial alert/notification lifecycle:
    - Create notifications (INFO, SUCCESS, WARNING, CRITICAL)
    - Track acknowledgments for critical alerts
    - Escalation logic for unacknowledged warnings
    """
    
    def trigger_alert(
        self,
        user_id: str,
        title: str,
        message: str = None,
        level: str = "INFO",
        link: str = None,
        source_type: str = None,
        source_id: str = None,
        metadata: Dict = None
    ) -> Optional[Dict]:
        """
        Insert a notification. Supabase Realtime automatically pushes to frontend.
        
        Args:
            user_id: UUID of the target user
            title: Notification title
            message: Optional detailed message
            level: 'INFO', 'SUCCESS', 'WARNING', 'CRITICAL'
            link: Optional navigation path (e.g., "/graph?node=Boiler_B7")
            source_type: 'IOT', 'DOCUMENT', 'COMPLIANCE', 'SYSTEM', 'DEMO'
            source_id: Reference ID to source entity
            metadata: Additional JSON data
            
        Returns:
            Created notification record or None
        """
        payload = {
            "user_id": user_id,
            "title": title,
            "message": message,
            "type": level,
            "link": link,
            "requires_acknowledgment": level == "CRITICAL",
            "source_type": source_type,
            "source_id": source_id,
            "metadata": metadata or {}
        }
        
        # Remove None values
        payload = {k: v for k, v in payload.items() if v is not None}
        
        try:
            response = supabase_service.client.table("notifications").insert(payload).execute()
            if response.data:
                print(f"🔔 Alert triggered: [{level}] {title} -> User {user_id}")
                return response.data[0]
            return None
        except Exception as e:
            print(f"❌ Failed to trigger alert: {e}")
            return None
    
    def get_user_notifications(
        self,
        user_id: str,
        limit: int = 20,
        include_read: bool = True
    ) -> List[Dict]:
        """
        Get notifications for a user, ordered by most recent.
        
        Args:
            user_id: UUID of the user
            limit: Max notifications to return
            include_read: Whether to include read notifications
            
        Returns:
            List of notification records
        """
        try:
            query = supabase_service.client.table("notifications") \
                .select("*") \
                .eq("user_id", user_id) \
                .order("created_at", desc=True) \
                .limit(limit)
            
            if not include_read:
                query = query.eq("is_read", False)
            
            response = query.execute()
            return response.data or []
        except Exception as e:
            print(f"Error fetching notifications: {e}")
            return []
    
    def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications for a user."""
        try:
            response = supabase_service.client.table("notifications") \
                .select("id", count="exact") \
                .eq("user_id", user_id) \
                .eq("is_read", False) \
                .execute()
            return response.count or 0
        except Exception as e:
            print(f"Error counting unread: {e}")
            return 0
    
    def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        """Mark a notification as read."""
        try:
            supabase_service.client.table("notifications") \
                .update({"is_read": True}) \
                .eq("id", notification_id) \
                .eq("user_id", user_id) \
                .execute()
            return True
        except Exception as e:
            print(f"Error marking read: {e}")
            return False
    
    def mark_all_read(self, user_id: str) -> bool:
        """Mark all notifications as read for a user."""
        try:
            supabase_service.client.table("notifications") \
                .update({"is_read": True}) \
                .eq("user_id", user_id) \
                .eq("is_read", False) \
                .execute()
            return True
        except Exception as e:
            print(f"Error marking all read: {e}")
            return False
    
    def acknowledge_alert(
        self,
        notification_id: str,
        user_id: str
    ) -> bool:
        """
        Acknowledge a critical alert. Records who and when.
        
        Args:
            notification_id: UUID of the notification
            user_id: UUID of the user acknowledging
            
        Returns:
            True if successful
        """
        try:
            supabase_service.client.table("notifications") \
                .update({
                    "is_read": True,
                    "acknowledged_at": datetime.utcnow().isoformat(),
                    "acknowledged_by": user_id
                }) \
                .eq("id", notification_id) \
                .eq("user_id", user_id) \
                .execute()
            print(f"✅ Alert {notification_id} acknowledged by {user_id}")
            return True
        except Exception as e:
            print(f"Error acknowledging alert: {e}")
            return False
    
    def get_stale_critical_alerts(self, minutes: int = 5) -> List[Dict]:
        """
        Find CRITICAL alerts that haven't been acknowledged after N minutes.
        Used by the escalation engine.
        
        Args:
            minutes: Time threshold for considering an alert stale
            
        Returns:
            List of stale critical alerts
        """
        cutoff_time = (datetime.utcnow() - timedelta(minutes=minutes)).isoformat()
        
        try:
            response = supabase_service.client.table("notifications") \
                .select("*") \
                .eq("type", "CRITICAL") \
                .eq("is_read", False) \
                .is_("acknowledged_at", "null") \
                .lt("created_at", cutoff_time) \
                .execute()
            return response.data or []
        except Exception as e:
            print(f"Error fetching stale alerts: {e}")
            return []
    
    def check_dead_mans_switch(self) -> int:
        """
        THE ESCALATION ENGINE
        
        Run this every 1 minute via Cron/Celery to:
        1. Find Critical Alerts sent > 5 mins ago that are NOT acknowledged
        2. Escalate to the next level (Senior Engineer, then Manager)
        
        Returns:
            Number of alerts escalated
        """
        stale_alerts = self.get_stale_critical_alerts(minutes=5)
        escalated_count = 0
        
        for alert in stale_alerts:
            current_level = alert.get("escalation_level", 0)
            
            # Skip if already at max escalation
            if current_level >= 2:
                continue
            
            # Get escalation target (in production, look up org hierarchy)
            # For demo, we'll just mark it as escalated
            new_level = current_level + 1
            
            # Update original alert's escalation level
            try:
                supabase_service.client.table("notifications") \
                    .update({"escalation_level": new_level}) \
                    .eq("id", alert["id"]) \
                    .execute()
            except Exception as e:
                print(f"Error updating escalation level: {e}")
                continue
            
            # In production: Get manager from org hierarchy
            # manager_id = get_dept_head(alert['user_id'])
            # For now, create a system log
            print(f"🔥 ESCALATION: Alert '{alert['title']}' escalated to level {new_level}")
            print(f"   Original recipient: {alert['user_id']}")
            print(f"   Time elapsed: >5 minutes without acknowledgment")
            
            escalated_count += 1
        
        if escalated_count > 0:
            print(f"⚠️ Dead Man's Switch: Escalated {escalated_count} alerts")
        
        return escalated_count
    
    def delete_notification(self, notification_id: str, user_id: str) -> bool:
        """Delete a notification."""
        try:
            supabase_service.client.table("notifications") \
                .delete() \
                .eq("id", notification_id) \
                .eq("user_id", user_id) \
                .execute()
            return True
        except Exception as e:
            print(f"Error deleting notification: {e}")
            return False


# Singleton instance
alert_service = AlertService()
