"""RTO Chatbot - FastAPI entry point.

A multilingual AI assistant for Puducherry RTO portal users.
"""

import sys
import traceback
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import FRONTEND_URL, HOST, PORT

app = FastAPI(
    title="Puducherry RTO Chatbot",
    description="Multilingual AI assistant for RTO services and navigation",
    version="1.0.0",
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ──
try:
    from routes.chat import router as chat_router
    app.include_router(chat_router)
except Exception as e:
    print(f"[chatbot] Failed to load routes: {e}")
    traceback.print_exc()


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "rto-chatbot"}


@app.get("/api/diag")
async def diagnostics():
    """Diagnostic endpoint — shows config and Gemini status."""
    from config import GOOGLE_API_KEY, GEMINI_MODEL
    result = {
        "python": sys.version,
        "host": HOST,
        "port": PORT,
        "frontend_url": FRONTEND_URL,
        "gemini_key_set": bool(GOOGLE_API_KEY),
        "gemini_key_len": len(GOOGLE_API_KEY) if GOOGLE_API_KEY else 0,
        "gemini_model": GEMINI_MODEL,
    }
    try:
        from services.llm import get_init_status
        result["llm"] = get_init_status()
    except Exception as e:
        result["llm"] = {"error": str(e)}
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT)
