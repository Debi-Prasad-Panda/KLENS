from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .core.config import settings
from .core.database import init_db, SessionLocal
from .core.security import get_password_hash
from .models.user import User, UserRole

# Import all models to ensure they are registered with SQLAlchemy
from .models import user, document as doc_model
from .models.audit_log import AuditLog
from .models.approval import Approval
from .models.document_version import DocumentVersion

# Import routers
from .api import auth, documents, approvals, chat, websocket, search, upload

app = FastAPI(title="K-LENS API", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(approvals.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(websocket.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(upload.router, prefix="/api")


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
    except Exception as e:
        print(f"⚠️ Failed to create initial data: {e}")
    finally:
        db.close()


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
