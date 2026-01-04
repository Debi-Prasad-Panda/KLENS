"""
Test embedding generation with sentence-transformers (768-dim)
This verifies the RAG model fix is working correctly.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend-python'))

from app.services.gemini_service import gemini_service

# Test text
test_text = "This is a test document about industrial safety procedures and equipment maintenance."

print("=" * 70)
print("Testing Embedding Generation (768-dim)")
print("=" * 70)

try:
    print(f"\nTest text: {test_text}")
    print("\nGenerating embedding...")
    
    embedding = gemini_service.generate_embedding(test_text)
    
    print(f"\n✅ Embedding generated successfully!")
    print(f"   Dimensions: {len(embedding)}")
    print(f"   First 5 values: {embedding[:5]}")
    print(f"   Last 5 values: {embedding[-5:]}")
    print(f"   Min value: {min(embedding):.4f}")
    print(f"   Max value: {max(embedding):.4f}")
    
    if len(embedding) == 768:
        print(f"\n✅ SUCCESS: Embedding has correct dimension (768)")
    else:
        print(f"\n❌ ERROR: Expected 768 dimensions, got {len(embedding)}")
        
except Exception as e:
    print(f"\n❌ Error generating embedding: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
