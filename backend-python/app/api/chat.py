from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import google.generativeai as genai

from ..core.config import settings
from ..models.user import User
from ..api.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    conversationHistory: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    message: str
    timestamp: str


SYSTEM_INSTRUCTION = """You are K-LENS AI Assistant - an intelligent platform for industrial document management, IoT monitoring, and compliance tracking in railway and industrial environments.

## K-LENS FEATURES

### 1. Authentication & Security
- **Role-Based Access Control** (Admin, Manager, Engineer, Safety Officer)
- **Cinderella Access**: Time-bound emergency privileges that auto-expire
- **Nuclear Keys**: Multi-signature approval system for critical actions
- JWT authentication with bcrypt password hashing
- Complete audit trail with version control

### 2. Document Management
- Multi-format support: PDF, DOCX, Excel, Images
- OCR text extraction using Tesseract
- AI-powered document analysis
- Role-specific views for different user types
- Document versioning with instant revert

### 3. AI-Powered Analysis
- Document summarization based on user role
- Risk detection and assessment
- Compliance checking against regulations
- Multilingual support

### 4. Knowledge Graph
- Interactive visualization of Documents, Risks, and People
- Semantic search capabilities
- Risk propagation visualization

### 5. Compliance & Audit
- Tamper-proof audit logging
- Version control for all documents
- Forensic trail for incident investigation

## RESPONSE FORMATTING GUIDELINES

Use proper Markdown formatting to create structured, professional responses:

- **Use ## for main headings** and ### for subheadings
- **Bold important terms** using double asterisks
- Use bullet points (-) for lists
- Use numbered lists (1. 2. 3.) for sequential steps
- Use > blockquotes for warnings or important notes
- Add horizontal rules (---) between major sections
- Keep responses well-organized and scannable
- Be concise but thorough"""


@router.post("/", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """Send a message to K-LENS AI Assistant."""
    if not request.message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    try:
        model = genai.GenerativeModel(
            model_name="gemini-flash-latest",
            system_instruction=SYSTEM_INSTRUCTION
        )
        
        # Build conversation history
        history = []
        for msg in request.conversationHistory or []:
            history.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [msg.content]
            })
        
        chat = model.start_chat(history=history)
        response = chat.send_message(request.message)
        
        return ChatResponse(
            message=response.text,
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process message: {str(e)}")
