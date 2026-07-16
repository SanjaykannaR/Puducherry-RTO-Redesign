"""Chatbot configuration."""

import os
from dotenv import load_dotenv

load_dotenv()

# ── Google Gemini ──
GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
GEMINI_MODEL: str = "gemini-2.0-flash"  # fast + cheap for chat

# ── Server ──
HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "5001"))

# ── CORS ──
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

# ── Supported languages ──
SUPPORTED_LANGUAGES = {"en", "ta", "fr"}
DEFAULT_LANGUAGE = "en"

# ── Navigation routes (frontend paths) ──
NAV_ROUTES = {
    "home": "/",
    "services": "/services",
    "vehicle_registration": "/services",
    "driving_license": "/services",
    "appointment": "/services",
    "fee_calculator": "/services",
    "track_application": "/services",
    "challan": "/services",
    "directory": "/directory",
    "fares": "/fares",
    "contact": "/contact",
    "about": "/about",
    "login": "/login",
    "register": "/register",
    "dashboard": "/dashboard",
    "exam": "/exam",
}
