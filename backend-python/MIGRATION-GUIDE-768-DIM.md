# Supabase Migration Guide: Fix RAG Embedding Dimensions

## What This Fixes
- **Problem**: RAG model showing random/irrelevant results
- **Root Cause**: Embedding dimension mismatch (384-dim in database vs 768-dim in Python)
- **Solution**: Migrate Supabase to use 768-dimensional embeddings

## Prerequisites
- Access to Supabase SQL Editor
- Admin privileges on your Supabase project

## Migration Steps

### Step 1: Backup Current Data (Recommended)
Before running the migration, consider exporting your current `knowledge_hub` table data:
1. Go to Supabase Dashboard → Table Editor
2. Select `knowledge_hub` table
3. Click "..." → Export as CSV (if you want to preserve data)

### Step 2: Run Migration SQL
1. **Navigate to Supabase Dashboard**
   - Go to your project at https://supabase.com/dashboard
   - Click on your K-LENS project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run Migration**
   - Copy the entire contents of `migrate-to-768-dim.sql`
   - Paste into the SQL Editor
   - Click "Run" or press `Ctrl+Enter`

4. **Verify Migration**
   - Check the output - it should show the embedding column as `vector(768)`
   - Look for any errors in the execution results

### Step 3: Regenerate Embeddings
After the migration, all existing embeddings are cleared (set to NULL). You need to regenerate them:

**Option A: Re-upload Documents**
- Delete and re-upload all documents through the K-LENS UI
- This will automatically generate new 768-dim embeddings

**Option B: Run Regeneration Script**
```bash
cd f:\CORDING\KLENS-V2\KLENS
python regenerate-embeddings.py
```

### Step 4: Test RAG Search
1. **Test a simple search**:
   ```bash
   python test-search-simple.py
   ```

2. **Verify results in UI**:
   - Open K-LENS at http://localhost:3000
   - Go to Search/Discovery
   - Enter a test query
   - Verify results are relevant (not random)

## Expected Behavior After Migration

### Before (Broken)
- Search returns random, unrelated results
- Similarity scores might be 0 or NaN
- Vector search fails silently

### After (Fixed)
- Search returns semantically relevant results
- Similarity scores between 0.0-1.0
- RAG responds with context-aware answers

## Rollback (If Needed)

If you need to rollback to 384-dim (not recommended):
1. Stop the backend: `docker-compose down`
2. Change model in `gemini_service.py` line 109 to: `all-MiniLM-L6-v2`
3. Run rollback SQL:
   ```sql
   DROP FUNCTION IF EXISTS match_documents(vector, float, int);
   UPDATE knowledge_hub SET embedding = NULL;
   ALTER TABLE knowledge_hub ALTER COLUMN embedding TYPE vector(384);
   -- Then recreate match_documents with vector(384)
   ```
4. Regenerate all embeddings

## Troubleshooting

### Error: "function match_documents already exists"
- The DROP FUNCTION commands should handle this
- If it persists, manually drop: `DROP FUNCTION IF EXISTS match_documents CASCADE;`

### Error: "column embedding cannot be cast automatically"
- This is expected - the migration clears embeddings first
- Ensure you run the migration in order (don't skip steps)

### Search still returns random results
1. Check that embeddings were regenerated (not NULL)
2. Verify model is `all-mpnet-base-v2` in `gemini_service.py`
3. Check backend logs for embedding generation errors
4. Test embedding generation directly: `python test_gemini.py`

## Files Modified/Created
- ✅ Created: `migrate-to-768-dim.sql` (migration script)
- ✅ Verified: `app/services/gemini_service.py` (already correct)
- ✅ Removed: `fix-supabase-embeddings.sql` (conflicting config)

## Next Steps After Migration
1. Monitor search performance
2. Re-upload or regenerate embeddings for all documents
3. Test with various queries to confirm relevance
4. Update documentation for future developers
