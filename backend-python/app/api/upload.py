"""
Upload API - Document ingestion pipeline for Supabase.
Handles: PDF Upload → Storage → OCR → Embedding → Database
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import tempfile
import os

from ..models.user import User
from ..api.auth import get_current_user
from ..services.gemini_service import gemini_service
from ..services.supabase_service import supabase_service
from pypdf import PdfReader

router = APIRouter(prefix="/upload", tags=["upload"])


class UploadResponse(BaseModel):
    id: str
    file_name: str
    s3_url: str
    status: str
    message: str


class UploadStatus(BaseModel):
    doc_id: str
    stage: str
    progress: int
    message: str


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list:
    """
    Split text into overlapping chunks.
    
    Args:
        text: Full document text
        chunk_size: Target size per chunk (in words)
        overlap: Number of words to overlap between chunks
    
    Returns:
        List of text chunks
    """
    words = text.split()
    chunks = []
    
    if len(words) <= chunk_size:
        return [text]
    
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start = end - overlap
        
        if start >= len(words):
            break
    
    return chunks


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF using pypdf."""
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text


def process_document_supabase(
    file_bytes: bytes,
    original_name: str,
    content_type: str,
    metadata: Dict[str, Any]
):
    """
    Background task: Full document processing pipeline.
    
    Pipeline Steps:
    1. Upload to Supabase Storage
    2. Extract text (OCR/pypdf)
    3. Chunk text
    4. Generate embeddings for each chunk
    5. Store in knowledge_hub table
    """
    temp_path = None
    try:
        # Save to temp file for processing
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(file_bytes)
            temp_path = tmp.name
        
        print(f"📄 Processing: {original_name}")
        
        # Step 1: Upload to Supabase Storage
        print("  ⬆️ Uploading to Storage...")
        storage_result = supabase_service.upload_file_bytes(
            file_bytes=file_bytes,
            original_name=original_name,
            content_type=content_type
        )
        s3_url = storage_result["public_url"]
        print(f"  ✅ Uploaded: {s3_url}")
        
        # Step 2: Extract text
        print("  📝 Extracting text...")
        full_text = extract_text_from_pdf(temp_path)
        if not full_text.strip():
            print("  ⚠️ No text extracted from PDF")
            full_text = f"[PDF document: {original_name}]"
        
        # Step 3: Chunk text
        print("  ✂️ Chunking text...")
        chunks = chunk_text(full_text, chunk_size=400, overlap=50)
        print(f"  📊 Created {len(chunks)} chunks")
        
        # Step 4: Generate embeddings and store
        print("  🧠 Generating embeddings...")
        stored_chunks = []
        
        for i, chunk in enumerate(chunks):
            try:
                embedding = gemini_service.generate_embedding(chunk)
                chunk_metadata = {
                    **metadata,
                    "chunk_index": i,
                    "total_chunks": len(chunks)
                }
                stored_chunks.append({
                    "content": chunk,
                    "embedding": embedding,
                    "metadata": chunk_metadata
                })
                print(f"    Chunk {i+1}/{len(chunks)} embedded")
            except Exception as e:
                print(f"    ⚠️ Failed to embed chunk {i}: {e}")
                # Store without embedding
                stored_chunks.append({
                    "content": chunk,
                    "embedding": [0.0] * 768,  # Zero vector fallback
                    "metadata": {**metadata, "chunk_index": i, "embedding_failed": True}
                })
        
        # Step 5: Batch insert to database
        print("  💾 Saving to database...")
        result = supabase_service.insert_document_chunks(
            file_name=original_name,
            s3_url=s3_url,
            chunks=stored_chunks
        )
        
        print(f"✅ Complete! Stored {len(result)} chunks for {original_name}")
        return result
        
    except Exception as e:
        print(f"❌ Processing failed for {original_name}: {e}")
        raise e
    finally:
        # Cleanup temp file
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


@router.post("/", response_model=UploadResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a document to the K-LENS Knowledge Hub.
    
    This endpoint:
    1. Accepts a PDF file
    2. Starts background processing (OCR → Chunk → Embed → Store)
    3. Returns immediately with upload confirmation
    
    The document will appear in search results once processing completes.
    """
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400, 
            detail="Only PDF files are supported currently"
        )
    
    # Read file bytes
    file_bytes = await file.read()
    
    # Validate file size (50MB max)
    if len(file_bytes) > 52428800:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")
    
    # Prepare metadata
    metadata = {
        "uploaded_by": current_user.email if hasattr(current_user, 'email') else str(current_user.id),
        "department": current_user.department if hasattr(current_user, 'department') else "Unknown",
        "upload_time": datetime.utcnow().isoformat()
    }
    
    # Quick upload to storage first (synchronous for immediate URL)
    try:
        storage_result = supabase_service.upload_file_bytes(
            file_bytes=file_bytes,
            original_name=file.filename,
            content_type=file.content_type or "application/pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage upload failed: {str(e)}")
    
    # Start background processing (embedding + DB insert)
    background_tasks.add_task(
        process_document_supabase,
        file_bytes=file_bytes,
        original_name=file.filename,
        content_type=file.content_type or "application/pdf",
        metadata=metadata
    )
    
    return UploadResponse(
        id=storage_result["storage_path"],
        file_name=file.filename,
        s3_url=storage_result["public_url"],
        status="processing",
        message="Document uploaded successfully. Processing in background."
    )


@router.post("/sync")
async def upload_document_sync(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Synchronous upload - waits for full processing before returning.
    Use for smaller files or when you need immediate search availability.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    file_bytes = await file.read()
    
    if len(file_bytes) > 10485760:  # 10MB limit for sync
        raise HTTPException(
            status_code=400, 
            detail="File too large for sync upload (max 10MB). Use async endpoint."
        )
    
    metadata = {
        "uploaded_by": current_user.email if hasattr(current_user, 'email') else str(current_user.id),
        "department": current_user.department if hasattr(current_user, 'department') else "Unknown",
        "upload_time": datetime.utcnow().isoformat(),
        "sync_upload": True
    }
    
    try:
        result = process_document_supabase(
            file_bytes=file_bytes,
            original_name=file.filename,
            content_type=file.content_type or "application/pdf",
            metadata=metadata
        )
        
        return {
            "status": "complete",
            "file_name": file.filename,
            "chunks_created": len(result),
            "message": "Document processed and indexed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
