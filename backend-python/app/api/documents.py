from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
import os
import shutil
import json

from ..core.database import get_db, SessionLocal
from ..core.config import settings
from ..models.document import Document, DocumentStatus
from ..models.document_version import DocumentVersion
from ..models.audit_log import AuditLog
from ..models.user import User
from ..api.auth import get_current_user
from ..services.gemini_service import gemini_service
from pypdf import PdfReader

router = APIRouter(prefix="/documents", tags=["documents"])


class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_name: str
    status: str
    ai_summary: Optional[str] = None
    ocr_text: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


class DocumentUpdateRequest(BaseModel):
    content: str
    commitMessage: Optional[str] = None


def log_audit(db: Session, user_id: int, action: str, resource_type: str, resource_id: int = None, details: dict = None):
    """Helper function to log audit events."""
    audit = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=json.dumps(details) if details else None
    )
    db.add(audit)
    db.commit()


def process_document(doc_id: int, file_path: str, user_id: int):
    """Background task to process document - uses its own database session."""
    # Create a new session for background task
    db = SessionLocal()
    
    try:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return
        
        # Update status
        doc.status = DocumentStatus.ocr
        db.commit()
        
        # Extract text with pypdf
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        
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
        
        # Create initial version
        version = DocumentVersion(
            document_id=doc_id,
            version=1,
            content=text,
            changed_by=user_id,
            commit_message="Initial upload"
        )
        db.add(version)
        db.commit()
        
        # Log audit
        log_audit(db, user_id, "upload", "document", doc_id, {"filename": doc.original_name})
        
    except Exception as e:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc:
            doc.status = DocumentStatus.failed
            db.commit()
        print(f"Document processing error: {e}")
    finally:
        db.close()


@router.post("/", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a new document for processing."""
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
    
    # Process in background with its own session
    background_tasks.add_task(process_document, doc.id, file_path, current_user.id)
    
    return doc


@router.get("/", response_model=List[DocumentResponse])
def get_documents(
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all documents for current user."""
    query = db.query(Document).filter(Document.uploaded_by == current_user.id)
    
    if status:
        query = query.filter(Document.status == status)
    
    docs = query.order_by(Document.created_at.desc()).offset(offset).limit(limit).all()
    return docs


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific document by ID."""
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Log view action
    log_audit(db, current_user.id, "view", "document", doc_id)
    
    return doc


@router.put("/{doc_id}", response_model=dict)
def update_document(
    doc_id: int,
    update_data: DocumentUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update document content with versioning."""
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Get current max version
    max_version = db.query(func.max(DocumentVersion.version)).filter(
        DocumentVersion.document_id == doc_id
    ).scalar() or 0
    
    new_version = max_version + 1
    
    # Create new version
    version = DocumentVersion(
        document_id=doc_id,
        version=new_version,
        content=update_data.content,
        changed_by=current_user.id,
        commit_message=update_data.commitMessage
    )
    db.add(version)
    
    # Update document content
    doc.ocr_text = update_data.content
    db.commit()
    
    # Log audit
    log_audit(db, current_user.id, "edit", "document", doc_id, {"version": new_version})
    
    return {"version": new_version}


@router.post("/{doc_id}/revert/{version}", response_model=dict)
def revert_document(
    doc_id: int,
    version: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revert document to a previous version."""
    # Check admin role
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can revert documents")
    
    # Get the version
    version_data = db.query(DocumentVersion).filter(
        DocumentVersion.document_id == doc_id,
        DocumentVersion.version == version
    ).first()
    
    if not version_data:
        raise HTTPException(status_code=404, detail="Version not found")
    
    # Update document
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc.ocr_text = version_data.content
    db.commit()
    
    # Log audit
    log_audit(db, current_user.id, "revert", "document", doc_id, {"toVersion": version})
    
    return {"success": True}


@router.get("/{doc_id}/versions", response_model=List[dict])
def get_document_versions(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all versions of a document."""
    versions = db.query(DocumentVersion).filter(
        DocumentVersion.document_id == doc_id
    ).order_by(DocumentVersion.version.desc()).all()
    
    return [
        {
            "id": v.id,
            "version": v.version,
            "changed_by": v.changed_by,
            "commit_message": v.commit_message,
            "created_at": v.created_at.isoformat() if v.created_at else None
        }
        for v in versions
    ]
