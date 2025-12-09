from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://klens_user:klens_secure_password_2024@postgres:5432/klens"
    
    # Redis
    REDIS_URL: str = "redis://redis:6379"
    
    # Neo4j
    NEO4J_URI: str = "bolt://neo4j:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "klens_neo4j_2024"
    
    # JWT
    JWT_SECRET: str = "klens_jwt_secret_key_change_in_production_min_32_chars"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRES_MINUTES: int = 30
    
    # Gemini AI
    GEMINI_API_KEY: str
    
    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_BUCKET: str = "raw_files"
    
    # Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 52428800  # 50MB
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost", "http://localhost:80", "http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"

settings = Settings()
