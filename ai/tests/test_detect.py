"""Integration tests for the detect-face API endpoint.

Each test sends real HTTP requests via FastAPI's TestClient and verifies
status codes, error shapes, and response schemas.  No external server needed.
"""

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    """Return a TestClient instance scoped to this module."""
    return TestClient(app)


def test_health(client):
    """The /api/health endpoint should return HTTP 200 with status "ok"."""
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_detect_face_no_file(client):
    """POST without the required *file* form field → 422 validation error."""
    res = client.post("/api/detect-face")
    assert res.status_code == 422


def test_detect_face_invalid_image(client):
    """POST with un-decodable bytes → 400 "Invalid image"."""
    res = client.post("/api/detect-face", files={"file": ("test.jpg", b"not-an-image", "image/jpeg")})
    assert res.status_code == 400
    assert res.json()["detail"] == "Invalid image"


def test_detect_face_valid_image(client):
    """POST with a valid JPEG → 200 with the expected response keys.

    Since the test image is a uniform grey frame (no detectable face), we
    expect *confidence* to be 0.0 and *passed* to be False, but the schema
    must still contain all documented fields.
    """
    import numpy as np
    import cv2
    img = np.ones((480, 640, 3), dtype=np.uint8) * 200
    _, buf = cv2.imencode(".jpg", img)
    res = client.post("/api/detect-face", files={"file": ("frame.jpg", buf.tobytes(), "image/jpeg")})
    assert res.status_code == 200
    data = res.json()
    assert "face_detected" in data
    assert "confidence" in data
    assert "passed" in data
    assert "threshold" in data
    assert data["threshold"] == 0.60
