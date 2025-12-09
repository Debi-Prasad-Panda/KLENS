"""
Supabase Service - Unified client for Storage + Database operations.
Implements the "Store once, index everywhere" architecture for K-LENS.
"""

import os
import uuid
from typing import Dict, List, Optional, Any
from supabase import create_client, Client
from ..core.config import settings


class SupabaseService:
    """
    Unified Supabase client for:
    - Storage: Upload/download PDFs to S3-compatible bucket
    - Database: Insert/query knowledge_hub table with vectors
    - Search: Hybrid search (semantic + keyword)
    """
    
    def __init__(self):
        self._client: Optional[Client] = None
    
    @property
    def client(self) -> Client:
        """Lazy initialization of Supabase client."""
        if self._client is None:
            if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
                raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")
            self._client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        return self._client
    
    # ==================== STORAGE OPERATIONS ====================
    
    def upload_file(self, file_path: str, original_name: str = None) -> Dict[str, str]:
        """
        Upload a file to Supabase Storage.
        
        Args:
            file_path: Local path to the file
            original_name: Original filename (optional, uses basename if not provided)
        
        Returns:
            Dict with 'storage_path' and 'public_url'
        """
        file_name = original_name or os.path.basename(file_path)
        unique_id = str(uuid.uuid4())
        storage_path = f"documents/{unique_id}_{file_name}"
        
        with open(file_path, 'rb') as f:
            file_bytes = f.read()
            self.client.storage.from_(settings.SUPABASE_BUCKET).upload(
                path=storage_path,
                file=file_bytes,
                file_options={"content-type": "application/pdf"}
            )
        
        # Get public URL
        public_url = self.client.storage.from_(settings.SUPABASE_BUCKET).get_public_url(storage_path)
        
        return {
            "storage_path": storage_path,
            "public_url": public_url
        }
    
    def upload_file_bytes(self, file_bytes: bytes, original_name: str, content_type: str = "application/pdf") -> Dict[str, str]:
        """
        Upload file bytes directly to Supabase Storage (for UploadFile objects).
        
        Args:
            file_bytes: Raw file bytes
            original_name: Original filename
            content_type: MIME type
        
        Returns:
            Dict with 'storage_path' and 'public_url'
        """
        unique_id = str(uuid.uuid4())
        storage_path = f"documents/{unique_id}_{original_name}"
        
        self.client.storage.from_(settings.SUPABASE_BUCKET).upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": content_type}
        )
        
        public_url = self.client.storage.from_(settings.SUPABASE_BUCKET).get_public_url(storage_path)
        
        return {
            "storage_path": storage_path,
            "public_url": public_url
        }
    
    def delete_file(self, storage_path: str) -> bool:
        """Delete a file from Storage."""
        try:
            self.client.storage.from_(settings.SUPABASE_BUCKET).remove([storage_path])
            return True
        except Exception as e:
            print(f"Failed to delete file: {e}")
            return False
    
    # ==================== DATABASE OPERATIONS ====================
    
    def insert_document(
        self,
        file_name: str,
        s3_url: str,
        content_chunk: str,
        embedding: List[float],
        metadata: Dict[str, Any] = None
    ) -> Dict:
        """
        Insert a document chunk into knowledge_hub table.
        
        Args:
            file_name: Original filename
            s3_url: Public URL from Storage
            content_chunk: Text content (chunk)
            embedding: 768-dim vector from Gemini
            metadata: JSONB metadata (dept, author, etc.)
        
        Returns:
            Inserted row data
        """
        payload = {
            "file_name": file_name,
            "s3_url": s3_url,
            "content_chunk": content_chunk,
            "embedding": embedding,
            "metadata": metadata or {}
        }
        
        response = self.client.table("knowledge_hub").insert(payload).execute()
        return response.data[0] if response.data else {}
    
    def insert_document_chunks(
        self,
        file_name: str,
        s3_url: str,
        chunks: List[Dict[str, Any]]
    ) -> List[Dict]:
        """
        Batch insert multiple chunks for a document.
        
        Args:
            file_name: Original filename
            s3_url: Public URL from Storage
            chunks: List of dicts with 'content' and 'embedding' keys
        
        Returns:
            List of inserted rows
        """
        payloads = [
            {
                "file_name": file_name,
                "s3_url": s3_url,
                "content_chunk": chunk["content"],
                "embedding": chunk["embedding"],
                "metadata": chunk.get("metadata", {})
            }
            for chunk in chunks
        ]
        
        response = self.client.table("knowledge_hub").insert(payloads).execute()
        return response.data or []
    
    def get_document_by_id(self, doc_id: str) -> Optional[Dict]:
        """Get a single document by ID."""
        response = self.client.table("knowledge_hub").select("*").eq("id", doc_id).execute()
        return response.data[0] if response.data else None
    
    def get_documents(self, limit: int = 50, offset: int = 0) -> List[Dict]:
        """Get all documents with pagination."""
        response = (
            self.client.table("knowledge_hub")
            .select("id, file_name, s3_url, metadata, created_at")
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        return response.data or []
    
    def delete_document(self, doc_id: str) -> bool:
        """Delete a document by ID."""
        try:
            self.client.table("knowledge_hub").delete().eq("id", doc_id).execute()
            return True
        except Exception as e:
            print(f"Failed to delete document: {e}")
            return False
    
    # ==================== SEARCH OPERATIONS ====================
    
    def vector_search(
        self,
        query_embedding: List[float],
        limit: int = 10,
        threshold: float = 0.5
    ) -> List[Dict]:
        """
        Perform vector similarity search using pgvector.
        
        Note: Requires a database function 'match_documents' to be created:
        
        CREATE OR REPLACE FUNCTION match_documents(
            query_embedding vector(768),
            match_threshold float,
            match_count int
        )
        RETURNS TABLE (
            id uuid,
            file_name text,
            s3_url text,
            content_chunk text,
            metadata jsonb,
            similarity float
        )
        LANGUAGE plpgsql
        AS $$
        BEGIN
            RETURN QUERY
            SELECT
                k.id,
                k.file_name,
                k.s3_url,
                k.content_chunk,
                k.metadata,
                1 - (k.embedding <=> query_embedding) AS similarity
            FROM knowledge_hub k
            WHERE 1 - (k.embedding <=> query_embedding) > match_threshold
            ORDER BY k.embedding <=> query_embedding
            LIMIT match_count;
        END;
        $$;
        """
        try:
            response = self.client.rpc(
                "match_documents",
                {
                    "query_embedding": query_embedding,
                    "match_threshold": threshold,
                    "match_count": limit
                }
            ).execute()
            return response.data or []
        except Exception as e:
            print(f"Vector search error: {e}")
            # Fallback: return empty results
            return []
    
    def keyword_search(self, query: str, limit: int = 10) -> List[Dict]:
        """
        Perform keyword search using Postgres ilike.
        Supports multi-word queries by searching for each word.
        """
        try:
            # Split query into words for better matching
            words = query.strip().split()
            
            if not words:
                return []
            
            # For single word, use simple ilike
            if len(words) == 1:
                response = (
                    self.client.table("knowledge_hub")
                    .select("id, file_name, s3_url, content_chunk, metadata")
                    .ilike("content_chunk", f"%{words[0]}%")
                    .limit(limit)
                    .execute()
                )
                return response.data or []
            
            # For multiple words, search for first word and filter in Python
            # (Supabase doesn't support OR in ilike easily)
            results = []
            seen_ids = set()
            
            for word in words:
                if len(word) < 2:  # Skip very short words
                    continue
                response = (
                    self.client.table("knowledge_hub")
                    .select("id, file_name, s3_url, content_chunk, metadata")
                    .ilike("content_chunk", f"%{word}%")
                    .limit(limit)
                    .execute()
                )
                for row in (response.data or []):
                    if row["id"] not in seen_ids:
                        results.append(row)
                        seen_ids.add(row["id"])
            
            return results[:limit]
        except Exception as e:
            print(f"Keyword search error: {e}")
            return []
    
    def hybrid_search(
        self,
        query_text: str,
        query_embedding: List[float],
        limit: int = 10,
        vector_weight: float = 0.7
    ) -> List[Dict]:
        """
        Perform hybrid search combining vector + keyword results.
        
        Args:
            query_text: Text query for keyword search
            query_embedding: Vector embedding for semantic search
            limit: Max results to return
            vector_weight: Weight for vector results (0-1)
        
        Returns:
            Combined and deduplicated results with similarity scores
        """
        # Get vector results
        vector_results = self.vector_search(query_embedding, limit=limit)
        
        # Get keyword results
        keyword_results = self.keyword_search(query_text, limit=limit)
        
        # Combine and deduplicate by ID
        seen_ids = set()
        combined = []
        
        # Add vector results with weighted score
        for r in vector_results:
            r["score"] = r.get("similarity", 0.5) * vector_weight
            r["match_type"] = "vector"
            combined.append(r)
            seen_ids.add(r["id"])
        
        # Add keyword results (not already in vector results)
        for r in keyword_results:
            if r["id"] not in seen_ids:
                r["score"] = (1 - vector_weight) * 0.8  # Base score for keyword matches
                r["match_type"] = "keyword"
                combined.append(r)
                seen_ids.add(r["id"])
        
        # Sort by score descending
        combined.sort(key=lambda x: x.get("score", 0), reverse=True)
        
        return combined[:limit]


# Singleton instance
supabase_service = SupabaseService()
