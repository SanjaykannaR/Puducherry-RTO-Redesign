"""RTO Chatbot - FastAPI entry point.

A multilingual AI assistant for Puducherry RTO portal users.
Provides Q&A about RTO services, processes, fees, documents,
and navigation assistance across English, Tamil, and French.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import FRONTEND_URL, HOST, PORT
from routes.chat import router as chat_router

app = FastAPI(
    title="Puducherry RTO Chatbot",
    description="Multilingual AI assistant for RTO services and navigation",
    version="1.0.0",
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ──
app.include_router(chat_router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "rto-chatbot"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT)
