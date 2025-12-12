"""
Test script to verify semantic search is working properly.
Tests:
1. Embedding generation
2. Vector search function in Supabase
3. Hybrid search endpoint
"""

import requests
import json

API_URL = "http://localhost:8000/api"

def test_search():
    print("=" * 60)
    print("TESTING SEMANTIC SEARCH")
    print("=" * 60)
    
    # Step 1: Login to get token
    print("\n[1] Logging in...")
    login_response = requests.post(
        f"{API_URL}/auth/login",
        json={
            "email": "admin@klens.local",
            "password": "Admin@123"
        }
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return
    
    token = login_response.json().get("access_token")
    print(f"[OK] Login successful")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 2: Check if documents exist
    print("\n[2] Checking knowledge hub documents...")
    docs_response = requests.get(
        f"{API_URL}/search/documents?limit=5",
        headers=headers
    )
    
    if docs_response.status_code != 200:
        print(f"❌ Failed to fetch documents: {docs_response.text}")
        return
    
    docs = docs_response.json()
    print(f"[OK] Found {len(docs)} documents in knowledge hub")
    
    if len(docs) == 0:
        print("[WARNING] No documents found. Upload some documents first!")
        return
    
    # Step 3: Test semantic search
    print("\n[3] Testing semantic search...")
    test_queries = [
        "safety procedures",
        "maintenance schedule",
        "risk assessment",
        "compliance requirements"
    ]
    
    for query in test_queries:
        print(f"\n   Query: '{query}'")
        search_response = requests.post(
            f"{API_URL}/search/",
            headers=headers,
            json={"query": query, "limit": 3}
        )
        
        if search_response.status_code != 200:
            print(f"   ❌ Search failed: {search_response.text}")
            continue
        
        results = search_response.json()
        print(f"   [OK] Found {results.get('total', 0)} results")
        
        for i, result in enumerate(results.get('results', [])[:2], 1):
            print(f"      {i}. {result['file_name']}")
            print(f"         Match: {result['match_type']} | Score: {result['score']:.2f}")
            print(f"         Preview: {result['content_chunk'][:80]}...")
    
    # Step 4: Test embedding generation
    print("\n[4] Testing embedding generation...")
    try:
        from backend_python.app.services.gemini_service import gemini_service
        test_text = "This is a test document about industrial safety"
        embedding = gemini_service.generate_embedding(test_text)
        print(f"[OK] Embedding generated: {len(embedding)} dimensions")
        print(f"   First 5 values: {embedding[:5]}")
    except Exception as e:
        print(f"❌ Embedding generation failed: {e}")
    
    print("\n" + "=" * 60)
    print("[SUCCESS] SEMANTIC SEARCH TEST COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    test_search()
