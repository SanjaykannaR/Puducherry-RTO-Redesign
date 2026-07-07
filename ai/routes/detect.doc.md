# Face Detection Route

**File:** `routes/detect.py`

## Purpose
Proctoring endpoint that receives browser camera frames and returns face detection analysis.

## Endpoint
- `POST /api/detect-face` - Accepts image upload, returns face detection result

## Key Decisions
- Threshold 0.60 for detection confidence (PDF1 requirement)
- Reports multiple faces (cheating prevention)
- Returns structured response for frontend violation state machine

## Violation Rules
- Tab switch / fullscreen exit: +3 immediate violation points
- 3 consecutive face mismatches or no-face: +2 violation points
- Termination at ≥5 violation points (frontend enforces)

## Related Files
- `main.py` - Mounts router
- `services/face_utils.py` - Detection logic
