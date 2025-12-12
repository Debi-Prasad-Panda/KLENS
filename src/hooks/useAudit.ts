/**
 * useAudit - Hook for logging user actions to audit trail
 * Automatically tracks user actions across the application
 */

import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAccessToken } from '@/lib/supabase';

// Action types
export type AuditAction =
     | 'VIEW'
     | 'CREATE'
     | 'EDIT'
     | 'DELETE'
     | 'REVERT'
     | 'APPROVE'
     | 'REJECT'
     | 'LOGIN'
     | 'LOGOUT'
     | 'EXPORT'
     | 'PERMISSION_CHANGE'
     | 'UPLOAD'
     | 'DOWNLOAD'
     | 'SEARCH'
     | 'SYSTEM';

export type AuditCategory =
     | 'DOCUMENT'
     | 'USER'
     | 'SYSTEM'
     | 'SECURITY'
     | 'COMPLIANCE';

export type AuditSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

interface LogOptions {
     action: AuditAction;
     category: AuditCategory;
     severity?: AuditSeverity;
     resourceType: string;
     resourceId?: string;
     resourceName: string;
     metadata?: Record<string, any>;
}

interface AuditLog {
     id: string;
     action: string;
     category: string;
     severity: string;
     user_id: string;
     user_name: string;
     user_email: string;
     user_role: string;
     resource_type: string;
     resource_id?: string;
     resource_name: string;
     metadata?: Record<string, any>;
     ip_address?: string;
     user_agent?: string;
     created_at: string;
}

interface AuditStats {
     total: number;
     today: number;
     critical_count: number;
     unique_users: number;
     action_counts: Record<string, number>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export function useAudit() {
     const { user } = useAuth();

     /**
      * Log an action to the audit trail
      */
     const logAction = useCallback(async (options: LogOptions): Promise<void> => {
          try {
               const token = await getAccessToken();
               if (!token) {
                    console.warn('No auth token, skipping audit log');
                    return;
               }

               const response = await fetch(`${API_URL}/audit/log`, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                         Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                         action: options.action,
                         category: options.category,
                         severity: options.severity || 'INFO',
                         resource_type: options.resourceType,
                         resource_id: options.resourceId,
                         resource_name: options.resourceName,
                         metadata: options.metadata
                    })
               });

               if (!response.ok) {
                    console.warn('Failed to log audit action:', await response.text());
               }
          } catch (error) {
               // Don't let audit logging failures break the app
               console.warn('Audit logging error:', error);
          }
     }, []);

     /**
      * Fetch audit logs with optional filters
      */
     const fetchLogs = useCallback(async (params?: {
          limit?: number;
          offset?: number;
          action?: string;
          category?: string;
          severity?: string;
          dateFrom?: string;
          dateTo?: string;
          search?: string;
     }): Promise<AuditLog[]> => {
          try {
               const token = await getAccessToken();
               if (!token) return [];

               const queryParams = new URLSearchParams();
               if (params?.limit) queryParams.set('limit', String(params.limit));
               if (params?.offset) queryParams.set('offset', String(params.offset));
               if (params?.action) queryParams.set('action', params.action);
               if (params?.category) queryParams.set('category', params.category);
               if (params?.severity) queryParams.set('severity', params.severity);
               if (params?.dateFrom) queryParams.set('date_from', params.dateFrom);
               if (params?.dateTo) queryParams.set('date_to', params.dateTo);
               if (params?.search) queryParams.set('search', params.search);

               const response = await fetch(`${API_URL}/audit/logs?${queryParams}`, {
                    headers: { Authorization: `Bearer ${token}` }
               });

               if (response.ok) {
                    return await response.json();
               }
               return [];
          } catch (error) {
               console.warn('Failed to fetch audit logs:', error);
               return [];
          }
     }, []);

     /**
      * Fetch audit statistics
      */
     const fetchStats = useCallback(async (): Promise<AuditStats | null> => {
          try {
               const token = await getAccessToken();
               if (!token) return null;

               const response = await fetch(`${API_URL}/audit/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
               });

               if (response.ok) {
                    return await response.json();
               }
               return null;
          } catch (error) {
               console.warn('Failed to fetch audit stats:', error);
               return null;
          }
     }, []);

     /**
      * Fetch security alerts
      */
     const fetchSecurityAlerts = useCallback(async (limit = 20): Promise<AuditLog[]> => {
          try {
               const token = await getAccessToken();
               if (!token) return [];

               const response = await fetch(`${API_URL}/audit/security-alerts?limit=${limit}`, {
                    headers: { Authorization: `Bearer ${token}` }
               });

               if (response.ok) {
                    return await response.json();
               }
               return [];
          } catch (error) {
               console.warn('Failed to fetch security alerts:', error);
               return [];
          }
     }, []);

     // Convenience methods for common actions
     const logView = useCallback((resourceType: string, resourceName: string, resourceId?: string) =>
          logAction({ action: 'VIEW', category: 'DOCUMENT', resourceType, resourceName, resourceId }),
          [logAction]);

     const logCreate = useCallback((resourceType: string, resourceName: string, resourceId?: string) =>
          logAction({ action: 'CREATE', category: 'DOCUMENT', resourceType, resourceName, resourceId }),
          [logAction]);

     const logEdit = useCallback((resourceType: string, resourceName: string, resourceId?: string, changes?: Record<string, any>) =>
          logAction({ action: 'EDIT', category: 'DOCUMENT', resourceType, resourceName, resourceId, metadata: { changes } }),
          [logAction]);

     const logDelete = useCallback((resourceType: string, resourceName: string, resourceId?: string) =>
          logAction({ action: 'DELETE', category: 'DOCUMENT', severity: 'WARNING', resourceType, resourceName, resourceId }),
          [logAction]);

     const logUpload = useCallback((fileName: string, fileId?: string, metadata?: Record<string, any>) =>
          logAction({ action: 'UPLOAD', category: 'DOCUMENT', resourceType: 'FILE', resourceName: fileName, resourceId: fileId, metadata }),
          [logAction]);

     const logSearch = useCallback((query: string, results?: number) =>
          logAction({ action: 'SEARCH', category: 'DOCUMENT', resourceType: 'SEARCH', resourceName: `Search: "${query}"`, metadata: { query, results } }),
          [logAction]);

     const logExport = useCallback((resourceType: string, resourceName: string, format?: string) =>
          logAction({ action: 'EXPORT', category: 'DOCUMENT', resourceType, resourceName, metadata: { format } }),
          [logAction]);

     const logPermissionChange = useCallback((target: string, changes: Record<string, any>) =>
          logAction({ action: 'PERMISSION_CHANGE', category: 'SECURITY', severity: 'WARNING', resourceType: 'PERMISSION', resourceName: target, metadata: changes }),
          [logAction]);

     return {
          // Core methods
          logAction,
          fetchLogs,
          fetchStats,
          fetchSecurityAlerts,

          // Convenience methods
          logView,
          logCreate,
          logEdit,
          logDelete,
          logUpload,
          logSearch,
          logExport,
          logPermissionChange
     };
}
