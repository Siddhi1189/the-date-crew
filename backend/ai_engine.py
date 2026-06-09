"""
ai_engine.py — The Date Crew
==============================
Groq-powered AI integration for personalized intro messages and match
insights. Falls back to smart template-based responses when the API key
is missing or the request fails.

Uses the **llama-3.3-70b-versatile** model via the Groq SDK.
"""

from __future__ import annotations

import os
import random
import logging
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("the_date_crew.ai")

# ---------------------------------------------------------------------------
# Groq client initialisation (synchronous SDK)
# ---------------------------------------------------------------------------

client = None
GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY")

if GROQ_API_KEY:
    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)
        logger.info("Groq client initialised successfully.")
    except Exception as exc:
        logger.warning("Failed to initialise Groq client: %s", exc)
        client = None
else:
    logger.info("GROQ_API_KEY not set — AI features will use template fallback.")

MODEL = "llama-3.3-70b-versatile"


# ===================================================================
# Helper Utilities
# ===================================================================

def _shared_hobbies(user: dict, match: dict) -> list[str]:
    """Return hobbies common to both profiles."""
    return list(
        set(h.lower() for h in user.get("hobbies", []))
        & set(h.lower() for h in match.get("hobbies", []))
    )


def _same_city(user: dict, match: dict) -> bool:
    return user.get("city", "").lower() == match.get("city", "").lower()


def _fmt_hobbies(hobbies: list[str]) -> str:
    """Capitalise and join a list of hobbies in natural English."""
    titled = [h.title() for h in hobbies]
    if len(titled) == 0:
        return ""
    if len(titled) == 1:
        return titled[0]
    return ", ".join(titled[:-1]) + " and " + titled[-1]


# ===================================================================
# Template Fallbacks
# ===================================================================

_INTRO_TEMPLATES: list[str] = [
    (
        "Hi {match_name}, I'm {user_name} from {user_city}. "
        "{hobby_line}"
        "I'd love to get to know you better — your profile really stood out to me. 😊"
    ),
    (
        "Namaste {match_name}! I'm {user_name}, a {user_profession} based in {user_city}. "
        "{hobby_line}"
        "Would you be up for a conversation over chai (virtual or real)? ☕"
    ),
    (
        "Hey {match_name} 👋 I'm {user_name}. "
        "{city_line}"
        "{hobby_line}"
        "I loved reading your bio and think we might really click. Looking forward to hearing from you!"
    ),
]

_INSIGHT_TEMPLATES: list[str] = [
    (
        "You and {match_name} share a {score_cat} with an overall compatibility of {score}%. "
        "{value_line} {lifestyle_line} {location_line}"
    ),
    (
        "Our algorithm sees great potential between you and {match_name}! "
        "Here's why: {value_line} {lifestyle_line} {location_line} "
        "Overall compatibility: {score}%."
    ),
]


def _template_intro(user: dict, match: dict) -> str:
    """Generate a template-based intro when AI is unavailable."""
    shared = _shared_hobbies(user, match)
    hobby_line = ""
    if shared:
        hobby_line = f"I noticed we both enjoy {_fmt_hobbies(shared)} — that's awesome! "
    elif match.get("hobbies"):
        hobby_line = f"I'm curious about your interest in {match['hobbies'][0]} — tell me more! "

    city_line = ""
    if _same_city(user, match):
        city_line = f"It's great that we're both in {user['city']}! "
    else:
        city_line = f"I'm based in {user['city']} — would love to connect across cities. "

    template = random.choice(_INTRO_TEMPLATES)
    return template.format(
        user_name=user["name"].split()[0],
        match_name=match["name"].split()[0],
        user_city=user["city"],
        user_profession=user["profession"],
        hobby_line=hobby_line,
        city_line=city_line,
    )


def _template_insight(user: dict, match: dict, score: dict) -> str:
    """Generate a template-based insight when AI is unavailable."""
    breakdown = score.get("breakdown", {})

    value_line = ""
    if breakdown.get("values", 0) >= 70:
        value_line = "Your core values align beautifully."
    elif breakdown.get("values", 0) >= 50:
        value_line = "You share some important values, with room to grow together."
    else:
        value_line = "Your values differ, which could bring fresh perspectives."

    lifestyle_line = ""
    if breakdown.get("lifestyle", 0) >= 70:
        lifestyle_line = "Your lifestyles are very compatible!"
    elif breakdown.get("lifestyle", 0) >= 50:
        lifestyle_line = "You have overlapping lifestyle preferences."
    else:
        lifestyle_line = "Your lifestyles are different — variety is the spice of life!"

    location_line = ""
    if breakdown.get("location", 0) == 100:
        location_line = f"Being in the same city ({user['city']}) makes meeting easy."
    elif breakdown.get("location", 0) >= 60:
        location_line = "You're in nearby cities, so meeting up is very doable."
    else:
        location_line = "Distance is a factor, but love knows no zip codes. 🌍"

    template = random.choice(_INSIGHT_TEMPLATES)
    return template.format(
        match_name=match["name"].split()[0],
        score=score.get("overall_score", "?"),
        score_cat=score.get("category", "compatibility score"),
        value_line=value_line,
        lifestyle_line=lifestyle_line,
        location_line=location_line,
    )


