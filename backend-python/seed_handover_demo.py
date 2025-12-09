"""
Silent Handover Demo Seed Data
Creates 6 months of fake activity logs, resolutions, and user-asset relationships
for demonstrating the Silent Handover feature.

Run this script to populate demo data:
    python seed_handover_demo.py
"""

import os
import random
from datetime import datetime, timedelta
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ SUPABASE_URL and SUPABASE_KEY must be set in .env")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ==================== DEMO PERSONAS ====================
USERS = [
    {"email": "rajesh.sharma@klens.com", "name": "Rajesh Sharma", "dept": "Maintenance"},
    {"email": "priya.patel@klens.com", "name": "Priya Patel", "dept": "Safety"},
    {"email": "amit.kumar@klens.com", "name": "Amit Kumar", "dept": "Operations"},
    {"email": "admin@example.com", "name": "System Admin", "dept": "IT"},
]

# Machines/Assets that users manage
MACHINES = [
    "Boiler-B7", "Turbine-C2", "Compressor-A1", "Generator-G3", 
    "Pump-P5", "Heat-Exchanger-H2", "Valve-Bank-V4", "Control-Panel-CP1"
]

DOCUMENTS = [
    "Boiler_Maintenance_Manual_2024.pdf",
    "Turbine_Safety_Protocols_v3.pdf",
    "Emergency_Shutdown_Procedures.pdf",
    "Compressor_Troubleshooting_Guide.pdf",
    "Monthly_Inspection_Checklist.pdf",
    "OSHA_Compliance_Report_2024.pdf",
    "Heat_Exchanger_Cleaning_SOP.pdf",
    "Valve_Calibration_Procedure.pdf",
]

# Problem scenarios for resolution memory
PROBLEMS = [
    {
        "problem": "Boiler pressure fluctuating between 150-180 PSI unexpectedly",
        "action": "Replaced faulty pressure relief valve. Recalibrated sensors. Scheduled follow-up check in 2 weeks.",
        "machine": "Boiler-B7"
    },
    {
        "problem": "Turbine vibration levels exceeding normal threshold",
        "action": "Balanced rotor blades. Replaced worn bearings. Aligned shaft to specifications.",
        "machine": "Turbine-C2"
    },
    {
        "problem": "Compressor overheating during peak operation",
        "action": "Cleaned air filters. Replaced coolant. Installed additional cooling fan.",
        "machine": "Compressor-A1"
    },
    {
        "problem": "Control panel showing intermittent false alarms",
        "action": "Replaced corroded wiring. Updated firmware. Calibrated all sensors.",
        "machine": "Control-Panel-CP1"
    },
    {
        "problem": "Pump cavitation causing efficiency loss",
        "action": "Adjusted suction head. Replaced impeller. Verified NPSH requirements.",
        "machine": "Pump-P5"
    },
    {
        "problem": "Heat exchanger scaling reducing thermal efficiency",
        "action": "Chemical descaling treatment. Installed water softener. Scheduled quarterly cleaning.",
        "machine": "Heat-Exchanger-H2"
    },
    {
        "problem": "Generator output voltage fluctuations",
        "action": "Replaced voltage regulator. Cleaned brushes and commutator. Load tested at full capacity.",
        "machine": "Generator-G3"
    },
    {
        "problem": "Valve actuator responding slowly to control signals",
        "action": "Lubricated valve stem. Replaced actuator diaphragm. Recalibrated positioner.",
        "machine": "Valve-Bank-V4"
    },
]


def random_date(days_back=180):
    """Generate a random date within the past N days."""
    delta = timedelta(days=random.randint(1, days_back))
    return datetime.now() - delta


