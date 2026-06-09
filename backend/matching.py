"""
matching.py — The Date Crew
============================
Gender-aware compatibility scoring engine and profile filter system.

Scoring Dimensions (total = 100):
  • Age compatibility   — 20 %
  • Location            — 15 %
  • Values alignment    — 20 %
  • Lifestyle           — 15 %
  • Professional        — 15 %
  • Height              — 5 %
  • Income              — 10 %

Each dimension returns a 0-100 sub-score that is multiplied by its weight
to produce the final overall score (also 0-100).
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Profession compatibility groups
# ---------------------------------------------------------------------------

_PROFESSION_GROUPS: dict[str, str] = {
    "Software Engineer": "tech",
    "Data Scientist": "tech",
    "Graphic Designer": "creative",
    "Fashion Designer": "creative",
    "Content Creator": "creative",
    "Architect": "creative",
    "Doctor": "medical",
    "Pharmacist": "medical",
    "Lawyer": "law",
    "Chartered Accountant": "finance",
    "Marketing Manager": "business",
    "HR Manager": "business",
    "Startup Founder": "business",
    "Teacher": "education",
    "Journalist": "media",
}

# Groups that pair well with each other
_COMPATIBLE_GROUPS: set[frozenset[str]] = {
    frozenset({"tech", "tech"}),
    frozenset({"creative", "creative"}),
    frozenset({"medical", "medical"}),
    frozenset({"business", "business"}),
    frozenset({"tech", "business"}),
    frozenset({"tech", "creative"}),
    frozenset({"medical", "education"}),
    frozenset({"law", "business"}),
    frozenset({"law", "media"}),
    frozenset({"business", "media"}),
    frozenset({"education", "media"}),
    frozenset({"finance", "business"}),
    frozenset({"finance", "tech"}),
    frozenset({"finance", "law"}),
}

# Education ranking for proximity scoring
_EDUCATION_RANK: dict[str, int] = {
    "PhD": 6,
    "MBBS": 5,
    "MBA": 5,
    "LLB": 4,
    "BArch": 4,
    "B.Tech": 4,
    "M.Tech": 5,
    "MA": 4,
    "B.Com": 3,
    "BA": 3,
    "B.Pharm": 4,
    "B.Sc": 3,
}

# City → state mapping for regional proximity
_CITY_STATE: dict[str, str] = {
    "Mumbai": "Maharashtra",
    "Pune": "Maharashtra",
    "Delhi": "Delhi",
    "Bengaluru": "Karnataka",
    "Hyderabad": "Telangana",
    "Chennai": "Tamil Nadu",
    "Kolkata": "West Bengal",
    "Jaipur": "Rajasthan",
    "Ahmedabad": "Gujarat",
    "Lucknow": "Uttar Pradesh",
}


# ===================================================================
# Individual Scoring Functions
# ===================================================================

def _score_age(user: dict, candidate: dict) -> int:
    """
    Prefer candidates 1-5 years younger (for male→female matching).
    Score decreases as gap widens beyond 5 in either direction.
    """
    diff = user["age"] - candidate["age"]  # positive = user is older

    if 1 <= diff <= 5:
        return 100  # ideal range
    elif diff == 0:
        return 90  # same age is great too
    elif -2 <= diff < 0:
        return 80  # woman slightly older — fine
    elif 6 <= diff <= 8:
        return 70  # a bit wide but okay
    elif -5 <= diff < -2:
        return 60
    elif 9 <= diff <= 12:
        return 40
    else:
        return max(20, 100 - abs(diff) * 8)


def _score_location(user: dict, candidate: dict) -> int:
    """Same city = 100, same state = 60, different = 30."""
    if user["city"] == candidate["city"]:
        return 100
    if _CITY_STATE.get(user["city"]) == _CITY_STATE.get(candidate["city"]):
        return 60
    return 30


def _score_values(user: dict, candidate: dict) -> int:
    """Religion match, diet compatibility, children alignment."""
    score = 0

    # Religion (max 40)
    if user["religion"] == candidate["religion"]:
        score += 40
    else:
        score += 15  # some base for openness

    # Diet compatibility (max 30)
    diet_u, diet_c = user["diet"], candidate["diet"]
    if diet_u == diet_c:
        score += 30
    elif {diet_u, diet_c} <= {"Vegetarian", "Eggetarian", "Vegan"}:
        score += 22  # close enough
    elif "Eggetarian" in {diet_u, diet_c}:
        score += 15  # eggetarian is middle-ground
    else:
        score += 8

    # Children preference (max 30)
    children_u, children_c = user["wants_children"], candidate["wants_children"]
    if children_u == children_c:
        score += 30
    elif "Maybe" in {children_u, children_c}:
        score += 20
    else:
        score += 5  # strong disagreement

    return score


def _score_lifestyle(user: dict, candidate: dict) -> int:
    """Hobbies overlap, pets, relocation, smoking, drinking."""
    score = 0

    # Hobbies overlap (max 30)
    user_hobbies = set(h.lower() for h in user.get("hobbies", []))
    cand_hobbies = set(h.lower() for h in candidate.get("hobbies", []))
    overlap = len(user_hobbies & cand_hobbies)
    total = max(len(user_hobbies | cand_hobbies), 1)
    score += min(30, int((overlap / total) * 50) + (10 if overlap >= 2 else 0))

    # Pets (max 15)
    pets_u, pets_c = user["open_to_pets"], candidate["open_to_pets"]
    if pets_u == pets_c:
        score += 15
    elif "Maybe" in {pets_u, pets_c}:
        score += 10
    elif {pets_u, pets_c} == {"Yes", "No"}:
        score += 3
    else:
        score += 7

    # Relocation (max 15)
    reloc_u, reloc_c = user["open_to_relocate"], candidate["open_to_relocate"]
    if reloc_u == "Yes" or reloc_c == "Yes":
        score += 15
    elif "Maybe" in {reloc_u, reloc_c}:
        score += 10
    elif user["city"] == candidate["city"]:
        score += 15  # same city, relocation irrelevant
    else:
        score += 5

    # Smoking compatibility (max 20)
    smoke_u, smoke_c = user["smoking"], candidate["smoking"]
    if smoke_u == smoke_c:
        score += 20
    elif "Occasionally" in {smoke_u, smoke_c}:
        score += 12
    else:
        score += 4

    # Drinking compatibility (max 20)
    drink_u, drink_c = user["drinking"], candidate["drinking"]
    if drink_u == drink_c:
        score += 20
    elif "Occasionally" in {drink_u, drink_c}:
        score += 14
    else:
        score += 5

    # Normalise to 0-100
    return min(100, score)


def _score_professional(user: dict, candidate: dict) -> int:
    """Profession group compatibility + education proximity."""
    score = 0

    # Profession group (max 60)
    group_u = _PROFESSION_GROUPS.get(user["profession"], "other")
    group_c = _PROFESSION_GROUPS.get(candidate["profession"], "other")
    pair = frozenset({group_u, group_c})

    if group_u == group_c:
        score += 60
    elif pair in _COMPATIBLE_GROUPS:
        score += 45
    else:
        score += 25  # diverse pairing — still has charm

    # Education proximity (max 40)
    edu_u = _EDUCATION_RANK.get(user["education"], 3)
    edu_c = _EDUCATION_RANK.get(candidate["education"], 3)
    diff = abs(edu_u - edu_c)
    if diff == 0:
        score += 40
    elif diff == 1:
        score += 30
    elif diff == 2:
        score += 20
    else:
        score += 10

    return score


def _score_height(user: dict, candidate: dict) -> int:
    """Man taller = high, within 10 cm = good, large gap = lower."""
    diff = user["height_cm"] - candidate["height_cm"]

    if user["gender"] == "male":
        # Positive diff means man is taller
        if 5 <= diff <= 20:
            return 100
        elif 0 < diff < 5:
            return 90
        elif diff == 0:
            return 75
        elif -5 <= diff < 0:
            return 55
        else:
            return max(20, 100 - abs(diff) * 3)
    else:
        # Female user — reverse logic
        diff = -diff
        if 5 <= diff <= 20:
            return 100
        elif 0 < diff < 5:
            return 90
        elif diff == 0:
            return 75
        elif -5 <= diff < 0:
            return 55
        else:
            return max(20, 100 - abs(diff) * 3)


def _score_income(user: dict, candidate: dict) -> int:
    """Relative balance — similar range = good, very large gap = lower."""
    inc_u = user["income_lpa"]
    inc_c = candidate["income_lpa"]
    avg = (inc_u + inc_c) / 2 or 1
    ratio = abs(inc_u - inc_c) / avg

    if ratio <= 0.2:
        return 100  # very similar
    elif ratio <= 0.4:
        return 85
    elif ratio <= 0.6:
        return 70
    elif ratio <= 0.8:
        return 55
    elif ratio <= 1.0:
        return 40
    else:
        return max(20, int(100 - ratio * 30))


# ===================================================================
# Family & Compatibility Scoring
# ===================================================================

_FAMILY_VALUES_ORDER = ["Traditional", "Moderate", "Liberal"]
_FAMILY_STATUS_ORDER = ["Middle Class", "Upper Middle Class", "Affluent", "Rich"]


def _score_family(user: dict, candidate: dict) -> int:
    """Family background compatibility (0-100)."""
    score = 0

    # Family values alignment (max 40)
    uv = user.get("family_values", "Moderate")
    cv = candidate.get("family_values", "Moderate")
    if uv == cv:
        score += 40
    elif abs(_FAMILY_VALUES_ORDER.index(uv) - _FAMILY_VALUES_ORDER.index(cv)) == 1:
        score += 25  # adjacent (Traditional↔Moderate or Moderate↔Liberal)
    else:
        score += 10  # opposite ends

    # Family type (max 30)
    if user.get("family_type") == candidate.get("family_type"):
        score += 30
    else:
        score += 15

    # Family status proximity (max 30)
    us = _FAMILY_STATUS_ORDER.index(user.get("family_status", "Middle Class"))
    cs = _FAMILY_STATUS_ORDER.index(candidate.get("family_status", "Middle Class"))
    diff = abs(us - cs)
    if diff == 0:
        score += 30
    elif diff == 1:
        score += 20
    else:
        score += 10

    return score


def _score_compatibility(user: dict, candidate: dict) -> int:
    """Overall compatibility signals (0-100)."""
    score = 0

    # Location flexibility (max 40)
    flex = candidate.get("location_flexibility", "Same State")
    if flex in ("Anywhere in India", "Open to Abroad"):
        score += 40
    elif flex == "Same State" and _CITY_STATE.get(user["city"]) == _CITY_STATE.get(candidate["city"]):
        score += 35
    elif flex == "Same City Only" and user["city"] == candidate["city"]:
        score += 30
    else:
        score += 15

    # Children alignment (max 30)
    cu = user.get("wants_children", "Maybe")
    cc = candidate.get("wants_children", "Maybe")
    if cu == cc:
        score += 30
    elif "Maybe" in {cu, cc}:
        score += 20
    else:
        score += 5

    # Marital status alignment (max 30)
    if user.get("marital_status") == candidate.get("marital_status"):
        score += 30
    else:
        score += 15

    return score


# ===================================================================
# Match Reasons Generator
# ===================================================================

def _generate_match_reasons(user: dict, candidate: dict, breakdown: dict) -> list[str]:
    """Produce human-readable reasons explaining WHY a match is good."""
    reasons: list[str] = []

    if breakdown["values"] >= 80:
        reasons.append(
            f"Strong values alignment — both share {user['religion']} faith and similar dietary preferences"
        )
    if breakdown["location"] >= 80:
        if user["city"] == candidate["city"]:
            reasons.append(f"Both based in {user['city']} — easy to meet and connect")
    if breakdown["age"] >= 85:
        reasons.append(
            f"Great age compatibility — {abs(user['age'] - candidate['age'])} year difference"
        )
    if breakdown["professional"] >= 75:
        reasons.append(
            f"Professional synergy — {user['profession']} and {candidate['profession']} backgrounds complement well"
        )
    if breakdown["lifestyle"] >= 70:
        shared_hobbies = set(h.lower() for h in user.get("hobbies", [])) & set(
            h.lower() for h in candidate.get("hobbies", [])
        )
        if shared_hobbies:
            reasons.append(f"Shared interests in {', '.join(list(shared_hobbies)[:3])}")
    if breakdown.get("family", 0) >= 70:
        reasons.append(
            f"Compatible family values — both from {candidate.get('family_values', 'moderate').lower()} backgrounds"
        )
    if breakdown.get("compatibility", 0) >= 70:
        if user.get("wants_children") == candidate.get("wants_children"):
            reasons.append("Aligned on future plans regarding children")
    if user.get("mother_tongue") == candidate.get("mother_tongue"):
        reasons.append(f"Same mother tongue — {user['mother_tongue']}")
    if user.get("education") == candidate.get("education"):
        reasons.append(f"Similar educational background — both {user['education']}")
    if candidate.get("location_flexibility") in ("Anywhere in India", "Open to Abroad"):
        reasons.append(f"{candidate['name'].split()[0]} is open to relocation")

    # Ensure at least 2 reasons
    if len(reasons) < 2:
        reasons.append(f"Complementary personalities from {user['city']} and {candidate['city']}")
        reasons.append(
            f"Diverse professional pairing — {user['profession']} meets {candidate['profession']}"
        )

    return reasons[:5]  # Cap at 5


# ===================================================================
# Main Matching Function
# ===================================================================

# Gender-specific weights (each sums to 1.0)
_WEIGHTS_MALE_MATCHING: dict[str, float] = {
    "age": 0.15,
    "location": 0.10,
    "values": 0.20,
    "lifestyle": 0.10,
    "professional": 0.10,
    "height": 0.05,
    "income": 0.10,
    "family": 0.10,
    "compatibility": 0.10,
}

_WEIGHTS_FEMALE_MATCHING: dict[str, float] = {
    "age": 0.10,
    "location": 0.10,
    "values": 0.20,
    "lifestyle": 0.10,
    "professional": 0.15,
    "height": 0.05,
    "income": 0.05,
    "family": 0.15,
    "compatibility": 0.10,
}

_CATEGORY_LABELS: list[tuple[int, str]] = [
    (90, "Soulmate Match 💕"),
    (75, "High Potential Match ✨"),
    (60, "Good Match 👍"),
    (40, "Worth Exploring 🤔"),
    (0, "Low Match 💤"),
]


def calculate_match(
    user_profile: dict,
    candidate_profile: dict,
    filters: dict | None = None,
) -> dict:
    """
    Calculate a multi-dimensional compatibility score between two profiles.

    Parameters
    ----------
    user_profile : dict
        The logged-in user's profile.
    candidate_profile : dict
        A potential match's profile.
    filters : dict, optional
        Not used in scoring — filters are applied separately via
        ``apply_filters()``.

    Returns
    -------
    dict
        ``overall_score`` (0-100), ``category`` label, ``breakdown``
        with per-dimension scores, and ``match_reasons`` list.
    """
    breakdown = {
        "age": _score_age(user_profile, candidate_profile),
        "location": _score_location(user_profile, candidate_profile),
        "values": _score_values(user_profile, candidate_profile),
        "lifestyle": _score_lifestyle(user_profile, candidate_profile),
        "professional": _score_professional(user_profile, candidate_profile),
        "height": _score_height(user_profile, candidate_profile),
        "income": _score_income(user_profile, candidate_profile),
        "family": _score_family(user_profile, candidate_profile),
        "compatibility": _score_compatibility(user_profile, candidate_profile),
    }

    # Select gender-specific weights
    weights = (
        _WEIGHTS_MALE_MATCHING
        if user_profile.get("gender") == "male"
        else _WEIGHTS_FEMALE_MATCHING
    )

    overall = sum(
        breakdown[dim] * weight for dim, weight in weights.items()
    )
    overall_score = round(min(100, max(0, overall)))

    category = "Low Match 💤"
    for threshold, label in _CATEGORY_LABELS:
        if overall_score >= threshold:
            category = label
            break

    match_reasons = _generate_match_reasons(user_profile, candidate_profile, breakdown)

    return {
        "overall_score": overall_score,
        "category": category,
        "breakdown": breakdown,
        "match_reasons": match_reasons,
    }


# ===================================================================
# Filter Function
# ===================================================================

def apply_filters(profiles: list[dict], filters: dict) -> list[dict]:
    """
    Apply user-specified filters to a list of profiles.

    Supported filter keys
    ---------------------
    age_min, age_max       : int
    religion               : str
    diet                   : str
    city                   : str
    open_to_relocate       : str   ('Yes', 'No', 'Maybe')
    open_to_pets           : str
    wants_children         : str
    height_min, height_max : int
    smoking                : str
    drinking               : str

    Returns
    -------
    list[dict]
        Subset of profiles that pass all specified filters.
    """
    if not filters:
        return profiles

    result: list[dict] = []

    for p in profiles:
        # Age range
        if "age_min" in filters and p["age"] < int(filters["age_min"]):
            continue
        if "age_max" in filters and p["age"] > int(filters["age_max"]):
            continue

        # Height range
        if "height_min" in filters and p["height_cm"] < int(filters["height_min"]):
            continue
        if "height_max" in filters and p["height_cm"] > int(filters["height_max"]):
            continue

        # Exact match filters
        if "religion" in filters and p["religion"].lower() != filters["religion"].lower():
            continue
        if "diet" in filters and p["diet"].lower() != filters["diet"].lower():
            continue
        if "city" in filters and p["city"].lower() != filters["city"].lower():
            continue
        if "open_to_relocate" in filters and p["open_to_relocate"] != filters["open_to_relocate"]:
            continue
        if "open_to_pets" in filters and p["open_to_pets"] != filters["open_to_pets"]:
            continue
        if "wants_children" in filters and p["wants_children"] != filters["wants_children"]:
            continue
        if "smoking" in filters and p["smoking"] != filters["smoking"]:
            continue
        if "drinking" in filters and p["drinking"] != filters["drinking"]:
            continue
        if "status_tag" in filters and p.get("status_tag", "").lower() != filters["status_tag"].lower():
            continue
        if "stage" in filters and p.get("stage", "").lower() != filters["stage"].lower():
            continue

        result.append(p)

    return result
