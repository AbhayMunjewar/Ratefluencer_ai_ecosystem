"""Load trained models and produce scores."""
from __future__ import annotations

from typing import Any, Dict, Optional

import joblib

from backend.ml.features import profile_to_feature_vector
from backend.ml.training import (
    CAMPAIGN_MODEL_PATH,
    MODEL_META_PATH,
    RATEFLUENCER_MODEL_PATH,
    ensure_models_trained,
)
from backend.utils import metrics as m

_rate_model = None
_campaign_model = None
_meta: Optional[Dict[str, Any]] = None


def _load_models() -> None:
    global _rate_model, _campaign_model, _meta
    if _rate_model is not None and _campaign_model is not None:
        return
    ensure_models_trained()
    _rate_model = joblib.load(RATEFLUENCER_MODEL_PATH)
    _campaign_model = joblib.load(CAMPAIGN_MODEL_PATH)
    if __import__("os").path.isfile(MODEL_META_PATH):
        _meta = joblib.load(MODEL_META_PATH)


def get_model_meta() -> Dict[str, Any]:
    _load_models()
    return dict(_meta or {})


def predict_ratefluencer_score(
    profile: Dict[str, Any],
    *,
    auth_score: int,
    brand_match_score: int,
) -> int:
    """Blend ML prediction with authenticity + brand fit."""
    _load_models()
    features = profile_to_feature_vector(profile)
    ml_score = float(_rate_model.predict([features])[0])
    formula = 0.50 * auth_score + 0.50 * brand_match_score
    blended = 0.55 * ml_score + 0.45 * formula
    return int(m.clamp(blended))


def predict_campaign_success(
    profile: Dict[str, Any],
    *,
    growth_score: int,
    auth_score: int,
    category_match: int = 80,
    audience_match: int = 85,
) -> int:
    _load_models()
    features = profile_to_feature_vector(profile)
    ml_score = float(_campaign_model.predict([features])[0])
    heuristic = int(
        m.clamp(
            0.25 * audience_match
            + 0.25 * category_match
            + 0.20 * min(100, int(m.engagement_rate(profile) * 12))
            + 0.18 * growth_score
            + 0.12 * auth_score
        )
    )
    blended = 0.60 * ml_score + 0.40 * heuristic
    return int(m.clamp(blended))
