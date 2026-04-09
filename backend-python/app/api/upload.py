"""
Upload API - Document ingestion pipeline for Supabase.
Handles: PDF Upload → Storage → OCR → Embedding → Database
Supports Granular Access Control (RBAC/ABAC) via access_rules.
"""

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import tempfile
import os
import json
import redis

from ..models.access_rules import AccessRules, AccessLevel
# Use new Supabase Auth dependency
from ..dependencies.auth import get_current_user, IndustrialUser
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


def publish_upload_status(doc_id: str, stage: str, progress: int, message: str = ""):
    """Publish upload status for websocket subscribers."""
    try:
        r = redis.from_url(settings.REDIS_URL)
        payload = json.dumps({
            "doc_id": doc_id,
            "stage": stage,
            "progress": progress,
            "message": message,
        })
        r.publish(f"doc_status:{doc_id}", payload)
        r.close()
    except Exception as e:
        print(f"Failed to publish upload status: {e}")


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
    tracking_id: str,
    file_bytes: bytes,
    original_name: str,
    content_type: str,
    metadata: Dict[str, Any],
    pre_uploaded: Optional[Dict[str, str]] = None,
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
        publish_upload_status(tracking_id, "uploading", 10, "Upload confirmed. Preparing pipeline...")
        
        # Step 1: Upload to Supabase Storage
        print("  ⬆️ Uploading to Storage...")
        if pre_uploaded:
            s3_url = pre_uploaded["public_url"]
            print(f"  ✅ Reusing uploaded file: {s3_url}")
        else:
            storage_result = supabase_service.upload_file_bytes(
                file_bytes=file_bytes,
                original_name=original_name,
                content_type=content_type
            )
            s3_url = storage_result["public_url"]
            print(f"  ✅ Uploaded: {s3_url}")
        
        # Step 2: Extract text
        print("  📝 Extracting text...")
        publish_upload_status(tracking_id, "ocr", 30, "Extracting text...")
        full_text = extract_text_from_pdf(temp_path)
        if not full_text.strip():
            print("  ⚠️ No text extracted from PDF")
            full_text = f"[PDF document: {original_name}]"
        
        # Step 3: Chunk text
        print("  ✂️ Chunking text...")
        publish_upload_status(tracking_id, "analyzing", 50, "Preparing chunks for AI analysis...")
        chunks = chunk_text(full_text, chunk_size=400, overlap=50)
        print(f"  📊 Created {len(chunks)} chunks")
        
        # Step 4: Generate embeddings and store
        print("  🧠 Generating embeddings...")
        publish_upload_status(tracking_id, "analyzing", 65, "Generating embeddings...")
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
        publish_upload_status(tracking_id, "linking", 85, "Saving indexed chunks...")
        result = supabase_service.insert_document_chunks(
            file_name=original_name,
            s3_url=s3_url,
            chunks=stored_chunks
        )
        
        print(f"✅ Complete! Stored {len(result)} chunks for {original_name}")
        publish_upload_status(tracking_id, "complete", 100, "Document processing complete")
        return result
        
    except Exception as e:
        publish_upload_status(tracking_id, "error", 0, f"Processing failed: {e}")
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
    access_rules: Optional[str] = Form(None),
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Upload a document to the K-LENS Knowledge Hub with Granular Access Control.
    
    This endpoint:
    1. Accepts a PDF file with optional access_rules JSON
    2. Starts background processing (OCR → Chunk → Embed → Store)
    3. Returns immediately with upload confirmation
    
    Access Levels:
    - public: Everyone can access
    - department: Only specified department
    - managers_only: Only managers in specified department
    - custom: Only specific users by email
    
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
    
    # Parse access rules if provided
    parsed_access_rules = AccessRules()  # Default: public access
    if access_rules:
        try:
            access_data = json.loads(access_rules)
            parsed_access_rules = AccessRules(**access_data)
        except (json.JSONDecodeError, ValueError) as e:
            print(f"⚠️ Invalid access_rules JSON: {e}, using default (public)")
    
    # Get user info for ownership tracking
    user_id = str(current_user.id) if hasattr(current_user, 'id') else "unknown"
    user_email = current_user.email if hasattr(current_user, 'email') else "unknown@klens.local"
    user_department = current_user.department if hasattr(current_user, 'department') else "Unknown"
    
    # Prepare metadata with access control
    access_metadata = parsed_access_rules.to_metadata_dict(user_id, user_email)
    metadata = {
        **access_metadata,
        "uploaded_by": user_email,
        "department": user_department,
        "upload_time": datetime.utcnow().isoformat()
    }
    
    print(f"📋 Access Control: {parsed_access_rules.access_level} | Metadata: {metadata}")
    
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
        tracking_id=storage_result["storage_path"],
        file_bytes=file_bytes,
        original_name=file.filename,
        content_type=file.content_type or "application/pdf",
        metadata=metadata,
        pre_uploaded=storage_result,
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
    access_rules: Optional[str] = Form(None),
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Synchronous upload with Granular Access Control.
    Waits for full processing before returning.
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
    
    # Parse access rules if provided
    parsed_access_rules = AccessRules()  # Default: public access
    if access_rules:
        try:
            access_data = json.loads(access_rules)
            parsed_access_rules = AccessRules(**access_data)
        except (json.JSONDecodeError, ValueError) as e:
            print(f"⚠️ Invalid access_rules JSON: {e}, using default (public)")
    
    # Get user info for ownership tracking
    user_id = str(current_user.id) if hasattr(current_user, 'id') else "unknown"
    user_email = current_user.email if hasattr(current_user, 'email') else "unknown@klens.local"
    user_department = current_user.department if hasattr(current_user, 'department') else "Unknown"
    
    # Prepare metadata with access control
    access_metadata = parsed_access_rules.to_metadata_dict(user_id, user_email)
    metadata = {
        **access_metadata,
        "uploaded_by": user_email,
        "department": user_department,
        "upload_time": datetime.utcnow().isoformat(),
        "sync_upload": True
    }
    
    print(f"📋 Sync Upload Access Control: {parsed_access_rules.access_level}")
    
    try:
        result = process_document_supabase(
            tracking_id=f"sync:{file.filename}",
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
