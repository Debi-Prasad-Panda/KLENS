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

    # ==================== USER MANAGEMENT (Silent Handover) ====================
    
    def create_or_update_user(self, email: str, name: str = None, department: str = None) -> Dict:
        """
        Create or update a User node in the graph.
        """
        try:
            with self.driver.session() as session:
                result = session.run(
                    """
                    MERGE (u:User {email: $email})
                    SET u.name = COALESCE($name, u.name, $email),
                        u.department = COALESCE($department, u.department),
                        u.updated_at = datetime()
                    RETURN u
                    """,
                    email=email,
                    name=name,
                    department=department
                )
                return {"success": True, "user": result.single()}
        except Exception as e:
            print(f"Neo4j user error: {e}")
            return {"error": str(e)}
    
    def create_user_manages_asset(
        self,
        user_email: str,
        asset_name: str,
        asset_type: str = "Machine",
        is_primary: bool = True
    ) -> Dict:
        """
        Create a MANAGES relationship between a User and an Asset.
        Used for tracking who is responsible for what equipment.
        
        Args:
            user_email: User's email
            asset_name: Name of the machine/asset
            asset_type: Node label (Machine, Document, Risk, etc.)
            is_primary: Whether this user is the primary manager
        """
        try:
            with self.driver.session() as session:
                # First ensure user exists
                session.run(
                    """
                    MERGE (u:User {email: $email})
                    SET u.updated_at = datetime()
                    """,
                    email=user_email
                )
                
                # Create asset and relationship
                result = session.run(
                    f"""
                    MATCH (u:User {{email: $email}})
                    MERGE (a:{asset_type} {{name: $asset_name}})
                    MERGE (u)-[r:MANAGES]->(a)
                    SET r.is_primary = $is_primary,
                        r.created_at = COALESCE(r.created_at, datetime()),
                        r.updated_at = datetime()
                    RETURN u, a, r
                    """,
                    email=user_email,
                    asset_name=asset_name,
                    is_primary=is_primary
                )
                return {"success": True, "created": result.single() is not None}
        except Exception as e:
            print(f"Neo4j manages error: {e}")
            return {"error": str(e)}
    
    def find_orphaned_assets(self, user_email: str) -> List[Dict]:
        """
        Find assets that ONLY this user manages (no backup).
        These are "orphaned" if this user leaves.
        
        Returns:
            List of assets with no other managers
        """
        try:
            with self.driver.session() as session:
                result = session.run(
                    """
                    MATCH (u:User {email: $email})-[:MANAGES]->(asset)
                    OPTIONAL MATCH (other:User)-[:MANAGES]->(asset)
                    WHERE other.email <> $email
                    WITH asset, count(other) as backup_count
                    WHERE backup_count = 0
                    RETURN asset.name as name, labels(asset)[0] as type, asset as properties
                    """,
                    email=user_email
                )
                return [dict(record) for record in result]
        except Exception as e:
            print(f"Neo4j orphan query error: {e}")
            return []
    
    def get_user_dependencies(self, user_email: str) -> Dict:
        """
        Get full dependency graph for a user.
        Returns everything they manage, documents they're connected to, etc.
        """
        try:
            with self.driver.session() as session:
                # Get managed assets
                managed_result = session.run(
                    """
                    MATCH (u:User {email: $email})-[r:MANAGES]->(asset)
                    RETURN asset.name as name, labels(asset)[0] as type, r.is_primary as is_primary
                    """,
                    email=user_email
                )
                managed_assets = [dict(record) for record in managed_result]
                
                # Get documents they're connected to
                docs_result = session.run(
                    """
                    MATCH (u:User {email: $email})-[:MANAGES|:UPLOADED|:AUTHORED]->(d:Document)
                    RETURN d.name as name, d.doc_id as doc_id
                    LIMIT 20
                    """,
                    email=user_email
                )
                documents = [dict(record) for record in docs_result]
                
                return {
                    "managed_assets": managed_assets,
                    "documents": documents,
                    "total_managed": len(managed_assets)
                }
        except Exception as e:
            print(f"Neo4j dependency error: {e}")
            return {"managed_assets": [], "documents": [], "error": str(e)}
    
    def auto_infer_user_asset_relationship(
        self,
        user_email: str,
        doc_name: str,
        extracted_entities: List[Dict]
    ) -> int:
        """
        Auto-infer User→Asset relationships from document entities.
        When a user uploads a document about "Turbine-C2", link them to it.
        
        Args:
            user_email: The user who uploaded/edited the document
            doc_name: Document name for context
            extracted_entities: List of entities from Gemini extraction
        
        Returns:
            Number of relationships created
        """
        try:
            relationships_created = 0
            with self.driver.session() as session:
                # First ensure user exists
                session.run(
                    """
                    MERGE (u:User {email: $email})
                    SET u.updated_at = datetime()
                    """,
                    email=user_email
                )
                
                for entity in extracted_entities:
                    group = entity.get("group", "Entity")
                    name = entity.get("id", "")
                    
                    # Only create MANAGES relationships for machines/equipment
                    if group in ["Machine", "Equipment", "Asset", "System"]:
                        result = session.run(
                            f"""
                            MATCH (u:User {{email: $email}})
                            MERGE (a:{group} {{name: $name}})
                            MERGE (u)-[r:MANAGES]->(a)
                            SET r.source = 'auto_inferred',
                                r.source_doc = $doc_name,
                                r.is_primary = false,
                                r.updated_at = datetime()
                            RETURN r
                            """,
                            email=user_email,
                            name=name,
                            doc_name=doc_name
                        )
                        if result.single():
                            relationships_created += 1
            
            return relationships_created
        except Exception as e:
            print(f"Neo4j auto-infer error: {e}")
            return 0
    
    def get_at_risk_users(self) -> List[Dict]:
        """
        Find users who are sole managers of critical assets.
        Used to show warning icons in the UI.
        
        Returns:
            List of users with their orphaned asset counts
        """
        try:
            with self.driver.session() as session:
                result = session.run(
                    """
                    MATCH (u:User)-[:MANAGES]->(asset)
                    WHERE NOT exists {
                        MATCH (other:User)-[:MANAGES]->(asset)
                        WHERE other.email <> u.email
                    }
                    WITH u, count(asset) as orphan_count
                    WHERE orphan_count > 0
                    RETURN u.email as email, u.name as name, orphan_count
                    ORDER BY orphan_count DESC
                    """
                )
                return [dict(record) for record in result]
        except Exception as e:
            print(f"Neo4j at-risk query error: {e}")
            return []


# Singleton instance
neo4j_service = Neo4jService()

