import cv2
import mediapipe as mp
import numpy as np

mp_face_detection = mp.solutions.face_detection
mp_face_mesh = mp.solutions.face_mesh

face_detection = mp_face_detection.FaceDetection(
    model_selection=1, min_detection_confidence=0.5
)
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    min_detection_confidence=0.5,
)


def detect_face(image: np.ndarray) -> dict:
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = face_detection.process(rgb)

    if not results.detections:
        return {"face_detected": False, "confidence": 0.0, "bbox": None}

    detection = results.detections[0]
    bbox = detection.location_data.relative_bounding_box
    confidence = detection.score[0]

    return {
        "face_detected": True,
        "confidence": round(float(confidence), 4),
        "bbox": {
            "xmin": float(bbox.xmin),
            "ymin": float(bbox.ymin),
            "width": float(bbox.width),
            "height": float(bbox.height),
        },
    }


def multiple_faces_detected(image: np.ndarray) -> bool:
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = face_detection.process(rgb)
    if results.detections:
        return len(results.detections) > 1
    return False
