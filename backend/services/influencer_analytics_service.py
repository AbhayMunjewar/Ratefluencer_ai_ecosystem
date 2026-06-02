from typing import Any, Dict

from backend.repositories.influencer_repository import InfluencerRepository
from backend.utils import metrics as m


class InfluencerAnalyticsService:
    def __init__(self, influencer_repo: InfluencerRepository) -> None:
        self.influencer_repo = influencer_repo

    def analyze_profile(self, influencer_id: Any) -> Dict[str, Any]:
        influencer = self.influencer_repo.resolve_by_id(influencer_id)
        if not influencer:
            return {"error": "Influencer not found"}

        profile = m.normalize_profile(influencer)
        analytics = {
            "influencer_id": profile.get("id"),
            "handle": profile.get("handle"),
            "followers": profile["followers"],
            "following": profile["following"],
            "likes": int(profile["avgLikes"]),
            "comments": int(profile["avgComments"]),
            "shares": int(profile["avgShares"]),
            "saves": int(profile["avgSaves"]),
            "views": int(profile["views"]),
            "posting_frequency_per_week": round(profile["postingFrequency"], 2),
            "audience_demographics": profile["audienceDemographics"],
            "engagement_rate": m.engagement_rate(profile),
            "share_rate": m.share_rate(profile),
            "save_rate": m.save_rate(profile),
            "comment_rate": m.comment_rate(profile),
            "audience_quality": m.audience_quality_score(profile),
            "posting_consistency": m.posting_consistency_score(profile),
            "audience_reach_score": m.audience_reach_score(profile),
            "metrics_source": profile.get("metricsSource", {}),
        }
        return analytics
