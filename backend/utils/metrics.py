"""Deterministic metric helpers derived from influencer profile fields."""
from __future__ import annotations

import hashlib
import math
import re
from typing import Any, Dict, List, Optional, Tuple


def _stable_seed(value: str) -> int:
    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()
    return int(digest[:8], 16)


def clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


def normalize_profile(influencer: Dict[str, Any]) -> Dict[str, Any]:
    """Fill missing engagement fields; prefer values already on the profile."""
    followers = max(1, int(influencer.get("followers", 1)))
    avg_likes = float(influencer.get("avgLikes", 0))
    avg_comments = float(influencer.get("avgComments", 0))
    sources: Dict[str, str] = dict(influencer.get("metricsSource") or {})

    if avg_likes <= 0 and influencer.get("engagement"):
        avg_likes = followers * (float(influencer["engagement"]) / 100.0) * 0.85
        sources.setdefault("avgLikes", "derived_from_engagement_rate")
    elif avg_likes > 0:
        sources.setdefault("avgLikes", "provided")

    if avg_comments <= 0 and avg_likes > 0:
        avg_comments = avg_likes * 0.04
        sources.setdefault("avgComments", "derived_from_likes")
    elif avg_comments > 0:
        sources.setdefault("avgComments", "provided")

    seed = _stable_seed(str(influencer.get("id", influencer.get("handle", "unknown"))))

    if influencer.get("following") is not None:
        following = int(influencer["following"])
        sources.setdefault("following", "provided")
    else:
        following = 800 + (seed % 4000)
        sources["following"] = "derived"

    if influencer.get("avgShares") is not None:
        avg_shares = float(influencer["avgShares"])
        sources.setdefault("avgShares", "provided")
    else:
        avg_shares = 0.06 * avg_likes
        sources["avgShares"] = "derived"

    if influencer.get("avgSaves") is not None:
        avg_saves = float(influencer["avgSaves"])
        sources.setdefault("avgSaves", "provided")
    else:
        avg_saves = 0.12 * avg_likes
        sources["avgSaves"] = "derived"

    if influencer.get("views") is not None:
        views = float(influencer["views"])
        sources.setdefault("views", "provided")
    else:
        views = followers * float(influencer.get("engagement", 5)) * 8
        sources["views"] = "derived"

    if influencer.get("postingFrequency") is not None or influencer.get("postsPerWeek") is not None:
        posts_per_week = float(
            influencer.get("postingFrequency") or influencer.get("postsPerWeek")
        )
        sources.setdefault("postingFrequency", "provided")
    else:
        posts_per_week = max(1.0, min(7.0, (influencer.get("campaigns", 6) or 6) / 6.0))
        sources["postingFrequency"] = "derived"

    if influencer.get("audienceDemographics"):
        demographics = influencer["audienceDemographics"]
        sources.setdefault("audienceDemographics", "provided")
    else:
        demographics = _derive_demographics(influencer, seed)
        sources["audienceDemographics"] = "derived"

    return {
        **influencer,
        "followers": followers,
        "following": following,
        "avgLikes": avg_likes,
        "avgComments": avg_comments,
        "avgShares": avg_shares,
        "avgSaves": avg_saves,
        "views": views,
        "postingFrequency": posts_per_week,
        "audienceDemographics": demographics,
        "metricsSource": sources,
    }


def _derive_demographics(influencer: Dict[str, Any], seed: int) -> Dict[str, Any]:
    niche = str(influencer.get("niche", "Lifestyle"))
    country = str(influencer.get("country", "US"))
    base_age = 22 + (seed % 12)
    return {
        "primaryAgeRange": f"{base_age}-{base_age + 9}",
        "genderSplit": {"female": 55 + (seed % 20), "male": 45 - (seed % 15)},
        "topCountries": [country, "US", "GB"][: 2 + (seed % 2)],
        "interests": list(influencer.get("categories", [niche]))[:4],
    }


def engagement_rate(profile: Dict[str, Any]) -> float:
    followers = max(1, profile["followers"])
    interactions = (
        profile["avgLikes"]
        + profile["avgComments"]
        + profile["avgShares"]
        + profile["avgSaves"]
    )
    return round((interactions / followers) * 100, 2)


def share_rate(profile: Dict[str, Any]) -> float:
    base = max(1.0, profile["avgLikes"] + profile["avgComments"])
    return round((profile["avgShares"] / base) * 100, 2)


