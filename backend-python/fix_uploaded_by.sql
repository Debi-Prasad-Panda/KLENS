-- =============================================================
-- FIX: Change documents.uploaded_by from INTEGER to TEXT (UUID)
-- =============================================================
-- Run this to fix the schema mismatch between SQLAlchemy and Supabase

-- First, drop the foreign key constraint if it exists
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_uploaded_by_fkey;

-- Change the column type from INTEGER to TEXT
ALTER TABLE documents ALTER COLUMN uploaded_by TYPE TEXT USING uploaded_by::TEXT;

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);

-- Done!
