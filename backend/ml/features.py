"""Nine Ratefluencer feature inputs for supervised models."""
from __future__ import annotations

import hashlib
import re
from datetime import datetime
from typing import Any, Dict, List

from backend.utils import metrics as m

FEATURE_NAMES: List[str] = [
    "engagement_rate",
    "comment_rate",
    "share_rate",
    "save_rate",
    "audience_quality",
    "posting_consistency",
    "audience_reach",
    "growth_health",
    "authenticity_hint",
]

GROWTH_FEATURE_NAMES: List[str] = [
    "follower_count",
    "likes",
    "comments",
    "shares",
    "saves",
    "reach",
    "impressions",
    "engagement_rate",
    "caption_length",
    "hashtags_count",
    "post_hour",
    "account_type",
    "content_category",
    "media_type",
    "traffic_source",
    "day_of_week",
    "has_call_to_action",
]


def _stable_seed(value: str) -> int:
    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()
    return int(digest[:8], 16)


def _call_to_action_flag(profile: Dict[str, Any]) -> int:
    text = " ".join(
        str(part or "")
        for part in [
            profile.get("bio"),
            profile.get("name"),
            profile.get("handle"),
            profile.get("niche"),
        ]
    ).lower()
    cta_terms = ["link in bio", "subscribe", "follow", "shop", "click", "dm", "watch"]
    return int(any(term in text for term in cta_terms))


def profile_to_growth_feature_vector(profile: Dict[str, Any], scenario: str = "baseline") -> List[Any]:
    """Build the growth model input row from a normalized influencer profile."""
    normalized = m.normalize_profile(profile)
    seed = _stable_seed(str(normalized.get("id", normalized.get("handle", "unknown"))))
    followers = int(normalized.get("followers", 0))
    likes = int(normalized.get("avgLikes", 0))
    comments = int(normalized.get("avgComments", 0))
    shares = int(normalized.get("avgShares", 0))
    saves = int(normalized.get("avgSaves", 0))
    engagement = float(m.engagement_rate(normalized))
    reach = int(normalized.get("views") or max(followers, int(followers * max(1.0, engagement) / 2)))
    impressions = int(max(reach, followers * 10))
    caption_length = len(str(normalized.get("bio") or normalized.get("name") or ""))
    hashtags_count = len(normalized.get("categories") or [normalized.get("niche", "Lifestyle")])
    post_hour = 8 + (seed % 12)
    account_type = "verified_creator" if normalized.get("verified") else "creator"
    content_category = str(normalized.get("niche") or (normalized.get("categories") or ["Lifestyle"])[0])
    media_type = "video" if str(normalized.get("platform", "")).lower() in {"youtube", "tiktok"} else "image"
    traffic_source = "organic"
    day_of_week = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"][(seed + len(scenario)) % 7]

    return [
        followers,
        likes,
        comments,
        shares,
        saves,
        reach,
        impressions,
        engagement,
        caption_length,
        hashtags_count,
        post_hour,
        account_type,
        content_category,
        media_type,
        traffic_source,
        day_of_week,
        _call_to_action_flag(normalized),
    ]


def profile_to_feature_vector(profile: Dict[str, Any]) -> List[float]:
    """Build model input from a normalized influencer profile."""
    growth = profile.get("growth") or [100]
    anomaly_score, _ = m.growth_anomaly_metrics(growth)
    growth_health = float(anomaly_score)

    auth_hint = float(profile.get("authenticity", 75))
    if profile.get("aiScore"):
        auth_hint = (auth_hint + float(profile["aiScore"])) / 2.0

    return [
        float(m.engagement_rate(profile)),
        float(m.comment_rate(profile)),
        float(m.share_rate(profile)),
        float(m.save_rate(profile)),
        float(m.audience_quality_score(profile)),
        float(m.posting_consistency_score(profile)),
        float(m.audience_reach_score(profile)),
        growth_health,
        auth_hint,
    ]
