from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.sql import func
from ..core.database import Base
import enum


class ApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class Approval(Base):
    """Nuclear Keys approval system - multi-signature approval for critical actions."""
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    action_type = Column(String(100), nullable=False)  # delete_document, grant_admin, etc.
    resource_id = Column(Integer, nullable=True)
    required_approvals = Column(Integer, default=2)  # Number of approvals needed (2-of-3 quorum)
    approvers = Column(Text, default="[]")  # JSON array of {userId, decision, timestamp}
    status = Column(SQLEnum(ApprovalStatus), default=ApprovalStatus.pending)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
