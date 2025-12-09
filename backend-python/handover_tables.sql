-- =============================================================
-- K-LENS Silent Handover - Resolution Memory & Activity Logs
-- =============================================================
-- Run this in Supabase SQL Editor to create the "Hive Mind" tables
-- These power the Silent Handover feature for knowledge transfer
-- =============================================================

-- 1. RESOLUTION MEMORY (The "Hive Mind")
-- Stores problem-solution pairs with vector embeddings for semantic search
-- Example: "How did Rajesh fix the boiler pressure issue last month?"

CREATE TABLE IF NOT EXISTS resolution_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_text TEXT NOT NULL,
    problem_embedding vector(768),      -- Gemini embedding dimensions
    action_taken TEXT NOT NULL,
    outcome_status TEXT DEFAULT 'PENDING',  -- 'FIXED', 'FAILED', 'ESCALATED', 'PENDING'
    user_email TEXT NOT NULL,
    machine_id TEXT,                    -- Optional: related machine/asset
    symptoms JSONB DEFAULT '[]',        -- Array of symptoms observed
    confidence_score FLOAT DEFAULT 0.5,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast vector similarity search
CREATE INDEX IF NOT EXISTS idx_resolution_embedding 
ON resolution_memory 
USING ivfflat (problem_embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_resolution_user ON resolution_memory(user_email);
CREATE INDEX IF NOT EXISTS idx_resolution_status ON resolution_memory(outcome_status);

-- 2. USER ACTIVITY LOGS (The "Attention Index")
-- Tracks what users are working on to understand their domain expertise
-- Example: "What documents has Rajesh been reading recently?"

CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    action_type TEXT NOT NULL,          -- 'VIEW_DOC', 'SEARCH', 'RESOLVE_RISK', 'UPLOAD', 'EDIT'
    target_id TEXT,                     -- Document ID, Machine name, or Search query
    target_name TEXT,                   -- Human-readable name
    metadata JSONB DEFAULT '{}',        -- Extra details like file_name, search_query
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_activity_type ON user_activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_time ON user_activity_logs(timestamp DESC);

-- 3. VECTOR SEARCH FUNCTION for Resolution Memory
-- Finds similar past problems using semantic search

CREATE OR REPLACE FUNCTION match_resolutions(
    query_embedding vector(768),
    match_threshold FLOAT DEFAULT 0.5,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    problem_text TEXT,
    action_taken TEXT,
    outcome_status TEXT,
    user_email TEXT,
    machine_id TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.problem_text,
        r.action_taken,
        r.outcome_status,
        r.user_email,
        r.machine_id,
        1 - (r.problem_embedding <=> query_embedding) AS similarity
    FROM resolution_memory r
    WHERE 1 - (r.problem_embedding <=> query_embedding) > match_threshold
    ORDER BY r.problem_embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 4. GET USER EXPERTISE SUMMARY
-- Aggregates what a user has been working on

CREATE OR REPLACE FUNCTION get_user_expertise_summary(target_email TEXT)
RETURNS TABLE (
    action_type TEXT,
    action_count BIGINT,
    recent_targets TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.action_type,
        COUNT(*)::BIGINT AS action_count,
        ARRAY_AGG(DISTINCT a.target_name ORDER BY a.target_name) FILTER (WHERE a.target_name IS NOT NULL) AS recent_targets
    FROM user_activity_logs a
    WHERE a.user_email = target_email
    AND a.timestamp > NOW() - INTERVAL '90 days'
    GROUP BY a.action_type
    ORDER BY action_count DESC;
END;
$$;

-- =============================================================
-- NOTES FOR DEMO:
-- 1. Run the seed script to populate 6 months of fake data
-- 2. The handover report uses ALL of these: resolutions + activity logs
-- 3. Vector search finds "similar problems" even with different wording
-- =============================================================

-- 5. USERS TABLE (For Demo Authentication)
-- Stores demo users for the Silent Handover feature

CREATE TABLE IF NOT EXISTS demo_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT,
    role TEXT DEFAULT 'engineer',          -- 'admin', 'manager', 'engineer', 'safety_officer'
    avatar_url TEXT,
    is_at_risk BOOLEAN DEFAULT FALSE,      -- True if they manage orphaned assets
    managed_assets_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_demo_users_email ON demo_users(email);
CREATE INDEX IF NOT EXISTS idx_demo_users_role ON demo_users(role);
CREATE INDEX IF NOT EXISTS idx_demo_users_at_risk ON demo_users(is_at_risk);

-- 6. Function to get at-risk users (sole managers of critical assets)
CREATE OR REPLACE FUNCTION get_at_risk_demo_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    name TEXT,
    department TEXT,
    role TEXT,
    managed_assets_count INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.name,
        u.department,
        u.role,
        u.managed_assets_count
    FROM demo_users u
    WHERE u.is_at_risk = TRUE
    ORDER BY u.managed_assets_count DESC;
END;
$$;

