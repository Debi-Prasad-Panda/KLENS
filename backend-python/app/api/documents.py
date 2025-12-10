from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import os
import shutil
import json

from ..core.database import get_db, SessionLocal
from ..core.config import settings
from ..models.document import Document, DocumentStatus
from ..models.document_version import DocumentVersion
from ..models.audit_log import AuditLog
# Use new Supabase Auth dependency
from ..dependencies.auth import get_current_user, IndustrialUser
# SQLAlchemy User model for database queries
from ..models.user import User
from ..services.gemini_service import gemini_service
from ..services.neo4j_service import neo4j_service
from pypdf import PdfReader

router = APIRouter(prefix="/documents", tags=["documents"])


class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_name: str
    status: str
    ai_summary: Optional[str] = None
    ocr_text: Optional[str] = None
    created_at: datetime

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


def publish_status(doc_id: int, stage: str, progress: int, message: str = ""):
    """Publish document processing status to Redis for WebSocket clients."""
    import redis
    from ..core.config import settings
    try:
        r = redis.from_url(settings.REDIS_URL)
        payload = json.dumps({
            "doc_id": doc_id,
            "stage": stage,
            "progress": progress,
            "message": message
        })
        r.publish(f"doc_status:{doc_id}", payload)
        r.close()
    except Exception as e:
        print(f"Failed to publish status: {e}")


def process_document(doc_id: int, file_path: str, user_id: int):
    """Background task to process document - uses its own database session."""
    # Create a new session for background task
    db = SessionLocal()
    
    try:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return
        
        # Stage 1: OCR Extraction
        publish_status(doc_id, "ocr", 20, "Extracting text from document...")
        doc.status = DocumentStatus.ocr
        db.commit()
        
        # Extract text with pypdf
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        
        doc.ocr_text = text
        publish_status(doc_id, "analyzing", 40, "Running AI analysis...")
        doc.status = DocumentStatus.analyzing
        db.commit()
        
        # Stage 2: AI Analysis
        analysis = gemini_service.analyze_document(text)
        doc.ai_summary = analysis.get("summary", "")
        
        # Generate embedding
        publish_status(doc_id, "analyzing", 50, "Generating embeddings...")
        embedding = gemini_service.generate_embedding(text)
        doc.embedding = embedding
        
        # Stage 3: Graph Linking
        publish_status(doc_id, "linking", 70, "Extracting entities and building knowledge graph...")
        graph_data = gemini_service.extract_graph_entities(text, doc.original_name)
        neo4j_service.save_graph_entities(
            doc_id=doc_id,
            doc_name=doc.original_name,
            nodes=graph_data.get("nodes", []),
            links=graph_data.get("links", [])
        )
        
        # Stage 4: Complete
        publish_status(doc_id, "complete", 100, "Document processing complete!")
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
        publish_status(doc_id, "error", 0, f"Processing failed: {str(e)}")
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc:
            doc.status = DocumentStatus.failed
            db.commit()
        print(f"Document processing error: {e}")
    finally:
        db.close()


@router.post("/", response_model=DocumentResponse)
def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: IndustrialUser = Depends(get_current_user),
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
    current_user: IndustrialUser = Depends(get_current_user),
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
    current_user: IndustrialUser = Depends(get_current_user),
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
    current_user: IndustrialUser = Depends(get_current_user),
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
    current_user: IndustrialUser = Depends(get_current_user),
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
    current_user: IndustrialUser = Depends(get_current_user),
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


