from neo4j import GraphDatabase
from typing import Dict, List
from ..core.config import settings


class Neo4jService:
    """Service for managing Neo4j graph database operations."""

    def __init__(self):
        self._driver = None

    @property
    def driver(self):
        """Lazy initialization of Neo4j driver."""
        if self._driver is None:
            self._driver = GraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
            )
        return self._driver

    def close(self):
        """Close the driver connection."""
        if self._driver:
            self._driver.close()
            self._driver = None

    def save_graph_entities(
        self,
        doc_id: int,
        doc_name: str,
        nodes: List[Dict],
        links: List[Dict]
    ) -> Dict:
        """
        Save extracted graph entities to Neo4j.
        
        Args:
            doc_id: Document ID from PostgreSQL
            doc_name: Original document filename
            nodes: List of node dicts with keys: id, group, val
            links: List of link dicts with keys: source, target, type
        
        Returns:
            Dict with counts of created nodes and relationships
        """
        if not nodes:
            return {"nodes_created": 0, "relationships_created": 0}

        try:
            with self.driver.session() as session:
                # Create or merge the document node
                session.run(
                    """
                    MERGE (d:Document {doc_id: $doc_id})
                    SET d.name = $doc_name, d.updated_at = datetime()
                    """,
                    doc_id=doc_id,
                    doc_name=doc_name
                )

                # Create entity nodes and link them to the document
                nodes_created = 0
                for node in nodes:
                    node_id = node.get("id", "")
                    group = node.get("group", "Entity")
                    val = node.get("val", 5)

                    if not node_id:
                        continue

                    # Use the group as the node label
                    result = session.run(
                        f"""
                        MERGE (n:{group} {{name: $node_id}})
                        SET n.val = $val
                        WITH n
                        MATCH (d:Document {{doc_id: $doc_id}})
                        MERGE (d)-[:CONTAINS]->(n)
                        RETURN n
                        """,
                        node_id=node_id,
                        val=val,
                        doc_id=doc_id
                    )
                    if result.single():
                        nodes_created += 1

                # Create relationships between entities
                relationships_created = 0
                for link in links:
                    source = link.get("source", "")
                    target = link.get("target", "")
                    rel_type = link.get("type", "RELATED_TO").replace(" ", "_").upper()

                    if not source or not target:
                        continue

                    result = session.run(
                        f"""
                        MATCH (a {{name: $source}})
                        MATCH (b {{name: $target}})
                        MERGE (a)-[r:{rel_type}]->(b)
                        RETURN r
                        """,
                        source=source,
                        target=target
                    )
                    if result.single():
                        relationships_created += 1

                return {
                    "nodes_created": nodes_created,
                    "relationships_created": relationships_created
                }

        except Exception as e:
            print(f"Neo4j error: {e}")
            return {"error": str(e), "nodes_created": 0, "relationships_created": 0}


# Singleton instance
neo4j_service = Neo4jService()
