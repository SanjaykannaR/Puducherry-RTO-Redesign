# Face Detection Utilities

**File:** `services/face_utils.py`

## Purpose
Core face detection logic using MediaPipe (Google's lightweight ML framework). Alternative to dlib/face_recognition which requires complex C++ build tooling on Windows.

## Functions
- `detect_face(image)` - Single face detection with confidence score and bounding box
- `multiple_faces_detected(image)` - Checks for multiple faces in frame

## Key Decisions
- MediaPipe chosen over dlib/face_recognition due to:
  - Zero C++ compilation needed (pip installs cleanly)
  - Faster inference on CPU
  - Good accuracy for real-time proctoring
- OpenCV for image decode/preprocessing pipeline
- Threshold-based detection with 0.50 min confidence for detection, 0.60 for proctoring pass

## Dependencies
- opencv-python, mediapipe, numpy

## Related Files
- `routes/detect.py` - Uses these utilities
