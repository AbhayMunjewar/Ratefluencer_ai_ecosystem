from typing import Any, Dict, List, Union

from backend.repositories.brand_repository import BrandRepository
from backend.repositories.influencer_repository import InfluencerRepository
from backend.ml.predictor import (
    get_model_meta,
    predict_campaign_success,
    predict_ratefluencer_score,
)
from backend.services.authenticity_service import AuthenticityService
from backend.services.brand_matching_service import BrandMatchingService
from backend.services.growth_service import GrowthService
from backend.services.rag_recommendation_service import RAGRecommendationService
from backend.utils import metrics as m


class RatefluencerService:
    def __init__(
        self,
        influencer_repo: InfluencerRepository,
        brand_repo: BrandRepository,
        authenticity_service: AuthenticityService,
        brand_match_service: BrandMatchingService,
        rag_service: RAGRecommendationService,
        growth_service: GrowthService,
    ) -> None:
        self.influencer_repo = influencer_repo
        self.brand_repo = brand_repo
        self.authenticity_service = authenticity_service
        self.brand_match_service = brand_match_service
        self.rag_service = rag_service
        self.growth_service = growth_service

    def calculate_master_score(self, influencer_id: Union[int, str]) -> Dict[str, Any]:
        influencer = self.influencer_repo.resolve_by_id(influencer_id)
        if not influencer:
            return {"error": "Influencer not found"}

        auth = self.authenticity_service.calculate_authenticity(influencer_id)
        if "error" in auth:
            return auth

        brand_data = self.brand_match_service.match_influencer_to_brands(influencer_id)
        if "error" in brand_data:
            return brand_data

        auth_score = auth["authenticity_score"]
        brand_match_score = brand_data["brand_match_score"]
        profile = m.normalize_profile(influencer)
        ratefluencer_score = predict_ratefluencer_score(
            profile,
            auth_score=auth_score,
            brand_match_score=brand_match_score,
        )

        recommended = brand_data.get("recommended_brands", [])
        recommended_names = [b.get("brand") for b in recommended if b.get("brand")]

        top_brand = None
        if recommended:
            top_brand = self.brand_repo.get_by_id(recommended[0].get("brand_id"))

        reasoning = self.rag_service.build_recommendation_reasoning(influencer, top_brand)

        strengths, weaknesses, recommendations = self._build_insights(
            auth, brand_data, ratefluencer_score
        )

        growth_data = self.growth_service.predict_growth(influencer_id, "baseline")
        growth_proxy = int(growth_data.get("growthScore", growth_data.get("growth_score", 70)))
        campaign_proxy = predict_campaign_success(
            profile,
            growth_score=growth_proxy,
            auth_score=auth_score,
            category_match=85,
            audience_match=90 if profile.get("country") in ("US", "GB", "IN") else 80,
        )
        meta = get_model_meta()

        influencer["aiScore"] = ratefluencer_score
        influencer["authenticity"] = auth_score
        self.influencer_repo.save(influencer)

        return {
            "authenticity": auth_score,
            "growth": growth_proxy,
            "brand_match": brand_match_score,
            "campaign_success": campaign_proxy,
            "ratefluencer_score": ratefluencer_score,
            "recommended_brands": recommended_names[:3],
            "insights": recommendations[:3],
            "strengths": strengths,
            "weaknesses": weaknesses,
            "recommendations": recommendations,
            "recommendation_reasoning": reasoning,
            "brand_match_score": brand_match_score,
            "recommended_brand_details": recommended[:5],
            "ml_model_version": meta.get("version"),
        }

    def _build_insights(
        self,
        auth: Dict[str, Any],
        brand_data: Dict[str, Any],
        score: int,
    ) -> tuple[List[str], List[str], List[str]]:
        strengths: List[str] = []
        weaknesses: List[str] = []
        recommendations: List[str] = []

        if auth["authenticity_score"] >= 85:
            strengths.append("High authenticity with low fraud probability")
        else:
            weaknesses.append("Authenticity score below premium creator threshold")
            recommendations.append("Run a 30-day audience cleanup and re-scan engagement quality")

        if auth.get("fake_follower_probability", 0) <= 15:
            strengths.append("Low purchased-follower risk profile")
        else:
            weaknesses.append("Elevated purchased-follower indicators")
            recommendations.append("Audit follower acquisition sources from recent growth spikes")

        if auth.get("engagement_pod_probability", 0) <= 10:
            strengths.append("Minimal engagement pod clustering detected")
        else:
            weaknesses.append("Engagement pod patterns detected in repeat interactors")
            recommendations.append("Shift campaign KPI weighting toward save/share depth metrics")

        if brand_data.get("brand_match_score", 0) >= 80:
            strengths.append("Strong semantic fit with priority brand verticals")
        else:
            weaknesses.append("Brand affinity score has room to improve")
            recommendations.append("Refine content pillars to align with top matched brand niches")

        top_brands = brand_data.get("recommended_brands", [])[:2]
        for brand in top_brands:
            recommendations.append(
                f"Prioritize outreach to {brand.get('brand')} ({brand.get('score')}% embedding match)"
            )

        if score >= 88:
            strengths.append("Overall Ratefluencer score indicates partnership-ready creator status")
        elif score < 72:
            recommendations.append("Improve posting consistency before high-budget campaign allocation")

        return strengths[:4], weaknesses[:4], recommendations[:5]
