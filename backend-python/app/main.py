from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from .core.config import settings
from .core.database import init_db, SessionLocal
from .core.security import get_password_hash
from .models.user import User, UserRole
from .models.user_profile import UserProfile, ShiftStatus

# Import all models to ensure they are registered with SQLAlchemy
from .models import user, document as doc_model
from .models.audit_log import AuditLog
from .models.approval import Approval
from .models.document_version import DocumentVersion

# Import middleware
from .middleware.rate_limit import RateLimitMiddleware

from .api import auth, documents, approvals, chat, websocket, search, upload, handover, notifications
from .api import supabase_auth  # New Supabase Auth router
from .api import user_management  # User Management (Admin) router
from .api import profile  # Digital Identity Hub
from .api import roles  # Role Management API
from .api import audit  # Audit Trail API
from .api import graph  # Knowledge Graph API

app = FastAPI(title="K-LENS API", version="2.0.0")

# SECURITY: Rate Limiting (must be added before routes)
# Protects against brute force, DoS, and API abuse
app.add_middleware(RateLimitMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# NEW: Supabase Auth (primary) - handles /api/auth/* endpoints
app.include_router(supabase_auth.router, prefix="/api")

# User Management (Admin Panel)
app.include_router(user_management.router, prefix="/api")

# Legacy routers (still available for local-only deployments)
# Note: Legacy auth is at /api/auth-legacy to avoid conflicts
app.include_router(auth.router, prefix="/api/auth-legacy", tags=["auth-legacy"])
app.include_router(documents.router, prefix="/api")
app.include_router(approvals.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(websocket.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(handover.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(profile.router, prefix="/api")  # Digital Identity Hub
app.include_router(roles.router, prefix="/api")  # Role Management API
app.include_router(audit.router, prefix="/api")  # Audit Trail API
app.include_router(graph.router, prefix="/api")  # Knowledge Graph API


def create_initial_data():
    """Create default data if not exists"""
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin:
            print("👤 Creating default admin user...")
            admin_user = User(
                email="admin@example.com",
                password_hash=get_password_hash("Admin@123"),
                name="System Admin",
                role=UserRole.admin,
                department="IT"
            )
            db.add(admin_user)
            db.commit()
            print("✅ Default admin created: admin@example.com / Admin@123")
        else:
            print("✅ Admin user already exists")
        
        # Create mock UserProfile for testing Digital Identity Hub
        create_mock_profiles(db)
        
    except Exception as e:
        print(f"⚠️ Failed to create initial data: {e}")
    finally:
        db.close()


def create_mock_profiles(db: Session):
    """Create mock UserProfile data for testing the Digital Identity Hub"""
    try:
        # Check if mock profile already exists
        existing = db.query(UserProfile).filter(UserProfile.employee_id == "EMP-8821").first()
        if existing:
            print("✅ Mock UserProfile already exists")
            return
        
        print("🪪 Creating mock UserProfile for Digital Identity Hub...")
        
        # Mock profile for testing - simulating an industrial worker
        mock_profile = UserProfile(
            user_id="mock-admin-user-id",  # Will be updated when real user logs in
            employee_id="EMP-8821",
            clearance_level=4,  # LEVEL 4: RESTRICTED ACCESS
            
            # Health & Safety
            emergency_contact_name="Jane Doe (Wife)",
            emergency_contact_phone="555-0199",
            blood_type="O+",
            medical_tags=["Diabetic"],
            safety_score=98,
            
            # Shift Context - Currently on shift
            shift_status=ShiftStatus.ON_SHIFT.value,
            current_shift_start=datetime.utcnow() - timedelta(hours=5, minutes=30),
            current_shift_end=datetime.utcnow() + timedelta(hours=2, minutes=30),
            current_location="Zone B - Boiler Room",
            
            # AI Persona / Skills
            expertise_tags=["Python", "SCADA Systems", "Technical Writing", "Industrial Safety"],
            voice_settings={"speed": 1.2, "auto_listen": False, "wake_word": "Hey K-LENS"}
        )
        db.add(mock_profile)
        db.commit()
        print("✅ Mock UserProfile created: EMP-8821 (Clearance Level 4)")
        print("   📍 Location: Zone B - Boiler Room")
        print("   🟢 Status: ON SHIFT (2h 30m remaining)")
        print("   🛡️ Safety Score: 98/100")
        
    except Exception as e:
        print(f"⚠️ Failed to create mock profile: {e}")
        db.rollback()


@app.on_event("startup")
async def startup():
    # Try to initialize local database (optional - for legacy endpoints)
    try:
        init_db()
        create_initial_data()
        print("✅ Local Database: Connected")
    except Exception as e:
        print(f"⚠️ Local Database: Not available ({type(e).__name__})")
        print("   → Supabase endpoints will still work!")
    
    print("✅ K-LENS FastAPI Backend Started")
    print(f"🤖 Gemini AI: {'Configured' if settings.GEMINI_API_KEY else 'Missing API Key'}")
    print(f"☁️ Supabase: {'Configured' if settings.SUPABASE_URL else 'Not Configured'}")


@app.get("/")
def root():
    return {"message": "K-LENS FastAPI Backend", "version": "2.0.0", "status": "running"}


@app.get("/health")
def health():
    return {"status": "healthy", "database": "connected", "ai": "ready"}
