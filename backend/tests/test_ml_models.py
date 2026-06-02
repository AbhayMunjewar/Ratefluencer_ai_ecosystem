"""Trained ML model smoke tests."""
from backend.ml.predictor import get_model_meta, predict_ratefluencer_score
from backend.ml.training import train_and_save_models
from backend.utils import metrics as m


def test_models_train_and_predict():
    meta = train_and_save_models(force=True)
    assert meta["status"] == "trained"
    assert meta["samples"] >= 5

    profile = m.normalize_profile(
        {
            "id": "test_ml",
            "followers": 500_000,
            "avgLikes": 25_000,
            "avgComments": 800,
            "engagement": 5.2,
            "authenticity": 82,
            "growth": [100, 108, 115, 122],
        }
    )
    score = predict_ratefluencer_score(profile, auth_score=82, brand_match_score=78)
    assert 0 <= score <= 100
    assert get_model_meta().get("version")
