/**
 * K-LENS RBAC Permission System
 * Industrial-grade Role-Based Access Control for Frontend
 */

// ===================== TYPES =====================

export type Role = 'ADMIN' | 'MANAGER' | 'ENGINEER' | 'SAFETY_OFFICER' | 'OPERATOR';

export type Permission = 
  // User Management
  | 'USER_CREATE' | 'USER_DELETE' | 'USER_EDIT' | 'USER_VIEW_ALL' 
  | 'USER_ASSIGN_SHIFT' | 'USER_RESET_MFA'
  // Documents
  | 'DOC_UPLOAD' | 'DOC_EDIT' | 'DOC_DELETE' | 'DOC_APPROVE_DELETE'
  | 'DOC_VERSION' | 'DOC_VIEW_ALL' | 'DOC_VIEW_DEPT' | 'DOC_VIEW_ASSIGNED'
  | 'DOC_TAG_RISK' | 'DOC_AUDIT_VIEW'
  // Knowledge Graph
  | 'GRAPH_CONFIG' | 'GRAPH_VIEW_ALL' | 'GRAPH_VIEW_DEPT' 
  | 'GRAPH_VIEW_RISK' | 'GRAPH_VIEW_LOCAL'
  // IoT & UNS
  | 'IOT_CONFIG' | 'IOT_VIEW_ALL' | 'IOT_CALIBRATE' 
  | 'IOT_ALERTS_VIEW' | 'IOT_MONITOR'
  // Emergency & Override
  | 'EMERGENCY_GRANT' | 'EMERGENCY_REQUEST' | 'EMERGENCY_AUDIT'
  // Compliance
  | 'COMPLIANCE_VIEW' | 'COMPLIANCE_WRITE' | 'COMPLIANCE_FLAG'
  // Shift Management
  | 'SHIFT_BYPASS' | 'SHIFT_VIEW_ALL' | 'SHIFT_MANAGE'
  // Admin
  | 'ADMIN_SETTINGS' | 'ADMIN_GHOST_VIEW' | 'ADMIN_TRACE' | 'ADMIN_APPROVE';

// ===================== ROLE-PERMISSION MAPPING =====================

const ROLE_PERMISSIONS: Record<Role, Set<Permission>> = {
  ADMIN: new Set([
    // Admin has ALL permissions
    'USER_CREATE', 'USER_DELETE', 'USER_EDIT', 'USER_VIEW_ALL', 'USER_ASSIGN_SHIFT', 'USER_RESET_MFA',
    'DOC_UPLOAD', 'DOC_EDIT', 'DOC_DELETE', 'DOC_APPROVE_DELETE', 'DOC_VERSION', 'DOC_VIEW_ALL', 
    'DOC_VIEW_DEPT', 'DOC_VIEW_ASSIGNED', 'DOC_TAG_RISK', 'DOC_AUDIT_VIEW',
    'GRAPH_CONFIG', 'GRAPH_VIEW_ALL', 'GRAPH_VIEW_DEPT', 'GRAPH_VIEW_RISK', 'GRAPH_VIEW_LOCAL',
    'IOT_CONFIG', 'IOT_VIEW_ALL', 'IOT_CALIBRATE', 'IOT_ALERTS_VIEW', 'IOT_MONITOR',
    'EMERGENCY_GRANT', 'EMERGENCY_REQUEST', 'EMERGENCY_AUDIT',
    'COMPLIANCE_VIEW', 'COMPLIANCE_WRITE', 'COMPLIANCE_FLAG',
    'SHIFT_BYPASS', 'SHIFT_VIEW_ALL', 'SHIFT_MANAGE',
    'ADMIN_SETTINGS', 'ADMIN_GHOST_VIEW', 'ADMIN_TRACE', 'ADMIN_APPROVE',
  ]),
  
  MANAGER: new Set([
    'USER_VIEW_ALL', 'USER_ASSIGN_SHIFT',
    'DOC_VIEW_ALL', 'DOC_APPROVE_DELETE', 'DOC_AUDIT_VIEW',
    'GRAPH_VIEW_ALL',
    'IOT_VIEW_ALL',
    'EMERGENCY_REQUEST',
    'COMPLIANCE_VIEW',
    'SHIFT_BYPASS', 'SHIFT_VIEW_ALL', 'SHIFT_MANAGE',
    'ADMIN_TRACE', 'ADMIN_APPROVE',
  ]),
  
  ENGINEER: new Set([
    'DOC_UPLOAD', 'DOC_EDIT', 'DOC_VERSION', 'DOC_VIEW_DEPT', 'DOC_TAG_RISK',
    'GRAPH_VIEW_DEPT',
    'IOT_CALIBRATE', 'IOT_VIEW_ALL',
    'EMERGENCY_REQUEST',
    'COMPLIANCE_VIEW',
    'SHIFT_BYPASS',
  ]),
  
  SAFETY_OFFICER: new Set([
    'DOC_VIEW_ALL', 'DOC_AUDIT_VIEW',
    'GRAPH_VIEW_RISK', 'GRAPH_VIEW_ALL',
    'IOT_ALERTS_VIEW', 'IOT_VIEW_ALL',
    'EMERGENCY_AUDIT',
    'COMPLIANCE_VIEW', 'COMPLIANCE_WRITE', 'COMPLIANCE_FLAG',
    'SHIFT_BYPASS', 'SHIFT_VIEW_ALL',
  ]),
  
  OPERATOR: new Set([
    'DOC_VIEW_ASSIGNED',
    'GRAPH_VIEW_LOCAL',
    'IOT_MONITOR',
    'EMERGENCY_REQUEST',
    'COMPLIANCE_VIEW',
  ]),
};

