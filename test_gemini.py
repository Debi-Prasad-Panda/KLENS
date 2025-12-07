import google.generativeai as genai
import os
import sys

# Get API key from env or argument
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key and len(sys.argv) > 1:
    api_key = sys.argv[1]

if not api_key:
    # Fallback to the known key if not found in env
    api_key = "AIzaSyCfDLK5EvsJaIkBf-CcTRA05QnZVa-K54o"

print(f"Testing Gemini API with key: {api_key[:10]}...")

try:
    genai.configure(api_key=api_key)
    
    # List models
    print("\nAvailable models compatible with gemini-1.5-flash:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
    
    # Test generation
    print("\nTesting generation with 'gemini-1.5-flash'...")
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hello, can you hear me?")
    print(f"\nResponse: {response.text}")
    print("\n✅ API Key and Model are working!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
