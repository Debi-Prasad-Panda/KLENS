-- =============================================================
-- Audit Logs Table for K-LENS
-- Stores all user actions for compliance and security tracking
-- =============================================================

-- 1. CREATE TABLE FIRST (if not exists - safe to re-run)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Action details
    action TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'INFO',
    
    -- User who performed the action (denormalized for immutability)
    user_id UUID NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_role TEXT NOT NULL,
    
    -- Resource affected
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    resource_name TEXT NOT NULL,
    
    -- Additional context
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT,
    correlation_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INDEXES (safe to re-run)
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON public.audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON public.audit_logs(resource_type);

CREATE INDEX IF NOT EXISTS idx_audit_logs_search ON public.audit_logs 
    USING gin(to_tsvector('english', resource_name || ' ' || user_name));

-- 3. ENABLE RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. DROP EXISTING POLICIES (now safe because table exists)
DROP POLICY IF EXISTS "Managers and admins can read all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can create audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role has full access" ON public.audit_logs;

-- 5. CREATE POLICIES
CREATE POLICY "Managers and admins can read all audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('ADMIN', 'MANAGER')
    )
    OR user_id = auth.uid()
);

CREATE POLICY "Users can create audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role has full access"
ON public.audit_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 6. COMMENTS
COMMENT ON TABLE public.audit_logs IS 'Immutable audit trail for all user actions in K-LENS';
