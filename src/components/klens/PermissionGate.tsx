/**
 * PermissionGate - Declarative permission-based rendering
 * 
 * Usage:
 *   <PermissionGate permission="DOC_UPLOAD">
 *     <UploadButton />
 *   </PermissionGate>
 * 
 *   <PermissionGate anyOf={['DOC_VIEW_ALL', 'DOC_VIEW_DEPT']} fallback={<AccessDenied />}>
 *     <DocumentList />
 *   </PermissionGate>
 */

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/lib/permissions';
import { Shield, Lock } from 'lucide-react';

interface PermissionGateProps {
  /** Single permission to check */
  permission?: Permission;
  
  /** Check if user has ANY of these permissions */
  anyOf?: Permission[];
  
  /** Check if user has ALL of these permissions */
  allOf?: Permission[];
  
  /** Require user to be on shift (for operators) */
  requireOnShift?: boolean;
  
  /** Content to show when authorized */
  children: ReactNode;
  
  /** Content to show when NOT authorized (optional) */
  fallback?: ReactNode;
  
  /** Show nothing (instead of fallback) when not authorized */
  hideIfDenied?: boolean;
}

export function PermissionGate({
  permission,
  anyOf,
  allOf,
  requireOnShift = false,
  children,
  fallback,
  hideIfDenied = false,
}: PermissionGateProps) {
  const { can, canAny, canAll, isOnShift, canBypassShift } = usePermissions();
  
  let hasAccess = true;
  
  // Check single permission
  if (permission) {
    hasAccess = can(permission);
  }
  
  // Check any of multiple permissions
  if (anyOf && anyOf.length > 0) {
    hasAccess = hasAccess && canAny(anyOf);
  }
  
  // Check all permissions
  if (allOf && allOf.length > 0) {
    hasAccess = hasAccess && canAll(allOf);
  }
  
  // Check shift requirement
  if (requireOnShift && !canBypassShift && !isOnShift) {
    hasAccess = false;
  }
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  if (hideIfDenied) {
    return null;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Default access denied message
  return null;
}

/**
 * AccessDenied - Standard access denied component
 */
interface AccessDeniedProps {
  message?: string;
  showIcon?: boolean;
  className?: string;
}

export function AccessDenied({ 
  message = "You don't have permission to access this feature.",
  showIcon = true,
  className = ""
}: AccessDeniedProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {showIcon && (
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">Access Denied</h3>
      <p className="text-sm text-slate-400 max-w-md">{message}</p>
    </div>
  );
}

/**
 * ShiftRestricted - Message for off-shift users
 */
interface ShiftRestrictedProps {
  shiftPattern?: string;
  className?: string;
}

export function ShiftRestricted({ shiftPattern, className = "" }: ShiftRestrictedProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
        <Shield className="w-8 h-8 text-amber-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Off-Shift Restriction</h3>
      <p className="text-sm text-slate-400 max-w-md">
        This action is restricted to your scheduled shift hours
        {shiftPattern && ` (${shiftPattern})`}.
      </p>
      <p className="text-xs text-slate-500 mt-2">
        Contact your supervisor for emergency access.
      </p>
    </div>
  );
}

/**
 * RoleBadge - Display user's role with styling
 */
interface RoleBadgeProps {
  role: string;
  size?: 'sm' | 'md' | 'lg';
}

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  const colorMap: Record<string, string> = {
    ADMIN: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    MANAGER: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    ENGINEER: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    SAFETY_OFFICER: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    OPERATOR: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  
  const sizeMap = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  
  return (
    <span className={`rounded-full border font-medium ${colorMap[role] || colorMap.OPERATOR} ${sizeMap[size]}`}>
      {role}
    </span>
  );
}

export default PermissionGate;
