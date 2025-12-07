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

    def generate_role_insights(self, text: str, role: str, doc_name: str = "") -> Dict:
        """Generate role-specific AI insights for a document.
        
        Args:
            text: Document text content
            role: Either 'engineer' or 'manager'
            doc_name: Optional document name for context
        
        Returns:
            Dict with structured insights based on role
        """
        if role == "engineer":
            prompt = f"""Analyze this industrial document from an ENGINEER's perspective.
Document: {doc_name}
Content: {text[:6000]}

Return a JSON object with exactly this structure:
{{
  "summary": ["point 1", "point 2", "point 3"],
  "specs": [
    {{"label": "spec name", "value": "spec value"}},
    {{"label": "spec name", "value": "spec value"}}
  ],
  "compliance": {{
    "status": "PASS or FAIL or PENDING",
    "standards": ["ISO standard", "other standard"],
    "nextAudit": "date or N/A"
  }},
  "risks": [
    {{"severity": "high or medium or low", "text": "risk description"}}
  ]
}}

Focus on: technical specifications, operating parameters, maintenance requirements, safety protocols, compliance standards.
Return ONLY valid JSON, no markdown or explanation."""

        else:  # manager
            prompt = f"""Analyze this industrial document from a MANAGER's perspective.
Document: {doc_name}
Content: {text[:6000]}

Return a JSON object with exactly this structure:
{{
  "summary": "2-3 sentence executive summary focusing on business impact",
  "financials": [
    {{"label": "metric name", "value": "amount", "change": "+X% or -X% or null"}}
  ],
  "risks": [
    {{"level": "HIGH or MEDIUM or LOW", "text": "business risk description"}}
  ],
  "recommendations": ["action item 1", "action item 2", "action item 3"]
}}

Focus on: financial implications, operational costs, business risks, budget requirements, strategic recommendations.
Return ONLY valid JSON, no markdown or explanation."""

        try:
            response = self.model.generate_content(prompt)
            import json
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
        except Exception as e:
            # Return sensible fallback data
            if role == "engineer":
                return {
                    "summary": ["Analysis in progress...", "Upload complete document for full analysis"],
                    "specs": [{"label": "Status", "value": "Pending Analysis"}],
                    "compliance": {"status": "PENDING", "standards": [], "nextAudit": "N/A"},
                    "risks": [{"severity": "low", "text": f"Unable to analyze: {str(e)[:50]}"}]
                }
            else:
                return {
                    "summary": "Document analysis in progress. Full insights will be available shortly.",
                    "financials": [{"label": "Status", "value": "Pending", "change": None}],
                    "risks": [{"level": "LOW", "text": f"Analysis pending: {str(e)[:50]}"}],
                    "recommendations": ["Complete document upload for full analysis"]
                }

gemini_service = GeminiService()
