"""
Regenerate embeddings for existing documents in Supabase.
Run this after the SQL migration to update all documents with new 384-dim embeddings.
"""

import sys
sys.path.insert(0, 'backend-python')

from app.services.supabase_service import supabase_service
from app.services.gemini_service import gemini_service

print("=" * 60)
print("REGENERATING EMBEDDINGS FOR EXISTING DOCUMENTS")
print("=" * 60)

# Get all documents
docs = supabase_service.get_documents(limit=100)
print(f"\nFound {len(docs)} documents to process")

if len(docs) == 0:
    print("No documents found. Upload some documents first!")
    sys.exit(0)

success_count = 0
error_count = 0

for i, doc in enumerate(docs, 1):
    doc_id = doc['id']
    file_name = doc['file_name']
    
    print(f"\n[{i}/{len(docs)}] Processing: {file_name}")
    
    try:
        # Get full document with content
        full_doc = supabase_service.get_document_by_id(doc_id)
        
        if not full_doc or not full_doc.get('content_chunk'):
            print(f"  [SKIP] No content found")
            continue
        
        content = full_doc['content_chunk']
        
        # Generate new embedding
        print(f"  Generating embedding...")
        embedding = gemini_service.generate_embedding(content)
        
        if not embedding or sum(abs(v) for v in embedding) == 0:
            print(f"  [ERROR] Failed to generate embedding")
            error_count += 1
            continue
        
        # Update document with new embedding
        supabase_service.client.table("knowledge_hub").update({
            "embedding": embedding
        }).eq("id", doc_id).execute()
        
        print(f"  [OK] Embedding updated ({len(embedding)} dimensions)")
        success_count += 1
        
    except Exception as e:
        print(f"  [ERROR] {e}")
        error_count += 1

print("\n" + "=" * 60)
print("REGENERATION COMPLETE")
print("=" * 60)
print(f"\nSuccess: {success_count}")
print(f"Errors: {error_count}")
print(f"Total: {len(docs)}")

if success_count > 0:
    print("\n✓ Semantic search should now work!")
    print("  Test it by running: python test-search-simple.py")
