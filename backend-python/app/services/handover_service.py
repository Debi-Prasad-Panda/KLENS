"""
Silent Handover Service - Knowledge Transfer for Employee Departures
Implements the "Knowledge Triangle" pattern:
1. Graph Analysis (Neo4j) - Find orphaned assets
2. Hive Mind (Supabase) - Get problem-solving history  
3. Attention Index (Supabase) - Recent activity/expertise
4. Gemini Synthesis - Generate the Legacy Pack report
"""

import google.generativeai as genai
from typing import Dict, List
from .supabase_service import supabase_service
from .neo4j_service import neo4j_service
from ..core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)


class HandoverService:
    """
    Generates "Legacy Pack" reports for departing employees.
    Captures tacit knowledge that would otherwise be lost.
    """
    
    def __init__(self):
        # Use gemini-2.5-flash-lite as specified
        self.model = genai.GenerativeModel('gemini-2.5-flash-lite')
    
    async def generate_handover_report(self, user_email: str, user_name: str = None) -> Dict:
        """
        Generate a comprehensive handover report for a departing user.
        
        Args:
            user_email: Email of the departing employee
            user_name: Optional name for personalization
        
        Returns:
            Dict with report_markdown, raw_data, and risk_level
        """
        print(f"🕵️‍♂️ Initiating Silent Handover for: {user_email}")
        
        # --- STEP 1: GRAPH ANALYSIS (Neo4j) ---
        # Find "Orphaned Assets" - things ONLY this user manages
        print("📊 Step 1/4: Analyzing graph dependencies...")
        orphaned_assets = neo4j_service.find_orphaned_assets(user_email)
        user_dependencies = neo4j_service.get_user_dependencies(user_email)
        
        # --- STEP 2: HIVE MIND ANALYSIS (Supabase Resolution Memory) ---
        # Find tricky problems they solved
        print("🧠 Step 2/4: Retrieving problem-solving history...")
        resolutions = supabase_service.get_user_resolutions(
            user_email=user_email,
            outcome_status="FIXED",
            limit=10
        )
        
        # --- STEP 3: ATTENTION INDEX (Supabase Activity Logs) ---
        # What were they working on recently?
        print("📚 Step 3/4: Analyzing activity patterns...")
        activity_logs = supabase_service.get_user_activity_logs(
            user_email=user_email,
            limit=30
        )
        expertise_summary = supabase_service.get_user_expertise_summary(user_email)
        
        # Extract document names from activity
        viewed_docs = list(set([
            log.get("target_name") or log.get("target_id", "Unknown")
            for log in activity_logs
            if log.get("action_type") == "VIEW_DOC"
        ]))
        
        # --- STEP 4: GEMINI SYNTHESIS ---
        print("✨ Step 4/4: Synthesizing tribal knowledge...")
        
        # Calculate risk level
        risk_level = self._calculate_risk_level(orphaned_assets, resolutions)
        
        # Build the prompt
        name_display = user_name or user_email.split("@")[0]
        
        prompt = f"""
You are an expert industrial knowledge transfer consultant. Generate a "Legacy Handover Protocol" 
for an engineer named {name_display} ({user_email}) who is leaving the organization.

Use the following raw data collected from our systems:

## 1. CRITICAL: ORPHANED ASSETS (No one else manages these!)
These machines/systems will have NO primary manager after this person leaves:
{orphaned_assets if orphaned_assets else "No orphaned assets detected (good!)"}

## 2. MANAGED ASSETS & DEPENDENCIES
Full list of what they manage:
{user_dependencies.get("managed_assets", [])[:10]}

## 3. EXPERT KNOWLEDGE: TOUGH PROBLEMS THEY FIXED
Recent problem resolutions showing their expertise:
{resolutions[:5] if resolutions else "No resolution history available"}

## 4. CONTEXT: DOCUMENTS & SYSTEMS THEY USE REGULARLY
{viewed_docs[:10] if viewed_docs else "No activity data available"}

## 5. EXPERTISE SUMMARY
{expertise_summary if expertise_summary else "No expertise data available"}

---

Generate a comprehensive handover report with this EXACT structure:

# 📋 Legacy Handover Protocol: {name_display}

## 🎯 Executive Summary
[2-3 sentences summarizing the knowledge risk and critical items]

## 🚨 Immediate Risks (Action Required!)
[List the orphaned assets that MUST be reassigned. If none, say "No critical risks identified"]

## 🧠 Tribal Knowledge (How They Solve Problems)
[Based on their resolution history, describe their problem-solving approach and expertise areas. 
If they fixed boiler issues, what's their technique? Make this actionable for their replacement.]

## 📚 Required Reading List
[Top 5-10 documents/manuals they frequently reference that a replacement should study]

## 👤 Recommended Successor Profile
[Based on the above, describe the ideal candidate profile for replacement]

## ⏰ Transition Timeline Recommendation
[Suggest a realistic timeline for knowledge transfer based on complexity]

---
Use markdown formatting. Be specific and actionable. This report helps prevent knowledge loss.
"""

        try:
            response = self.model.generate_content(prompt)
            report_markdown = response.text
        except Exception as e:
            print(f"❌ Gemini Error: {e}")
            # Generate a fallback report
            report_markdown = self._generate_fallback_report(
                name_display, orphaned_assets, resolutions, viewed_docs
            )
        
        # Convert orphaned_assets to serializable dicts (Neo4j nodes need conversion)
        serializable_orphans = []
        for a in orphaned_assets:
            if isinstance(a, dict):
                serializable_orphans.append({
                    "name": a.get("name", "Unknown"),
                    "type": a.get("type", "Asset")
                })
            else:
                # Handle Neo4j Node objects
                serializable_orphans.append({
                    "name": str(a.get("name", "Unknown")) if hasattr(a, 'get') else str(a),
                    "type": "Asset"
                })
        
        # Convert managed_assets similarly
        serializable_managed = []
        for a in user_dependencies.get("managed_assets", []):
            if isinstance(a, dict):
                serializable_managed.append({
                    "name": a.get("name", "Unknown"),
                    "type": a.get("type", "Asset"),
                    "is_primary": a.get("is_primary", False)
                })
        
        return {
            "report_markdown": report_markdown,
            "risk_level": risk_level,
            "raw_data": {
                "orphaned_assets": serializable_orphans,
                "managed_assets": serializable_managed,
                "resolutions_count": len(resolutions),
                "activity_count": len(activity_logs),
                "expertise_areas": expertise_summary
            },
            "user_email": user_email,
            "user_name": name_display
        }
    
    def _calculate_risk_level(
        self, 
        orphaned_assets: List[Dict], 
        resolutions: List[Dict]
    ) -> str:
        """
        Calculate risk level based on orphaned assets and expertise.
        Returns: 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
        """
        orphan_count = len(orphaned_assets)
        resolution_count = len(resolutions)
        
        if orphan_count >= 3 or (orphan_count >= 1 and resolution_count >= 5):
            return "CRITICAL"
        elif orphan_count >= 1 or resolution_count >= 3:
            return "HIGH"
        elif resolution_count >= 1:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _generate_fallback_report(
        self,
        name: str,
        orphaned_assets: List[Dict],
        resolutions: List[Dict],
        viewed_docs: List[str]
    ) -> str:
        """Generate a basic report when Gemini is unavailable."""
        orphan_list = "\n".join([
            f"- ⚠️ **{a.get('name', 'Unknown')}** ({a.get('type', 'Asset')})" 
            for a in orphaned_assets
        ]) or "- No orphaned assets detected"
        
        resolution_list = "\n".join([
            f"- Fixed: {r.get('problem_text', 'Unknown issue')[:50]}..." 
            for r in resolutions[:5]
        ]) or "- No resolution history"
        
        doc_list = "\n".join([
            f"- 📄 {doc}" for doc in viewed_docs[:5]
        ]) or "- No documents tracked"
        
        return f"""
# 📋 Legacy Handover Protocol: {name}

## 🎯 Executive Summary
This report was generated with limited AI assistance. Please review the raw data below.

## 🚨 Immediate Risks
{orphan_list}

## 🧠 Problem Resolution History
{resolution_list}

## 📚 Frequently Accessed Documents
{doc_list}

---
*Note: Full AI analysis unavailable. Data shown is raw system output.*
"""
    
    def get_at_risk_users(self) -> List[Dict]:
        """
        Get list of users who are sole managers of critical assets.
        Used for showing warning icons in the UI.
        Falls back to Supabase demo_users if Neo4j returns empty.
        """
        # Try Neo4j first
        neo4j_users = neo4j_service.get_at_risk_users()
        
        if neo4j_users:
            return neo4j_users
        
        # Fallback: Use Supabase demo_users table
        try:
            response = supabase_service.client.table("demo_users") \
                .select("email, name, managed_assets_count") \
                .eq("is_at_risk", True) \
                .execute()
            
            return [
                {
                    "email": u.get("email"),
                    "name": u.get("name"),
                    "orphan_count": u.get("managed_assets_count", 0)
                }
                for u in (response.data or [])
            ]
        except Exception as e:
            print(f"Supabase fallback error: {e}")
            return []
    
    def simulate_departure(self, user_email: str) -> Dict:
        """
        Simulate what happens when a user leaves.
        Returns the "damage assessment" for visualization.
        """
        orphaned = neo4j_service.find_orphaned_assets(user_email)
        dependencies = neo4j_service.get_user_dependencies(user_email)
        
        total_managed = dependencies.get("total_managed", 0)
        docs_affected = len(dependencies.get("documents", []))
        orphan_count = len(orphaned)
        
        # Text-based Impact Level:
        # CRITICAL = 3+ orphaned assets
        # HIGH = 1-2 orphaned assets  
        # MEDIUM = No orphaned but manages 3+ assets
        # LOW = Minimal risk
        
        if orphan_count >= 3:
            impact_level = "CRITICAL"
        elif orphan_count >= 1:
            impact_level = "HIGH"
        elif total_managed >= 3:
            impact_level = "MEDIUM"
        else:
            impact_level = "LOW"
        
        return {
            "orphaned_assets": orphaned,
            "total_managed": total_managed,
            "documents_affected": docs_affected,
            "impact_level": impact_level  # Changed from impact_score
        }


# Singleton instance
handover_service = HandoverService()
