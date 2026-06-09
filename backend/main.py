"""
main.py — The Date Crew
========================
FastAPI application powering the AI matchmaking backend.

Endpoints
---------
Auth:
  POST /auth/login          — Mock email + password login
  POST /auth/google         — Mock Google OAuth

Core:
  GET  /api/profiles/me     — Current user's profile
  GET  /api/matches         — All matches with scores (filterable)
  GET  /api/match/{id}      — Single match detail with full breakdown

AI:
  POST /api/ai/intro        — Generate personalised intro message
  POST /api/ai/insight      — Generate match compatibility insight

Actions:
  POST /api/email/send      — Mock email send

Run with:
  uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from profiles import ALL_PROFILES, FEMALE_PROFILES, MALE_PROFILES
from matching import calculate_match, apply_filters
from ai_engine import generate_intro, generate_match_insight, client as groq_client

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("the_date_crew")

# ---------------------------------------------------------------------------
# FastAPI App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="The Date Crew — AI Matchmaking API",
    description=(
        "Backend for an AI-powered Indian matchmaking app. "
        "Provides multi-dimensional compatibility scoring, "
        "AI-generated introductions, and smart filtering."
    ),
    version="1.0.0",
)

# CORS — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-Memory State
# ---------------------------------------------------------------------------

# Currently "logged in" user — defaults to m1 (Arjun Mehta)
_current_user_id: str = "m1"

# Sent emails log (mock)
_sent_emails: list[dict] = []

# In-memory activity log
_activity_log: list[dict] = []


def _log_activity(action: str, user_id: str, details: str = ""):
    """Append an activity entry; keeps only the most recent 50."""
    _activity_log.insert(0, {
        "action": action,
        "user_id": user_id,
        "details": details,
        "timestamp": datetime.now().isoformat(),
    })
    # Keep only last 50
    if len(_activity_log) > 50:
        _activity_log.pop()


# ---------------------------------------------------------------------------
# Pydantic Request / Response Models
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    email: str
    password: str


class GoogleAuthRequest(BaseModel):
    token: str


class AIRequest(BaseModel):
    user_id: str
    match_id: str


class EmailRequest(BaseModel):
    user_id: str
    match_id: str
    message: str


class EmailResponse(BaseModel):
    success: bool
    message: str
    timestamp: str


class MatchSummary(BaseModel):
    profile: dict
    score: dict


class MatchDetail(BaseModel):
    user_profile: dict
    match_profile: dict
    score: dict


# ===================================================================
# Auth Endpoints
# ===================================================================

@app.post("/auth/login", tags=["Auth"])
async def login(request: LoginRequest):
    """
    Mock login — accepts any email/password and returns the first male
    profile whose name loosely matches, or defaults to m1.
    """
    global _current_user_id

    # Try to find a male profile by email prefix matching name
    email_prefix = request.email.split("@")[0].lower().replace(".", "")
    matched_id = "m1"  # default

    for p in MALE_PROFILES:
        name_key = p["name"].lower().replace(" ", "")
        if email_prefix in name_key or name_key in email_prefix:
            matched_id = p["id"]
            break

    _current_user_id = matched_id
    user_profile = ALL_PROFILES[_current_user_id]

    logger.info("User logged in: %s (%s)", user_profile["name"], _current_user_id)
    _log_activity("login", _current_user_id, f"{user_profile['name']} logged in")

    # Return in format expected by frontend: {token, user}
    return {
        "token": f"mock-jwt-{_current_user_id}",
        "user": {
            **user_profile,
            "id": _current_user_id,
            "user_id": _current_user_id,
        },
    }


@app.post("/auth/google", tags=["Auth"])
async def google_auth(request: GoogleAuthRequest):
    """
    Mock Google OAuth — always authenticates as the current demo user.
    In production this would verify the Google ID token.
    """
    global _current_user_id

    # Default to m1 for Google sign-in demo
    _current_user_id = "m1"
    user_profile = ALL_PROFILES[_current_user_id]

    logger.info("Google OAuth login: %s", user_profile["name"])

    return {
        "token": f"google-mock-jwt-{_current_user_id}",
        "user": {
            **user_profile,
            "id": _current_user_id,
            "user_id": _current_user_id,
        },
    }


# ===================================================================
# Core Endpoints
# ===================================================================

@app.get("/api/profiles/me", tags=["Core"])
async def get_my_profile():
    """Return the currently logged-in user's full profile."""
    if _current_user_id not in ALL_PROFILES:
        raise HTTPException(status_code=404, detail="User profile not found.")
    return ALL_PROFILES[_current_user_id]


