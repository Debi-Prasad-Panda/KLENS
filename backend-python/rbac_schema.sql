-- =============================================================
-- K-LENS INDUSTRIAL RBAC SYSTEM
-- =============================================================
-- Run this AFTER admin_setup.sql
-- Implements 5-tier role hierarchy with permission matrix
-- =============================================================

-- ============================
-- 1. ROLE ENUM TYPE
-- ============================
-- Note: If role column already has data, we need to migrate carefully

-- First, add the access_scopes column if not exists
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS access_scopes TEXT[] DEFAULT '{}';

-- Add permissions column for granular overrides
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}';

-- Add can_bypass_shift flag for managers/admins
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS can_bypass_shift BOOLEAN DEFAULT false;

-- Update existing roles to use proper naming
UPDATE public.user_profiles SET role = 'ADMIN' WHERE role = 'admin';
UPDATE public.user_profiles SET role = 'MANAGER' WHERE role = 'manager';
UPDATE public.user_profiles SET role = 'OPERATOR' WHERE role = 'operator';
UPDATE public.user_profiles SET role = 'SAFETY_OFFICER' WHERE role = 'safety_officer';
UPDATE public.user_profiles SET role = 'ENGINEER' WHERE role = 'engineer';

-- Set bypass_shift for privileged roles
UPDATE public.user_profiles SET can_bypass_shift = true WHERE role IN ('ADMIN', 'MANAGER', 'ENGINEER', 'SAFETY_OFFICER');

-- ============================
-- 2. PERMISSION DEFINITIONS
-- ============================

-- Create permissions table for reference
CREATE TABLE IF NOT EXISTS public.rbac_permissions (
    action TEXT PRIMARY KEY,
    description TEXT,
    category TEXT,
    risk_level TEXT DEFAULT 'LOW' -- LOW, MEDIUM, HIGH, CRITICAL
);

