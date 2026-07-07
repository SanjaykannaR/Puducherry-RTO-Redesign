"""FastAPI application entry point for the RTO AI Proctoring Service.

Initialises the FastAPI app, configures CORS for the frontend, mounts route
modules, and exposes a health-check endpoint used by deployment infrastructure
to verify the service is alive.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.detect import router as detect_router

# ── FastAPI application instance ──

app = FastAPI(
    title="RTO AI Proctoring Service",
    description="Face detection and proctoring for Puducherry RTO online exams",
    version="1.0.0",
)

# ── CORS middleware ──
# Only the Next.js frontend on localhost:3000 is allowed to call this API.
# In production these origins should be scoped to the deployed frontend URL.

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Route registration ──

app.include_router(detect_router)


@app.get("/api/health")
async def health():
    """Health-check endpoint used by load balancers / orchestrators.

    Returns a simple JSON payload so consumers can confirm the service is
    running and responding. The timestamp field aids debugging in logs.
    """
    return {"status": "ok", "service": "ai-proctoring", "timestamp": "2026-07-07T00:00:00Z"}