# ===================================================================
# Public API — Intro Generation
# ===================================================================

async def generate_intro(user_profile: dict, match_profile: dict) -> str:
    """
    Generate a warm, culturally appropriate intro message.

    Uses Groq AI when available, otherwise falls back to a smart template
    that references shared hobbies, city, and profession.
    """
    if client is None:
        return _template_intro(user_profile, match_profile)

    shared = _shared_hobbies(user_profile, match_profile)
    prompt = (
        f"You are a warm, respectful Indian matchmaking assistant. "
        f"Generate a short (3-4 sentences), personalized introduction message "
        f"from {user_profile['name']} to {match_profile['name']}.\n\n"
        f"About the sender:\n"
        f"- Age: {user_profile['age']}, City: {user_profile['city']}\n"
        f"- Profession: {user_profile['profession']}\n"
        f"- Hobbies: {', '.join(user_profile.get('hobbies', []))}\n"
        f"- Bio: {user_profile.get('about', '')}\n\n"
        f"About the recipient:\n"
        f"- Age: {match_profile['age']}, City: {match_profile['city']}\n"
        f"- Profession: {match_profile['profession']}\n"
        f"- Hobbies: {', '.join(match_profile.get('hobbies', []))}\n"
        f"- Bio: {match_profile.get('about', '')}\n\n"
        f"Shared hobbies: {', '.join(shared) if shared else 'None'}\n"
        f"Same city: {'Yes' if _same_city(user_profile, match_profile) else 'No'}\n\n"
        f"Rules:\n"
        f"- Be warm, genuine, and culturally appropriate for India\n"
        f"- Reference specific shared interests or compliment their profile\n"
        f"- Keep it respectful — this is a marriage/serious-dating context\n"
        f"- Do NOT use emojis excessively — max 1-2\n"
        f"- Write ONLY the message, no meta-text or labels"
    )

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.8,
        )
        text = response.choices[0].message.content.strip()
        return text if text else _template_intro(user_profile, match_profile)
    except Exception as exc:
        logger.error("Groq intro generation failed: %s", exc)
        return _template_intro(user_profile, match_profile)


# ===================================================================
# Public API — Match Insight Generation
# ===================================================================

async def generate_match_insight(
    user_profile: dict,
    match_profile: dict,
    score: dict,
) -> str:
    """
    Generate AI commentary explaining why two people are (or aren't)
    compatible, with specific references to scoring dimensions.

    Uses Groq AI when available, otherwise falls back to templates.
    """
    if client is None:
        return _template_insight(user_profile, match_profile, score)

    breakdown = score.get("breakdown", {})
    prompt = (
        f"You are an insightful Indian matchmaking analyst. "
        f"Explain in 3-5 sentences why {user_profile['name']} and "
        f"{match_profile['name']} are compatible (or not).\n\n"
        f"Compatibility Score: {score.get('overall_score')}% "
        f"({score.get('category')})\n\n"
        f"Score Breakdown:\n"
        f"- Age: {breakdown.get('age', '?')}/100\n"
        f"- Location: {breakdown.get('location', '?')}/100\n"
        f"- Values: {breakdown.get('values', '?')}/100\n"
        f"- Lifestyle: {breakdown.get('lifestyle', '?')}/100\n"
        f"- Professional: {breakdown.get('professional', '?')}/100\n"
        f"- Height: {breakdown.get('height', '?')}/100\n"
        f"- Income: {breakdown.get('income', '?')}/100\n\n"
        f"{user_profile['name']}:\n"
        f"  {user_profile['age']}yo {user_profile['profession']} in "
        f"{user_profile['city']}, {user_profile['religion']}, "
        f"{user_profile['diet']}, hobbies: {', '.join(user_profile.get('hobbies', []))}\n\n"
        f"{match_profile['name']}:\n"
        f"  {match_profile['age']}yo {match_profile['profession']} in "
        f"{match_profile['city']}, {match_profile['religion']}, "
        f"{match_profile['diet']}, hobbies: {', '.join(match_profile.get('hobbies', []))}\n\n"
        f"Rules:\n"
        f"- Be specific — reference actual profile details\n"
        f"- Highlight the strongest and weakest compatibility areas\n"
        f"- Be encouraging even for lower scores\n"
        f"- Use a warm, professional tone appropriate for Indian audience\n"
        f"- Write ONLY the analysis, no meta-text or labels"
    )

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=400,
            temperature=0.7,
        )
        text = response.choices[0].message.content.strip()
        return text if text else _template_insight(user_profile, match_profile, score)
    except Exception as exc:
        logger.error("Groq insight generation failed: %s", exc)
        return _template_insight(user_profile, match_profile, score)
