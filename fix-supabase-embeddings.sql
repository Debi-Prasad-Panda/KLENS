-- Fix Supabase embedding dimensions from 768 to 384
-- Run this in Supabase SQL Editor

-- 1. Drop the old match_documents function
DROP FUNCTION IF EXISTS match_documents(vector, float, int);

-- 2. Clear existing embeddings (they're 768-dim, incompatible)
UPDATE knowledge_hub SET embedding = NULL;

-- 3. Alter the knowledge_hub table to use 384 dimensions
ALTER TABLE knowledge_hub 
ALTER COLUMN embedding TYPE vector(384);

-- 4. Create the new match_documents function with 384 dimensions
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(384),
    match_threshold float,
    match_count int
)
RETURNS TABLE (
    id uuid,
    file_name text,
    s3_url text,
    content_chunk text,
    metadata jsonb,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        k.id,
        k.file_name,
        k.s3_url,
        k.content_chunk,
        k.metadata,
        1 - (k.embedding <=> query_embedding) AS similarity
    FROM knowledge_hub k
    WHERE 1 - (k.embedding <=> query_embedding) > match_threshold
    ORDER BY k.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 5. Optional: Update resolution_memory table if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'resolution_memory' 
        AND column_name = 'problem_embedding'
    ) THEN
        UPDATE resolution_memory SET problem_embedding = NULL;
        ALTER TABLE resolution_memory 
        ALTER COLUMN problem_embedding TYPE vector(384);
    END IF;
END $$;

-- 6. Drop old match_resolutions function
DROP FUNCTION IF EXISTS match_resolutions(vector, float, int);

-- 7. Create match_resolutions function if needed
CREATE OR REPLACE FUNCTION match_resolutions(
    query_embedding vector(384),
    match_threshold float,
    match_count int
)
RETURNS TABLE (
    id uuid,
    user_email text,
    problem_text text,
    action_taken text,
    outcome_status text,
    machine_id text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.user_email,
        r.problem_text,
        r.action_taken,
        r.outcome_status,
        r.machine_id,
        1 - (r.problem_embedding <=> query_embedding) AS similarity
    FROM resolution_memory r
    WHERE r.problem_embedding IS NOT NULL
    AND 1 - (r.problem_embedding <=> query_embedding) > match_threshold
    ORDER BY r.problem_embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
