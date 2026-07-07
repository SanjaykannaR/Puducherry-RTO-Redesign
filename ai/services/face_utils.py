import os
import cv2
import mediapipe as mp
import numpy as np

BaseOptions = mp.tasks.BaseOptions
FaceDetector = mp.tasks.vision.FaceDetector
FaceDetectorOptions = mp.tasks.vision.FaceDetectorOptions
RunningMode = mp.tasks.vision.RunningMode

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "blaze_face_short_range.tflite")

options = FaceDetectorOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=RunningMode.IMAGE,
    min_detection_confidence=0.5,
)

detector = FaceDetector.create_from_options(options)


def _to_rgb(image: np.ndarray) -> mp.Image:
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    return mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)


def detect_face(image: np.ndarray) -> dict:
    mp_image = _to_rgb(image)
    results = detector.detect(mp_image)

    if not results.detections:
        return {"face_detected": False, "confidence": 0.0, "bbox": None}

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
    mp_image = _to_rgb(image)
    results = detector.detect(mp_image)
    if results.detections:
        return len(results.detections) > 1
    return False
