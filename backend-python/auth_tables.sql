-- =============================================================
-- K-LENS Industrial Auth System - Supabase Tables
-- =============================================================
-- Run this in Supabase SQL Editor AFTER enabling Supabase Auth
-- This creates the "Industrial Context" layer on top of auth.users
-- =============================================================

-- 1. USER PROFILES (The Industrial Context)
-- Links to Supabase Auth users and adds industrial-specific fields
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'OPERATOR',  -- ADMIN, MANAGER, OPERATOR, SAFETY_OFFICER
    department TEXT,
    
    -- Shift Logic
    shift_pattern TEXT,             -- 'MORNING', 'NIGHT'
    current_status TEXT DEFAULT 'OFF_SHIFT',  -- ON_SHIFT, ON_BREAK, OFF_SHIFT
    
    -- Kiosk Mode Security
    kiosk_pin_hash TEXT,            -- bcrypt hash of 4-digit PIN for fast unlock
    
    -- Metadata
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(current_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_department ON public.user_profiles(department);

-- 2. SHIFT SCHEDULES (The Time Rules)
-- Defines when each shift starts and ends
CREATE TABLE IF NOT EXISTS public.shift_schedules (
    shift_name TEXT PRIMARY KEY,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description TEXT
);

-- Insert Default Shifts
INSERT INTO public.shift_schedules (shift_name, start_time, end_time, description) VALUES 
    ('MORNING', '06:00:00', '14:00:00', 'Morning shift (6 AM - 2 PM)'),
    ('AFTERNOON', '14:00:00', '22:00:00', 'Afternoon shift (2 PM - 10 PM)'),
    ('NIGHT', '22:00:00', '06:00:00', 'Night shift (10 PM - 6 AM)')
ON CONFLICT (shift_name) DO NOTHING;

-- 3. SAFETY PASSPORT (User Certifications - The Compliance Check)
-- Tracks safety certifications and their expiry dates
CREATE TABLE IF NOT EXISTS public.user_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    cert_name TEXT NOT NULL,        -- e.g. "Boiler Safety L1", "Forklift License"
    cert_issuer TEXT,               -- Issuing authority
    issue_date DATE,
    expiry_date DATE NOT NULL,
    status TEXT DEFAULT 'VALID',    -- VALID, EXPIRED, REVOKED
    document_url TEXT,              -- Link to certificate scan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_certs_user ON public.user_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_certs_expiry ON public.user_certifications(expiry_date);
CREATE INDEX IF NOT EXISTS idx_certs_status ON public.user_certifications(status);

-- 4. AUTO-CREATE PROFILE TRIGGER
-- Automatically creates a user_profile when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'OPERATOR')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. AUTO-EXPIRE CERTIFICATIONS FUNCTION
-- Marks certifications as EXPIRED when expiry_date passes
CREATE OR REPLACE FUNCTION public.update_expired_certs()
RETURNS void AS $$
BEGIN
    UPDATE public.user_certifications
    SET status = 'EXPIRED'
    WHERE expiry_date < CURRENT_DATE AND status = 'VALID';
END;
$$ LANGUAGE plpgsql;

-- 6. CHECK IF USER IS ON SHIFT FUNCTION
-- Returns true if the user's current shift matches the current time
CREATE OR REPLACE FUNCTION public.is_user_on_shift(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_shift TEXT;
    shift_start TIME;
    shift_end TIME;
    current_time_local TIME;
BEGIN
    -- Get user's shift pattern
    SELECT shift_pattern INTO user_shift
    FROM public.user_profiles
    WHERE id = user_id;
    
    IF user_shift IS NULL THEN
        RETURN TRUE; -- No shift assigned = always allowed
    END IF;
    
    -- Get shift times
    SELECT start_time, end_time INTO shift_start, shift_end
    FROM public.shift_schedules
    WHERE shift_name = user_shift;
    
    IF shift_start IS NULL THEN
        RETURN TRUE; -- Unknown shift = always allowed
    END IF;
    
    current_time_local := CURRENT_TIME;
    
    -- Handle overnight shifts (like NIGHT: 22:00 - 06:00)
    IF shift_end < shift_start THEN
        RETURN current_time_local >= shift_start OR current_time_local < shift_end;
    ELSE
        RETURN current_time_local >= shift_start AND current_time_local < shift_end;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. GET USER WITH INDUSTRIAL CONTEXT FUNCTION
-- Returns user profile with shift status and expired cert check
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
    expired_cert_count BIGINT
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
        ) AS expired_cert_count
    FROM public.user_profiles p
    WHERE p.id = target_user_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================

-- Enable RLS on tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin/manager (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Direct query bypasses RLS (SECURITY DEFINER)
    SELECT role INTO user_role 
    FROM public.user_profiles 
    WHERE id = auth.uid();
    
    RETURN user_role IN ('ADMIN', 'MANAGER');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (except role)
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins and Managers can read all profiles (uses helper to avoid recursion)
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.user_profiles;
CREATE POLICY "Admins can read all profiles" ON public.user_profiles
    FOR SELECT USING (public.is_admin_or_manager());

-- Users can read their own certifications
DROP POLICY IF EXISTS "Users can read own certs" ON public.user_certifications;
CREATE POLICY "Users can read own certs" ON public.user_certifications
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage all certifications
DROP POLICY IF EXISTS "Admins can manage certs" ON public.user_certifications;
CREATE POLICY "Admins can manage certs" ON public.user_certifications
    FOR ALL USING (public.is_admin_or_manager());

-- =============================================================
-- NOTES FOR IMPLEMENTATION:
-- 1. Run this AFTER enabling Supabase Auth in your project
-- 2. The trigger auto-creates profiles on user signup
-- 3. Use get_user_industrial_context() for the 3-step verification
-- 4. Run update_expired_certs() periodically (via cron or on login)
-- =============================================================
