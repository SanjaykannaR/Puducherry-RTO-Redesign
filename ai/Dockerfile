# ── AI Proctoring Service Dockerfile ──
# Face detection for RTO online exams (MediaPipe + OpenCV)
# Build context is repo root (Railway quirk), so paths are ai/ prefixed

FROM python:3.12-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only what we need from ai/ subdirectory
COPY ai/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ai/ .

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
