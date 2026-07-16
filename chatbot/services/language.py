"""Language detection and response routing."""

from langdetect import detect, DetectorFactory
from config import SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE

# Make detection deterministic
DetectorFactory.seed = 0


def detect_language(text: str) -> str:
    """Detect the language of input text.

    Returns a supported language code ('en', 'ta', 'fr').
    Falls back to DEFAULT_LANGUAGE if detection fails or returns unsupported.
    """
    try:
        detected = detect(text)
        if detected in SUPPORTED_LANGUAGES:
            return detected
        # Tamil detection can return 'ml' (Malayalam) or 'kn' (Kannada) sometimes
        if detected in ("ml", "kn", "si", "te"):
            return "ta"  # South Indian languages - default to Tamil
        return DEFAULT_LANGUAGE
    except Exception:
        return DEFAULT_LANGUAGE


LANG_NAMES = {
    "en": "English",
    "ta": "Tamil",
    "fr": "French",
}


def get_lang_name(code: str) -> str:
    return LANG_NAMES.get(code, "English")


def get_greeting(lang: str) -> str:
    """Return a greeting in the detected language."""
    greetings = {
        "en": "Hello! I'm the Puducherry RTO Assistant. How can I help you today?",
        "ta": "வணக்கம்! நான் புதுச்சேரி ஆர்.டி.ஓ உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
        "fr": "Bonjour ! Je suis l'assistant RTO de Pondichéry. Comment puis-je vous aider aujourd'hui ?",
    }
    return greetings.get(lang, greetings["en"])


def get_login_suggestion(lang: str) -> str:
    """Return a login suggestion in the detected language."""
    suggestions = {
        "en": "\n\n💡 To access all services like applying for a license or booking an appointment, please log in first. You can use our portal for that!",
        "ta": "\n\n💡 உரிமம் விண்ணப்பிக்க அல்லது நியமனம் பதிவு செய்ய அனைத்து சேவைகளையும் அணுக, முதலில் உள்நுழையவும். எங்கள் போர்ட்டலை பயன்படுத்தலாம்!",
        "fr": "\n\n💡 Pour accéder à tous les services comme la demande de permis ou la réservation de rendez-vous, veuillez d'abord vous connecter. Utilisez notre portail !",
    }
    return suggestions.get(lang, suggestions["en"])
