/**
 * NotificationBell - Industrial-Grade Real-Time Notification System
 * 
 * Features:
 * - Real-time updates via Supabase Realtime subscriptions
 * - Critical alert acknowledgment flow
 * - Toast popups with sonner
 * - Unread count badge with pulse animation
 */

import { useEffect, useState, useCallback } from 'react';
import { Bell, Check, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string | null;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  link: string | null;
  is_read: boolean;
  requires_acknowledgment: boolean;
  acknowledged_at: string | null;
  created_at: string;
  source_type?: string;
  metadata?: Record<string, unknown>;
}

export function NotificationBell() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/notifications/?limit=15`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, token]);

  // Initial fetch
  useEffect(() => {
    if (user?.id && token) {
      fetchNotifications();
    }
  }, [user?.id, token, fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;

          // Add to list
          setNotifications((prev) => [newNotif, ...prev].slice(0, 15));
          setUnreadCount((prev) => prev + 1);

          // Show toast based on type
          showNotificationToast(newNotif);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );

          // Recalculate unread count
          setNotifications((prev) => {
            setUnreadCount(prev.filter((n) => !n.is_read).length);
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Show toast for new notifications
  const showNotificationToast = (notif: Notification) => {
    if (notif.type === 'CRITICAL') {
      toast.error(notif.title, {
        description: notif.message || undefined,
        duration: 10000,
        action: {
          label: 'ACKNOWLEDGE',
          onClick: () => acknowledgeNotification(notif.id),
        },
        icon: <AlertTriangle className="w-5 h-5 text-destructive" />,
      });
    } else if (notif.type === 'WARNING') {
      toast.warning(notif.title, {
        description: notif.message || undefined,
        duration: 5000,
      });
    } else if (notif.type === 'SUCCESS') {
      toast.success(notif.title, {
        description: notif.message || undefined,
      });
    } else {
      toast(notif.title, {
        description: notif.message || undefined,
      });
    }
  };

  // Mark as read
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/notifications/${id}/read`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Acknowledge critical notification
  const acknowledgeNotification = async (id: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/notifications/${id}/acknowledge`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id
              ? { ...n, is_read: true, acknowledged_at: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        toast.success('Alert acknowledged');
      }
    } catch (error) {
      console.error('Failed to acknowledge:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/notifications/read-all`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Get icon for notification type
  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'CRITICAL':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };

  // Get background color for notification type
  const getTypeBg = (type: Notification['type'], isRead: boolean) => {
    if (isRead) return 'bg-card/30';

    switch (type) {
      case 'CRITICAL':
        return 'bg-destructive/10 border-l-2 border-l-destructive';
      case 'WARNING':
        return 'bg-warning/10 border-l-2 border-l-warning';
      case 'SUCCESS':
        return 'bg-success/10 border-l-2 border-l-success';
      default:
        return 'bg-primary/10 border-l-2 border-l-primary';
    }
  };

  // Format time ago
  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-bell-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative notification-bell-container">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl bg-secondary/50 border border-border flex items-center justify-center hover:bg-secondary transition-colors"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-destructive text-[10px] font-bold text-destructive-foreground rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/30">
            <div>
              <h4 className="font-bold text-foreground text-sm">Notifications</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-muted-foreground mt-2">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You'll see alerts and updates here
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors ${getTypeBg(notif.type, notif.is_read)}`}
                  onClick={() => {
                    if (!notif.is_read) markAsRead(notif.id);
                    if (notif.link) window.location.href = notif.link;
                  }}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getTypeIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h5
                          className={`text-sm font-medium truncate ${
                            notif.type === 'CRITICAL'
                              ? 'text-destructive'
                              : notif.type === 'WARNING'
                              ? 'text-warning'
                              : 'text-foreground'
                          }`}
                        >
                          {notif.title}
                        </h5>
                        {!notif.is_read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      {notif.message && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-muted-foreground">
                          {timeAgo(notif.created_at)}
                        </span>
                        {notif.requires_acknowledgment && !notif.acknowledged_at && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              acknowledgeNotification(notif.id);
                            }}
                            className="flex items-center gap-1 px-2 py-1 bg-destructive/20 text-destructive text-[10px] font-bold rounded hover:bg-destructive/30 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            ACKNOWLEDGE
                          </button>
                        )}
                        {notif.acknowledged_at && (
                          <span className="flex items-center gap-1 text-[10px] text-success">
                            <Check className="w-3 h-3" />
                            Acknowledged
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-border bg-secondary/20">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                className="w-full py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium"
              >
                View All Notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
