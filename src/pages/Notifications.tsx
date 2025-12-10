/**
 * NotificationsPage - Full-page view for all notifications
 * 
 * Features:
 * - Complete list of all notifications with filtering
 * - Bulk actions (mark all read, clear all)
 * - Real-time updates via Supabase
 * - Acknowledgment for critical alerts
 */

import { useEffect, useState, useCallback } from 'react';
import { Bell, Check, AlertTriangle, Info, CheckCircle, Trash2, Filter, RefreshCw, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/klens/Sidebar';
import { TopNav } from '@/components/klens/TopNav';

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

type FilterType = 'all' | 'unread' | 'critical' | 'warning';
type TabType = "dashboard" | "search" | "graph" | "iot" | "ar" | "compliance" | "documents" | "document-view" | "features" | "profile" | "settings" | "succession" | "analytics";

export default function NotificationsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Sidebar state (not used but required for Sidebar component)
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  
  // Handle tab changes - navigate to main dashboard
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    navigate('/dashboard');
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id || !token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/notifications/?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id, token]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications-page-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refresh on any change
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchNotifications]);

  // Mark as read
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/notifications/${id}/read`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Acknowledge notification
  const acknowledgeNotification = async (id: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/notifications/${id}/acknowledge`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: true, acknowledged_at: new Date().toISOString() } : n)
        );
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
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/notifications/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    switch (filter) {
      case 'unread': return !n.is_read;
      case 'critical': return n.type === 'CRITICAL';
      case 'warning': return n.type === 'WARNING';
      default: return true;
    }
  });

  // Get type icon
  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'CRITICAL': return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-success" />;
      default: return <Info className="w-5 h-5 text-primary" />;
    }
  };

  // Get type background
  const getTypeBg = (type: Notification['type'], isRead: boolean) => {
    if (isRead) return 'bg-card/50 border-border/50';
    switch (type) {
      case 'CRITICAL': return 'bg-destructive/10 border-destructive/30';
      case 'WARNING': return 'bg-warning/10 border-warning/30';
      case 'SUCCESS': return 'bg-success/10 border-success/30';
      default: return 'bg-primary/10 border-primary/30';
    }
  };

  // Format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const criticalCount = notifications.filter(n => n.type === 'CRITICAL' && !n.is_read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
      
      {/* Main Content */}
      <div className="pl-64">
        <TopNav />
        
        {/* Main Content */}
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
                    <p className="text-sm text-muted-foreground">
                      {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'} 
                      {criticalCount > 0 && <span className="text-destructive ml-2">• {criticalCount} critical</span>}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setIsRefreshing(true); fetchNotifications(); }}
                  className={`p-2 hover:bg-secondary rounded-lg transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                >
                  <RefreshCw className="w-5 h-5 text-muted-foreground" />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              {(['all', 'unread', 'critical', 'warning'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {f === 'all' && `All (${notifications.length})`}
                  {f === 'unread' && `Unread (${unreadCount})`}
                  {f === 'critical' && `Critical (${notifications.filter(n => n.type === 'CRITICAL').length})`}
                  {f === 'warning' && `Warnings (${notifications.filter(n => n.type === 'WARNING').length})`}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-muted-foreground mt-3">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12 glass-card">
                  <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No notifications</h3>
                  <p className="text-muted-foreground">
                    {filter === 'all' ? "You're all caught up!" : `No ${filter} notifications`}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-xl border transition-all hover:shadow-lg ${getTypeBg(notification.type, notification.is_read)}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className={`font-medium ${
                            notification.type === 'CRITICAL' ? 'text-destructive' :
                            notification.type === 'WARNING' ? 'text-warning' : 'text-foreground'
                          }`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(notification.created_at)}
                            </span>
                            {!notification.is_read && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                        </div>
                        
                        {notification.message && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-3">
                          {notification.requires_acknowledgment && !notification.acknowledged_at && (
                            <button
                              onClick={() => acknowledgeNotification(notification.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/20 text-destructive text-xs font-bold rounded-lg hover:bg-destructive/30 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              ACKNOWLEDGE
                            </button>
                          )}
                          
                          {notification.acknowledged_at && (
                            <span className="flex items-center gap-1 text-xs text-success">
                              <Check className="w-3.5 h-3.5" />
                              Acknowledged
                            </span>
                          )}

                          {!notification.is_read && !notification.requires_acknowledgment && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-primary hover:underline"
                            >
                              Mark as read
                            </button>
                          )}

                          {notification.link && (
                            <button
                              onClick={() => navigate(notification.link!)}
                              className="text-xs text-primary hover:underline"
                            >
                              View details →
                            </button>
                          )}

                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="ml-auto p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
