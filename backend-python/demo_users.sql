-- =============================================================
-- K-LENS DEMO USERS FOR RBAC TESTING
-- =============================================================
-- Run this in Supabase SQL Editor to create test users for each role
-- Password for all users: Demo@123
-- =============================================================

-- First, we need to use Supabase Auth to create users
-- This script creates user_profiles for testing
-- You'll need to register these users via the signup form or Supabase Dashboard

-- Option 1: Create profiles directly (users need to register with these emails)
-- The profiles will auto-link when users register with matching emails

-- Option 2: Use Supabase Dashboard > Authentication > Users > Add User
-- Then run this script to set their roles

-- =============================================================
-- DEMO USER PROFILES
-- =============================================================

-- Note: Replace the UUIDs below with actual user IDs after registration
-- For now, we'll create placeholder profiles that will be updated

-- Helper function to create or update demo user profile
CREATE OR REPLACE FUNCTION create_demo_user(
    p_email TEXT,
    p_full_name TEXT,
    p_role TEXT,
    p_department TEXT,
    p_employee_id TEXT,
    p_shift_pattern TEXT DEFAULT 'MORNING'
) RETURNS void AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Check if user exists in auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    
    IF v_user_id IS NOT NULL THEN
        -- Update existing profile
        UPDATE public.user_profiles SET
            full_name = p_full_name,
            role = p_role,
            department = p_department,
            employee_id = p_employee_id,
            shift_pattern = p_shift_pattern,
            can_bypass_shift = (p_role IN ('ADMIN', 'MANAGER', 'ENGINEER', 'SAFETY_OFFICER')),
            is_active = true,
            is_archived = false
        WHERE id = v_user_id;
        
        RAISE NOTICE 'Updated profile for %', p_email;
    ELSE
        RAISE NOTICE 'User % not found in auth.users. Register first, then run this script.', p_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- QUICK SETUP: Update your existing admin account
-- =============================================================

-- Update debi@admin.com to be properly configured
UPDATE public.user_profiles 
SET 
    role = 'ADMIN',
    full_name = 'Debi Prasad Panda',
    department = 'IT',
    employee_id = 'EMP-001',
    can_bypass_shift = true,
    access_scopes = '{"*"}',
    permissions = '{}'
WHERE email = 'debi@admin.com';

-- =============================================================
-- CREATE DEMO USERS VIA SUPABASE DASHBOARD
-- =============================================================
-- 
-- Go to Supabase Dashboard > Authentication > Users > Add User
-- Create these users with password: Demo@123
--
-- 1. manager@klens.com - Plant Manager
-- 2. engineer@klens.com - Senior Engineer  
-- 3. safety@klens.com - Safety Officer
-- 4. operator@klens.com - Operator
--
-- After creating them, run the queries below:
-- =============================================================

-- Manager Profile
DO $$
BEGIN
    PERFORM create_demo_user(
        'manager@klens.com',
        'Rajesh Kumar',
        'MANAGER',
        'Operations',
        'EMP-002',
        'MORNING'
    );
END $$;

-- Engineer Profile
DO $$
BEGIN
    PERFORM create_demo_user(
        'engineer@klens.com',
        'Priya Sharma',
        'ENGINEER',
        'Engineering',
        'EMP-003',
        'MORNING'
    );
END $$;

-- Safety Officer Profile
DO $$
BEGIN
    PERFORM create_demo_user(
        'safety@klens.com',
        'Amit Singh',
        'SAFETY_OFFICER',
        'Safety',
        'EMP-004',
        'MORNING'
    );
END $$;

-- Operator Profile
DO $$
BEGIN
    PERFORM create_demo_user(
        'operator@klens.com',
        'Vikram Das',
        'OPERATOR',
        'Production',
        'EMP-005',
        'MORNING'
    );
END $$;

-- =============================================================
-- VERIFY DEMO USERS
-- =============================================================

-- Run this to see all configured users
SELECT 
    email,
    full_name,
    role,
    department,
    employee_id,
    can_bypass_shift,
    is_active
FROM public.user_profiles
ORDER BY 
    CASE role
        WHEN 'ADMIN' THEN 1
        WHEN 'MANAGER' THEN 2
        WHEN 'ENGINEER' THEN 3
        WHEN 'SAFETY_OFFICER' THEN 4
        WHEN 'OPERATOR' THEN 5
    END;

-- =============================================================
-- DEMO USER CREDENTIALS
-- =============================================================
-- 
-- | Email                  | Password  | Role           |
-- |------------------------|-----------|----------------|
-- | debi@admin.com         | (your pw) | ADMIN          |
-- | manager@klens.com      | Demo@123  | MANAGER        |
-- | engineer@klens.com     | Demo@123  | ENGINEER       |
-- | safety@klens.com       | Demo@123  | SAFETY_OFFICER |
-- | operator@klens.com     | Demo@123  | OPERATOR       |
--
-- =============================================================
