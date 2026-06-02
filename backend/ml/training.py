"""Train and persist sklearn regressors on catalog influencers."""
from __future__ import annotations

import os
from typing import Any, Dict, List, Tuple

import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor

from backend.ml.features import FEATURE_NAMES, profile_to_feature_vector
from backend.repositories.influencer_repository import InfluencerRepository
from backend.services.authenticity_engine import generate_authenticity_report
from backend.utils import metrics as m

_DATA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "models",
)
RATEFLUENCER_MODEL_PATH = os.path.join(_DATA_DIR, "ratefluencer_gb.joblib")
CAMPAIGN_MODEL_PATH = os.path.join(_DATA_DIR, "campaign_success_rf.joblib")
MODEL_META_PATH = os.path.join(_DATA_DIR, "model_meta.joblib")


def _expert_ratefluencer_label(profile: Dict[str, Any], auth_score: int) -> float:
    """Teacher signal for master score (0–100)."""
    er = m.engagement_rate(profile)
    return float(
        m.clamp(
            0.22 * auth_score
            + 0.18 * m.audience_quality_score(profile)
            + 0.16 * m.posting_consistency_score(profile)
            + 0.14 * m.audience_reach_score(profile)
            + 0.12 * min(100.0, er * 10.0)
            + 0.10 * m.growth_anomaly_metrics(profile.get("growth") or [100])[0]
            + 0.08 * min(100.0, m.save_rate(profile))
        )
    )


def _expert_campaign_label(
    profile: Dict[str, Any], auth_score: int, growth_score: int
) -> float:
    er = m.engagement_rate(profile)
    engagement_fit = min(100.0, er * 12.0)
    niche_boost = 88.0 if profile.get("niche") else 78.0
    country = str(profile.get("country", "US"))
    audience_match = 95.0 if country in ("US", "GB", "CA", "IN") else 82.0
    return float(
        m.clamp(
            0.28 * audience_match
            + 0.22 * niche_boost
            + 0.22 * engagement_fit
            + 0.18 * growth_score
            + 0.10 * auth_score
        )
    )


def build_training_matrices(
    influencers: List[Dict[str, Any]],
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    rows_x: List[List[float]] = []
    y_rate: List[float] = []
    y_campaign: List[float] = []

    for raw in influencers:
        profile = m.normalize_profile(raw)
        report = generate_authenticity_report(profile)
        auth_score = int(report.authenticity_score)
        growth = profile.get("growth") or [100]
        if len(growth) >= 3:
            recent = growth[-3:]
            rates = [
                (recent[i] - recent[i - 1]) / recent[i - 1]
                for i in range(1, len(recent))
                if recent[i - 1] > 0
            ]
            base_rate = sum(rates) / len(rates) if rates else 0.05
        else:
            base_rate = 0.05
        growth_score = int(m.clamp(70 + base_rate * 400))

        rows_x.append(profile_to_feature_vector(profile))
        y_rate.append(_expert_ratefluencer_label(profile, auth_score))
        y_campaign.append(_expert_campaign_label(profile, auth_score, growth_score))

    return np.array(rows_x, dtype=np.float64), np.array(y_rate), np.array(y_campaign)


def train_and_save_models(force: bool = False) -> Dict[str, Any]:
    os.makedirs(_DATA_DIR, exist_ok=True)
    if (
        not force
        and os.path.isfile(RATEFLUENCER_MODEL_PATH)
        and os.path.isfile(CAMPAIGN_MODEL_PATH)
    ):
        meta = joblib.load(MODEL_META_PATH) if os.path.isfile(MODEL_META_PATH) else {}
        return {"status": "cached", **meta}

    repo = InfluencerRepository()
    influencers = repo.get_all()
    if len(influencers) < 5:
        raise RuntimeError("Not enough influencers to train ML models")

    x, y_rate, y_campaign = build_training_matrices(influencers)

    rate_model = GradientBoostingRegressor(
        n_estimators=120,
        max_depth=4,
        learning_rate=0.08,
        random_state=42,
    )
    rate_model.fit(x, y_rate)

    campaign_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=8,
        random_state=42,
        n_jobs=-1,
    )
    campaign_model.fit(x, y_campaign)

    joblib.dump(rate_model, RATEFLUENCER_MODEL_PATH)
    joblib.dump(campaign_model, CAMPAIGN_MODEL_PATH)

    meta = {
        "status": "trained",
        "samples": len(influencers),
        "features": FEATURE_NAMES,
        "ratefluencer_model": "GradientBoostingRegressor",
        "campaign_model": "RandomForestRegressor",
        "version": "1.0.0",
    }
    joblib.dump(meta, MODEL_META_PATH)
    return meta


def ensure_models_trained() -> Dict[str, Any]:
    try:
        return train_and_save_models(force=False)
    except Exception:
        return train_and_save_models(force=True)
