"""
Search API - Hybrid search combining vector + keyword search.
Uses Supabase knowledge_hub table with pgvector.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any

# Use new Supabase Auth dependency
from ..dependencies.auth import get_current_user, IndustrialUser
from ..services.gemini_service import gemini_service
from ..services.supabase_service import supabase_service
from ..utils.validation import (
    validate_no_xss,
    sanitize_text,
    StrictBaseModel,
)

router = APIRouter(prefix="/search", tags=["search"])


class SearchRequest(StrictBaseModel):
    """Search request with strict validation"""
    query: str = Field(
        ...,
        min_length=2,
        max_length=500,
        description="Search query"
    )
    limit: int = Field(
        10,
        ge=1,  # Greater than or equal to 1
        le=100,  # Less than or equal to 100
        description="Result limit"
    )
    filters: Optional[Dict[str, Any]] = Field(
        None,
        description="Metadata filters"
    )
    
    @field_validator('query')
    @classmethod
    def validate_query_field(cls, v: str) -> str:
        validate_no_xss(v)
        return sanitize_text(v, 500)


class SearchResult(BaseModel):
    id: str
    file_name: str
    s3_url: str
    content_chunk: str
    score: float
    match_type: str  # "vector" or "keyword"
    metadata: Optional[Dict[str, Any]] = None


class SearchResponse(BaseModel):
    results: List[SearchResult]
    total: int
    query: str


@router.post("/", response_model=SearchResponse)
async def hybrid_search(
    request: SearchRequest,
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Perform hybrid search (semantic + keyword) on the knowledge hub.
    
    This is the main search endpoint for K-LENS. It combines:
    1. Vector similarity search (semantic understanding)
    2. Keyword matching (exact term matching)
    
    The results are deduplicated and ranked by combined score.
    """
    if not request.query or len(request.query.strip()) < 2:
        raise HTTPException(status_code=400, detail="Query must be at least 2 characters")
    
    try:
        # Generate embedding for query
        query_embedding = gemini_service.generate_embedding(request.query)
        
        # Perform hybrid search
        results = supabase_service.hybrid_search(
            query_text=request.query,
            query_embedding=query_embedding,
            limit=request.limit
        )
        
        # Transform to response format
        search_results = [
            SearchResult(
                id=str(r.get("id", "")),
                file_name=r.get("file_name", ""),
                s3_url=r.get("s3_url", ""),
                content_chunk=r.get("content_chunk", "")[:500],  # Truncate for response
                score=r.get("score", 0.0),
                match_type=r.get("match_type", "unknown"),
                metadata=r.get("metadata")
            )
            for r in results
        ]
        
        return SearchResponse(
            results=search_results,
            total=len(search_results),
            query=request.query
        )
        
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/documents", response_model=List[Dict])
async def get_all_documents(
    limit: int = 50,
    offset: int = 0,
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Get all documents from knowledge hub with pagination.
    """
    try:
        documents = supabase_service.get_documents(limit=limit, offset=offset)
        return documents
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch documents: {str(e)}")


@router.get("/documents/{doc_id}")
async def get_document(
    doc_id: str,
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Get a specific document by ID from knowledge hub.
    """
    doc = supabase_service.get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.get("/documents/{doc_id}/insights", response_model=Dict[str, Any])
async def get_document_insights(
    doc_id: str,
    role: str = "engineer",
    language: str = "English",
    refresh: bool = False,
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Get AI-generated role-based insights for a Knowledge Hub document (UUID).
    Uses metadata column for caching, keyed by role and language.
    """
    # 1. Fetch document
    doc = supabase_service.get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # 2. Check cache in metadata
    metadata = doc.get("metadata", {}) or {}
    # Cache key includes language if not English
    cache_key = f"{role}_insights"
    if language != "English":
        cache_key = f"{role}_insights_{language}"
    
    if not refresh and cache_key in metadata:
        print(f"[Cache HIT] Returning cached {role} insights ({language}) for doc {doc_id}")
        return metadata[cache_key]
    
    # 3. Generate insights API
    try:
        print(f"[Cache MISS] Generating {role} insights ({language}) for doc {doc_id}")
        insights = gemini_service.generate_role_insights(
            text=doc.get("content_chunk", ""),
            role=role,
            doc_name=doc.get("file_name", "Document"),
            language=language
        )
        
        # 4. Cache in metadata
        try:
            updated_metadata = metadata.copy()
            updated_metadata[cache_key] = insights
            supabase_service.client.table("knowledge_hub").update({"metadata": updated_metadata}).eq("id", doc_id).execute()
        except Exception as e:
            print(f"Failed to cache insights: {e}")
            
        return insights
        
    except Exception as e:
        print(f"Insights generation error: {e}")
        return {
            "summary": "Unable to generate insights at this time.",
            "error": str(e)
        }
