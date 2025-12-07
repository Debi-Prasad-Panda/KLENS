from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import init_db, engine, Base

# Import all models to ensure they are registered with SQLAlchemy
from .models import user, document as doc_model
from .models.audit_log import AuditLog
from .models.approval import Approval
from .models.document_version import DocumentVersion

# Import routers
from .api import auth, documents, approvals, chat

# Create tables
Base.metadata.create_all(bind=engine)

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


@app.on_event("startup")
async def startup():
    init_db()
    print("✅ K-LENS FastAPI Backend Started")
    print(f"📊 Database: {settings.DATABASE_URL}")
    print(f"🤖 Gemini AI: {'Configured' if settings.GEMINI_API_KEY else 'Missing API Key'}")
    print("\n👤 Create admin via: http://localhost:8000/docs -> POST /api/auth/register")


@app.get("/")
def root():
    return {"message": "K-LENS FastAPI Backend", "version": "2.0.0", "status": "running"}


@app.get("/health")
def health():
    return {"status": "healthy", "database": "connected", "ai": "ready"}