-- Insert all permissions
INSERT INTO public.rbac_permissions (action, description, category, risk_level) VALUES
    -- User Management
    ('USER_CREATE', 'Create new users', 'USER_MGMT', 'HIGH'),
    ('USER_DELETE', 'Delete/Archive users', 'USER_MGMT', 'CRITICAL'),
    ('USER_EDIT', 'Edit user profiles', 'USER_MGMT', 'MEDIUM'),
    ('USER_VIEW_ALL', 'View all users', 'USER_MGMT', 'LOW'),
    ('USER_ASSIGN_SHIFT', 'Assign shifts to users', 'USER_MGMT', 'MEDIUM'),
    ('USER_RESET_MFA', 'Reset MFA for users', 'USER_MGMT', 'HIGH'),
    
    -- Documents
    ('DOC_UPLOAD', 'Upload documents', 'DOCUMENTS', 'MEDIUM'),
    ('DOC_EDIT', 'Edit documents', 'DOCUMENTS', 'MEDIUM'),
    ('DOC_DELETE', 'Delete documents', 'DOCUMENTS', 'HIGH'),
    ('DOC_APPROVE_DELETE', 'Approve document deletions', 'DOCUMENTS', 'CRITICAL'),
    ('DOC_VERSION', 'Manage document versions', 'DOCUMENTS', 'MEDIUM'),
    ('DOC_VIEW_ALL', 'View all documents', 'DOCUMENTS', 'LOW'),
    ('DOC_VIEW_DEPT', 'View department documents', 'DOCUMENTS', 'LOW'),
    ('DOC_VIEW_ASSIGNED', 'View assigned documents only', 'DOCUMENTS', 'LOW'),
    ('DOC_TAG_RISK', 'Tag documents as High Risk', 'DOCUMENTS', 'HIGH'),
    ('DOC_AUDIT_VIEW', 'View document audit history', 'DOCUMENTS', 'MEDIUM'),
    
    -- Knowledge Graph
    ('GRAPH_CONFIG', 'Configure graph schema', 'KNOWLEDGE', 'HIGH'),
    ('GRAPH_VIEW_ALL', 'View full knowledge graph', 'KNOWLEDGE', 'LOW'),
    ('GRAPH_VIEW_DEPT', 'View department graph nodes', 'KNOWLEDGE', 'LOW'),
    ('GRAPH_VIEW_RISK', 'View risk-related nodes', 'KNOWLEDGE', 'MEDIUM'),
    ('GRAPH_VIEW_LOCAL', 'View local unit nodes', 'KNOWLEDGE', 'LOW'),
    
    -- IoT & UNS
    ('IOT_CONFIG', 'Configure sensors', 'IOT', 'HIGH'),
    ('IOT_VIEW_ALL', 'View all IoT dashboards', 'IOT', 'LOW'),
    ('IOT_CALIBRATE', 'Calibrate sensors', 'IOT', 'MEDIUM'),
    ('IOT_ALERTS_VIEW', 'View safety alerts', 'IOT', 'LOW'),
    ('IOT_MONITOR', 'Monitor dashboards', 'IOT', 'LOW'),
    
    -- Emergency & Override
    ('EMERGENCY_GRANT', 'Grant emergency override', 'EMERGENCY', 'CRITICAL'),
    ('EMERGENCY_REQUEST', 'Request emergency override', 'EMERGENCY', 'HIGH'),
    ('EMERGENCY_AUDIT', 'Audit override history', 'EMERGENCY', 'MEDIUM'),
    
    -- Compliance
    ('COMPLIANCE_VIEW', 'View compliance reports', 'COMPLIANCE', 'LOW'),
    ('COMPLIANCE_WRITE', 'Write compliance reports', 'COMPLIANCE', 'MEDIUM'),
    ('COMPLIANCE_FLAG', 'Flag safety violations', 'COMPLIANCE', 'HIGH'),
    
    -- Shift Management
    ('SHIFT_BYPASS', 'Bypass shift restrictions', 'SHIFT', 'MEDIUM'),
    ('SHIFT_VIEW_ALL', 'View all shift schedules', 'SHIFT', 'LOW'),
    ('SHIFT_MANAGE', 'Manage shift schedules', 'SHIFT', 'MEDIUM'),
    
    -- Admin
    ('ADMIN_SETTINGS', 'Access admin settings', 'ADMIN', 'HIGH'),
    ('ADMIN_GHOST_VIEW', 'View ghost/archived users', 'ADMIN', 'MEDIUM'),
    ('ADMIN_TRACE', 'Trace user activity', 'ADMIN', 'HIGH'),
    ('ADMIN_APPROVE', 'Approve nuclear key requests', 'ADMIN', 'CRITICAL')
ON CONFLICT (action) DO NOTHING;

-- ============================
-- 3. ROLE-PERMISSION MAPPING
-- ============================

CREATE TABLE IF NOT EXISTS public.rbac_role_permissions (
    role TEXT NOT NULL,
    action TEXT NOT NULL REFERENCES public.rbac_permissions(action),
    PRIMARY KEY (role, action)
);

-- Clear existing mappings
TRUNCATE public.rbac_role_permissions;

-- ADMIN - Full technical control
INSERT INTO public.rbac_role_permissions (role, action)
SELECT 'ADMIN', action FROM public.rbac_permissions;

-- MANAGER - Full operational control
INSERT INTO public.rbac_role_permissions (role, action) VALUES
    ('MANAGER', 'USER_VIEW_ALL'),
    ('MANAGER', 'USER_ASSIGN_SHIFT'),
    ('MANAGER', 'DOC_VIEW_ALL'),
    ('MANAGER', 'DOC_APPROVE_DELETE'),
    ('MANAGER', 'DOC_AUDIT_VIEW'),
    ('MANAGER', 'GRAPH_VIEW_ALL'),
    ('MANAGER', 'IOT_VIEW_ALL'),
    ('MANAGER', 'EMERGENCY_REQUEST'),
    ('MANAGER', 'COMPLIANCE_VIEW'),
    ('MANAGER', 'SHIFT_BYPASS'),
    ('MANAGER', 'SHIFT_VIEW_ALL'),
    ('MANAGER', 'SHIFT_MANAGE'),
    ('MANAGER', 'ADMIN_TRACE'),
    ('MANAGER', 'ADMIN_APPROVE');

