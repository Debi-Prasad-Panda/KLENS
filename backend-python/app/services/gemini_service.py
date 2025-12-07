import google.generativeai as genai
from typing import Dict, List
from ..core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

class GeminiService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def analyze_document(self, text: str) -> Dict:
        """Analyze document and extract key information"""
        prompt = f"""Analyze this industrial document and provide:
1. Summary (2-3 sentences)
2. Key risks identified
3. Compliance issues
4. Action items

Document:
{text[:8000]}

Return as JSON with keys: summary, risks, compliance, actions"""
        
        try:
            response = self.model.generate_content(prompt)
            return {"summary": response.text, "status": "success"}
        except Exception as e:
            return {"summary": "Analysis failed", "status": "error", "error": str(e)}
    
    def extract_graph_entities(self, text: str, doc_name: str) -> Dict:
        """Extract entities and relationships for knowledge graph"""
        prompt = f"""Extract entities and relationships from this document for a knowledge graph.

Document: {doc_name}
Text: {text[:8000]}

Return JSON with:
- nodes: [{{"id": "entity_name", "group": "Document|Risk|Person|Machine|Dept", "val": 5-10}}]
- links: [{{"source": "entity1", "target": "entity2", "type": "MENTIONS|AFFECTS|HAS_RISK"}}]

Focus on industrial safety entities."""
        
        try:
            response = self.model.generate_content(prompt)
            # Parse JSON from response
            import json
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
        except Exception as e:
            return {"nodes": [], "links": [], "error": str(e)}
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for semantic search"""
        try:
            result = genai.embed_content(
                model="models/embedding-001",
                content=text[:8000],
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            return [0.0] * 768  # Return zero vector on error

gemini_service = GeminiService()
