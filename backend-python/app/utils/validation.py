"""
Input Validation and Sanitization Utilities for K-LENS API

OWASP Best Practices:
- Input validation to prevent injection attacks (SQL, NoSQL, Command, XSS)
- Strict type checking and length limits
- Field whitelisting (reject unexpected fields)
- Sanitization of user-provided text
- Email and password strength validation
"""

from pydantic import BaseModel, Field, validator, field_validator
from typing import Optional, List, Dict, Any
import re
import html
from email_validator import validate_email, EmailNotValidError


# ==================== CONSTANTS ====================

# Maximum lengths for various fields (prevents DoS via large inputs)
MAX_EMAIL_LENGTH = 254  # RFC 5321
MAX_NAME_LENGTH = 100
MAX_PASSWORD_LENGTH = 128
MAX_TEXT_LENGTH = 5000  # Generic text fields
MAX_MESSAGE_LENGTH = 10000  # Chat messages
MAX_FILENAME_LENGTH = 255
MAX_DEPARTMENT_LENGTH = 100
MAX_ROLE_LENGTH = 50

# Regex patterns for validation
ALPHANUMERIC_PATTERN = re.compile(r'^[a-zA-Z0-9_-]+$')
SAFE_TEXT_PATTERN = re.compile(r'^[a-zA-Z0-9\s.,!?\'"-]+$')
PIN_PATTERN = re.compile(r'^\d{4,6}$')  # 4-6 digit PIN

# Dangerous patterns to block (basic XSS prevention)
XSS_PATTERNS = [
    re.compile(r'<script', re.IGNORECASE),
    re.compile(r'javascript:', re.IGNORECASE),
    re.compile(r'on\w+\s*=', re.IGNORECASE),  # event handlers
    re.compile(r'<iframe', re.IGNORECASE),
]


# ==================== VALIDATION UTILITIES ====================

def sanitize_text(text: str, max_length: Optional[int] = None) -> str:
    """
    Sanitize user-provided text to prevent XSS attacks.
    
    Args:
        text: Input text to sanitize
        max_length: Optional maximum length
    
    Returns:
        Sanitized text
    """
    if not text:
        return text
    
    # HTML escape to prevent XSS
    sanitized = html.escape(text.strip())
    
    # Enforce length limit
    if max_length and len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized


def validate_no_xss(text: str) -> str:
    """
    Validate that text doesn't contain XSS patterns.
    Raises ValueError if XSS detected.
    """
    if not text:
        return text
    
    for pattern in XSS_PATTERNS:
        if pattern.search(text):
            raise ValueError("Input contains potentially malicious content")
    
    return text


def validate_email_address(email: str) -> str:
    """
    Validate email address format and deliverability.
    Raises ValueError if invalid.
    """
    if not email or len(email) > MAX_EMAIL_LENGTH:
        raise ValueError("Email address is invalid or too long")
    
    try:
        # Validate email using email-validator library
        validation = validate_email(email, check_deliverability=False)
        return validation.normalized
    except EmailNotValidError as e:
        raise ValueError(f"Invalid email address: {str(e)}")


def validate_password_strength(password: str) -> str:
    """
    Validate password meets minimum security requirements.
    
    Requirements:
    - Minimum 8 characters
    - Maximum 128 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    
    Raises ValueError if password doesn't meet requirements.
    """
    if not password:
        raise ValueError("Password is required")
    
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    
    if len(password) > MAX_PASSWORD_LENGTH:
        raise ValueError(f"Password must be less than {MAX_PASSWORD_LENGTH} characters")
    
    if not re.search(r'[A-Z]', password):
        raise ValueError("Password must contain at least one uppercase letter")
    
    if not re.search(r'[a-z]', password):
        raise ValueError("Password must contain at least one lowercase letter")
    
    if not re.search(r'\d', password):
        raise ValueError("Password must contain at least one digit")
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        raise ValueError("Password must contain at least one special character")
    
    return password


def validate_filename(filename: str) -> str:
    """
    Validate filename to prevent path traversal and other attacks.
    
    Raises ValueError if filename is invalid.
    """
    if not filename:
        raise ValueError("Filename is required")
    
    if len(filename) > MAX_FILENAME_LENGTH:
        raise ValueError(f"Filename must be less than {MAX_FILENAME_LENGTH} characters")
    
    # Check for path traversal attempts
    if '..' in filename or '/' in filename or '\\' in filename:
        raise ValueError("Filename contains invalid characters")
    
    # Validate file extension (basic check)
    allowed_extensions = ['.pdf', '.docx', '.xlsx', '.txt', '.png', '.jpg', '.jpeg']
    if not any(filename.lower().endswith(ext) for ext in allowed_extensions):
        raise ValueError(f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}")
    
    return filename


def validate_json_object(obj: Any, max_depth: int = 5, current_depth: int = 0) -> Any:
    """
    Validate JSON object to prevent deeply nested structures (DoS attack).
    
    Raises ValueError if structure is too deep or too large.
    """
    if current_depth > max_depth:
        raise ValueError("JSON structure is too deeply nested")
    
    if isinstance(obj, dict):
        if len(obj) > 100:  # Maximum 100 keys at any level
            raise ValueError("JSON object has too many keys")
        
        return {
            k: validate_json_object(v, max_depth, current_depth + 1)
            for k, v in obj.items()
        }
    
    elif isinstance(obj, list):
        if len(obj) > 1000:  # Maximum 1000 items in array
            raise ValueError("JSON array is too large")
        
        return [validate_json_object(item, max_depth, current_depth + 1) for item in obj]
    
    else:
        return obj


