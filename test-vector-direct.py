"""Test vector search directly with lower threshold"""
import sys
sys.path.insert(0, 'backend-python')

from app.services.supabase_service import supabase_service
from app.services.gemini_service import gemini_service

print("Testing vector search with different thresholds...")

query = "safety"
embedding = gemini_service.generate_embedding(query)

print(f"\nQuery: '{query}'")
print(f"Embedding dimensions: {len(embedding)}")

# Try with very low threshold
for threshold in [0.0, 0.1, 0.3, 0.5]:
    print(f"\nThreshold: {threshold}")
    results = supabase_service.vector_search(embedding, limit=3, threshold=threshold)
    print(f"  Results: {len(results)}")
    for r in results[:2]:
        print(f"    - {r.get('file_name')} (similarity: {r.get('similarity', 0):.3f})")
