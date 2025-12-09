"""
Silent Handover API Endpoints
Provides endpoints for generating Legacy Pack reports and managing user-asset relationships.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from ..services.handover_service import handover_service
from ..services.neo4j_service import neo4j_service

router = APIRouter(prefix="/handover", tags=["Silent Handover"])


# ==================== REQUEST/RESPONSE MODELS ====================

class HandoverRequest(BaseModel):
    """Request to generate a handover report."""
    user_email: EmailStr
    user_name: Optional[str] = None


class UserAssetRequest(BaseModel):
    """Request to create a User→Asset relationship."""
    user_email: EmailStr
    asset_name: str
    asset_type: str = "Machine"
    is_primary: bool = True


class HandoverResponse(BaseModel):
    """Response containing the handover report."""
    report_markdown: str
    risk_level: str
    raw_data: dict
    user_email: str
    user_name: str


class AtRiskUser(BaseModel):
    """User who is sole manager of critical assets."""
    email: str
    name: Optional[str]
    orphan_count: int


class SimulationResponse(BaseModel):
    """Response from departure simulation."""
    orphaned_assets: list
    total_managed: int
    documents_affected: int
    impact_score: int


# ==================== ENDPOINTS ====================

@router.post("/generate", response_model=HandoverResponse)
async def generate_handover_report(request: HandoverRequest):
    """
    Generate a comprehensive Legacy Pack report for a departing employee.
    
    This endpoint:
    1. Queries Neo4j for orphaned assets (things only this user manages)
    2. Queries Supabase for resolution history (problems they solved)
    3. Queries Supabase for activity logs (documents they frequently access)
    4. Uses Gemini AI to synthesize a human-readable handover report
    
    Returns a markdown report with risk assessment.
    """
    try:
        result = await handover_service.generate_handover_report(
            user_email=request.user_email,
            user_name=request.user_name
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")


@router.get("/at-risk-users", response_model=List[AtRiskUser])
async def get_at_risk_users():
    """
    Get list of users who are sole managers of critical assets.
    
    These users should show a warning icon (⚠️) in the UI.
    If they leave, their managed assets would have no backup.
    """
    try:
        users = handover_service.get_at_risk_users()
        return [
            AtRiskUser(
                email=u.get("email", "unknown"),
                name=u.get("name"),
                orphan_count=u.get("orphan_count", 0)
            )
            for u in users
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get at-risk users: {str(e)}")


@router.post("/simulate/{user_email}")
async def simulate_departure(user_email: str):
    """
    Simulate what happens when a user leaves.
    
    Returns:
    - orphaned_assets: Assets that would have no manager
    - total_managed: Total assets they currently manage
    - documents_affected: Documents linked to them
    - impact_score: Calculated risk score
    
    Used for the visual "Knowledge Loss Simulation" in the UI.
    """
    try:
        result = handover_service.simulate_departure(user_email)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


@router.post("/user-asset")
async def create_user_asset_relationship(request: UserAssetRequest):
    """
    Manually create a User→Asset MANAGES relationship.
    
    This is the "God Mode" to manually link users to machines
    when auto-inference doesn't catch everything.
    """
    try:
        result = neo4j_service.create_user_manages_asset(
            user_email=request.user_email,
            asset_name=request.asset_name,
            asset_type=request.asset_type,
            is_primary=request.is_primary
        )
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return {"success": True, "message": f"Linked {request.user_email} to {request.asset_name}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user-dependencies/{user_email}")
async def get_user_dependencies(user_email: str):
    """
    Get full dependency graph for a user.
    
    Returns:
    - managed_assets: All assets they manage
    - documents: Documents they're connected to
    - total_managed: Count of managed assets
    """
    try:
        result = neo4j_service.get_user_dependencies(user_email)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/orphaned-assets/{user_email}")
async def get_orphaned_assets(user_email: str):
    """
    Get assets that ONLY this user manages.
    
    These are critical - if the user leaves, no one else knows these systems!
    """
    try:
        assets = neo4j_service.find_orphaned_assets(user_email)
        return {"orphaned_assets": assets, "count": len(assets)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
