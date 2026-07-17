"""Google Gemini LLM integration for the RTO chatbot.

All imports are lazy — nothing fails at module level.
"""

import importlib
from config import GOOGLE_API_KEY, GEMINI_MODEL

# Lazy-loaded globals
_genai = None
_model = None
_initialized = False
_init_error = None


def _ensure_init():
    """Initialize Gemini once, on first use. Never crashes."""
    global _genai, _model, _initialized, _init_error
    if _initialized:
        return
    _initialized = True

    if not GOOGLE_API_KEY:
        _init_error = "GEMINI_API_KEY not set"
        print(f"[chatbot] {_init_error}")
        return

    try:
        _genai = importlib.import_module("google.generativeai")
        _genai.configure(api_key=GOOGLE_API_KEY)
        _model = _genai.GenerativeModel(GEMINI_MODEL)
        print(f"[chatbot] Gemini configured: model={GEMINI_MODEL}")
    except Exception as e:
        _init_error = str(e)
        print(f"[chatbot] Gemini init failed: {e}")
        _model = None


# ── System prompts ──

SYSTEM_PROMPT_EN = """You are a helpful AI assistant for the Puducherry RTO (Regional Transport Office) portal. Your role is to help citizens with:

1. Driving License services (new, renewal, duplicate, address change)
2. Learner's License (LLR) information
3. Vehicle Registration services
4. RC Renewal
5. Traffic challans and penalties
6. Fee information
7. Document requirements
8. Step-by-step process guidance
9. Navigation help on the portal

RULES:
- Always respond in the SAME LANGUAGE as the user's message
- Be concise and helpful - give step-by-step instructions when explaining processes
- When mentioning fees, always use Indian Rupees (Rs.)
- Mention the official portal URLs when relevant (sarathi.parivahan.gov.in, vahan.parivahan.gov.in)
- If the user asks about age 40+ license renewal, ALWAYS mention Form 1A medical certificate requirement
- If the user wants to apply for services, suggest they log in to the portal
- Be friendly and patient, especially with older users
- If you don't know something specific, direct them to contact the RTO helpline
- Keep responses under 300 words unless the user asks for detailed information
- Use numbered steps for processes
"""

SYSTEM_PROMPT_TA = """நீங்கள் புதுச்சேரி ஆர்.டி.ஓ (பிராந்திய போக்குவரத்து அலுவலகம்) இணையதளத்திற்கான உதவியான AI உதவியாளர். உங்கள் பணி குடிமக்களுக்கு உதவுவதாகும்:

1. ஓட்டுநர் உரிமம் சேவைகள் (புதிய, புதுப்பித்தல், நகல், முகவரி மாற்றம்)
2. கற்றோர் உரிமம் (எல்.எல்.ஆர்.) தகவல்
3. வாகன பதிவு சேவைகள்
4. ஆர்.சி. புதுப்பித்தல்
5. போக்குவரத்து சால்லன் மற்றும் அபராதங்கள்
6. கட்டண தகவல்
7. ஆவண தேவைகள்
8. படிப்படியான செயல்முறை வழிகாட்டுதல்
9. இணையதளத்தில் வழிசெலுத்தல் உதவி

விதிகள்:
- எப்போதும் பயனரின் செய்தியின் மொழியில் பதிலளிக்கவும்
- சுருக்கமாகவும் உதவியாகவும் இருங்கள்
- கட்டணங்களைக் குறிப்பிடும்போது, எப்போதும் இந்திய ரூபாயில் (ரூ.) குறிப்பிடவும்
- 40+ வயதில் உரிமம் புதுப்பித்தல் பற்றி கேட்டால், படிவம் 1ஏ மருத்துவ சான்றிதழ் தேவை என்பதை எப்போதும் குறிப்பிடவும்
- பயனர் சேவைகளுக்கு விண்ணப்பிக்க விரும்பினால், போர்ட்டலில் உள்நுழைய பரிந்துரைக்கவும்
- பதில்களை 300 சொற்களுக்குள் வைத்திருங்கள்
"""

SYSTEM_PROMPT_FR = """Vous êtes un assistant IA utile pour le portail RTO de Pondichéry. Votre rôle est d'aider les citoyens avec :

1. Services de permis de conduire (nouveau, renouvellement, double)
2. Informations sur le permis d'apprenti (LLR)
3. Services d'immatriculation de véhicules
4. Renouvellement RC
5. Contraventions et pénalités de circulation
6. Informations sur les frais
7. Exigences de documents
8. Guidance étape par étape
9. Aide à la navigation sur le portail

RÈGLES :
- Répondez toujours dans la MÊME LANGUE que le message de l'utilisateur
- Soyez concis et utile
- Utilisez les Roupies indiennes (Rs.) pour les frais
- Si l'utilisateur demande le renouvellement à 40+ ans, mentionnez TOUJOURS le certificat médical Formulaire 1A
- Si l'utilisateur veut appliquer, suggérez de se connecter au portail
- Gardez les réponses sous 300 mots
"""


