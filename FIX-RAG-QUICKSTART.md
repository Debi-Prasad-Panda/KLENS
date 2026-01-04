# Quick Start: Fix RAG Model (768-dim Migration)

## The Problem
Your RAG model was showing random results due to embedding dimension mismatch:
- Python: 768-dim embeddings ✅
- Supabase: 384-dim embeddings ❌

## The Fix (3 Steps)

### Step 1: Run Supabase Migration (REQUIRED)
1. Open https://supabase.com/dashboard
2. Select your K-LENS project
3. Go to **SQL Editor** → New Query
4. Copy ALL contents from: `backend-python/migrate-to-768-dim.sql`
5. Paste and click **Run**
6. Verify output shows: `vector(768)`

### Step 2: Regenerate Embeddings
After migration, re-upload your documents OR run:
```bash
cd f:\CORDING\KLENS-V2\KLENS
python regenerate-embeddings.py
```

### Step 3: Test
Search for something in K-LENS and verify results are now relevant!

## Files Created
- ✅ `migrate-to-768-dim.sql` - Run this in Supabase
- ✅ `MIGRATION-GUIDE-768-DIM.md` - Detailed guide
- ✅ `test-embedding-768.py` - Verified 768-dim works

## Need Help?
See detailed guide: `backend-python/MIGRATION-GUIDE-768-DIM.md`
