from sqlalchemy.orm import Session
from ..models.user import User
from .security import get_password_hash

def create_default_admin(db: Session):
    """Create default admin user if not exists"""
    admin_email = "admin@klens.local"
    
    # Check if admin already exists
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if existing_admin:
        print(f"✅ Admin user already exists: {admin_email}")
        return existing_admin
    
    # Create admin user
    hashed_password = get_password_hash("Admin@123")
    admin_user = User(
        email=admin_email,
        password_hash=hashed_password,
        name="System Administrator",
        role="admin",
        department="IT"
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    print(f"✅ Default admin created: {admin_email} / Admin@123")
    return admin_user
