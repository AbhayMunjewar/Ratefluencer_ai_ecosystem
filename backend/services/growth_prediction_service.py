"""
ML growth tier classification service (XGBoost).

Does not predict exact follower counts — classifies Low / Medium / High growth.
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd

from backend.ml.growth_features import (
    CATEGORICAL_FEATURES,
    NUMERIC_FEATURES,
    TIER_LABELS,
    engineer_features,
    row_from_prediction_input,
)
from backend.ml.growth_predictor import profile_to_growth_row
from backend.utils import metrics as m

logger = logging.getLogger(__name__)

MODEL_PATH = (
    Path(__file__).resolve().parents[1] / "models" / "growth_classifier.pkl"
)

TIER_SCORE_BASE: Dict[int, int] = {0: 32, 1: 58, 2: 78}

_driver_thresholds: Dict[str, float] = {
    "engagement_rate": 0.045,
    "saves_per_follower": 0.002,
    "reach_per_follower": 0.35,
    "likes_per_follower": 0.015,
    "shares_per_follower": 0.001,
    "comments_per_follower": 0.0008,
}


class GrowthPredictionService:
    def __init__(self, model_path: Path = MODEL_PATH) -> None:
        self.model_path = model_path
        self._bundle: Optional[Dict[str, Any]] = None

    def _load_bundle(self) -> Dict[str, Any]:
        if self._bundle is not None:
            return self._bundle
        if not self.model_path.is_file():
            raise FileNotFoundError(
                f"Growth classifier not found at {self.model_path}. "
                "Run: python -m backend.ml.train_growth_classifier"
            )
        self._bundle = joblib.load(self.model_path)
        logger.info("Loaded growth classifier from %s", self.model_path)
        return self._bundle

    def is_model_available(self) -> bool:
        return self.model_path.is_file()

    def _prepare_frame(self, row: Dict[str, Any]) -> pd.DataFrame:
        engineered = engineer_features(pd.DataFrame([row]))
        feature_cols = NUMERIC_FEATURES + CATEGORICAL_FEATURES
        return engineered[feature_cols]

    def _compute_growth_score(self, tier_id: int, confidence: float) -> int:
        base = TIER_SCORE_BASE.get(tier_id, 50)
        return int(m.clamp(base + confidence * 22))

    def _interpret_drivers(
        self, row: Dict[str, Any], tier_id: int
    ) -> Tuple[List[str], List[str]]:
        engineered = engineer_features(pd.DataFrame([row])).iloc[0]
        strengths: List[str] = []
        suggestions: List[str] = []

        er = float(engineered.get("engagement_rate", 0))
        if er >= _driver_thresholds["engagement_rate"]:
            strengths.append("High engagement rate")
        else:
            suggestions.append("Boost engagement with stronger hooks and replies")

        saves_pf = float(engineered.get("saves_per_follower", 0))
        if saves_pf >= _driver_thresholds["saves_per_follower"]:
            strengths.append("Strong save rate")
        else:
            suggestions.append("Increase save rate with educational or save-worthy content")

        reach_pf = float(engineered.get("reach_per_follower", 0))
        if reach_pf >= _driver_thresholds["reach_per_follower"]:
            strengths.append("Strong reach relative to audience size")
        else:
            suggestions.append("Expand reach using Reels and hashtag discovery")

        likes_pf = float(engineered.get("likes_per_follower", 0))
        if likes_pf >= _driver_thresholds["likes_per_follower"]:
            strengths.append("Solid like velocity per follower")
        else:
            suggestions.append("Improve content resonance to lift likes per follower")

        shares_pf = float(engineered.get("shares_per_follower", 0))
        if shares_pf >= _driver_thresholds["shares_per_follower"]:
            strengths.append("Healthy share rate")
        else:
            suggestions.append("Create more shareable moments and collab posts")

        if str(row.get("has_call_to_action", "0")) in ("0", "False", "false"):
            suggestions.append("Use stronger CTA content in captions")

        if int(row.get("hashtags_count", 5)) < 4:
            suggestions.append("Test additional niche hashtags for discovery")

        if int(row.get("caption_length", 100)) < 60:
            suggestions.append("Add more context in captions to drive saves and comments")

        if tier_id >= 2 and not strengths:
            strengths.append("Overall signals align with high-growth creator patterns")
        if tier_id == 0 and len(suggestions) < 3:
            suggestions.append("Increase posting frequency with consistent formats")

        return strengths[:4], list(dict.fromkeys(suggestions))[:5]

    def predict_growth_tier(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classify growth tier from post/creator metrics.

        Accepts keys like followers, likes, comments, engagement_rate, etc.
        """
        bundle = self._load_bundle()
        pipeline = bundle["pipeline"]

        row = row_from_prediction_input(payload)
        frame = self._prepare_frame(row)

        probabilities = pipeline.predict_proba(frame)[0]
        tier_id = int(np.argmax(probabilities))
        confidence = float(probabilities[tier_id])
        tier_label = TIER_LABELS.get(tier_id, "Medium Growth")

        strengths, suggestions = self._interpret_drivers(row, tier_id)
        growth_score = self._compute_growth_score(tier_id, confidence)

        return {
            "growthTier": tier_label,
            "confidence": round(confidence, 4),
            "growthScore": growth_score,
            "topFactors": strengths,
            "improvementSuggestions": suggestions,
            "tierId": tier_id,
            "probabilities": {
                TIER_LABELS[i]: round(float(probabilities[i]), 4)
                for i in sorted(TIER_LABELS)
            },
            "modelVersion": bundle.get("version"),
        }

    def predict_from_profile(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Map influencer catalog profile to classifier input."""
        row = profile_to_growth_row(profile)
        return self.predict_growth_tier(row)


_growth_prediction_service: Optional[GrowthPredictionService] = None


def get_growth_prediction_service() -> GrowthPredictionService:
    global _growth_prediction_service
    if _growth_prediction_service is None:
        _growth_prediction_service = GrowthPredictionService()
    return _growth_prediction_service


def predict_growth_tier(payload: Dict[str, Any]) -> Dict[str, Any]:
    return get_growth_prediction_service().predict_growth_tier(payload)