def save_rate(profile: Dict[str, Any]) -> float:
    base = max(1.0, profile["avgLikes"])
    return round((profile["avgSaves"] / base) * 100, 2)


def comment_rate(profile: Dict[str, Any]) -> float:
    base = max(1.0, profile["avgLikes"])
    return round((profile["avgComments"] / base) * 100, 2)


def audience_quality_score(profile: Dict[str, Any]) -> int:
    followers = profile["followers"]
    following = max(1, profile["following"])
    ratio = followers / following
    er = engagement_rate(profile) / 100.0
    demo = profile.get("audienceDemographics", {})
    interest_depth = min(1.0, len(demo.get("interests", [])) / 4.0)
    raw = (min(1.0, ratio / 1500.0) * 0.35) + (min(1.0, er / 0.12) * 0.45) + (interest_depth * 0.2)
    return int(clamp(raw * 100))


def posting_consistency_score(profile: Dict[str, Any]) -> int:
    freq = profile["postingFrequency"]
    growth = profile.get("growth", [])
    stability = 1.0
    if len(growth) >= 4:
        deltas = []
        for i in range(1, len(growth)):
            prev, curr = growth[i - 1], growth[i]
            if prev > 0:
                deltas.append(abs((curr - prev) / prev))
        if deltas:
            stability = 1.0 - min(1.0, (sum(deltas) / len(deltas)) / 0.25)
    freq_score = 1.0 - abs(freq - 4.0) / 6.0
    return int(clamp((stability * 0.55 + max(0.0, freq_score) * 0.45) * 100))


def audience_reach_score(profile: Dict[str, Any]) -> int:
    er = engagement_rate(profile)
    views_per_follower = profile["views"] / max(1, profile["followers"])
    raw = (min(100, er * 10) * 0.5) + (min(100, views_per_follower * 12) * 0.5)
    return int(clamp(raw))


def build_comment_samples(profile: Dict[str, Any]) -> List[str]:
    stored = profile.get("recentComments")
    if isinstance(stored, list) and stored:
        return [str(c) for c in stored]

    seed = _stable_seed(str(profile.get("id")))
    generic_pool = [
        "Nice post!",
        "Love this 🔥",
        "Great content",
        "Amazing!",
        "Follow back",
        "Check my page",
        "So inspiring, thanks for sharing your routine",
        "Which product shade is this?",
    ]
    bot_pool = ["Nice post!", "Great content", "Amazing!", "Love this 🔥", "Nice post!"]

    auth_hint = profile.get("authenticity", 85)
    bot_ratio = clamp((100 - auth_hint) / 100.0, 0.05, 0.65)
    count = 24
    comments: List[str] = []
    for i in range(count):
        use_bot = (seed + i * 17) % 100 < int(bot_ratio * 100)
        pool = bot_pool if use_bot else generic_pool
        comments.append(pool[(seed + i) % len(pool)])
    return comments


def build_engagement_actors(profile: Dict[str, Any]) -> List[str]:
    stored = profile.get("engagementActors")
    if isinstance(stored, list) and stored:
        return [str(a) for a in stored]

    seed = _stable_seed(f"actors-{profile.get('id')}")
    actors = [f"user_{(seed + i * 31) % 10000}" for i in range(40)]
    # Inject pod cluster for lower authenticity profiles
    auth = profile.get("authenticity", 85)
    if auth < 80:
        pod_core = f"pod_user_{seed % 999}"
        for i in range(12):
            actors[i] = pod_core
    return actors


def growth_anomaly_metrics(growth: List[float]) -> Tuple[int, float]:
    """Returns anomaly score 0-100 and max spike magnitude."""
    if len(growth) < 2:
        return 100, 0.0

    rates: List[float] = []
    for i in range(1, len(growth)):
        prev, curr = growth[i - 1], growth[i]
        rates.append((curr - prev) / prev if prev > 0 else 0.0)

    avg_rate = sum(rates) / len(rates) if rates else 0.0
    max_spike = max(rates) if rates else 0.0
    anomaly_score = 100
    for rate in rates:
        if rate > 0.35 and rate > 2.5 * max(avg_rate, 0.01):
            anomaly_score -= 22
        elif rate > 0.55:
            anomaly_score -= 30
    return int(clamp(anomaly_score)), max_spike


def risk_level_from_score(score: int) -> str:
    if score >= 85:
        return "Low"
    if score >= 70:
        return "Medium"
    return "High"
