"""REST endpoint for face-detection proctoring checks.

The frontend sends a camera snapshot; this endpoint decodes the image, runs
MediaPipe face detection, and returns a boolean verdict plus confidence scores.
"""

import base64
import cv2
import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File

from services.face_utils import detect_face, multiple_faces_detected

router = APIRouter(prefix="/api", tags=["proctoring"])

# ── Confidence threshold ──
# A detection must score >= 0.60 to be considered reliable. This is the same
# threshold used in the MediaPipe model's own default; raising it reduces
# false positives at the cost of more false negatives.

DETECTION_THRESHOLD = 0.60


@router.post("/detect-face")
async def detect_face_endpoint(file: UploadFile = File(...)):
    """Accept an uploaded JPEG/PNG frame and return a proctoring verdict.

    Business logic (*passed* = True):
      1. A face must be detected in the frame.
      2. The detection confidence must be >= *DETECTION_THRESHOLD* (0.60).
      3. Only **one** face may be present (multiple faces → cheating).
    """
    # ── Decode raw bytes into an OpenCV BGR image ──
    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image")

    # ── Run detection pipeline ──
    result = detect_face(image)
    multiple = multiple_faces_detected(image)

    # ── Combine checks into a single pass/fail verdict ──
    passed = (
        result["face_detected"]
        and result["confidence"] >= DETECTION_THRESHOLD
        and not multiple
    )

    return {
        "passed": passed,
        "face_detected": result["face_detected"],
        "confidence": result["confidence"],
        "multiple_faces": multiple,
        "threshold": DETECTION_THRESHOLD,
    }