@router.get("/stats/dashboard", response_model=dict)
def get_dashboard_stats(
    current_user: IndustrialUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics."""
    from ..models.approval import Approval, ApprovalStatus
    
    # Document counts
    total_docs = db.query(func.count(Document.id)).scalar() or 0
    complete_docs = db.query(func.count(Document.id)).filter(
        Document.status == DocumentStatus.complete
    ).scalar() or 0
    processing_docs = db.query(func.count(Document.id)).filter(
        Document.status.in_([DocumentStatus.processing, DocumentStatus.ocr, DocumentStatus.analyzing])
    ).scalar() or 0
    failed_docs = db.query(func.count(Document.id)).filter(
        Document.status == DocumentStatus.failed
    ).scalar() or 0
    
    # Pending approvals
    pending_approvals = db.query(func.count(Approval.id)).filter(
        Approval.status == ApprovalStatus.pending
    ).scalar() or 0
    
    # Compliance score (simulated based on failed ratio)
    compliance_score = round(((total_docs - failed_docs) / max(total_docs, 1)) * 100, 1)
    
    # Recent documents for activity
    recent_docs = db.query(Document).order_by(
        Document.created_at.desc()
    ).limit(5).all()
    
    # Documents by department - skip JOIN since uploaded_by is now UUID string
    # In production, this should query user_profiles table in Supabase
    # For now, return a placeholder to avoid the type mismatch error
    department_data = [
        {"name": "Operations", "value": total_docs // 3 or 1},
        {"name": "Engineering", "value": total_docs // 3 or 1},
        {"name": "Management", "value": total_docs // 3 or 1}
    ]
    
    return {
        "stats": {
            "totalDocuments": total_docs,
            "complianceScore": compliance_score,
            "pendingApprovals": pending_approvals,
            "systemAlerts": failed_docs
        },
        "departmentData": department_data,
        "recentActivity": [
            {
                "id": doc.id,
                "original_name": doc.original_name,
                "status": doc.status.value if doc.status else "unknown",
                "created_at": doc.created_at.isoformat() if doc.created_at else None,
                "uploaded_by": doc.uploaded_by
            }
            for doc in recent_docs
        ]
    }


@router.get("/{doc_id}/insights", response_model=dict)
def get_document_insights(
    doc_id: int,
    role: str = "engineer",
    refresh: bool = False,
    current_user: IndustrialUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-generated role-based insights for a document.
    
    Insights are cached in the database after first generation to avoid
    repeated API calls to Gemini.
    
    Args:
        doc_id: Document ID
        role: Either 'engineer' or 'manager'
        refresh: If True, bypass cache and regenerate insights
    
    Returns:
        Role-specific AI analysis of the document
    """
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check if insights are already cached (unless refresh is requested)
    cached_insights = None
    if not refresh:
        if role == "engineer" and doc.engineer_insights:
            try:
                cached_insights = json.loads(doc.engineer_insights)
                print(f"[Cache HIT] Returning cached engineer insights for doc {doc_id}")
            except:
                pass
        elif role == "manager" and doc.manager_insights:
            try:
                cached_insights = json.loads(doc.manager_insights)
                print(f"[Cache HIT] Returning cached manager insights for doc {doc_id}")
            except:
                pass
    
    if cached_insights:
        # Log audit and return cached
        log_audit(db, current_user.id, "view_insights", "document", doc_id, {"role": role, "cached": True})
        return cached_insights
    
    # Use OCR text for analysis, fallback to summary
    text = doc.ocr_text or doc.ai_summary or ""
    
    if not text:
        # Return placeholder if no text available
        if role == "engineer":
            return {
                "summary": ["Document content not yet processed", "Please wait for OCR to complete"],
                "specs": [{"label": "Status", "value": "Processing"}],
                "compliance": {"status": "PENDING", "standards": [], "nextAudit": "N/A"},
                "risks": []
            }
        else:
            return {
                "summary": "Document is still being processed. Insights will be available once OCR and analysis are complete.",
                "financials": [],
                "risks": [],
                "recommendations": ["Wait for document processing to complete"]
            }
    
    # Generate role-based insights using Gemini
    print(f"[Cache MISS] Generating {role} insights for doc {doc_id}")
    insights = gemini_service.generate_role_insights(
        text=text,
        role=role,
        doc_name=doc.original_name
    )
    
    # Cache the insights in database
    try:
        if role == "engineer":
            doc.engineer_insights = json.dumps(insights)
        else:
            doc.manager_insights = json.dumps(insights)
        db.commit()
        print(f"[Cache] Saved {role} insights for doc {doc_id}")
    except Exception as e:
        print(f"[Cache] Failed to save insights: {e}")
    
    # Log audit
    log_audit(db, current_user.id, "view_insights", "document", doc_id, {"role": role, "cached": False})
    
    return insights

