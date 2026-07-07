import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_detect_face_no_file(client):
    res = client.post("/api/detect-face")
    assert res.status_code == 422


def test_detect_face_invalid_image(client):
    res = client.post("/api/detect-face", files={"file": ("test.jpg", b"not-an-image", "image/jpeg")})
    assert res.status_code == 400
    assert res.json()["detail"] == "Invalid image"


def test_detect_face_valid_image(client):
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
