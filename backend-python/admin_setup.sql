-- =============================================================
-- K-LENS ADMIN SETUP & WORKFORCE GOVERNANCE ENHANCEMENT
-- =============================================================
-- RUN THIS AFTER auth_tables.sql TO:
-- 1. Add Ghost Mode & Employee ID fields
-- 2. Promote a user to ADMIN
-- 3. Add allowed_ip_range for geo-fencing
-- =============================================================

-- ============================
-- 1. SCHEMA ENHANCEMENTS
-- ============================

-- Add Ghost Mode columns to user_profiles (run each separately for safety)
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS employee_id TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS archived_by UUID;

-- Set defaults for existing rows
UPDATE public.user_profiles SET is_active = true WHERE is_active IS NULL;
UPDATE public.user_profiles SET is_archived = false WHERE is_archived IS NULL;

-- Add geo-fencing to shift_schedules
ALTER TABLE public.shift_schedules ADD COLUMN IF NOT EXISTS allowed_ip_range CIDR;

-- Index for employee_id lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_employee_id ON public.user_profiles(employee_id);

-- ============================
-- 2. GHOST MODE FUNCTIONS
-- ============================

-- Archive a user (Ghost Mode) instead of deleting
CREATE OR REPLACE FUNCTION public.archive_user(target_user_id UUID, admin_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.user_profiles
    SET 
        is_active = false,
        is_archived = true,
        archived_at = NOW(),
        archived_by = admin_user_id
    WHERE id = target_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restore a ghost user
CREATE OR REPLACE FUNCTION public.restore_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.user_profiles
    SET 
        is_active = true,
        is_archived = false,
        archived_at = NULL,
        archived_by = NULL
    WHERE id = target_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================
-- 3. ADMIN PROMOTION
-- ============================

-- Promote first user to ADMIN automatically
CREATE OR REPLACE FUNCTION public.promote_first_user_to_admin()
RETURNS void AS $$
BEGIN
    UPDATE public.user_profiles
    SET role = 'ADMIN'
    WHERE id = (
        SELECT id FROM public.user_profiles 
        ORDER BY created_at ASC 
        LIMIT 1
    ) AND role != 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Call it to promote first user
SELECT public.promote_first_user_to_admin();

-- ============================
-- 4. USER MANAGEMENT STATS VIEW
-- ============================

-- Drop view if exists to recreate
DROP VIEW IF EXISTS public.workforce_stats;

-- Create view for dashboard statistics
CREATE VIEW public.workforce_stats AS
SELECT 
    (SELECT COUNT(*) FROM public.user_profiles WHERE is_active = true AND is_archived = false) AS active_users,
    (SELECT COUNT(*) FROM public.user_profiles WHERE is_archived = true) AS ghost_users,
    (SELECT COUNT(*) FROM public.user_profiles WHERE current_status = 'ON_SHIFT') AS on_shift_users,
    (SELECT COUNT(*) FROM public.user_certifications WHERE expiry_date < CURRENT_DATE) AS expired_certs_count,
    (SELECT COUNT(DISTINCT user_id) FROM public.user_certifications WHERE expiry_date < CURRENT_DATE) AS users_with_expired_certs;

-- ============================
-- 5. GET ALL USERS FOR ADMIN PANEL
-- ============================

CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    role TEXT,
    department TEXT,
    employee_id TEXT,
    shift_pattern TEXT,
    current_status TEXT,
    is_active BOOLEAN,
    is_archived BOOLEAN,
    archived_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    is_on_shift BOOLEAN,
    expired_certs_count BIGINT,
    certs_expiring_soon BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.full_name,
        p.role,
        p.department,
        p.employee_id,
        p.shift_pattern,
        p.current_status,
        p.is_active,
        p.is_archived,
        p.archived_at,
        p.created_at,
        public.is_user_on_shift(p.id) AS is_on_shift,
        (SELECT COUNT(*) FROM public.user_certifications c WHERE c.user_id = p.id AND c.expiry_date < CURRENT_DATE) AS expired_certs_count,
        (SELECT COUNT(*) FROM public.user_certifications c WHERE c.user_id = p.id AND c.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') AS certs_expiring_soon
    FROM public.user_profiles p
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================
-- NOTES:
-- ============================
-- After running this:
-- 1. Register an account via the K-LENS login page
-- 2. The FIRST user will be automatically promoted to ADMIN
-- 3. Or uncomment OPTION A and run with your email to promote specific user
-- =============================================================
