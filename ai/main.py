"""FastAPI application entry point for the RTO AI Proctoring Service."""

import os
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.detect import router as detect_router

app = FastAPI(
    title="RTO AI Proctoring Service",
    description="Face detection and proctoring for Puducherry RTO online exams",
    version="1.0.0",
)

# ── CORS ──
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [o.strip() for o in FRONTEND_URL.split(",") if o.strip()]
allowed_origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(detect_router)


@app.get("/api/health")
async def health():
    """Health-check endpoint used by load balancers / orchestrators.

    Returns a simple JSON payload so consumers can confirm the service is
    running and responding. The timestamp field aids debugging in logs.
    """
    return {"status": "ok", "service": "ai-proctoring", "timestamp": datetime.utcnow().isoformat() + "Z"}