-- ENGINEER - Technical specialist
INSERT INTO public.rbac_role_permissions (role, action) VALUES
    ('ENGINEER', 'DOC_UPLOAD'),
    ('ENGINEER', 'DOC_EDIT'),
    ('ENGINEER', 'DOC_VERSION'),
    ('ENGINEER', 'DOC_VIEW_DEPT'),
    ('ENGINEER', 'DOC_TAG_RISK'),
    ('ENGINEER', 'GRAPH_VIEW_DEPT'),
    ('ENGINEER', 'IOT_CALIBRATE'),
    ('ENGINEER', 'IOT_VIEW_ALL'),
    ('ENGINEER', 'EMERGENCY_REQUEST'),
    ('ENGINEER', 'COMPLIANCE_VIEW'),
    ('ENGINEER', 'SHIFT_BYPASS');

-- SAFETY_OFFICER - Global read, compliance write
INSERT INTO public.rbac_role_permissions (role, action) VALUES
    ('SAFETY_OFFICER', 'DOC_VIEW_ALL'),
    ('SAFETY_OFFICER', 'DOC_AUDIT_VIEW'),
    ('SAFETY_OFFICER', 'GRAPH_VIEW_RISK'),
    ('SAFETY_OFFICER', 'GRAPH_VIEW_ALL'),
    ('SAFETY_OFFICER', 'IOT_ALERTS_VIEW'),
    ('SAFETY_OFFICER', 'IOT_VIEW_ALL'),
    ('SAFETY_OFFICER', 'EMERGENCY_AUDIT'),
    ('SAFETY_OFFICER', 'COMPLIANCE_VIEW'),
    ('SAFETY_OFFICER', 'COMPLIANCE_WRITE'),
    ('SAFETY_OFFICER', 'COMPLIANCE_FLAG'),
    ('SAFETY_OFFICER', 'SHIFT_BYPASS'),
    ('SAFETY_OFFICER', 'SHIFT_VIEW_ALL');

-- OPERATOR - Restricted to assigned resources
INSERT INTO public.rbac_role_permissions (role, action) VALUES
    ('OPERATOR', 'DOC_VIEW_ASSIGNED'),
    ('OPERATOR', 'GRAPH_VIEW_LOCAL'),
    ('OPERATOR', 'IOT_MONITOR'),
    ('OPERATOR', 'EMERGENCY_REQUEST'),
    ('OPERATOR', 'COMPLIANCE_VIEW');

-- ============================
-- 4. PERMISSION CHECK FUNCTION
-- ============================

CREATE OR REPLACE FUNCTION public.check_permission(
    p_user_id UUID,
    p_action TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_role TEXT;
    v_custom_permissions TEXT[];
    v_has_permission BOOLEAN;
BEGIN
    -- Get user's role and custom permissions
    SELECT role, permissions INTO v_role, v_custom_permissions
    FROM public.user_profiles
    WHERE id = p_user_id;
    
    IF v_role IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check custom permissions first (override)
    IF p_action = ANY(v_custom_permissions) THEN
        RETURN true;
    END IF;
    
    -- Check role-based permissions
    SELECT EXISTS(
        SELECT 1 FROM public.rbac_role_permissions
        WHERE role = v_role AND action = p_action
    ) INTO v_has_permission;
    
    RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================
-- 5. CHECK ROLE PERMISSION (Simpler function)
-- ============================

CREATE OR REPLACE FUNCTION public.check_role_permission(
    p_role TEXT,
    p_action TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM public.rbac_role_permissions
        WHERE role = p_role AND action = p_action
    );
END;
$$ LANGUAGE plpgsql;

-- ============================
-- 6. GET USER PERMISSIONS
-- ============================

CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id UUID)
RETURNS TABLE (action TEXT, description TEXT, category TEXT) AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role FROM public.user_profiles WHERE id = p_user_id;
    
    RETURN QUERY
    SELECT rp.action, rp.description, rp.category
    FROM public.rbac_role_permissions rrp
    JOIN public.rbac_permissions rp ON rrp.action = rp.action
    WHERE rrp.role = v_role
    
    UNION
    
    SELECT rp.action, rp.description, rp.category
    FROM public.user_profiles up
    CROSS JOIN LATERAL unnest(up.permissions) AS perm(action)
    JOIN public.rbac_permissions rp ON perm.action = rp.action
    WHERE up.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================
