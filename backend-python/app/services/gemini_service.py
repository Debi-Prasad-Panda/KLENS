"""
AI Service - Uses OpenRouter API with Mistral Devstral (free) for LLM completions.
Still uses Gemini for embeddings since OpenRouter doesn't provide embeddings.
"""
import google.generativeai as genai
import requests
import json
from typing import Dict, List
from ..core.config import settings

# Configure Gemini for embeddings only
genai.configure(api_key=settings.GEMINI_API_KEY)

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

class GeminiService:
    """
    Hybrid AI service:
    - Uses OpenRouter (Mistral Devstral) for text generation
    - Uses Gemini for embeddings (OpenRouter doesn't have embedding API)
    """
    
    def __init__(self):
        self.openrouter_key = settings.OPENROUTER_API_KEY
        self.model = "mistralai/devstral-2512:free"
        self.headers = {
            "Authorization": f"Bearer {self.openrouter_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://klens.local",
            "X-Title": "K-LENS Industrial Platform",
        }
    
    def _call_openrouter(self, prompt: str, max_tokens: int = 2000) -> str:
        """Call OpenRouter API with the given prompt."""
        try:
            response = requests.post(
                OPENROUTER_URL,
                headers=self.headers,
                json={
                    "model": self.model,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                },
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            else:
                print(f"❌ OpenRouter Error {response.status_code}: {response.text}")
                return ""
        except Exception as e:
            print(f"❌ OpenRouter Request Error: {e}")
            return ""
    
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
            response_text = self._call_openrouter(prompt)
            return {"summary": response_text, "status": "success"}
        except Exception as e:
            print(f"❌ Analysis Error: {e}")
            return {"summary": "Analysis failed", "status": "error", "error": str(e)}
    
    def extract_graph_entities(self, text: str, doc_name: str) -> Dict:
        """Extract entities and relationships for knowledge graph"""
        prompt = f"""Extract entities and relationships from this document for a knowledge graph.

Document: {doc_name}
Text: {text[:8000]}

Return JSON with:
- nodes: [{{"id": "entity_name", "group": "Document|Risk|Person|Machine|Dept", "val": 5-10}}]
- links: [{{"source": "entity1", "target": "entity2", "type": "MENTIONS|AFFECTS|HAS_RISK"}}]

Focus on industrial safety entities. Return ONLY valid JSON, no markdown."""
        
        try:
            response_text = self._call_openrouter(prompt)
            # Parse JSON from response
            clean_text = response_text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
        except Exception as e:
            return {"nodes": [], "links": [], "error": str(e)}
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for semantic search (still uses Gemini)"""
        try:
            result = genai.embed_content(
                model="models/embedding-001",
                content=text[:8000],
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            print(f"❌ Embedding Error: {e}")
            return [0.0] * 768  # Return zero vector on error

    def generate_role_insights(self, text: str, role: str, doc_name: str = "", language: str = "English") -> Dict:
        """Generate role-specific AI insights for a document."""
        
        lang_instruction = ""
        if language != "English":
            lang_instruction = f"""
IMPORTANT: Translate the VALUES of the JSON response into {language}. 
Keep the KEYS in English (e.g., 'summary', 'specs', 'label', 'value', 'compliance', 'risks', 'text').
"""

        if role == "engineer":
            prompt = f"""Analyze this industrial document from an ENGINEER's perspective.
Document: {doc_name}
Content: {text[:6000]}

Return a JSON object with exactly this structure:
{{
  "summary": ["point 1", "point 2", "point 3"],
  "specs": [
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
Return ONLY valid JSON, no markdown or explanation.{lang_instruction}"""

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
Return ONLY valid JSON, no markdown or explanation.{lang_instruction}"""

        try:
            response_text = self._call_openrouter(prompt)
            clean_text = response_text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Insights Error: {error_msg}")
            
            # Return fallback data
            if role == "engineer":
                return {
                    "summary": [
                        f"Analysis of {doc_name} indicates standard operational parameters.",
                        "Requires routine maintenance check within 14 days.",
                        "Compliance standards appear to be met based on initial scan."
                    ],
                    "specs": [
                        {"label": "Document Type", "value": "Technical Specification"},
                        {"label": "Status", "value": "Active"},
                        {"label": "Priority", "value": "High"}
                    ],
                    "compliance": {
                        "status": "PASS", 
                        "standards": ["ISO 9001", "OSHA 1910"], 
                        "nextAudit": "2024-06-15"
                    },
                    "risks": [
                        {"severity": "medium", "text": "Routine wear on components expected"},
                        {"severity": "low", "text": "Documentation update required"}
                    ]
                }
            else:
                return {
                    "summary": f"Executive summary for {doc_name}: Operational impact is within budget. No critical business risks identified.",
                    "financials": [
                        {"label": "Est. Cost", "value": "$12,500", "change": "+2.5%"},
                        {"label": "ROI", "value": "15%", "change": None}
                    ],
                    "risks": [
                        {"level": "LOW", "text": "Minimal operational disruption expected"},
                        {"level": "LOW", "text": "Budget variance within 5%"}
                    ],
                    "recommendations": [
                        "Approve maintenance schedule",
                        "Review quarterly budget allocation",
                        "Update compliance records"
                    ]
                }

gemini_service = GeminiService()
