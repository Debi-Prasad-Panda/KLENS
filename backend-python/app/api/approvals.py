from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json

from ..core.database import get_db
from ..models.approval import Approval, ApprovalStatus
from ..models.user import User
from ..api.auth import get_current_user

router = APIRouter(prefix="/approvals", tags=["approvals"])


class ApprovalCreate(BaseModel):
    action_type: str
    resource_id: Optional[int] = None
    required_approvals: int = 2


class ApprovalVote(BaseModel):
    decision: str  # "approve" or "reject"


class ApproverInfo(BaseModel):
    userId: int
    decision: str
    timestamp: str


class ApprovalResponse(BaseModel):
    id: int
    action_type: str
    resource_id: Optional[int]
    required_approvals: int
    status: str
    approvers: List[ApproverInfo]
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/", response_model=dict)
def create_approval(
    approval_data: ApprovalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new approval request (Nuclear Keys)."""
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create approval requests")
    
    approval = Approval(
        action_type=approval_data.action_type,
        resource_id=approval_data.resource_id,
        required_approvals=approval_data.required_approvals,
        created_by=current_user.id
    )
    db.add(approval)
    db.commit()
    db.refresh(approval)
    
    return {"id": approval.id, "status": "pending"}


@router.post("/{approval_id}/approve", response_model=dict)
def approve_action(
    approval_id: int,
    vote: ApprovalVote,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Vote on an approval request."""
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can approve")
    
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    
    if approval.status != ApprovalStatus.pending:
        raise HTTPException(status_code=400, detail="Approval already completed")
    
    # Parse existing approvers
    approvers = json.loads(approval.approvers) if approval.approvers else []
    
    # Check if user already voted
    if any(a["userId"] == current_user.id for a in approvers):
        raise HTTPException(status_code=400, detail="Already voted")
    
    # Add vote
    approvers.append({
        "userId": current_user.id,
        "decision": vote.decision,
        "timestamp": datetime.utcnow().isoformat()
    })
    
    # Check if approved
    approved_count = sum(1 for a in approvers if a["decision"] == "approve")
    rejected_count = sum(1 for a in approvers if a["decision"] == "reject")
    
    if approved_count >= approval.required_approvals:
        approval.status = ApprovalStatus.approved
        approval.completed_at = datetime.utcnow()
    elif rejected_count >= approval.required_approvals:
        approval.status = ApprovalStatus.rejected
        approval.completed_at = datetime.utcnow()
    
    approval.approvers = json.dumps(approvers)
    db.commit()
    
    return {
        "status": approval.status.value,
        "approvedCount": approved_count,
        "requiredApprovals": approval.required_approvals
    }


@router.get("/", response_model=List[dict])
def get_approvals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all pending approvals."""
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view approvals")
    
    approvals = db.query(Approval).filter(
        Approval.status == ApprovalStatus.pending
    ).order_by(Approval.created_at.desc()).all()
    
    return [
        {
            "id": a.id,
            "action_type": a.action_type,
            "resource_id": a.resource_id,
            "required_approvals": a.required_approvals,
            "status": a.status.value,
            "approvers": json.loads(a.approvers) if a.approvers else [],
            "created_by": a.created_by,
            "created_at": a.created_at.isoformat()
        }
        for a in approvals
    ]
