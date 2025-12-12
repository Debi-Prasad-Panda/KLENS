-- Migration: Fix documents.uploaded_by column type
-- Issue: SQLAlchemy model uses String but database column is Integer
-- This causes: invalid input syntax for type integer: "uuid-string"

-- Step 1: Drop any foreign key constraints on uploaded_by (if exists)
-- ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_uploaded_by_fkey;

-- Step 2: Change column type from Integer to Text (VARCHAR)
-- This allows storing UUID strings from Supabase Auth
ALTER TABLE documents 
ALTER COLUMN uploaded_by TYPE TEXT
USING uploaded_by::TEXT;

-- Step 3: Also fix document_versions.changed_by if it has same issue
ALTER TABLE document_versions 
ALTER COLUMN changed_by TYPE TEXT
USING changed_by::TEXT;

-- Step 4: Also fix audit_log.user_id if it exists with Integer type
ALTER TABLE audit_log 
ALTER COLUMN user_id TYPE TEXT
USING user_id::TEXT;

-- Done! The documents API should now work with Supabase UUID user IDs
