import numpy as np
import cv2

from services.face_utils import detect_face, multiple_faces_detected


def test_detect_face_no_face():
    img = np.ones((480, 640, 3), dtype=np.uint8) * 200
    result = detect_face(img)
    assert result["face_detected"] is False
    assert result["confidence"] == 0.0
    assert result["bbox"] is None


def test_detect_face_returns_dict():
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.rectangle(img, (200, 100), (440, 380), (255, 255, 255), -1)
    result = detect_face(img)
    assert isinstance(result, dict)
    assert "face_detected" in result
    assert "confidence" in result
    assert "bbox" in result


def test_multiple_faces_no_face():
    img = np.ones((480, 640, 3), dtype=np.uint8) * 200
    assert multiple_faces_detected(img) is False
