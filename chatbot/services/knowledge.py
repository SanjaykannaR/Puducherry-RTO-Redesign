"""Knowledge base loader - reads JSON knowledge files and provides search."""

import json
import os
from pathlib import Path
from typing import Optional

KNOWLEDGE_DIR = Path(__file__).parent.parent / "knowledge"

_cache: dict[str, dict] = {}


def _load(lang: str) -> dict:
    if lang in _cache:
        return _cache[lang]
    path = KNOWLEDGE_DIR / f"{lang}.json"
    if not path.exists():
        path = KNOWLEDGE_DIR / "en.json"
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    _cache[lang] = data
    return data


def get_topic(topic_key: str, lang: str = "en") -> Optional[dict]:
    """Get a specific topic from the knowledge base."""
    data = _load(lang)
    return data.get("topics", {}).get(topic_key)


def get_all_topics(lang: str = "en") -> dict:
    """Get all topics."""
    data = _load(lang)
    return data.get("topics", {})


def search_knowledge(query: str, lang: str = "en") -> str:
    """Search the knowledge base and return relevant context as text.

    Does a simple keyword match against topic titles and keys,
    returning the matched topics as formatted text for the LLM prompt.
    """
    data = _load(lang)
    topics = data.get("topics", {})
    query_lower = query.lower()

    # Score each topic by keyword overlap
    scored: list[tuple[float, str, dict]] = []
    for key, topic in topics.items():
        title = topic.get("title", "").lower()
        score = 0.0

        # Direct keyword match in title
        for word in query_lower.split():
            if len(word) < 3:
                continue
            if word in title or word in key:
                score += 2.0
            # Check in content strings
            topic_str = json.dumps(topic).lower()
            if word in topic_str:
                score += 0.5

        # Boost for common RTO intent keywords
        intent_keywords = {
            "license": ["license", "licence", "dl", "llr", "driving"],
            "vehicle": ["vehicle", "registration", "rc", "car", "bike", "motorcycle"],
            "renewal": ["renew", "renewal", "renewal", "expire", "expired", "validity"],
            "documents": ["document", "form", "paper", "proof", "required"],
            "fees": ["fee", "cost", "price", "charge", "pay", "payment", "rupees", "rs"],
            "challan": ["challan", "fine", "penalty", "violation", "traffic"],
            "appointment": ["appointment", "slot", "book", "visit"],
            "medical": ["medical", "form 1a", "form 1", "health", "doctor", "fitness", "age 40", "40+"],
            "test": ["test", "exam", "driving test", "competence"],
            "transfer": ["transfer", "ownership", "sell", "buy", "second hand"],
            "noc": ["noc", "no objection", "outside state", "other state"],
            "helpline": ["contact", "phone", "help", "office", "address"],
        }

        for intent, keywords in intent_keywords.items():
            for kw in keywords:
                if kw in query_lower:
                    # Check if this topic is about this intent
                    topic_str = json.dumps(topic).lower()
                    if intent in key or any(k in topic_str for k in keywords[:2]):
                        score += 1.0

        if score > 0:
            scored.append((score, key, topic))

    # Sort by score descending
    scored.sort(key=lambda x: x[0], reverse=True)

    # Take top 3 most relevant topics
    results = []
    for score, key, topic in scored[:3]:
        results.append(f"--- {topic.get('title', key)} ---\n{json.dumps(topic, indent=2, ensure_ascii=False)}")

    if not results:
        return "No specific RTO topic found in knowledge base for this query."

    return "\n\n".join(results)


def get_navigation_intent(query: str, lang: str = "en") -> Optional[dict]:
    """Detect if the user wants to navigate somewhere and return the route."""
    data = _load(lang)
    nav_intents = data.get("navigation_intents", {})
    query_lower = query.lower()

    # Check for navigation intent keywords
    nav_keywords = {
        "go_to": ["go to", "take me", "navigate", "open", "show me", "where is", "link for", "page for"],
        "services": ["service", "services"],
        "license": ["license", "licence", "dl", "llr"],
        "vehicle": ["vehicle", "registration", "rc"],
        "appointment": ["appointment", "book", "schedule"],
        "challan": ["challan", "fine", "penalty"],
        "calculator": ["calculator", "fee calculator", "calculate"],
        "directory": ["directory", "offices", "office list"],
        "fares": ["fare", "fares", "fees", "fee structure"],
        "contact": ["contact", "phone", "email", "address"],
        "login": ["login", "sign in", "log in"],
        "register": ["register", "sign up"],
        "dashboard": ["dashboard", "my account", "profile"],
        "home": ["home", "main page", "front page"],
    }

    wants_navigate = any(kw in query_lower for kw in nav_keywords["go_to"])

    if not wants_navigate:
        return None

    # Find matching destination
    for dest_key, keywords in nav_keywords.items():
        if dest_key == "go_to":
            continue
        for kw in keywords:
            if kw in query_lower:
                intent = nav_intents.get(dest_key)
                if intent:
                    return {"intent": dest_key, **intent}

    return None
