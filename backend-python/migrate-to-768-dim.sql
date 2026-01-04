-- Migration: Update Knowledge Hub to 768-Dimensional Embeddings
-- This fixes the RAG model dimension mismatch issue
-- Run this in Supabase SQL Editor

-- 1. Drop old match_documents function (384-dim version)
DROP FUNCTION IF EXISTS match_documents(vector(384), float, int);
DROP FUNCTION IF EXISTS match_documents(vector, float, int);

-- 2. Clear existing embeddings (they will be regenerated)
UPDATE knowledge_hub SET embedding = NULL;

-- 3. Update knowledge_hub table to use 768 dimensions
ALTER TABLE knowledge_hub 
ALTER COLUMN embedding TYPE vector(768);

-- 4. Recreate match_documents function with 768 dimensions
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(768),
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 10
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
    WHERE k.embedding IS NOT NULL
    AND 1 - (k.embedding <=> query_embedding) > match_threshold
    ORDER BY k.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 5. Update hybrid_search function if it exists
DROP FUNCTION IF EXISTS hybrid_search(text, vector(384), float, int);
DROP FUNCTION IF EXISTS hybrid_search(text, vector, float, int);

CREATE OR REPLACE FUNCTION hybrid_search(
    query_text text,
    query_embedding vector(768),
    match_threshold float DEFAULT 0.3,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    file_name text,
    s3_url text,
    content_chunk text,
    metadata jsonb,
    score float,
    match_type text
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    
    -- Vector Search Results
    SELECT 
        k.id,
        k.file_name,
        k.s3_url,
        k.content_chunk,
        k.metadata,
        (1 - (k.embedding <=> query_embedding)) * 0.7 AS score,
        'vector'::text AS match_type
    FROM knowledge_hub k
    WHERE k.embedding IS NOT NULL
    AND 1 - (k.embedding <=> query_embedding) > match_threshold
    
    UNION ALL
    
    -- Keyword Search Results (case-insensitive)
    SELECT 
        k.id,
        k.file_name,
        k.s3_url,
        k.content_chunk,
        k.metadata,
        0.3 AS score,
        'keyword'::text AS match_type
    FROM knowledge_hub k
    WHERE k.content_chunk ILIKE '%' || query_text || '%'
    AND k.id NOT IN (
        SELECT k2.id FROM knowledge_hub k2 
        WHERE k2.embedding IS NOT NULL
        AND 1 - (k2.embedding <=> query_embedding) > match_threshold
    )
    
    ORDER BY score DESC
    LIMIT match_count;
END;
$$;

-- 6. Update resolution_memory table if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'resolution_memory' 
        AND column_name = 'problem_embedding'
    ) THEN
        -- Drop old function
        DROP FUNCTION IF EXISTS match_resolutions(vector(384), float, int);
        DROP FUNCTION IF EXISTS match_resolutions(vector, float, int);
        
        -- Clear embeddings
        UPDATE resolution_memory SET problem_embedding = NULL;
        
        -- Update column
        ALTER TABLE resolution_memory 
        ALTER COLUMN problem_embedding TYPE vector(768);
        
        -- Recreate function
        CREATE OR REPLACE FUNCTION match_resolutions(
            query_embedding vector(768),
            match_threshold float DEFAULT 0.5,
            match_count int DEFAULT 10
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
        AS $func$
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
        $func$;
    END IF;
END $$;

-- 7. Verify the changes
SELECT 
    table_name,
    column_name,
    udt_name,
    character_maximum_length
FROM information_schema.columns
WHERE table_name IN ('knowledge_hub', 'resolution_memory')
AND column_name LIKE '%embedding%';

-- Expected output: embedding column should show vector(768)
