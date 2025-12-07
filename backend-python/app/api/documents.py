from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import os
import shutil
from ..core.database import get_db
from ..core.config import settings
from ..models.document import Document, DocumentStatus
from ..models.user import User
from ..api.auth import get_current_user
from ..services.gemini_service import gemini_service
import fitz  # PyMuPDF

router = APIRouter(prefix="/documents", tags=["documents"])

class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_name: str
    status: str
    ai_summary: str = None
    created_at: str

    class Config:
        from_attributes = True

def process_document(doc_id: int, file_path: str, db: Session):
    """Background task to process document"""
    doc = db.query(Document).filter(Document.id == doc_id).first()
    
    try:
        # Update status
        doc.status = DocumentStatus.ocr
        db.commit()
        
        # Extract text with PyMuPDF
        pdf_doc = fitz.open(file_path)
        text = ""
        for page in pdf_doc:
            text += page.get_text()
        pdf_doc.close()
        
        doc.ocr_text = text
        doc.status = DocumentStatus.analyzing
        db.commit()
        
        # AI Analysis
        analysis = gemini_service.analyze_document(text)
        doc.ai_summary = analysis.get("summary", "")
        
        # Generate embedding
        embedding = gemini_service.generate_embedding(text)
        doc.embedding = embedding
        
        # Extract graph entities
        graph_data = gemini_service.extract_graph_entities(text, doc.original_name)
        # TODO: Save to Neo4j
        
        doc.status = DocumentStatus.complete
        db.commit()
        
    except Exception as e:
        doc.status = DocumentStatus.failed
        db.commit()
        print(f"Document processing error: {e}")

@router.post("/", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file
    if file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    
    # Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"{current_user.id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create document record
    doc = Document(
        filename=file_path,
        original_name=file.filename,
        file_type=file.content_type,
        file_size=file.size,
        uploaded_by=current_user.id,
        status=DocumentStatus.processing
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # Process in background
    background_tasks.add_task(process_document, doc.id, file_path, db)
    
    return doc

@router.get("/", response_model=List[DocumentResponse])
def get_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    docs = db.query(Document).filter(Document.uploaded_by == current_user.id).all()
    return docs

@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc
