import google.generativeai as genai
import json
import os
from typing import Dict, List

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

def extract_graph_from_text(document_text: str, document_name: str = "Document") -> Dict:
    """
    Extract knowledge graph entities and relationships from text using Gemini AI.
    Returns nodes and links in format compatible with react-force-graph-3d.
    """
    
    prompt = f"""You are a Knowledge Graph Engineer for an industrial safety system.

Analyze this document and extract:
1. NODES: Entities like Machines, People, Departments, Documents, Risks
2. LINKS: Relationships like MENTIONS, AFFECTS, MANAGED_BY, HAS_RISK, CAUSES

DOCUMENT: {document_name}
TEXT:
{document_text[:8000]}

OUTPUT FORMAT (JSON only, no markdown):
{{
    "nodes": [
        {{"id": "Boiler_B7", "group": "Machine", "val": 10}},
        {{"id": "Safety_Officer", "group": "Person", "val": 8}},
        {{"id": "Fire_Hazard", "group": "Risk", "val": 9}}
    ],
    "links": [
        {{"source": "Boiler_B7", "target": "Fire_Hazard", "type": "HAS_RISK"}},
        {{"source": "Fire_Hazard", "target": "Safety_Officer", "type": "AFFECTS"}}
    ]
}}

GROUPS: Document, Risk, Person, Dept, Machine
TYPES: MENTIONS, AFFECTS, MANAGED_BY, HAS_RISK, CAUSES, DESCRIBES, ASSIGNED_TO
"""

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        # Clean response
        clean_json = response.text.replace("```json", "").replace("```", "").strip()
        graph_data = json.loads(clean_json)
        
        # Add document node
        graph_data["nodes"].insert(0, {
            "id": document_name.replace(" ", "_"),
            "group": "Document",
            "val": 8
        })
        
        return graph_data
        
    except Exception as e:
        print(f"Graph Extraction Error: {e}")
        # Fallback
        return {
            "nodes": [{"id": document_name.replace(" ", "_"), "group": "Document", "val": 5}],
            "links": []
        }

def merge_graphs(existing: Dict, new: Dict) -> Dict:
    """Merge new graph data into existing graph."""
    
    # Merge nodes (avoid duplicates)
    node_ids = {n["id"] for n in existing["nodes"]}
    for node in new["nodes"]:
        if node["id"] not in node_ids:
            existing["nodes"].append(node)
            node_ids.add(node["id"])
    
    # Merge links (avoid duplicates)
    link_keys = {(l["source"], l["target"]) for l in existing["links"]}
    for link in new["links"]:
        key = (link["source"], link["target"])
        if key not in link_keys:
            existing["links"].append(link)
            link_keys.add(key)
    
    return existing
