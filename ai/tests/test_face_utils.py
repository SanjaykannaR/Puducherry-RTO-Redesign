"""Unit tests for face_utils — the MediaPipe wrapper layer.

These tests exercise *detect_face* and *multiple_faces_detected* directly
with synthetic images, without going through the HTTP layer.
"""

import numpy as np
import cv2

from services.face_utils import detect_face, multiple_faces_detected


def test_detect_face_no_face():
    """A uniform grey image (no facial features) should yield no detection.

    Verifies that *face_detected* is False, confidence is 0.0, and bbox is
    None — the canonical "no face" contract.
    """
    img = np.ones((480, 640, 3), dtype=np.uint8) * 200
    result = detect_face(img)
    assert result["face_detected"] is False
    assert result["confidence"] == 0.0
    assert result["bbox"] is None


def test_detect_face_returns_dict():
    """Even when no real face exists, the return value must be a dict with the
    expected keys so the route layer never hits a KeyError.

    Uses a white rectangle as a rough face-like blob.
    """
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.rectangle(img, (200, 100), (440, 380), (255, 255, 255), -1)
    result = detect_face(img)
    assert isinstance(result, dict)
    assert "face_detected" in result
    assert "confidence" in result
    assert "bbox" in result


def test_multiple_faces_no_face():
    """If the image contains no face, *multiple_faces_detected* returns False
    rather than raising or returning True.
    """
    img = np.ones((480, 640, 3), dtype=np.uint8) * 200
    assert multiple_faces_detected(img) is False
