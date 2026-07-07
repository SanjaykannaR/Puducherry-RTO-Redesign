# AI Proctoring Service Entry Point

**File:** `main.py`

## Purpose
FastAPI application entry point for the AI-powered exam proctoring service. Handles face detection requests from the frontend exam portal.

## Endpoints
- `GET /api/health` - Health check
- `POST /api/detect-face` - Face detection and proctoring analysis

## Key Decisions
- CORS restricted to frontend origin only
- Separate service from backend (independent scaling, Python ecosystem for CV)
- Port 8000 to avoid conflicts with frontend (3000) and backend (5000)

## Dependencies
- FastAPI, uvicorn, opencv-python, mediapipe, numpy

## Related Files
- `routes/detect.py` - Face detection endpoint
- `services/face_utils.py` - Face detection utilities