-- 7. CAN USER ACCESS SCOPE
-- ============================

CREATE OR REPLACE FUNCTION public.can_access_scope(
    p_user_id UUID,
    p_scope TEXT -- e.g., 'BOILER_B7', 'ELEC_GRID'
) RETURNS BOOLEAN AS $$
DECLARE
    v_role TEXT;
    v_scopes TEXT[];
BEGIN
    SELECT role, access_scopes INTO v_role, v_scopes
    FROM public.user_profiles
    WHERE id = p_user_id;
    
    -- Admins/Managers can access everything
    IF v_role IN ('ADMIN', 'MANAGER') THEN
        RETURN true;
    END IF;
    
    -- Safety Officers can access everything for auditing
    IF v_role = 'SAFETY_OFFICER' THEN
        RETURN true;
    END IF;
    
    -- Check if scope is in user's assigned scopes
    IF v_scopes IS NULL OR array_length(v_scopes, 1) IS NULL THEN
        RETURN true; -- No scopes assigned = can access all
    END IF;
    
    RETURN p_scope = ANY(v_scopes);
END;
$$ LANGUAGE plpgsql;

-- ============================
-- 8. UPDATE INDUSTRIAL CONTEXT
-- ============================

-- Drop existing function first (return type changed)
DROP FUNCTION IF EXISTS public.get_user_industrial_context(UUID);

-- Update the get_user_industrial_context function to include permissions
CREATE OR REPLACE FUNCTION public.get_user_industrial_context(target_user_id UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    role TEXT,
    department TEXT,
    shift_pattern TEXT,
    current_status TEXT,
    is_on_shift BOOLEAN,
    has_expired_certs BOOLEAN,
    expired_cert_count BIGINT,
    can_bypass_shift BOOLEAN,
    access_scopes TEXT[],
    permissions TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.full_name,
        p.role,
        p.department,
        p.shift_pattern,
        p.current_status,
        public.is_user_on_shift(p.id) AS is_on_shift,
        EXISTS(
            SELECT 1 FROM public.user_certifications c 
            WHERE c.user_id = p.id AND c.expiry_date < CURRENT_DATE
        ) AS has_expired_certs,
        (
            SELECT COUNT(*) FROM public.user_certifications c 
            WHERE c.user_id = p.id AND c.expiry_date < CURRENT_DATE
        ) AS expired_cert_count,
        COALESCE(p.can_bypass_shift, false) AS can_bypass_shift,
        COALESCE(p.access_scopes, '{}') AS access_scopes,
        COALESCE(p.permissions, '{}') AS permissions
    FROM public.user_profiles p
    WHERE p.id = target_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================
-- NOTES:
-- ============================
-- Usage examples:
-- SELECT check_permission('user-uuid', 'DOC_UPLOAD');
-- SELECT check_role_permission('ENGINEER', 'DOC_UPLOAD');
-- SELECT * FROM get_user_permissions('user-uuid');
-- SELECT can_access_scope('user-uuid', 'BOILER_B7');
-- =============================================================