# ==================== ENHANCED PYDANTIC MODELS ====================

class StrictBaseModel(BaseModel):
    """
    Base model with strict validation settings.
    Rejects extra fields to prevent unexpected data.
    """
    class Config:
        # Reject extra fields (OWASP: Input validation)
        extra = "forbid"
        # Strict types (no coercion)
        str_strip_whitespace = True
        # Validate assignment
        validate_assignment = True


class ValidatedEmail(StrictBaseModel):
    """Email validation model"""
    email: str = Field(
        ...,
        min_length=3,
        max_length=MAX_EMAIL_LENGTH,
        description="Email address"
    )
    
    @field_validator('email')
    @classmethod
    def validate_email_field(cls, v: str) -> str:
        return validate_email_address(v)


class ValidatedPassword(StrictBaseModel):
    """Password validation model"""
    password: str = Field(
        ...,
        min_length=8,
        max_length=MAX_PASSWORD_LENGTH,
        description="Password"
    )
    
    @field_validator('password')
    @classmethod
    def validate_password_field(cls, v: str) -> str:
        return validate_password_strength(v)


class ValidatedText(StrictBaseModel):
    """Generic text validation model"""
    text: str = Field(
        ...,
        min_length=1,
        max_length=MAX_TEXT_LENGTH,
        description="Text content"
    )
    
    @field_validator('text')
    @classmethod
    def validate_text_field(cls, v: str) -> str:
        validate_no_xss(v)
        return sanitize_text(v, MAX_TEXT_LENGTH)


class ValidatedSearchQuery(StrictBaseModel):
    """Search query validation"""
    query: str = Field(
        ...,
        min_length=2,
        max_length=500,
        description="Search query"
    )
    limit: int = Field(
        10,
        ge=1,  # Greater than or equal to 1
        le=100,  # Less than or equal to 100
        description="Result limit"
    )
    
    @field_validator('query')
    @classmethod
    def validate_query_field(cls, v: str) -> str:
        validate_no_xss(v)
        return sanitize_text(v, 500)


class ValidatedChatMessage(StrictBaseModel):
    """Chat message validation"""
    message: str = Field(
        ...,
        min_length=1,
        max_length=MAX_MESSAGE_LENGTH,
        description="Chat message"
    )
    
    @field_validator('message')
    @classmethod
    def validate_message_field(cls, v: str) -> str:
        validate_no_xss(v)
        return sanitize_text(v, MAX_MESSAGE_LENGTH)


class ValidatedFilename(StrictBaseModel):
    """Filename validation"""
    filename: str = Field(
        ...,
        min_length=1,
        max_length=MAX_FILENAME_LENGTH,
        description="File name"
    )
    
    @field_validator('filename')
    @classmethod
    def validate_filename_field(cls, v: str) -> str:
        return validate_filename(v)


class ValidatedName(StrictBaseModel):
    """Name validation (user names, department names, etc.)"""
    name: str = Field(
        ...,
        min_length=1,
        max_length=MAX_NAME_LENGTH,
        description="Name"
    )
    
    @field_validator('name')
    @classmethod
    def validate_name_field(cls, v: str) -> str:
        validate_no_xss(v)
        return sanitize_text(v, MAX_NAME_LENGTH)


class ValidatedPIN(StrictBaseModel):
    """PIN validation (4-6 digits)"""
    pin: str = Field(
        ...,
        min_length=4,
        max_length=6,
        description="PIN code"
    )
    
    @field_validator('pin')
    @classmethod
    def validate_pin_field(cls, v: str) -> str:
        if not PIN_PATTERN.match(v):
            raise ValueError("PIN must be 4-6 digits")
        return v


# ==================== COMMON VALIDATION SCHEMAS ====================

def validate_user_role(role: str) -> str:
    """Validate user role against allowed values"""
    allowed_roles = [
        "ADMIN",
        "MANAGER", 
        "ENGINEER",
        "OPERATOR",
        "SAFETY_OFFICER",
        "VIEWER"
    ]
    
    role_upper = role.upper()
    if role_upper not in allowed_roles:
        raise ValueError(f"Invalid role. Allowed roles: {', '.join(allowed_roles)}")
    
    return role_upper


def validate_shift_status(status: str) -> str:
    """Validate shift status against allowed values"""
    allowed_statuses = [
        "ON_SHIFT",
        "OFF_SHIFT",
        "ON_BREAK",
        "EMERGENCY"
    ]
    
    status_upper = status.upper()
    if status_upper not in allowed_statuses:
        raise ValueError(f"Invalid status. Allowed statuses: {', '.join(allowed_statuses)}")
    
    return status_upper


def validate_document_status(status: str) -> str:
    """Validate document status against allowed values"""
    allowed_statuses = [
        "pending",
        "processing",
        "completed",
        "failed"
    ]
    
    status_lower = status.lower()
    if status_lower not in allowed_statuses:
        raise ValueError(f"Invalid status. Allowed statuses: {', '.join(allowed_statuses)}")
    
    return status_lower
