"""MediaPipe face-detection wrapper for proctoring.

Provides two public functions that run the BlazeFace short-range model on a
given image frame.  The model is loaded once at import time (module-level
singleton) so repeated calls reuse the same detector instance for performance.
"""

import os
import cv2
import mediapipe as mp
import numpy as np

# ── MediaPipe type aliases (shorthand for cleaner code) ──

BaseOptions = mp.tasks.BaseOptions
FaceDetector = mp.tasks.vision.FaceDetector
FaceDetectorOptions = mp.tasks.vision.FaceDetectorOptions
RunningMode = mp.tasks.vision.RunningMode

# ── BlazeFace model path ──
# The model asset lives at <project_root>/models/blaze_face_short_range.tflite.
# Resolution: 128×128 input, output: bounding-box + 6 keypoints.

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "blaze_face_short_range.tflite")

# ── Module-level detector singleton ──
# Created on first import so the model is loaded into memory once per process.
# *min_detection_confidence* = 0.5 is the internal filter before our own 0.60
# threshold in the route layer.

options = FaceDetectorOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=RunningMode.IMAGE,
    min_detection_confidence=0.5,
)

detector = FaceDetector.create_from_options(options)


def _to_rgb(image: np.ndarray) -> mp.Image:
    """Convert an OpenCV BGR frame to a MediaPipe Image (SRGB).

    OpenCV loads images in BGR channel order; MediaPipe expects RGB, so we
    must convert before every detection call.
    """
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    return mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)


def detect_face(image: np.ndarray) -> dict:
    """Run BlazeFace on *image* and return detection results for the first face.

    Args:
        image: OpenCV BGR numpy array (H×W×3).

    Returns:
        dict with keys:
          - face_detected (bool) — whether at least one face was found
          - confidence (float)   — score of the top detection (0‑1, rounded to 4dp)
          - bbox (dict | None)   — {xmin, ymin, width, height} in pixels,
                                   or None when no face is detected
    """
    mp_image = _to_rgb(image)
    results = detector.detect(mp_image)

    if not results.detections:
        return {"face_detected": False, "confidence": 0.0, "bbox": None}

    # We only care about the highest-confidence face for the primary verdict.
    detection = results.detections[0]
    bbox = detection.bounding_box
    confidence = detection.categories[0].score

    return {
        "face_detected": True,
        "confidence": round(float(confidence), 4),
        "bbox": {
            "xmin": float(bbox.origin_x),
            "ymin": float(bbox.origin_y),
            "width": float(bbox.width),
            "height": float(bbox.height),
        },
    }


def multiple_faces_detected(image: np.ndarray) -> bool:
    """Check whether more than one face appears in *image*.

    Proctoring rules forbid multiple people in the frame (possible cheating).
    This is a separate call from *detect_face* because we re-run detection
    to check for >1 face rather than caching results.
    """
    mp_image = _to_rgb(image)
    results = detector.detect(mp_image)
    if results.detections:
        return len(results.detections) > 1
    return False
