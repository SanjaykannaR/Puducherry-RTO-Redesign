"""Chat API endpoint."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from services.language import detect_language, get_lang_name
from services.llm import generate_response
from services.knowledge import get_navigation_intent

router = APIRouter(prefix="/api", tags=["chat"])


class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="User message")
    language: Optional[str] = Field(None, description="Preferred language (en/ta/fr), auto-detected if not provided")
    history: Optional[list[dict]] = Field(default_factory=list, description="Chat history for context")


class ChatResponse(BaseModel):
    response: str
    language: str
    navigation: Optional[dict] = None
    login_suggested: bool = False


@router.post("/chat", response_model=ChatResponse)
async def chat(msg: ChatMessage):
    """Process a chat message and return AI response.

    - Auto-detects language from user message if not specified
    - Searches RTO knowledge base for relevant context
    - Generates response using Google Gemini
    - Detects navigation intent (e.g., "take me to services")
    """
    if not msg.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Detect or use specified language
    lang = msg.language if msg.language in ("en", "ta", "fr") else detect_language(msg.message)

    # Generate response
    result = generate_response(
        user_message=msg.message,
        lang=lang,
        chat_history=msg.history,
    )

    return ChatResponse(
        response=result["response"],
        language=lang,
        navigation=result.get("navigation"),
        login_suggested=result.get("login_suggested", False),
    )


@router.get("/chat/health")
async def chat_health():
    return {"status": "ok", "service": "chat-api"}
