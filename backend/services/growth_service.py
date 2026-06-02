from __future__ import annotations

from typing import Any, Dict, Optional, Union

from backend.repositories.influencer_repository import InfluencerRepository
from backend.services.growth_prediction_service import get_growth_prediction_service
from backend.utils import metrics as m


class GrowthService:
    """Facade for ML growth tier classification (no follower count forecasting)."""

    def __init__(self, influencer_repo: InfluencerRepository) -> None:
        self.influencer_repo = influencer_repo
        self.prediction_service = get_growth_prediction_service()

    def predict_growth(
        self,
        influencer_id: Union[int, str, None] = None,
        scenario: str = "baseline",
        features: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        del scenario  # legacy param; tier model does not use scenarios

        if features:
            try:
                return self.prediction_service.predict_growth_tier(features)
            except FileNotFoundError as exc:
                return {"error": str(exc)}

        if influencer_id is None:
            return {"error": "influencer_id or feature payload is required"}

        influencer = self.influencer_repo.resolve_by_id(influencer_id)
        if not influencer:
            return {"error": "Influencer not found"}

        profile = m.normalize_profile(influencer)
        try:
            result = self.prediction_service.predict_from_profile(profile)
            result["influencer_id"] = influencer_id
            result["current_followers"] = profile.get("followers")
            return result
        except FileNotFoundError as exc:
            return {"error": str(exc)}
