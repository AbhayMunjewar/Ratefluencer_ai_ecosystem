from typing import Any, Dict, Union

from backend.repositories.influencer_repository import InfluencerRepository
from backend.repositories.repositories import CampaignRepository
from backend.services.authenticity_service import AuthenticityService
from backend.services.growth_service import GrowthService
from backend.utils import metrics as m


class CampaignSuccessService:
    def __init__(
        self,
        campaign_repo: CampaignRepository,
        influencer_repo: InfluencerRepository,
        authenticity_service: AuthenticityService,
        growth_service: GrowthService,
    ) -> None:
        self.campaign_repo = campaign_repo
        self.influencer_repo = influencer_repo
        self.authenticity_service = authenticity_service
        self.growth_service = growth_service

    def predict_campaign_success(
        self, campaign_id: Union[int, str], influencer_id: Union[int, str]
    ) -> Dict[str, Any]:
        campaign = self.campaign_repo.get_by_id(campaign_id)
        influencer = self.influencer_repo.get_by_id(influencer_id)

        if not campaign or not influencer:
            return {"error": "Campaign or Influencer not found"}

        profile = m.normalize_profile(influencer)
        auth_data = self.authenticity_service.calculate_authenticity(influencer_id)
        growth_data = self.growth_service.predict_growth(influencer_id, "baseline")

        auth_score = auth_data.get("authenticity_score", 0)
        growth_score = growth_data.get("growth_score", 0)

        campaign_category = campaign.get("category", "")
        inf_niche = profile.get("niche", "")
        inf_categories = profile.get("categories", [])

        if inf_niche == campaign_category:
            category_match = 100
        elif campaign_category in inf_categories:
            category_match = 85
        else:
            category_match = 45

        target_country = campaign.get("targetCountry")
        audience_match = (
            95
            if target_country and profile.get("country") == target_country
            else 88
            if profile.get("country") in ("US", "GB", "CA")
            else 78
        )

        engagement_fit = min(100, int(m.engagement_rate(profile) * 12))

        success_probability = int(
            0.30 * audience_match
            + 0.25 * category_match
            + 0.20 * engagement_fit
            + 0.15 * growth_score
            + 0.10 * auth_score
        )
        return {"success_probability": int(m.clamp(success_probability))}
