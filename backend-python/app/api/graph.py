"""
Knowledge Graph API - Provides graph data from Neo4j database
Serves nodes and relationships for the frontend Knowledge Graph visualization
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from ..services.neo4j_service import neo4j_service
from ..dependencies.auth import get_current_user, IndustrialUser


router = APIRouter(prefix="/graph", tags=["Knowledge Graph"])


# ==================== Response Models ====================

class GraphNode(BaseModel):
    id: str
    group: str  # Document, Person, Machine, Risk, Dept
    val: int = 5
    
class GraphLink(BaseModel):
    source: str
    target: str
    type: str = "RELATED_TO"

class GraphDataResponse(BaseModel):
    nodes: List[GraphNode]
    links: List[GraphLink]
    stats: Dict[str, int]


# ==================== Graph Data Methods ====================

def get_full_graph() -> Dict:
    """
    Fetch the entire knowledge graph from Neo4j.
    Returns nodes grouped by type and all relationships.
    """
    try:
        with neo4j_service.driver.session() as session:
            # Get all nodes with their labels
            nodes_result = session.run("""
                MATCH (n)
                WHERE n:Document OR n:Person OR n:Machine OR n:Risk OR n:Dept OR n:User OR n:Equipment OR n:Asset
                RETURN n.name as id, 
                       CASE 
                           WHEN n:Document THEN 'Document'
                           WHEN n:User OR n:Person THEN 'Person'
                           WHEN n:Machine OR n:Equipment OR n:Asset THEN 'Machine'
                           WHEN n:Risk THEN 'Risk'
                           WHEN n:Dept THEN 'Dept'
                           ELSE 'Entity'
                       END as group,
                       COALESCE(n.val, 5) as val
                LIMIT 200
            """)
            
            nodes = []
            for record in nodes_result:
                node_id = record.get("id")
                if node_id:
                    nodes.append({
                        "id": str(node_id).replace(" ", "_"),
                        "group": record.get("group", "Entity"),
                        "val": record.get("val", 5)
                    })
            
            # Get all relationships
            links_result = session.run("""
                MATCH (a)-[r]->(b)
                WHERE (a:Document OR a:Person OR a:Machine OR a:Risk OR a:Dept OR a:User)
                  AND (b:Document OR b:Person OR b:Machine OR b:Risk OR b:Dept OR b:User)
                RETURN a.name as source, b.name as target, type(r) as type
                LIMIT 500
            """)
            
            links = []
            for record in links_result:
                source = record.get("source")
                target = record.get("target")
                if source and target:
                    links.append({
                        "source": str(source).replace(" ", "_"),
                        "target": str(target).replace(" ", "_"),
                        "type": record.get("type", "RELATED_TO")
                    })
            
            # Calculate stats
            stats = {
                "documents": sum(1 for n in nodes if n["group"] == "Document"),
                "people": sum(1 for n in nodes if n["group"] == "Person"),
                "machines": sum(1 for n in nodes if n["group"] == "Machine"),
                "risks": sum(1 for n in nodes if n["group"] == "Risk"),
                "departments": sum(1 for n in nodes if n["group"] == "Dept"),
                "total_nodes": len(nodes),
                "total_connections": len(links)
            }
            
            return {
                "nodes": nodes,
                "links": links,
                "stats": stats
            }
            
    except Exception as e:
        print(f"Graph fetch error: {e}")
        return {"nodes": [], "links": [], "stats": {}, "error": str(e)}


def get_document_graph(doc_id: int) -> Dict:
    """
    Get the subgraph centered around a specific document.
    """
    try:
        with neo4j_service.driver.session() as session:
            result = session.run("""
                MATCH (d:Document {doc_id: $doc_id})-[r]-(connected)
                RETURN d, r, connected
                LIMIT 50
            """, doc_id=doc_id)
            
            nodes = []
            links = []
            seen_nodes = set()
            
            for record in result:
                doc = record.get("d")
                connected = record.get("connected")
                rel = record.get("r")
                
                # Add document node
                doc_name = doc.get("name", f"Doc_{doc_id}")
                if doc_name not in seen_nodes:
                    nodes.append({
                        "id": doc_name.replace(" ", "_"),
                        "group": "Document",
                        "val": 10
                    })
                    seen_nodes.add(doc_name)
                
                # Add connected node
                conn_name = connected.get("name", "Unknown")
                if conn_name not in seen_nodes:
                    # Determine group from labels
                    labels = list(connected.labels) if hasattr(connected, 'labels') else []
                    group = "Entity"
                    for label in labels:
                        if label in ["Document", "Person", "Machine", "Risk", "Dept", "User"]:
                            group = label if label != "User" else "Person"
                            break
                    
                    nodes.append({
                        "id": conn_name.replace(" ", "_"),
                        "group": group,
                        "val": 5
                    })
                    seen_nodes.add(conn_name)
                
                # Add link
                links.append({
                    "source": doc_name.replace(" ", "_"),
                    "target": conn_name.replace(" ", "_"),
                    "type": rel.type if hasattr(rel, 'type') else "RELATED_TO"
                })
            
            return {"nodes": nodes, "links": links}
            
    except Exception as e:
        print(f"Document graph error: {e}")
        return {"nodes": [], "links": [], "error": str(e)}


# ==================== API Endpoints ====================

@router.get("/data", response_model=GraphDataResponse)
async def get_graph_data(
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Get the full knowledge graph for visualization.
    Returns all nodes and relationships from Neo4j.
    """
    graph_data = get_full_graph()
    
    # If Neo4j is empty or has error, return demo data
    if not graph_data.get("nodes") or len(graph_data["nodes"]) == 0:
        # Return minimal demo data so UI isn't empty
        return GraphDataResponse(
            nodes=[
                GraphNode(id="K-LENS_System", group="Document", val=10),
                GraphNode(id="Upload_a_Document", group="Document", val=5),
                GraphNode(id="Knowledge_Graph", group="Machine", val=5),
            ],
            links=[
                GraphLink(source="K-LENS_System", target="Knowledge_Graph", type="CONTAINS"),
            ],
            stats={
                "documents": 1,
                "people": 0,
                "machines": 1,
                "risks": 0,
                "departments": 0,
                "total_nodes": 3,
                "total_connections": 1
            }
        )
    
    return GraphDataResponse(
        nodes=[GraphNode(**n) for n in graph_data["nodes"]],
        links=[GraphLink(**l) for l in graph_data["links"]],
        stats=graph_data.get("stats", {})
    )


