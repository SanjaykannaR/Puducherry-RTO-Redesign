import pytest
from fastapi.testclient import TestClient
import numpy as np
import cv2

from main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def sample_image():
    img = np.ones((480, 640, 3), dtype=np.uint8) * 200
    _, buf = cv2.imencode('.jpg', img)
    return buf.tobytes()


@pytest.fixture
def face_image():
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.rectangle(img, (200, 100), (440, 380), (255, 255, 255), -1)
    _, buf = cv2.imencode('.jpg', img)
    return buf.tobytes()