@app.get("/api/matches", tags=["Core"])
async def get_matches(
    # Accept both snake_case and camelCase from frontend
    user_id: Optional[str] = Query(None),
    age_min: Optional[int] = Query(None, ge=18, le=60),
    age_max: Optional[int] = Query(None, ge=18, le=60),
    ageMin: Optional[int] = Query(None, ge=18, le=60),
    ageMax: Optional[int] = Query(None, ge=18, le=60),
    religion: Optional[str] = Query(None),
    diet: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    open_to_relocate: Optional[str] = Query(None),
    openToRelocate: Optional[str] = Query(None),
    open_to_pets: Optional[str] = Query(None),
    openToPets: Optional[str] = Query(None),
    wants_children: Optional[str] = Query(None),
    wantsChildren: Optional[str] = Query(None),
    height_min: Optional[int] = Query(None, ge=100, le=220),
    height_max: Optional[int] = Query(None, ge=100, le=220),
    smoking: Optional[str] = Query(None),
    drinking: Optional[str] = Query(None),
    status_tag: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
):
    """
    Get all opposite-gender matches with compatibility scores.
    Returns {matches: [...]} to match frontend expectations.
    """
    if _current_user_id not in ALL_PROFILES:
        raise HTTPException(status_code=404, detail="User not found. Please login first.")

    user = ALL_PROFILES[_current_user_id]

    # Step 2: Opposite-gender candidates
    if user["gender"] == "male":
        candidates = list(FEMALE_PROFILES)
    else:
        candidates = list(MALE_PROFILES)

    # Step 3: Build filter dict — merge camelCase and snake_case params
    filters: dict = {}
    _age_min = age_min or ageMin
    _age_max = age_max or ageMax
    _relocate = open_to_relocate or openToRelocate
    _pets = open_to_pets or openToPets
    _children = wants_children or wantsChildren

    if _age_min is not None:
        filters["age_min"] = _age_min
    if _age_max is not None:
        filters["age_max"] = _age_max
    if religion is not None:
        filters["religion"] = religion
    if diet is not None:
        filters["diet"] = diet
    if city is not None:
        filters["city"] = city
    if _relocate is not None:
        filters["open_to_relocate"] = _relocate
    if _pets is not None:
        filters["open_to_pets"] = _pets
    if _children is not None:
        filters["wants_children"] = _children
    if height_min is not None:
        filters["height_min"] = height_min
    if height_max is not None:
        filters["height_max"] = height_max
    if smoking is not None:
        filters["smoking"] = smoking
    if drinking is not None:
        filters["drinking"] = drinking
    if status_tag is not None:
        filters["status_tag"] = status_tag
    if stage is not None:
        filters["stage"] = stage

    candidates = apply_filters(candidates, filters)

    # Step 4 & 5: Score and sort
    results = []
    for candidate in candidates:
        score = calculate_match(user, candidate)
        results.append({"profile": candidate, "score": score})

    results.sort(key=lambda r: r["score"]["overall_score"], reverse=True)

    logger.info(
        "Returned %d matches for %s (filters: %s)",
        len(results), user["name"], filters or "none",
    )

    # Wrap in {matches: [...]} for frontend compatibility
    return {"matches": results}


@app.get("/api/match/{match_id}", response_model=MatchDetail, tags=["Core"])
async def get_match_detail(match_id: str):
    """
    Get a single match's full profile and detailed score breakdown.
    """
    if _current_user_id not in ALL_PROFILES:
        raise HTTPException(status_code=404, detail="User not found. Please login first.")

    if match_id not in ALL_PROFILES:
        raise HTTPException(status_code=404, detail=f"Match profile '{match_id}' not found.")

    user = ALL_PROFILES[_current_user_id]
    match = ALL_PROFILES[match_id]

    # Validate opposite gender
    if user["gender"] == match["gender"]:
        raise HTTPException(
            status_code=400,
            detail="Can only view match details for opposite-gender profiles.",
        )

    score = calculate_match(user, match)
    _log_activity("viewed_profile", _current_user_id, f"Viewed {match['name']}'s profile")

    return MatchDetail(
        user_profile=user,
        match_profile=match,
        score=score,
    )