def seed_resolution_memory():
    """Seed resolution memory with demo problem resolutions."""
    print("🧠 Seeding Resolution Memory (Hive Mind)...")
    
    resolutions = []
    
    # Rajesh is the expert - give him most of the fixes
    rajesh_email = "rajesh.sharma@klens.com"
    for problem in PROBLEMS[:6]:  # Rajesh fixes 6 out of 8
        resolutions.append({
            "user_email": rajesh_email,
            "problem_text": problem["problem"],
            "action_taken": problem["action"],
            "machine_id": problem["machine"],
            "outcome_status": "FIXED",
            "symptoms": ["Unusual readings", "Operator reported issue"],
            "timestamp": random_date().isoformat()
        })
    
    # Other users fix fewer problems
    for i, problem in enumerate(PROBLEMS[6:]):
        resolutions.append({
            "user_email": USERS[i % 3]["email"],
            "problem_text": problem["problem"],
            "action_taken": problem["action"],
            "machine_id": problem["machine"],
            "outcome_status": "FIXED",
            "symptoms": ["Scheduled maintenance"],
            "timestamp": random_date().isoformat()
        })
    
    # Add some additional resolutions for Rajesh to make him look irreplaceable
    extra_problems = [
        ("Boiler flame sensor malfunction", "Cleaned sensor lens. Replaced igniter.", "Boiler-B7"),
        ("Steam trap not closing properly", "Replaced float and thermostatic element.", "Boiler-B7"),
        ("Turbine oil temperature rising", "Changed thermal oil. Cleaned oil cooler.", "Turbine-C2"),
    ]
    
    for problem, action, machine in extra_problems:
        resolutions.append({
            "user_email": rajesh_email,
            "problem_text": problem,
            "action_taken": action,
            "machine_id": machine,
            "outcome_status": "FIXED",
            "symptoms": ["Preventive maintenance"],
            "timestamp": random_date(90).isoformat()
        })
    
    try:
        for res in resolutions:
            supabase.table("resolution_memory").insert(res).execute()
        print(f"   ✅ Inserted {len(resolutions)} resolutions")
    except Exception as e:
        print(f"   ❌ Error: {e}")


def seed_activity_logs():
    """Seed activity logs showing what users have been working on."""
    print("📊 Seeding Activity Logs (Attention Index)...")
    
    activities = []
    rajesh_email = "rajesh.sharma@klens.com"
    
    # Rajesh views documents frequently
    for _ in range(40):
        doc = random.choice(DOCUMENTS[:5])  # He focuses on core docs
        activities.append({
            "user_email": rajesh_email,
            "action_type": "VIEW_DOC",
            "target_id": doc,
            "target_name": doc.replace("_", " ").replace(".pdf", ""),
            "metadata": {"file_name": doc, "duration_seconds": random.randint(60, 600)},
            "timestamp": random_date().isoformat()
        })
    
    # Rajesh does searches
    search_queries = [
        "boiler pressure troubleshooting",
        "turbine vibration analysis",
        "preventive maintenance schedule",
        "emergency shutdown procedure",
        "steam trap inspection"
    ]
    for _ in range(15):
        query = random.choice(search_queries)
        activities.append({
            "user_email": rajesh_email,
            "action_type": "SEARCH",
            "target_id": query,
            "target_name": query,
            "metadata": {"search_query": query, "results_count": random.randint(3, 10)},
            "timestamp": random_date().isoformat()
        })
    
    # Add some activity for other users too (but less)
    for user in USERS[1:]:
        for _ in range(10):
            doc = random.choice(DOCUMENTS)
            activities.append({
                "user_email": user["email"],
                "action_type": "VIEW_DOC",
                "target_id": doc,
                "target_name": doc.replace("_", " ").replace(".pdf", ""),
                "metadata": {"file_name": doc},
                "timestamp": random_date().isoformat()
            })
    
    try:
        for act in activities:
            supabase.table("user_activity_logs").insert(act).execute()
        print(f"   ✅ Inserted {len(activities)} activity logs")
    except Exception as e:
        print(f"   ❌ Error: {e}")


