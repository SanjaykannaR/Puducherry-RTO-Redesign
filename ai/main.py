from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.detect import router as detect_router

app = FastAPI(
    title="RTO AI Proctoring Service",
    description="Face detection and proctoring for Puducherry RTO online exams",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(detect_router)

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "ai-proctoring", "timestamp": "2026-07-07T00:00:00Z"}