# ===================================================================
# AI Endpoints
# ===================================================================

@app.post("/api/ai/intro", tags=["AI"])
async def ai_intro(request: AIRequest):
    """
    Generate an AI-powered personalised intro message from the user
    to the specified match.
    """
    if request.user_id not in ALL_PROFILES:
        raise HTTPException(status_code=404, detail="User profile not found.")
    if request.match_id not in ALL_PROFILES:
        raise HTTPException(status_code=404, detail="Match profile not found.")

    user = ALL_PROFILES[request.user_id]
    match = ALL_PROFILES[request.match_id]

    intro = await generate_intro(user, match)

    logger.info("Generated intro: %s → %s", user["name"], match["name"])

    return {
        "success": True,
        "intro": intro,
        "intro_message": intro,
        "from": user["name"],
        "to": match["name"],
    }


@app.post("/api/ai/insight", tags=["AI"])
async def ai_insight(request: AIRequest):
    """
    Generate an AI-powered compatibility insight for a user–match pair.
    """
    if request.user_id not in ALL_PROFILES:
        raise HTTPException(status_code=404, detail="User profile not found.")
    if request.match_id not in ALL_PROFILES:
        raise HTTPException(status_code=404, detail="Match profile not found.")

    user = ALL_PROFILES[request.user_id]
    match = ALL_PROFILES[request.match_id]
    score = calculate_match(user, match)
    _log_activity("ai_insight", request.user_id, f"Checked compatibility with {match['name']}")

    insight = await generate_match_insight(user, match, score)

    logger.info("Generated insight: %s ↔ %s", user["name"], match["name"])

    return {
        "success": True,
        "insight": insight,
        "score": score,
        "profiles": {
            "user": user["name"],
            "match": match["name"],
        },
    }


# ===================================================================
# Action Endpoints
# ===================================================================

@app.post("/api/email/send", response_model=EmailResponse, tags=["Actions"])
async def send_email(request: EmailRequest):
    """
    Mock email send — logs the message and returns success.
    In production this would integrate with an email service (SendGrid, etc.).
    """
    if request.user_id not in ALL_PROFILES:
        raise HTTPException(status_code=404, detail="Sender profile not found.")
    if request.match_id not in ALL_PROFILES:
        raise HTTPException(status_code=404, detail="Recipient profile not found.")
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    user = ALL_PROFILES[request.user_id]
    match = ALL_PROFILES[request.match_id]
    timestamp = datetime.now().isoformat()

    email_record = {
        "from_id": request.user_id,
        "from_name": user["name"],
        "to_id": request.match_id,
        "to_name": match["name"],
        "message": request.message,
        "timestamp": timestamp,
    }
    _sent_emails.append(email_record)
    _log_activity("sent_intro", request.user_id, f"Sent intro to {match['name']}")

    logger.info(
        "Email sent: %s → %s (%d chars)",
        user["name"], match["name"], len(request.message),
    )

    return EmailResponse(
        success=True,
        message=f"Your message has been sent to {match['name']}! 💌",
        timestamp=timestamp,
    )


# ===================================================================
# Activity Feed
# ===================================================================

@app.get("/api/activity", tags=["Core"])
async def get_activity():
    """Return the 20 most recent activity entries."""
    return {"activities": _activity_log[:20]}


# ===================================================================
# Health Check
# ===================================================================

@app.get("/health", tags=["System"])
async def health_check():
    """Simple health check endpoint."""
    return {
        "status": "healthy",
        "app": "The Date Crew",
        "version": "1.0.0",
        "ai_enabled": groq_client is not None,
        "total_profiles": len(ALL_PROFILES),
        "emails_sent": len(_sent_emails),
    }