def get_system_prompt(lang: str) -> str:
    prompts = {"en": SYSTEM_PROMPT_EN, "ta": SYSTEM_PROMPT_TA, "fr": SYSTEM_PROMPT_FR}
    return prompts.get(lang, SYSTEM_PROMPT_EN)


def build_prompt(user_message: str, lang: str, chat_history: list[dict] | None = None) -> str:
    """Build the full prompt with knowledge context."""
    from services.knowledge import search_knowledge, get_navigation_intent

    kb_context = search_knowledge(user_message, lang)
    nav_intent = get_navigation_intent(user_message, lang)

    parts = [
        f"System: {get_system_prompt(lang)}",
        f"\n--- RTO Knowledge Base Context ---\n{kb_context}\n--- End Context ---",
    ]

    if chat_history:
        parts.append("\n--- Conversation History ---")
        for msg in chat_history[-6:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            parts.append(f"{role}: {content}")
        parts.append("--- End History ---")

    if nav_intent:
        parts.append(f"\n[Navigation detected: User wants to go to {nav_intent.get('hint', '')}. Path: {nav_intent.get('path', '')}]")

    parts.append(f"\nUser: {user_message}")
    parts.append("\nAssistant:")

    return "\n".join(parts)


def get_init_status() -> dict:
    """Return Gemini initialization status for diagnostics."""
    _ensure_init()
    return {
        "initialized": _initialized,
        "model_ready": _model is not None,
        "api_key_set": bool(GOOGLE_API_KEY),
        "error": _init_error,
        "model": GEMINI_MODEL,
    }


def generate_response(user_message: str, lang: str, chat_history: list[dict] | None = None) -> dict:
    """Generate a response using Google Gemini. Never raises."""
    from services.language import get_greeting, get_login_suggestion

    error_messages = {
        "en": "I'm having trouble processing your request. Please try again or contact our helpline at +91 413 222 1234.",
        "ta": "உங்கள் கோரிக்கையை செயலாக்குவதில் சிக்கல் உள்ளது. மீண்டும் முயற்சிக்கவும் அல்லது எங்கள் ஹெல்ப்லைனை தொடர்பு கொள்ளவும்: +91 413 222 1234.",
        "fr": "J'ai du mal à traiter votre demande. Veuillez réessayer ou contacter notre assistance : +91 413 222 1234.",
    }

    _ensure_init()

    # Check for greetings
    greeting_keywords = {
        "en": ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
        "ta": ["வணக்கம்", "ஹலோ", "வாழ்த்துக்கள்"],
        "fr": ["bonjour", "salut", "bonsoir"],
    }

    is_greeting = any(kw in user_message.lower() for kw in greeting_keywords.get(lang, greeting_keywords["en"]))

    if is_greeting and len(user_message.split()) < 5:
        return {
            "response": get_greeting(lang),
            "navigation": None,
            "login_suggested": False,
        }

    # Check navigation intent
    nav_intent = get_navigation_intent(user_message, lang)

    # If Gemini isn't ready, return a graceful fallback
    if _model is None:
        return {
            "response": error_messages.get(lang, error_messages["en"]),
            "navigation": nav_intent,
            "login_suggested": False,
        }

    # Build prompt and generate
    prompt = build_prompt(user_message, lang, chat_history)

    try:
        response = _model.generate_content(
            prompt,
            generation_config=_genai.types.GenerationConfig(
                temperature=0.3,
                max_output_tokens=500,
                top_p=0.8,
            ),
        )
        response_text = response.text.strip()

        login_keywords = {
            "en": ["log in", "login", "sign in", "apply", "register"],
            "ta": ["உள்நுழை", "விண்ணப்பிக்க", "பதிவு"],
            "fr": ["connecter", "appliquer", "s'inscrire"],
        }
        should_suggest_login = any(
            kw in response_text.lower() for kw in login_keywords.get(lang, login_keywords["en"])
        )

        return {
            "response": response_text,
            "navigation": nav_intent,
            "login_suggested": should_suggest_login,
        }

    except Exception as e:
        print(f"[chatbot] Gemini error: {e}")
        return {
            "response": error_messages.get(lang, error_messages["en"]),
            "navigation": None,
            "login_suggested": False,
        }
