from typing import Any, Dict, Union

from backend.repositories.influencer_repository import InfluencerRepository
from backend.repositories.repositories import CampaignRepository
from backend.services.authenticity_service import AuthenticityService
from backend.services.growth_service import GrowthService
from backend.ml import campaign_success_classifier
from backend.ml.predictor import predict_campaign_success as predict_campaign_legacy
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
        influencer = self.influencer_repo.resolve_by_id(influencer_id)

        if not campaign or not influencer:
            return {"error": "Campaign or Influencer not found"}

        profile = m.normalize_profile(influencer)
        auth_data = self.authenticity_service.calculate_authenticity(influencer_id)
        if "error" in auth_data:
            return auth_data

        growth_data = self.growth_service.predict_growth(influencer_id, "baseline")
        if growth_data.get("error"):
            return growth_data

        auth_score = int(auth_data.get("authenticity_score", 0))
        growth_score = float(
            growth_data.get("growthScore", growth_data.get("growth_score", 50))
        )

        campaign_category = campaign.get("category", "")
        inf_niche = profile.get("niche", "")
        inf_categories = profile.get("categories", [])

        if inf_niche == campaign_category:
            category_match = 100
        elif campaign_category in inf_categories:
            category_match = 85
        else:
            category_match = 45

        platforms = campaign.get("platforms") or []
        if platforms and profile.get("platform") not in platforms:
            return {
                "error": (
                    f"Creator platform {profile.get('platform')} is not in campaign "
                    f"platforms ({', '.join(platforms)})"
                )
            }

        if campaign_success_classifier.is_model_available():
            try:
                result = campaign_success_classifier.predict_campaign_success_ml(
                    campaign,
                    profile,
                    auth_score=auth_score,
                    growth_score=growth_score,
                    brand_match_score=category_match,
                    audience_quality_score=auth_data.get("audience_quality_score"),
                    fake_follower_probability=auth_data.get(
                        "fake_follower_probability"
                    ),
                )
                result["campaign_id"] = campaign_id
                result["influencer_id"] = influencer_id
                result["campaign_name"] = campaign.get("name")
                result["influencer_name"] = profile.get("name")
                result["platform"] = profile.get("platform")
                result["category"] = campaign_category
                return result
            except Exception as exc:
                return {
                    "error": f"Campaign success model failed: {exc}",
                }

        success_probability = predict_campaign_legacy(
            profile,
            growth_score=int(growth_score),
            auth_score=auth_score,
            category_match=category_match,
            audience_match=88,
        )
        return {
            "success_probability": success_probability,
            "predicted_outcome": "Success" if success_probability >= 50 else "Failure",
            "confidence": None,
            "model_version": "catalog_regressor_fallback",
            "brand_match_score": category_match,
            "source": "legacy_regressor",
            "campaign_id": campaign_id,
            "influencer_id": influencer_id,
        }
