from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pgvector.sqlalchemy import Vector
from .config import settings

# Lazy initialization - only connect when actually needed
_engine = None
_SessionLocal = None
Base = declarative_base()

def get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine(settings.DATABASE_URL)
    return _engine

def get_session_local():
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return _SessionLocal

# For backward compatibility
def SessionLocal():
    return get_session_local()()

def get_db():
    db = get_session_local()()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database with pgvector extension"""
    engine = get_engine()
    # Enable pgvector extension FIRST (before creating tables)
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()
    
    # Now create tables (which use the vector type)
    Base.metadata.create_all(bind=engine)