@router.get("/document/{doc_id}")
async def get_document_subgraph(
    doc_id: int,
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Get the subgraph for a specific document.
    Shows all entities connected to that document.
    """
    return get_document_graph(doc_id)


@router.get("/stats")
async def get_graph_stats(
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Get summary statistics about the knowledge graph.
    """
    try:
        with neo4j_service.driver.session() as session:
            result = session.run("""
                MATCH (n)
                WITH labels(n)[0] as label, count(n) as count
                RETURN label, count
            """)
            
            stats = {}
            for record in result:
                label = record.get("label", "Unknown")
                count = record.get("count", 0)
                stats[label.lower()] = count
            
            # Get relationship count
            rel_result = session.run("MATCH ()-[r]->() RETURN count(r) as total")
            rel_count = rel_result.single()
            stats["connections"] = rel_count["total"] if rel_count else 0
            
            return {"stats": stats}
            
    except Exception as e:
        print(f"Graph stats error: {e}")
        return {"stats": {}, "error": str(e)}


@router.post("/seed-demo")
async def seed_demo_data(
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Seed Neo4j with demo data for testing.
    Creates sample documents, people, machines, and risks.
    """
    try:
        demo_nodes = [
            {"id": "Boiler_B7", "group": "Machine"},
            {"id": "Turbine_C2", "group": "Machine"},
            {"id": "Pump_Station_4", "group": "Machine"},
            {"id": "Boiler_B7_Specs", "group": "Document"},
            {"id": "Safety_Manual_2024", "group": "Document"},
            {"id": "Maintenance_Log_Q4", "group": "Document"},
            {"id": "Pressure_Anomaly", "group": "Risk"},
            {"id": "Valve_Failure_Risk", "group": "Risk"},
            {"id": "Safety_Officer", "group": "Person"},
            {"id": "Eng_Rajesh", "group": "Person"},
            {"id": "Operations_Dept", "group": "Dept"},
            {"id": "Engineering_Dept", "group": "Dept"},
        ]
        
        demo_links = [
            {"source": "Boiler_B7_Specs", "target": "Boiler_B7", "type": "DESCRIBES"},
            {"source": "Boiler_B7", "target": "Pressure_Anomaly", "type": "HAS_RISK"},
            {"source": "Safety_Manual_2024", "target": "Valve_Failure_Risk", "type": "WARNS_ABOUT"},
            {"source": "Safety_Officer", "target": "Operations_Dept", "type": "WORKS_IN"},
            {"source": "Eng_Rajesh", "target": "Engineering_Dept", "type": "WORKS_IN"},
            {"source": "Eng_Rajesh", "target": "Boiler_B7", "type": "MANAGES"},
            {"source": "Eng_Rajesh", "target": "Turbine_C2", "type": "MANAGES"},
            {"source": "Maintenance_Log_Q4", "target": "Pump_Station_4", "type": "REFERENCES"},
            {"source": "Safety_Officer", "target": "Pressure_Anomaly", "type": "ASSIGNED_TO"},
        ]
        
        result = neo4j_service.save_graph_entities(
            doc_id=0,
            doc_name="Demo_Seed",
            nodes=demo_nodes,
            links=demo_links
        )
        
        return {
            "message": "Demo data seeded successfully",
            "nodes_created": result.get("nodes_created", 0),
            "relationships_created": result.get("relationships_created", 0)
        }
        
    except Exception as e:
        print(f"Seed error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
