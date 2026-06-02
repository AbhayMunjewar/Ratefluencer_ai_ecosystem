from __future__ import annotations

from typing import Any, Dict, List, Tuple, Union

from backend.repositories.brand_repository import BrandRepository
from backend.repositories.influencer_repository import InfluencerRepository
from backend.services.embedding_service import (
    cosine_similarity,
    embed_text,
    similarity_to_score,
)
from backend.utils import metrics as m


class BrandMatchingService:
    """Hybrid (semantic + heuristic) Brand Matching Engine.

    - No ML training.
    - Brand embeddings are precomputed and cached in memory.
    - Semantic similarity is primary (80%), heuristics secondary (20%).

    Backward compatibility:
    - `score_pair()` still returns an int 0-100.
    - `match_brand()` keeps the existing output structure used by tests.
    - `match_influencer_to_brands()` keeps existing keys used by Ratefluencer.
    """

    MODEL_NAME = "all-MiniLM-L6-v2"

    # weights per task
    SEMANTIC_WEIGHT = 0.80
    HEURISTIC_WEIGHT = 0.20

    def __init__(
        self,
        brand_repo: BrandRepository,
        influencer_repo: InfluencerRepository,
    ) -> None:
        self.brand_repo = brand_repo
        self.influencer_repo = influencer_repo

        self._brands: List[Dict[str, Any]] = self.brand_repo.get_all()
        self._brand_embeddings: Dict[str, List[float]] = {}
        self._brand_texts: Dict[str, str] = {}

        # Precompute brand embeddings once (optimization requirement)
        for brand in self._brands:
            bid = str(brand.get("id"))
            text = self._brand_text(brand)
            self._brand_texts[bid] = text
            self._brand_embeddings[bid] = embed_text(text)

    # ------------------------- text building -------------------------
    def _influencer_text(self, influencer: Dict[str, Any]) -> str:
        # Spec: "{bio} {category} {niche}"
        profile = m.normalize_profile(influencer)
        bio = str(profile.get("bio", "") or "").strip()
        category = " ".join(profile.get("categories", []) or [])
        niche = str(profile.get("niche", "") or "").strip()
        return " ".join([bio, str(category).strip(), niche]).strip()

    def _brand_text(self, brand: Dict[str, Any]) -> str:
        # Spec: "{industry} {description} {target_audience}"
        industry = str(brand.get("industry", "") or "").strip()
        description = str(brand.get("description", "") or "").strip()
        target_audience = str(brand.get("targetAudience", "") or "").strip()
        return " ".join([industry, description, target_audience]).strip()

    # ------------------------- heuristics helpers -------------------------
    @staticmethod
    def _tokenize_keywords(s: str) -> List[str]:
        s = (s or "").lower()
        # reuse regex tokenization from embed fallback
        import re
        return re.findall(r"[a-z0-9]+", s)


    def _engagement_quality_score(self, influencer: Dict[str, Any]) -> int:
        """Engagement quality bucket per spec using engagement_rate.

        Spec thresholds:
        >5% => 100
        3%-5% => 80
        1%-3% => 60
        <1% => 30
        """
        profile = m.normalize_profile(influencer)
        er = influencer.get("engagement_rate")
        if er is None:
            er = profile.get("engagement")
        # fallback to derived ER using metrics fields if available
        if er is None:
            er = m.engagement_rate(profile)
            # engagement_rate() already returns percent
        try:
            er_val = float(er)
        except Exception:
            er_val = 0.0

        # If er_val looks like 0..1, convert to percent
        if 0 <= er_val <= 1.0:
            er_val *= 100.0

        if er_val > 5.0:
            return 100
        if 3.0 <= er_val <= 5.0:
            return 80
        if 1.0 <= er_val < 3.0:
            return 60
        return 30

    def _niche_match_score(self, influencer: Dict[str, Any], brand: Dict[str, Any]) -> int:
        """Niche match per task mapping.

        Uses:
        - influencer.niche
        - influencer.categories (if provided)
        - brand.targetNiches
        """
        targets = [str(t).strip() for t in (brand.get("targetNiches") or []) if str(t).strip()]
        if not targets:
            # fallback: use brand.industry as a target niche token
            industry = str(brand.get("industry", "") or "").strip()
            targets = [industry] if industry else []

        niche = str(influencer.get("niche", "") or "").strip()
        categories = [str(c).strip() for c in (influencer.get("categories") or []) if str(c).strip()]

        if niche and niche in targets:
            return 100

        if niche:
            # related match heuristic: same keyword appears
            if any(niche.lower() in t.lower() or t.lower() in niche.lower() for t in targets):
                return 70

        if categories:
            # exact category match
            for c in categories:
                if c in targets:
                    return 70
            # weak match
            for c in categories:
                if any(c.lower() in t.lower() or t.lower() in c.lower() for t in targets):
                    return 30

        return 30

    def _audience_match_score(self, influencer: Dict[str, Any], brand: Dict[str, Any]) -> int:
        """Audience match (secondary heuristic).

        Spec says compare influencer audience vs brand target audience.
        We approximate by keyword overlap between:
        - influencer audienceDemographics.interests (from normalize_profile)
        - influencer categories
        - brand targetAudience / targetNiches
        """
        profile = m.normalize_profile(influencer)
        interests = profile.get("audienceDemographics", {}).get("interests", []) or []
        categories = profile.get("categories", []) or []
        influencer_text = " ".join([" ".join(interests), " ".join(categories), str(profile.get("country", ""))])

        target_audience = str(brand.get("targetAudience", "") or "")
        target_niches = " ".join(brand.get("targetNiches", []) or [])
        brand_text = " ".join([target_audience, target_niches])

        # Keyword overlap score (deterministic regex tokenization)
        import re
        a = set(re.findall(r"[a-z0-9]+", influencer_text.lower()))
        b = set(re.findall(r"[a-z0-9]+", brand_text.lower()))
        if not a or not b:
            return 50
        overlap = len(a & b)
        denom = max(1, min(len(a), len(b)))
        ratio = overlap / denom
        return int(m.clamp(30 + ratio * 70))

    def _geography_match_score(self, influencer: Dict[str, Any], brand: Dict[str, Any]) -> int:
        """Geography: use influencer.country when brand is global.

        brands.json doesn't contain explicit region. Treat as global -> 100.
        If targetAudience mentions a country/region keyword, we boost.
        """
        inf_country = str(influencer.get("country", "") or "").strip()
        if not inf_country:
            return 70

        target_audience = str(brand.get("targetAudience", "") or "").lower()
        if inf_country.lower() in target_audience:
            return 100

        # Soft assumption for missing region: treat as global
        return 100

    def _platform_match_score(self, influencer: Dict[str, Any], brand: Dict[str, Any]) -> int:
        """Platform compatibility.

        Spec provides example mapping; repo doesn't encode brand->platform.
        We approximate via overlap between influencer.platform and brand.targetNiches/industry.
        """
        platform = str(influencer.get("platform", "") or "").lower()
        if not platform:
            return 70

        # rough platform keywords
        platform_keywords = {
            "instagram": ["fashion", "beauty", "lifestyle"],
            "tiktok": ["fashion", "beauty", "entertainment"],
            "youtube": ["technology", "education", "gaming", "entertainment"],
        }.get(platform, [])

        brand_text = " ".join(
            [
                str(brand.get("industry", "") or ""),
                str(brand.get("description", "") or ""),
                " ".join(brand.get("targetNiches", []) or []),
            ]
        ).lower()

        if not platform_keywords:
            return 70

        hits = sum(1 for k in platform_keywords if k in brand_text)
        if hits >= 2:
            return 100
        if hits == 1:
            return 80
        return 60

    # ------------------------- scoring -------------------------
    def score_pair(self, influencer: Dict[str, Any], brand: Dict[str, Any]) -> int:
        """Return final match score 0-100 for (influencer, brand)."""
        semantic, heuristic, final, _reasons, _confidence = self._score_pair_detailed(influencer, brand)
        return int(final)

    def _score_pair_detailed(
        self, influencer: Dict[str, Any], brand: Dict[str, Any]
    ) -> Tuple[float, float, float, List[str]]:
        bid = str(brand.get("id"))
        brand_vec = self._brand_embeddings.get(bid)
        if brand_vec is None:
            # fallback: shouldn't happen
            brand_vec = embed_text(self._brand_text(brand))

        inf_vec = embed_text(self._influencer_text(influencer))
        similarity = cosine_similarity(inf_vec, brand_vec)
        semantic_score = similarity_to_score(similarity)  # 0-100

        niche_score = self._niche_match_score(influencer, brand)
        audience_score = self._audience_match_score(influencer, brand)
        geo_score = self._geography_match_score(influencer, brand)
        platform_score = self._platform_match_score(influencer, brand)
        engagement_score = self._engagement_quality_score(influencer)

        # Heuristic weights per task
        heuristic_score = (
            niche_score * 0.40
            + audience_score * 0.25
            + geo_score * 0.10
            + platform_score * 0.10
            + engagement_score * 0.15
        )

        final_score = semantic_score * self.SEMANTIC_WEIGHT + heuristic_score * self.HEURISTIC_WEIGHT
        final_score = float(m.clamp(final_score, 0.0, 100.0))


        reasons: List[str] = []
        if niche_score >= 90:
            reasons.append("Strong niche alignment")
        elif niche_score >= 70:
            reasons.append("Good niche alignment")
        else:
            reasons.append("Niche fit is moderate")

        if audience_score >= 80:
            reasons.append("High audience overlap")
        elif audience_score >= 60:
            reasons.append("Some audience overlap")
        else:
            reasons.append("Limited audience overlap")

        if geo_score >= 100:
            reasons.append("Geography aligned/global")
        else:
            reasons.append("Geography is a potential constraint")

        if platform_score >= 80:
            reasons.append("Platform compatibility looks good")
        else:
            reasons.append("Platform fit could improve")

        if engagement_score >= 90:
            reasons.append("Excellent engagement quality")
        elif engagement_score >= 60:
            reasons.append("Solid engagement quality")
        else:
            reasons.append("Engagement quality is lower")

        # Confidence: agreement between semantic and heuristic, normalized
        confidence = (
            (semantic_score / 100.0) * 0.7
            + (heuristic_score / 100.0) * 0.3
        )
        confidence = float(m.clamp(confidence * 1.0, 0.0, 1.0))

        return (semantic_score, heuristic_score, final_score, reasons, confidence)

    def match_brand(self, brand_id: Union[int, str]) -> Dict[str, Any]:
        brand = self.brand_repo.get_by_id(brand_id)
        if not brand:
            return {"error": "Brand not found"}

        matches: List[Dict[str, Any]] = []
        for inf in self.influencer_repo.get_all():
            score = self.score_pair(inf, brand)
            # Keep existing schema expected by tests.
            matches.append(
                {
                    "influencer": inf.get("name") or inf.get("handle") or str(inf.get("id", "Unknown")),
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
        influencer = self.influencer_repo.resolve_by_id(influencer_id)
        if not influencer:
            return {"error": "Influencer not found"}

        ranked: List[Dict[str, Any]] = []
        for brand in self._brands:
            semantic, heuristic, final, reasons, confidence = self._score_pair_detailed(
                influencer, brand
            )
            ranked.append(
                {
                    "brand_id": brand.get("id"),
                    "brand": brand.get("name"),
                    "score": int(final),
                    "industry": brand.get("industry"),
                    # extra explainability fields (non-breaking)
                    "confidence": confidence,
                    "matchExplanation": reasons[:5],
                    "semantic_score": int(semantic),
                    "heuristic_score": int(heuristic),
                }
            )

        ranked.sort(key=lambda x: x["score"], reverse=True)
        return {
            "brand_match_score": ranked[0]["score"] if ranked else 0,
            "recommended_brands": ranked[:5],
            "embedding_model": self.MODEL_NAME,
        }

