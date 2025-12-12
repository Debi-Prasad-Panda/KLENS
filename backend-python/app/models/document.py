from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from ..core.database import Base
import enum

class DocumentStatus(str, enum.Enum):
    uploading = "uploading"
    processing = "processing"
    ocr = "ocr"
    analyzing = "analyzing"
    complete = "complete"
    failed = "failed"

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    # Changed from Integer FK to String to support Supabase UUID user IDs
    uploaded_by = Column(String, nullable=True, index=True)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.uploading)
    ocr_text = Column(Text)
    ai_summary = Column(Text)
    embedding = Column(Vector(384))  # sentence-transformers all-MiniLM-L6-v2 dimension
    # Cached AI insights (JSON strings)
    engineer_insights = Column(Text, nullable=True)
    manager_insights = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


