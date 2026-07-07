"""Shared pytest fixtures for the AI proctoring test suite.

Reusable fixtures are defined here so unit and integration tests can focus on
assertions rather than test infrastructure setup.
"""

import pytest
from fastapi.testclient import TestClient
import numpy as np
import cv2

from main import app


@pytest.fixture
def client():
    """Provide a FastAPI TestClient wired to the real app instance.

    This sends real HTTP requests through Starlette's test transport without
    needing a live server.
    """
    return TestClient(app)


@pytest.fixture
def sample_image():
    """Return a uniform mid-grey JPEG (480×640) with no discernible face.

    Useful for testing the "no face" / "low confidence" code path.
    """
    img = np.ones((480, 640, 3), dtype=np.uint8) * 200
    _, buf = cv2.imencode('.jpg', img)
    return buf.tobytes()


@pytest.fixture
def face_image():
    """Return a JPEG with a white rectangle simulating a face region.

    Not a real face — this will likely not trigger MediaPipe detection, but it
    exercises the image-decoding and dict-return path without needing a real
    photograph checked into version control.
    """
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.rectangle(img, (200, 100), (440, 380), (255, 255, 255), -1)
    _, buf = cv2.imencode('.jpg', img)
    return buf.tobytes()
