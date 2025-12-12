from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import google.generativeai as genai

from ..core.config import settings
# Use new Supabase Auth dependency
from ..dependencies.auth import get_current_user, IndustrialUser
from ..services.gemini_service import gemini_service
from ..services.supabase_service import supabase_service

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
    sources: Optional[List[dict]] = None  # RAG sources


SYSTEM_INSTRUCTION = """You are K-LENS AI Assistant - an intelligent platform for industrial document management, IoT monitoring, and compliance tracking in railway and industrial environments.

## YOUR CAPABILITIES

You have access to a **Knowledge Hub** containing industrial documents, manuals, and memos. When the user asks questions, you will be provided with relevant context from these documents to help answer accurately.

### When Context is Provided:
- Use the retrieved document content to answer questions accurately
- Always cite which document the information came from
- If the context doesn't fully answer the question, say so and provide what you can

### When No Context is Available:
- Answer based on your general knowledge about K-LENS features
- Suggest the user upload relevant documents to the Knowledge Hub

## K-LENS FEATURES

### 1. Authentication & Security
- **Role-Based Access Control** (Admin, Manager, Engineer, Safety Officer)
- **Cinderella Access**: Time-bound emergency privileges that auto-expire
- **Nuclear Keys**: Multi-signature approval system for critical actions

### 2. Document Management
- Multi-format support: PDF, DOCX, Excel, Images
- OCR text extraction
- AI-powered document analysis
- Document versioning with instant revert

### 3. Knowledge Hub (Supabase)
- Semantic search using vector embeddings
- Hybrid search (AI + keyword matching)
- Automatic document chunking and indexing

## RESPONSE FORMATTING

Use proper Markdown formatting:
- **Bold important terms**
- Use bullet points for lists
- Use > blockquotes for document citations
- Keep responses well-organized and scannable"""


def retrieve_context(query: str, limit: int = 3) -> List[dict]:
    """
    Retrieve relevant documents from knowledge_hub for RAG.
    """
    try:
        # Generate embedding for the query
        query_embedding = gemini_service.generate_embedding(query)
        
        # Search knowledge hub
        results = supabase_service.hybrid_search(
            query_text=query,
            query_embedding=query_embedding,
            limit=limit
        )
        
        return results
    except Exception as e:
        print(f"RAG retrieval error: {e}")
        return []


def format_context_for_prompt(results: List[dict]) -> str:
    """
    Format retrieved documents into context for the AI prompt.
    """
    if not results:
        return ""
    
    context_parts = ["## Retrieved Context from Knowledge Hub:\n"]
    
    for i, result in enumerate(results, 1):
        context_parts.append(f"### Document {i}: {result.get('file_name', 'Unknown')}")
        context_parts.append(f"**Match Type:** {result.get('match_type', 'unknown')}")
        context_parts.append(f"**Content:**\n> {result.get('content_chunk', '')[:800]}")
        context_parts.append("")
    
    return "\n".join(context_parts)


@router.post("/", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    current_user: IndustrialUser = Depends(get_current_user)
):
    """
    Send a message to K-LENS AI Assistant with RAG (Retrieval-Augmented Generation).
    
    The assistant will:
    1. Search the Knowledge Hub for relevant documents
    2. Include that context in the AI prompt
    3. Generate an informed response citing sources
    """
    if not request.message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    try:
        # Step 1: Retrieve relevant context from Knowledge Hub (RAG)
        print(f"[RAG] Searching for context: '{request.message[:50]}...'")
        rag_results = retrieve_context(request.message, limit=3)
        context_text = format_context_for_prompt(rag_results)
        
        if rag_results:
            print(f"[RAG] Found {len(rag_results)} relevant documents")
        else:
            print("[RAG] No relevant documents found")
        
        # Step 2: Build enhanced prompt with context
        enhanced_message = request.message
        if context_text:
            enhanced_message = f"{context_text}\n\n---\n\n**User Question:** {request.message}"
        
        # Step 3: Generate response with OpenRouter (Mistral Devstral)
        import requests as http_requests
        
        # Build conversation history for OpenRouter format
        messages = [{"role": "system", "content": SYSTEM_INSTRUCTION}]
        for msg in request.conversationHistory or []:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        messages.append({"role": "user", "content": enhanced_message})
        
        openrouter_response = http_requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://klens.local",
                "X-Title": "K-LENS Industrial Platform",
            },
            json={
                "model": "mistralai/devstral-2512:free",
                "messages": messages,
                "max_tokens": 2000,
            },
            timeout=60
        )
        
        if openrouter_response.status_code != 200:
            print(f"OpenRouter Error: {openrouter_response.text}")
            raise HTTPException(status_code=500, detail="AI service unavailable")
        
        ai_response = openrouter_response.json()["choices"][0]["message"]["content"]
        
        # Format sources for response
        sources = [
            {
                "file_name": r.get("file_name"),
                "s3_url": r.get("s3_url"),
                "match_type": r.get("match_type")
            }
            for r in rag_results
        ] if rag_results else None
        
        return ChatResponse(
            message=ai_response,
            timestamp=datetime.utcnow().isoformat(),
            sources=sources
        )
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process message: {str(e)}")

