/**
 * usePermissions Hook - Industrial RBAC for React
 * 
 * Usage:
 *   const { can, canAny, canAll, isAdmin, isOnShift } = usePermissions();
 *   
 *   // Check single permission
 *   {can('DOC_UPLOAD') && <UploadButton />}
 *   
 *   // Check any of multiple permissions
 *   {canAny(['DOC_VIEW_ALL', 'DOC_VIEW_DEPT']) && <DocumentList />}
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Permission, 
  Role,
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  canBypassShift as checkCanBypassShift,
  getRolePermissions,
  ROLE_METADATA
} from '@/lib/permissions';


export interface UsePermissionsReturn {
  /** User's role */
  role: string | undefined;
  
  /** Check if user has a specific permission */
  can: (permission: Permission) => boolean;
  
  /** Check if user has ANY of the listed permissions */
  canAny: (permissions: Permission[]) => boolean;
  
  /** Check if user has ALL of the listed permissions */
  canAll: (permissions: Permission[]) => boolean;
  
  /** Get all permissions for current user */
  permissions: Permission[];
  
  /** Role checks */
  isAdmin: boolean;
  isManager: boolean;
  isEngineer: boolean;
  isSafetyOfficer: boolean;
  isOperator: boolean;
  
  /** Shift checks */
  canBypassShift: boolean;
  isOnShift: boolean;
  
  /** Role metadata */
  roleDisplayName: string;
  roleDescription: string;
  roleColor: string;
}

export function usePermissions(): UsePermissionsReturn {
  const { user, industrialContext } = useAuth();
  
  const role = user?.role;
  
  // Memoize permission checks to avoid recalculating on every render
  const permissionHelpers = useMemo(() => ({
    can: (permission: Permission) => hasPermission(role, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(role, permissions),
    permissions: getRolePermissions(role),
  }), [role]);
  
  // Role checks
  const roleChecks = useMemo(() => ({
    isAdmin: role === 'ADMIN',
    isManager: role === 'MANAGER',
    isEngineer: role === 'ENGINEER',
    isSafetyOfficer: role === 'SAFETY_OFFICER',
    isOperator: role === 'OPERATOR',
  }), [role]);
  
  // Shift checks
  const shiftChecks = useMemo(() => ({
    canBypassShift: checkCanBypassShift(role),
    isOnShift: industrialContext?.isOnShift ?? true,
  }), [role, industrialContext?.isOnShift]);
  
  // Role metadata
  const roleMetadata = useMemo(() => {
    const metadata = role ? ROLE_METADATA[role as Role] : null;
    return {
      roleDisplayName: metadata?.displayName || role || 'Unknown',
      roleDescription: metadata?.description || '',
      roleColor: metadata?.color || 'slate',
    };
  }, [role]);
  
  return {
    role,
    ...permissionHelpers,
    ...roleChecks,
    ...shiftChecks,
    ...roleMetadata,
  };
}

export default usePermissions;
