"""Inference helpers for the trained growth model."""
from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Any, Dict, Optional

import joblib
import pandas as pd

from backend.utils import metrics as m

GROWTH_MODEL_PATH = Path(__file__).resolve().parents[1] / "models" / "growth_model.pkl"

_growth_model = None


def _stable_seed(value: str) -> int:
    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()
    return int(digest[:8], 16)


def _load_growth_model():
    global _growth_model
    if _growth_model is not None:
        return _growth_model
    if not GROWTH_MODEL_PATH.is_file():
        return None
    _growth_model = joblib.load(GROWTH_MODEL_PATH)
    return _growth_model


def _has_call_to_action(text: str) -> int:
    lowered = text.lower()
    keywords = [
        "subscribe",
        "follow",
        "shop",
        "link",
        "learn",
        "join",
        "dm",
        "click",
        "buy",
        "watch",
    ]
    return int(any(keyword in lowered for keyword in keywords))


def profile_to_growth_row(profile: Dict[str, Any]) -> Dict[str, Any]:
    normalized = m.normalize_profile(profile)
    seed_value = str(
        normalized.get("id")
        or normalized.get("handle")
        or normalized.get("name")
        or "growth"
    )
    seed = _stable_seed(seed_value)
    platform = str(normalized.get("platform") or "Instagram")
    niche = str(normalized.get("niche") or (normalized.get("categories") or ["Lifestyle"])[0])
    bio = str(normalized.get("bio") or normalized.get("description") or "")
    categories = normalized.get("categories") or [niche]

    followers = int(normalized.get("followers") or 0)
    likes = int(round(float(normalized.get("avgLikes") or 0)))
    comments = int(round(float(normalized.get("avgComments") or 0)))
    shares = int(round(float(normalized.get("avgShares") or 0)))
    saves = int(round(float(normalized.get("avgSaves") or 0)))
    engagement_rate = float(m.engagement_rate(normalized))

    reach = int(
        max(
            normalized.get("views") or 0,
            followers * max(1.0, engagement_rate / 8.0),
        )
    )
    impressions = int(max(reach, (normalized.get("views") or 0) * 1.15))
    caption_length = max(20, len(bio.strip()) or len(str(normalized.get("name") or "")) * 2)
    hashtags_count = max(1, min(25, bio.count("#") + len(categories)))
    post_hour = seed % 24
    day_of_week = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"][seed % 7]
    account_type = "business" if normalized.get("verified") else "creator"
    content_category = niche
    media_type = "video" if platform in ("YouTube", "TikTok") else "image"
    traffic_source = "organic"

    return {
        "follower_count": followers,
        "likes": likes,
        "comments": comments,
        "shares": shares,
        "saves": saves,
        "reach": reach,
        "impressions": impressions,
        "engagement_rate": engagement_rate,
        "caption_length": caption_length,
        "hashtags_count": hashtags_count,
        "post_hour": post_hour,
        "account_type": account_type,
        "content_category": content_category,
        "media_type": media_type,
        "traffic_source": traffic_source,
        "day_of_week": day_of_week,
        "has_call_to_action": _has_call_to_action(bio),
    }


def predict_growth_gain(profile: Dict[str, Any]) -> Dict[str, Any]:
    model = _load_growth_model()
    if model is None:
        return {"predicted_gain": None, "source": "missing_model"}

    row = profile_to_growth_row(profile)
    prediction = float(model.predict(pd.DataFrame([row]))[0])
    return {
        "predicted_gain": max(0.0, prediction),
        "source": "growth_model",
        "features": row,
    }