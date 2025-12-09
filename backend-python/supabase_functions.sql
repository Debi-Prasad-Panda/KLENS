-- K-LENS Supabase SQL Setup
-- Run this in Supabase SQL Editor after creating the knowledge_hub table

-- 0. FIRST: Enable the pgvector extension (REQUIRED!)
-- Go to Supabase Dashboard -> Database -> Extensions -> Search "vector" -> Enable
-- OR run this command:
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Vector Search Function
-- This function is called by the Python backend for semantic search
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
    WHERE 1 - (k.embedding <=> query_embedding) > match_threshold
    ORDER BY k.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 2. Hybrid Search Function (Optional - for future use)
-- Combines vector similarity with keyword matching
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
    WHERE 1 - (k.embedding <=> query_embedding) > match_threshold
    
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
        WHERE 1 - (k2.embedding <=> query_embedding) > match_threshold
    )
    
    ORDER BY score DESC
    LIMIT match_count;
END;
$$;

-- 3. Get document statistics
CREATE OR REPLACE FUNCTION get_knowledge_stats()
RETURNS TABLE (
    total_documents bigint,
    total_chunks bigint,
    unique_files bigint,
    avg_chunks_per_file numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT s3_url)::bigint AS total_documents,
        COUNT(*)::bigint AS total_chunks,
        COUNT(DISTINCT file_name)::bigint AS unique_files,
        ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT s3_url), 0), 2) AS avg_chunks_per_file
    FROM knowledge_hub;
END;
$$;