def print_neo4j_commands():
    """Print Cypher commands to run in Neo4j to create user-asset relationships."""
    print("\n📈 Run these commands in Neo4j Browser (http://localhost:7474):\n")
    
    rajesh_email = "rajesh.sharma@klens.com"
    
    # Rajesh is sole manager of critical machines
    commands = [
        f"// Create Rajesh as a User",
        f"MERGE (u:User {{email: '{rajesh_email}', name: 'Rajesh Sharma', department: 'Maintenance'}})",
        "",
        "// Create machines and link Rajesh as SOLE manager (orphaned assets!)",
        "MERGE (m1:Machine {name: 'Boiler-B7', status: 'active', criticality: 'high'})",
        "MERGE (m2:Machine {name: 'Turbine-C2', status: 'active', criticality: 'critical'})",
        "MERGE (m3:Machine {name: 'Compressor-A1', status: 'active', criticality: 'medium'})",
        "",
        f"MATCH (u:User {{email: '{rajesh_email}'}})",
        "MATCH (m:Machine) WHERE m.name IN ['Boiler-B7', 'Turbine-C2', 'Compressor-A1']",
        "MERGE (u)-[:MANAGES {is_primary: true, since: date()}]->(m)",
        "",
        "// Create other users with SHARED responsibilities",
        "MERGE (u2:User {email: 'priya.patel@klens.com', name: 'Priya Patel', department: 'Safety'})",
        "MERGE (u3:User {email: 'amit.kumar@klens.com', name: 'Amit Kumar', department: 'Operations'})",
        "",
        "// These machines have multiple managers (not orphaned)",
        "MERGE (m4:Machine {name: 'Generator-G3', status: 'active', criticality: 'high'})",
        "MERGE (m5:Machine {name: 'Pump-P5', status: 'active', criticality: 'medium'})",
        "",
        "MATCH (u2:User {email: 'priya.patel@klens.com'})",
        "MATCH (u3:User {email: 'amit.kumar@klens.com'})",
        "MATCH (m4:Machine {name: 'Generator-G3'})",
        "MATCH (m5:Machine {name: 'Pump-P5'})",
        "MERGE (u2)-[:MANAGES]->(m4)",
        "MERGE (u3)-[:MANAGES]->(m4)",  # Shared!
        "MERGE (u2)-[:MANAGES]->(m5)",
        "MERGE (u3)-[:MANAGES]->(m5)",  # Shared!
    ]
    
    print("```cypher")
    for cmd in commands:
        print(cmd)
    print("```")
    
    print("\n💡 After running these, Rajesh will have 3 ORPHANED assets!")
    print("   When you 'Offboard' him, the system will show these as CRITICAL risks.\n")


def seed_demo_users():
    """Seed demo users into Supabase demo_users table."""
    print("👥 Seeding Demo Users...")
    
    demo_users = [
        {
            "email": "rajesh.sharma@klens.com",
            "name": "Rajesh Sharma",
            "department": "Maintenance",
            "role": "engineer",
            "is_at_risk": True,  # He manages orphaned assets!
            "managed_assets_count": 3
        },
        {
            "email": "priya.patel@klens.com",
            "name": "Priya Patel",
            "department": "Safety",
            "role": "safety_officer",
            "is_at_risk": False,
            "managed_assets_count": 2
        },
        {
            "email": "amit.kumar@klens.com",
            "name": "Amit Kumar",
            "department": "Operations",
            "role": "manager",
            "is_at_risk": False,
            "managed_assets_count": 2
        },
        {
            "email": "admin@example.com",
            "name": "System Admin",
            "department": "IT",
            "role": "admin",
            "is_at_risk": False,
            "managed_assets_count": 0
        },
    ]
    
    try:
        for user in demo_users:
            # Use upsert to avoid duplicates
            supabase.table("demo_users").upsert(user, on_conflict="email").execute()
        print(f"   ✅ Inserted/Updated {len(demo_users)} demo users")
    except Exception as e:
        print(f"   ❌ Error: {e}")


if __name__ == "__main__":
    print("=" * 60)
    print("🎭 K-LENS Silent Handover Demo Data Seeder")
    print("=" * 60)
    
    seed_demo_users()
    seed_resolution_memory()
    seed_activity_logs()
    print_neo4j_commands()
    
    print("=" * 60)
    print("✅ Supabase seeding complete!")
    print("⚠️  Don't forget to run the Neo4j commands above!")
    print("=" * 60)

