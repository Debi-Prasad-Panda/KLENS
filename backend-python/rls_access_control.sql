-- =============================================================
-- K-LENS Granular Access Control - Row Level Security Setup
-- =============================================================
-- Run this script in Supabase SQL Editor
-- This creates a "Secure Digital Vault" with RBAC + ABAC policies
-- =============================================================
-- 1. Enable Row Level Security on knowledge_hub table
ALTER TABLE knowledge_hub ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policy if it exists (for re-running)
DROP POLICY IF EXISTS "access_control_policy" ON knowledge_hub;

-- 3. Create the Access Control Policy
-- This is the "Guard Dog" at the database level
CREATE POLICY "access_control_policy"
ON knowledge_hub
FOR SELECT
USING (
  -- Rule A: The user is the Owner/Uploader
  -- Anyone can see their own uploaded documents
  auth.uid()::text = (metadata->>'uploaded_by_id')
  
  OR
  
  -- Rule B: Document is marked as PUBLIC
  -- Everyone in the company can access
  (metadata->>'access_level') = 'public'
  
  OR
  
  -- Rule C: DEPARTMENT-LEVEL Access
  -- User's department matches the target department
  (
    (metadata->>'access_level') = 'department' 
    AND 
    (metadata->>'target_department') = (auth.jwt()->>'department')
  )
  
  OR
  
  -- Rule D: MANAGERS-ONLY Access
  -- User is a manager AND in the correct department
  (
    (metadata->>'access_level') = 'managers_only'
    AND
    (metadata->>'target_department') = (auth.jwt()->>'department')
    AND
    (auth.jwt()->>'role') IN ('manager', 'admin')
  )
  
  OR
  
  -- Rule E: CUSTOM Access (Specific Users)
  -- User's email is in the allowed_users list
  (
    (metadata->>'access_level') = 'custom'
    AND
    (metadata->>'allowed_users')::jsonb ? auth.email()
  )
  
  OR
  
  -- Rule F: Admin Override
  -- Admins can see everything
  (auth.jwt()->>'role') = 'admin'
);

-- 4. Create policy for INSERT (users can only insert their own documents)
DROP POLICY IF EXISTS "insert_own_documents" ON knowledge_hub;
CREATE POLICY "insert_own_documents"
ON knowledge_hub
FOR INSERT
WITH CHECK (true);  -- Allow all authenticated inserts (backend validates)

-- 5. Create policy for UPDATE (only owner or admin)
DROP POLICY IF EXISTS "update_own_documents" ON knowledge_hub;
CREATE POLICY "update_own_documents"
ON knowledge_hub
FOR UPDATE
USING (
  auth.uid()::text = (metadata->>'uploaded_by_id')
  OR (auth.jwt()->>'role') = 'admin'
);

-- 6. Create policy for DELETE (only owner or admin)
DROP POLICY IF EXISTS "delete_own_documents" ON knowledge_hub;
CREATE POLICY "delete_own_documents"
ON knowledge_hub
FOR DELETE
USING (
  auth.uid()::text = (metadata->>'uploaded_by_id')
  OR (auth.jwt()->>'role') = 'admin'
);

-- =============================================================
-- IMPORTANT NOTES:
-- =============================================================
-- 1. This assumes your JWT claims include 'department' and 'role'
-- 2. If using Supabase Auth, you may need to set up custom claims
-- 3. The backend service key bypasses RLS for admin operations
-- 4. Test thoroughly with different user roles before deploying!
-- =============================================================
-- Quick test query (run after inserting a document):
-- SELECT id, file_name, metadata->>'access_level' as access_level 
-- FROM knowledge_hub 
-- LIMIT 10;
