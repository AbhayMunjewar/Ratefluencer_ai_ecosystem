"""Shared feature engineering for growth tier classification."""
from __future__ import annotations

from typing import Any, Dict, List, Tuple

import pandas as pd

TARGET_COLUMN = "followers_gained"
TIER_COLUMN = "growth_tier"

TIER_LABELS: Dict[int, str] = {
    0: "Low Growth",
    1: "Medium Growth",
    2: "High Growth",
}

NUMERIC_FEATURES: List[str] = [
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
    "likes_per_follower",
    "comments_per_follower",
    "shares_per_follower",
    "saves_per_follower",
    "reach_per_follower",
    "impressions_per_follower",
]

CATEGORICAL_FEATURES: List[str] = [
    "account_type",
    "content_category",
    "media_type",
    "traffic_source",
    "day_of_week",
    "has_call_to_action",
]


def normalize_column_names(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out.columns = (
        out.columns.str.strip().str.lower().str.replace(" ", "_")
    )
    return out


def assign_growth_tier(followers_gained: pd.Series) -> pd.Series:
    """0 = Low (0-99), 1 = Medium (100-499), 2 = High (500+)."""
    gained = pd.to_numeric(followers_gained, errors="coerce").fillna(0).clip(lower=0)
    tier = pd.Series(0, index=gained.index, dtype=int)
    tier[gained.between(100, 499, inclusive="both")] = 1
    tier[gained >= 500] = 2
    return tier


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add ratio features and normalize types."""
    out = df.copy()

    for col in NUMERIC_FEATURES:
        if col not in out.columns and col.endswith("_per_follower"):
            continue
        if col in out.columns:
            out[col] = pd.to_numeric(out[col], errors="coerce")

    if "follower_count" not in out.columns:
        out["follower_count"] = 1
    followers = out["follower_count"].replace(0, 1)

    ratio_map = {
        "likes_per_follower": "likes",
        "comments_per_follower": "comments",
        "shares_per_follower": "shares",
        "saves_per_follower": "saves",
        "reach_per_follower": "reach",
        "impressions_per_follower": "impressions",
    }
    for ratio_col, base_col in ratio_map.items():
        if base_col in out.columns:
            out[ratio_col] = out[base_col] / followers
        elif ratio_col not in out.columns:
            out[ratio_col] = 0.0

    if "has_call_to_action" in out.columns:
        out["has_call_to_action"] = out["has_call_to_action"].astype(str)

    if "engagement_rate" in out.columns and out["engagement_rate"].max() > 1.5:
        out["engagement_rate"] = out["engagement_rate"] / 100.0

    return out


def row_from_prediction_input(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Map API / profile dict to model feature row."""
    followers = max(1, int(payload.get("followers") or payload.get("follower_count") or 1))
    likes = float(payload.get("likes") or 0)
    comments = float(payload.get("comments") or 0)
    shares = float(payload.get("shares") or 0)
    saves = float(payload.get("saves") or 0)
    reach = float(payload.get("reach") or 0)
    impressions = float(payload.get("impressions") or max(reach, 0))

    engagement_rate = payload.get("engagement_rate")
    if engagement_rate is None:
        engagement_rate = ((likes + comments + shares + saves) / followers) * 100
    engagement_rate = float(engagement_rate)
    if engagement_rate > 1.5:
        engagement_rate /= 100.0

    row: Dict[str, Any] = {
        "follower_count": followers,
        "likes": likes,
        "comments": comments,
        "shares": shares,
        "saves": saves,
        "reach": reach,
        "impressions": impressions,
        "engagement_rate": engagement_rate,
        "caption_length": int(payload.get("caption_length") or 100),
        "hashtags_count": int(payload.get("hashtags_count") or 5),
        "post_hour": int(payload.get("post_hour") or 12),
        "account_type": str(payload.get("account_type") or "creator"),
        "content_category": str(
            payload.get("content_category") or payload.get("niche") or "Lifestyle"
        ),
        "media_type": str(payload.get("media_type") or "image"),
        "traffic_source": str(payload.get("traffic_source") or "Home Feed"),
        "day_of_week": str(payload.get("day_of_week") or "Friday"),
        "has_call_to_action": str(
            int(payload.get("has_call_to_action", 0))
            if str(payload.get("has_call_to_action", "0")).isdigit()
            else (1 if payload.get("has_call_to_action") else 0)
        ),
    }
    engineered = engineer_features(pd.DataFrame([row]))
    return engineered.iloc[0].to_dict()


def feature_matrix_columns() -> Tuple[List[str], List[str]]:
    return list(NUMERIC_FEATURES), list(CATEGORICAL_FEATURES)
