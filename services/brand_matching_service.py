from typing import Any, Dict, List, Optional, Union

from backend.repositories.brand_repository import BrandRepository
from backend.repositories.influencer_repository import InfluencerRepository
from backend.services.embedding_service import cosine_similarity, embed_text, similarity_to_score
from backend.utils import metrics as m


class BrandMatchingService:
    MODEL_NAME = "all-MiniLM-L6-v2"

    def __init__(
        self,
        brand_repo: BrandRepository,
        influencer_repo: InfluencerRepository,
    ) -> None:
        self.brand_repo = brand_repo
        self.influencer_repo = influencer_repo

    def _influencer_text(self, influencer: Dict[str, Any]) -> str:
        profile = m.normalize_profile(influencer)
        demo = profile.get("audienceDemographics", {})
        interests = ", ".join(demo.get("interests", profile.get("categories", [])))
        countries = ", ".join(demo.get("topCountries", [profile.get("country", "")]))
        return " ".join(
            [
                str(profile.get("bio", "")),
                str(profile.get("niche", "")),
                " ".join(profile.get("categories", [])),
                f"audience interests {interests}",
                f"audience countries {countries}",
                f"age {demo.get('primaryAgeRange', '')}",
            ]
        ).strip()

    def _brand_text(self, brand: Dict[str, Any]) -> str:
        return " ".join(
            [
                str(brand.get("name", "")),
                str(brand.get("industry", "")),
                str(brand.get("description", "")),
                str(brand.get("targetAudience", "")),
                " ".join(brand.get("targetNiches", [])),
                str(brand.get("campaignObjectives", "")),
            ]
        ).strip()

    def score_pair(self, influencer: Dict[str, Any], brand: Dict[str, Any]) -> int:
        inf_vec = embed_text(self._influencer_text(influencer))
        brand_vec = embed_text(self._brand_text(brand))
        similarity = cosine_similarity(inf_vec, brand_vec)

        followers = influencer.get("followers", 0)
        min_followers = brand.get("minFollowers", 0)
        follower_factor = 1.0 if followers >= min_followers else max(0.4, followers / max(1, min_followers))

        niche = influencer.get("niche", "")
        categories = influencer.get("categories", [])
        targets = brand.get("targetNiches", [])
        if niche in targets:
            niche_factor = 1.0
        elif any(c in targets for c in categories):
            niche_factor = 0.92
        else:
            niche_factor = 0.72

        base = similarity_to_score(similarity)
        return int(m.clamp(base * follower_factor * niche_factor))

    def match_brand(self, brand_id: Union[int, str]) -> Dict[str, Any]:
        brand = self.brand_repo.get_by_id(brand_id)
        if not brand:
            return {"error": "Brand not found"}

        matches: List[Dict[str, Any]] = []
        for inf in self.influencer_repo.get_all():
            score = self.score_pair(inf, brand)
            matches.append(
                {
                    "influencer": inf.get("name", inf.get("handle")),
                    "influencer_id": inf.get("id"),
                    "score": score,
                }
            )

        matches.sort(key=lambda x: x["score"], reverse=True)
        top_score = matches[0]["score"] if matches else 0

        return {
            "brand_match_score": top_score,
            "matches": matches,
            "embedding_model": self.MODEL_NAME,
        }

    def match_influencer_to_brands(self, influencer_id: Union[int, str]) -> Dict[str, Any]:
        influencer = self.influencer_repo.get_by_id(influencer_id)
        if not influencer:
            return {"error": "Influencer not found"}

        ranked: List[Dict[str, Any]] = []
        for brand in self.brand_repo.get_all():
            score = self.score_pair(influencer, brand)
            ranked.append(
                {
                    "brand_id": brand.get("id"),
                    "brand": brand.get("name"),
                    "score": score,
                    "industry": brand.get("industry"),
                }
            )

        ranked.sort(key=lambda x: x["score"], reverse=True)
        return {
            "brand_match_score": ranked[0]["score"] if ranked else 0,
            "recommended_brands": ranked[:5],
            "embedding_model": self.MODEL_NAME,
        }
