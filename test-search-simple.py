"""
Simple test to check if semantic search components are working.
Tests embedding generation and Supabase connection.
"""

import sys
sys.path.insert(0, 'backend-python')

print("=" * 60)
print("TESTING SEMANTIC SEARCH COMPONENTS")
print("=" * 60)

# Test 1: Check Supabase connection
print("\n[1] Testing Supabase connection...")
try:
    from app.services.supabase_service import supabase_service
    
    # Try to get documents
    docs = supabase_service.get_documents(limit=5)
    print(f"[OK] Supabase connected - Found {len(docs)} documents")
    
    if len(docs) > 0:
        print(f"    Sample document: {docs[0].get('file_name', 'N/A')}")
except Exception as e:
    print(f"[ERROR] Supabase connection failed: {e}")
    sys.exit(1)

# Test 2: Check embedding generation
print("\n[2] Testing embedding generation...")
try:
    from app.services.gemini_service import gemini_service
    
    test_text = "This is a test document about industrial safety procedures"
    embedding = gemini_service.generate_embedding(test_text)
    
    if embedding and len(embedding) > 0:
        print(f"[OK] Embedding generated: {len(embedding)} dimensions")
        print(f"    First 5 values: {[round(v, 4) for v in embedding[:5]]}")
        
        # Check if it's not a zero vector
        if sum(abs(v) for v in embedding) > 0:
            print(f"    [OK] Embedding has non-zero values")
        else:
            print(f"    [WARNING] Embedding is all zeros!")
    else:
        print(f"[ERROR] Embedding is empty or None")
except Exception as e:
    print(f"[ERROR] Embedding generation failed: {e}")
    import traceback
    traceback.print_exc()

# Test 3: Check if vector search function exists
print("\n[3] Testing vector search capability...")
try:
    if len(docs) > 0:
        # Try vector search
        test_embedding = gemini_service.generate_embedding("safety")
        results = supabase_service.vector_search(test_embedding, limit=3)
        
        if results:
            print(f"[OK] Vector search working - Found {len(results)} results")
            for i, r in enumerate(results[:2], 1):
                print(f"    {i}. {r.get('file_name', 'N/A')} (similarity: {r.get('similarity', 0):.3f})")
        else:
            print(f"[WARNING] Vector search returned no results")
            print(f"    This might mean:")
            print(f"    - No documents have embeddings yet")
            print(f"    - The match_documents() function is not created in Supabase")
    else:
        print(f"[SKIP] No documents to search")
except Exception as e:
    print(f"[ERROR] Vector search failed: {e}")
    print(f"    This likely means the match_documents() SQL function is missing")

# Test 4: Check hybrid search
print("\n[4] Testing hybrid search...")
try:
    if len(docs) > 0:
        query = "safety procedures"
        query_embedding = gemini_service.generate_embedding(query)
        results = supabase_service.hybrid_search(query, query_embedding, limit=3)
        
        if results:
            print(f"[OK] Hybrid search working - Found {len(results)} results")
            for i, r in enumerate(results[:2], 1):
                match_type = r.get('match_type', 'unknown')
                score = r.get('score', 0)
                print(f"    {i}. {r.get('file_name', 'N/A')} ({match_type}, score: {score:.3f})")
        else:
            print(f"[WARNING] Hybrid search returned no results")
    else:
        print(f"[SKIP] No documents to search")
except Exception as e:
    print(f"[ERROR] Hybrid search failed: {e}")

print("\n" + "=" * 60)
print("DIAGNOSIS COMPLETE")
print("=" * 60)

# Summary
print("\n[SUMMARY]")
if len(docs) == 0:
    print("- No documents in knowledge hub. Upload documents first!")
else:
    print(f"- {len(docs)} documents found in knowledge hub")
    print("- Check if documents have embeddings stored")
    print("- Verify match_documents() SQL function exists in Supabase")
