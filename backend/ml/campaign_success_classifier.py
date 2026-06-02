"""Load CSV-trained campaign success classifier and score campaign + influencer pairs."""
from __future__ import annotations

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib
import pandas as pd

from backend.utils import metrics as m

logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = BACKEND_DIR / "models" / "campaign_success_classifier.pkl"
META_PATH = BACKEND_DIR / "models" / "campaign_success_meta.json"

_bundle: Optional[Dict[str, Any]] = None
_meta: Optional[Dict[str, Any]] = None

CAMPAIGN_TYPE_BY_PLATFORM = {
    "Instagram": "Reel/Short Video",
    "TikTok": "Reel/Short Video",
    "YouTube": "Product Review",
}


def is_model_available() -> bool:
    return MODEL_PATH.is_file()


def _load() -> Tuple[Any, Dict[str, Any]]:
    global _bundle, _meta
    if _bundle is not None and _meta is not None:
        return _bundle["pipeline"], _meta
    if not MODEL_PATH.is_file():
        raise FileNotFoundError(
            f"Campaign success classifier not found at {MODEL_PATH}. "
            "Run: python -m backend.ml.success_campaign"
        )
    loaded = joblib.load(MODEL_PATH)
    if isinstance(loaded, dict) and "pipeline" in loaded:
        pipeline = loaded["pipeline"]
    else:
        pipeline = loaded
    _bundle = {"pipeline": pipeline}
    _meta = {}
    if META_PATH.is_file():
        with open(META_PATH, encoding="utf-8") as f:
            _meta = json.load(f)
    return pipeline, _meta


def _follower_growth_tier(followers: int) -> str:
    if followers >= 1_000_000:
        return "Mega"
    if followers >= 500_000:
        return "Macro"
    if followers >= 100_000:
        return "Mid-Tier"
    if followers >= 10_000:
        return "Micro"
    return "Nano"


def _campaign_duration_days(campaign: Dict[str, Any]) -> int:
    start = campaign.get("startDate")
    end = campaign.get("endDate")
    if not start or not end:
        return 30
    try:
        d0 = datetime.fromisoformat(str(start)[:10])
        d1 = datetime.fromisoformat(str(end)[:10])
        return max(1, (d1 - d0).days)
    except ValueError:
        return 30


def _resolve_platform(campaign: Dict[str, Any], profile: Dict[str, Any]) -> str:
    inf_platform = str(profile.get("platform", "Instagram"))
    platforms = campaign.get("platforms") or []
    if inf_platform in platforms:
        return inf_platform
    if platforms:
        first = str(platforms[0])
        if first == "Twitter/X":
            return "Instagram"
        return first
    return inf_platform


