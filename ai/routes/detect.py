import base64
import cv2
import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File

from services.face_utils import detect_face, multiple_faces_detected

router = APIRouter(prefix="/api", tags=["proctoring"])

DETECTION_THRESHOLD = 0.60


@router.post("/detect-face")
async def detect_face_endpoint(file: UploadFile = File(...)):
    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image")

    result = detect_face(image)
    multiple = multiple_faces_detected(image)

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