// ===================== HELPER FUNCTIONS =====================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: string | undefined, permission: Permission): boolean {
  if (!role) return false;
  const normalizedRole = role.toUpperCase() as Role;
  const rolePerms = ROLE_PERMISSIONS[normalizedRole];
  if (!rolePerms) return false;
  return rolePerms.has(permission);
}

/**
 * Check if a role has ANY of the specified permissions
 */
export function hasAnyPermission(role: string | undefined, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

/**
 * Check if a role has ALL of the specified permissions
 */
export function hasAllPermissions(role: string | undefined, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: string | undefined): Permission[] {
  if (!role) return [];
  const normalizedRole = role.toUpperCase() as Role;
  const rolePerms = ROLE_PERMISSIONS[normalizedRole];
  if (!rolePerms) return [];
  return Array.from(rolePerms);
}

/**
 * Check if role can bypass shift restrictions
 */
export function canBypassShift(role: string | undefined): boolean {
  return hasPermission(role, 'SHIFT_BYPASS');
}

// ===================== ROLE METADATA =====================

export const ROLE_METADATA: Record<Role, { 
  displayName: string; 
  description: string; 
  color: string;
  icon: string;
}> = {
  ADMIN: {
    displayName: 'System Administrator',
    description: 'Full technical control. Can manage users, reset MFA, view ghost accounts.',
    color: 'amber',
    icon: 'Crown',
  },
  MANAGER: {
    displayName: 'Plant Manager',
    description: 'Full operational control. Can approve deletions, trace activity, manage shifts.',
    color: 'blue',
    icon: 'Shield',
  },
  ENGINEER: {
    displayName: 'Senior Engineer',
    description: 'Technical specialist. Can upload documents, calibrate sensors, tag risks.',
    color: 'purple',
    icon: 'Wrench',
  },
  SAFETY_OFFICER: {
    displayName: 'Safety Officer',
    description: 'Compliance guard. Global read access, can flag violations and audit.',
    color: 'emerald',
    icon: 'ShieldCheck',
  },
  OPERATOR: {
    displayName: 'Operator',
    description: 'Frontline worker. Shift-locked, view assigned documents and local systems.',
    color: 'slate',
    icon: 'User',
  },
};

// ===================== PERMISSION CATEGORIES =====================

export const PERMISSION_CATEGORIES = {
  USER_MGMT: 'User Management',
  DOCUMENTS: 'Documents',
  KNOWLEDGE: 'Knowledge Graph',
  IOT: 'IoT & UNS',
  EMERGENCY: 'Emergency',
  COMPLIANCE: 'Compliance',
  SHIFT: 'Shift Management',
  ADMIN: 'Administration',
} as const;

export const PERMISSION_METADATA: Record<Permission, { 
  description: string; 
  category: keyof typeof PERMISSION_CATEGORIES;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}> = {
  // User Management
  USER_CREATE: { description: 'Create new users', category: 'USER_MGMT', riskLevel: 'HIGH' },
  USER_DELETE: { description: 'Delete/Archive users', category: 'USER_MGMT', riskLevel: 'CRITICAL' },
  USER_EDIT: { description: 'Edit user profiles', category: 'USER_MGMT', riskLevel: 'MEDIUM' },
  USER_VIEW_ALL: { description: 'View all users', category: 'USER_MGMT', riskLevel: 'LOW' },
  USER_ASSIGN_SHIFT: { description: 'Assign shifts to users', category: 'USER_MGMT', riskLevel: 'MEDIUM' },
  USER_RESET_MFA: { description: 'Reset MFA for users', category: 'USER_MGMT', riskLevel: 'HIGH' },
  
  // Documents
  DOC_UPLOAD: { description: 'Upload documents', category: 'DOCUMENTS', riskLevel: 'MEDIUM' },
  DOC_EDIT: { description: 'Edit documents', category: 'DOCUMENTS', riskLevel: 'MEDIUM' },
  DOC_DELETE: { description: 'Delete documents', category: 'DOCUMENTS', riskLevel: 'HIGH' },
  DOC_APPROVE_DELETE: { description: 'Approve document deletions', category: 'DOCUMENTS', riskLevel: 'CRITICAL' },
  DOC_VERSION: { description: 'Manage document versions', category: 'DOCUMENTS', riskLevel: 'MEDIUM' },
  DOC_VIEW_ALL: { description: 'View all documents', category: 'DOCUMENTS', riskLevel: 'LOW' },
  DOC_VIEW_DEPT: { description: 'View department documents', category: 'DOCUMENTS', riskLevel: 'LOW' },
  DOC_VIEW_ASSIGNED: { description: 'View assigned documents only', category: 'DOCUMENTS', riskLevel: 'LOW' },
  DOC_TAG_RISK: { description: 'Tag documents as High Risk', category: 'DOCUMENTS', riskLevel: 'HIGH' },
  DOC_AUDIT_VIEW: { description: 'View document audit history', category: 'DOCUMENTS', riskLevel: 'MEDIUM' },
  
  // Knowledge Graph
  GRAPH_CONFIG: { description: 'Configure graph schema', category: 'KNOWLEDGE', riskLevel: 'HIGH' },
  GRAPH_VIEW_ALL: { description: 'View full knowledge graph', category: 'KNOWLEDGE', riskLevel: 'LOW' },
  GRAPH_VIEW_DEPT: { description: 'View department graph nodes', category: 'KNOWLEDGE', riskLevel: 'LOW' },
  GRAPH_VIEW_RISK: { description: 'View risk-related nodes', category: 'KNOWLEDGE', riskLevel: 'MEDIUM' },
  GRAPH_VIEW_LOCAL: { description: 'View local unit nodes', category: 'KNOWLEDGE', riskLevel: 'LOW' },
  
  // IoT
  IOT_CONFIG: { description: 'Configure sensors', category: 'IOT', riskLevel: 'HIGH' },
  IOT_VIEW_ALL: { description: 'View all IoT dashboards', category: 'IOT', riskLevel: 'LOW' },
  IOT_CALIBRATE: { description: 'Calibrate sensors', category: 'IOT', riskLevel: 'MEDIUM' },
  IOT_ALERTS_VIEW: { description: 'View safety alerts', category: 'IOT', riskLevel: 'LOW' },
  IOT_MONITOR: { description: 'Monitor dashboards', category: 'IOT', riskLevel: 'LOW' },
  
  // Emergency
  EMERGENCY_GRANT: { description: 'Grant emergency override', category: 'EMERGENCY', riskLevel: 'CRITICAL' },
  EMERGENCY_REQUEST: { description: 'Request emergency override', category: 'EMERGENCY', riskLevel: 'HIGH' },
  EMERGENCY_AUDIT: { description: 'Audit override history', category: 'EMERGENCY', riskLevel: 'MEDIUM' },
  
  // Compliance
  COMPLIANCE_VIEW: { description: 'View compliance reports', category: 'COMPLIANCE', riskLevel: 'LOW' },
  COMPLIANCE_WRITE: { description: 'Write compliance reports', category: 'COMPLIANCE', riskLevel: 'MEDIUM' },
  COMPLIANCE_FLAG: { description: 'Flag safety violations', category: 'COMPLIANCE', riskLevel: 'HIGH' },
  
  // Shift
  SHIFT_BYPASS: { description: 'Bypass shift restrictions', category: 'SHIFT', riskLevel: 'MEDIUM' },
  SHIFT_VIEW_ALL: { description: 'View all shift schedules', category: 'SHIFT', riskLevel: 'LOW' },
  SHIFT_MANAGE: { description: 'Manage shift schedules', category: 'SHIFT', riskLevel: 'MEDIUM' },
  
  // Admin
  ADMIN_SETTINGS: { description: 'Access admin settings', category: 'ADMIN', riskLevel: 'HIGH' },
  ADMIN_GHOST_VIEW: { description: 'View ghost/archived users', category: 'ADMIN', riskLevel: 'MEDIUM' },
  ADMIN_TRACE: { description: 'Trace user activity', category: 'ADMIN', riskLevel: 'HIGH' },
  ADMIN_APPROVE: { description: 'Approve nuclear key requests', category: 'ADMIN', riskLevel: 'CRITICAL' },
};
