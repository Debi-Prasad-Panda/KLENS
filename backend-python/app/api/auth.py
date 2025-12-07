from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
import json
import redis

from ..core.database import get_db
from ..core.security import verify_password, get_password_hash, create_access_token, decode_token
from ..core.config import settings
from ..models.user import User, UserRole

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Redis client for Cinderella Access
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole
    department: str = None

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    department: str = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        name=user_data.name,
        role=user_data.role,
        department=user_data.department
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create token
    token = create_access_token({"sub": user.email, "role": user.role.value})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role.value,
            department=user.department
        )
    }

@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user.email, "role": user.role.value})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role.value,
            department=user.department
        )
    }

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user


# Cinderella Access Models
class CinderellaGrantRequest(BaseModel):
    userId: int
    durationMinutes: int = 60


class CinderellaResponse(BaseModel):
    hasAccess: bool
    grantedBy: Optional[int] = None
    expiresAt: Optional[str] = None
    permissions: Optional[List[str]] = None


@router.post("/cinderella", response_model=dict)
def grant_cinderella_access(
    request: CinderellaGrantRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Grant time-bound Cinderella access to a user (admin only)."""
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can grant Cinderella access")
    
    expires_at = datetime.utcnow() + timedelta(minutes=request.durationMinutes)
    
    access_data = {
        "grantedBy": current_user.id,
        "expiresAt": expires_at.isoformat(),
        "permissions": ["delete", "approve", "override"]
    }
    
    # Store in Redis with expiration
    redis_client.setex(
        f"cinderella:{request.userId}",
        request.durationMinutes * 60,  # TTL in seconds
        json.dumps(access_data)
    )
    
    return {"userId": request.userId, "expiresAt": expires_at.isoformat()}


@router.get("/cinderella", response_model=CinderellaResponse)
def check_cinderella_access(current_user: User = Depends(get_current_user)):
    """Check if current user has Cinderella access."""
    access_data = redis_client.get(f"cinderella:{current_user.id}")
    
    if not access_data:
        return CinderellaResponse(hasAccess=False)
    
    data = json.loads(access_data)
    return CinderellaResponse(
        hasAccess=True,
        grantedBy=data.get("grantedBy"),
        expiresAt=data.get("expiresAt"),
        permissions=data.get("permissions")
    )
