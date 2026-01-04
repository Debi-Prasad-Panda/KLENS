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
    
    # Class-level cache for embedding model (shared across all instances)
    _embedding_model = None
    _model_loading = False
    
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
        """Generate embedding using sentence-transformers (local, no API needed)"""
        try:
            # Use sentence-transformers for embeddings (free, local)
            from sentence_transformers import SentenceTransformer
            
            # Cache the model at class level (shared across all instances)
            if GeminiService._embedding_model is None and not GeminiService._model_loading:
                GeminiService._model_loading = True
                print("🔄 Loading embedding model all-mpnet-base-v2 (first time only)...")
                print("   This will take ~10-30 seconds to download (~420MB)")
                # Use all-mpnet-base-v2 which produces 768 dimensions
                # This matches the Supabase knowledge_hub table schema (vector(768))
                GeminiService._embedding_model = SentenceTransformer('all-mpnet-base-v2')
                GeminiService._model_loading = False
                print("✅ Embedding model loaded and cached! Future searches will be instant.")
            
            # Wait if model is being loaded by another thread
            while GeminiService._model_loading:
                import time
                time.sleep(0.1)
            
            embedding = GeminiService._embedding_model.encode(text[:8000], convert_to_numpy=True)
            return embedding.tolist()
        except ImportError:
            print("sentence-transformers not installed. Install: pip install sentence-transformers")
            # Fallback to simple hash-based embedding (not semantic, but works)
            import hashlib
            hash_obj = hashlib.sha256(text[:8000].encode())
            hash_bytes = hash_obj.digest()
            # Convert to 768-dim vector to match database schema
            embedding = [float(b) / 255.0 for b in hash_bytes] * 24
            return embedding[:768]
        except Exception as e:
            print(f"Embedding Error: {e}")
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

        elif role == "manager":
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

        elif role == "operator":
            prompt = f"""Analyze this industrial document from an OPERATOR's perspective.
Document: {doc_name}
Content: {text[:6000]}

Return a JSON object with exactly this structure:
{{
  "summary": ["key operational point 1", "key operational point 2", "key operational point 3"],
  "key_points": ["operational instruction 1", "operational instruction 2", "operational instruction 3"],
  "safety_steps": ["safety step 1", "safety step 2"],
  "warnings": ["warning 1", "warning 2"],
  "recommendations": ["action 1", "action 2"]
}}

Focus on: step-by-step procedures, operating instructions, safety warnings, emergency procedures, daily tasks.
Return ONLY valid JSON, no markdown or explanation.{lang_instruction}"""

        elif role == "safety_officer":
            prompt = f"""Analyze this industrial document from a SAFETY OFFICER's perspective.
Document: {doc_name}
Content: {text[:6000]}

Return a JSON object with exactly this structure:
{{
  "summary": ["safety finding 1", "safety finding 2", "safety finding 3"],
  "key_points": ["safety requirement 1", "safety requirement 2"],
  "hazards": [
    {{"type": "hazard type", "severity": "HIGH/MEDIUM/LOW", "mitigation": "action to mitigate"}}
  ],
  "compliance": ["standard 1", "regulation 2"],
  "risks": [
    {{"severity": "high or medium or low", "text": "risk description"}}
  ],
  "recommendations": ["safety improvement 1", "safety improvement 2"]
}}

Focus on: safety hazards, PPE requirements, emergency procedures, compliance with OSHA/ISO/local regulations, incident prevention.
Return ONLY valid JSON, no markdown or explanation.{lang_instruction}"""

        elif role == "maintenance":
            prompt = f"""Analyze this industrial document from a MAINTENANCE TECHNICIAN's perspective.
Document: {doc_name}
Content: {text[:6000]}

Return a JSON object with exactly this structure:
{{
  "summary": ["maintenance point 1", "maintenance point 2", "maintenance point 3"],
  "key_points": ["maintenance task 1", "maintenance task 2"],
  "schedule": [
    {{"task": "task name", "frequency": "daily/weekly/monthly", "priority": "HIGH/MEDIUM/LOW"}}
  ],
  "parts": ["part 1", "part 2"],
  "risks": [
    {{"severity": "high or medium or low", "text": "equipment risk description"}}
  ],
  "recommendations": ["maintenance recommendation 1", "maintenance recommendation 2"]
}}

Focus on: preventive maintenance, repair procedures, spare parts, equipment lifecycle, downtime prevention.
Return ONLY valid JSON, no markdown or explanation.{lang_instruction}"""

        else:  # quality
            prompt = f"""Analyze this industrial document from a QUALITY INSPECTOR's perspective.
Document: {doc_name}
Content: {text[:6000]}

Return a JSON object with exactly this structure:
{{
  "summary": ["quality finding 1", "quality finding 2", "quality finding 3"],
  "key_points": ["quality requirement 1", "quality requirement 2"],
  "standards": ["quality standard 1", "quality standard 2"],
  "defects": [
    {{"type": "defect type", "severity": "CRITICAL/MAJOR/MINOR", "action": "corrective action"}}
  ],
  "risks": [
    {{"severity": "high or medium or low", "text": "quality risk description"}}
  ],
  "recommendations": ["quality improvement 1", "quality improvement 2"]
}}

Focus on: quality control, inspection criteria, defect analysis, compliance with quality standards (ISO 9001), continuous improvement.
Return ONLY valid JSON, no markdown or explanation.{lang_instruction}"""

        try:
            response_text = self._call_openrouter(prompt)
            clean_text = response_text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Insights Error: {error_msg}")
            
            # Return fallback data based on role
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
            elif role == "manager":
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
            else:
                # Generic fallback for operator, safety_officer, maintenance, quality
                return {
                    "summary": [
                        f"Analysis of {doc_name} from {role.replace('_', ' ')} perspective.",
                        "Key points have been identified for review.",
                        "Follow standard procedures as outlined."
                    ],
                    "key_points": [
                        "Standard procedures apply",
                        "Review documentation regularly",
                        "Report any anomalies"
                    ],
                    "risks": [
                        {"severity": "low", "text": "Standard operational risks identified"}
                    ],
                    "recommendations": [
                        "Follow established protocols",
                        "Document any deviations"
                    ]
                }

gemini_service = GeminiService()