def build_feature_row(
    campaign: Dict[str, Any],
    profile: Dict[str, Any],
    *,
    auth_score: int,
    growth_score: float,
    brand_match_score: float,
    audience_quality_score: Optional[float] = None,
    fake_follower_probability: Optional[float] = None,
) -> Dict[str, Any]:
    """Build a feature dict aligned with campaign_success_dataset columns."""
    normalized = m.normalize_profile(profile)
    followers = max(1, int(normalized.get("followers", 1)))
    engagement_pct = float(normalized.get("engagement") or m.engagement_rate(normalized))
    engagement_rate = engagement_pct / 100.0

    avg_likes = float(normalized.get("avgLikes", 0))
    avg_comments = float(normalized.get("avgComments", 0))
    avg_shares = float(normalized.get("avgShares", 0))
    avg_saves = float(normalized.get("avgSaves", 0))

    reach = followers * 0.15
    impressions = reach * 1.2

    if audience_quality_score is None:
        audience_quality_score = float(m.audience_quality_score(normalized))
    if fake_follower_probability is None:
        fake_follower_probability = 0.08
    else:
        fake_follower_probability = float(fake_follower_probability)
        if fake_follower_probability > 1.0:
            fake_follower_probability /= 100.0

    platform = _resolve_platform(campaign, normalized)
    campaign_category = str(campaign.get("category") or normalized.get("niche") or "Lifestyle")
    brand_match = float(brand_match_score)
    if brand_match > 1.0:
        brand_match /= 100.0

    sponsored = max(1, int(campaign.get("influencers", 1) or 1) // 2)

    return {
        "platform": platform,
        "category": str(normalized.get("niche") or campaign_category),
        "country": str(normalized.get("country") or "US"),
        "followers": float(followers),
        "engagement_rate": engagement_rate,
        "avg_likes": avg_likes,
        "avg_comments": avg_comments,
        "avg_shares": avg_shares,
        "avg_saves": avg_saves,
        "reach": reach,
        "impressions": impressions,
        "audience_quality_score": float(audience_quality_score),
        "brand_industry": campaign_category,
        "brand_match_score": brand_match,
        "campaign_type": CAMPAIGN_TYPE_BY_PLATFORM.get(platform, "Brand Ambassador"),
        "campaign_duration_days": float(_campaign_duration_days(campaign)),
        "sponsored_post_count": float(sponsored),
        "estimated_campaign_budget": float(campaign.get("budget") or 50000),
        "growth_tier": _follower_growth_tier(followers),
        "growth_score": float(growth_score),
        "authenticity_score": float(auth_score),
        "fake_follower_probability": fake_follower_probability,
    }


def _explain_factors(row: Dict[str, Any], brand_match_pct: int) -> List[str]:
    factors: List[str] = []
    if row["brand_match_score"] >= 0.85:
        factors.append("Strong brand–creator category alignment")
    if row["authenticity_score"] >= 80:
        factors.append("High authenticity score")
    if row["engagement_rate"] >= 0.05:
        factors.append("Above-average engagement rate")
    if row["growth_score"] >= 55:
        factors.append("Positive growth momentum")
    if row["fake_follower_probability"] <= 0.06:
        factors.append("Low fake-follower risk")
    if not factors:
        factors.append(f"Brand match score {brand_match_pct}%")
    return factors[:4]


def predict_campaign_success_ml(
    campaign: Dict[str, Any],
    profile: Dict[str, Any],
    *,
    auth_score: int,
    growth_score: float,
    brand_match_score: int,
    audience_quality_score: Optional[float] = None,
    fake_follower_probability: Optional[float] = None,
) -> Dict[str, Any]:
    pipeline, meta = _load()
    feature_cols: List[str] = meta.get("feature_cols") or list(
        build_feature_row(
            campaign,
            profile,
            auth_score=auth_score,
            growth_score=growth_score,
            brand_match_score=brand_match_score,
        ).keys()
    )

    row = build_feature_row(
        campaign,
        profile,
        auth_score=auth_score,
        growth_score=growth_score,
        brand_match_score=brand_match_score,
        audience_quality_score=audience_quality_score,
        fake_follower_probability=fake_follower_probability,
    )
    frame = pd.DataFrame([row])[feature_cols]

    proba = pipeline.predict_proba(frame)[0]
    class_idx = int(proba.argmax())
    confidence = float(proba[class_idx])
    predicted_class = int(pipeline.classes_[class_idx])
    predicted_outcome = "Success" if predicted_class == 1 else "Failure"
    success_probability = int(round(proba[1] * 100))

    metrics = meta.get("metrics") or {}
    return {
        "success_probability": success_probability,
        "predicted_outcome": predicted_outcome,
        "confidence": round(confidence, 4),
        "probability_success": round(float(proba[1]), 4),
        "probability_failure": round(float(proba[0]), 4),
        "model_version": meta.get("version", "campaign_success_classifier"),
        "model_metrics": metrics,
        "brand_match_score": brand_match_score,
        "top_factors": _explain_factors(row, brand_match_score),
        "source": "csv_classifier",
    }
