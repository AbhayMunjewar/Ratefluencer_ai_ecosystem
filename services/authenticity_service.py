from typing import Any, Dict

from backend.repositories.influencer_repository import InfluencerRepository
from backend.services.authenticity_engine import generate_authenticity_report


class AuthenticityService:
    def __init__(self, influencer_repo: InfluencerRepository) -> None:
        self.influencer_repo = influencer_repo

    def get_authenticity_report(self, influencer_id: Any) -> Dict[str, Any]:
        influencer = self.influencer_repo.get_by_id(influencer_id)
        if not influencer:
            return {"error": "Influencer not found"}

        report = generate_authenticity_report(influencer)
        payload = report.to_dict()

        influencer["authenticity"] = report.authenticity_score
        influencer["engagement"] = report.engagement_rate
        influencer["risk"] = payload["risk_level"].lower()
        self.influencer_repo.save(
            {
                "id": influencer.get("id"),
                "authenticity": report.authenticity_score,
                "engagement": report.engagement_rate,
                "risk": payload["risk_level"].lower(),
            }
        )
        return payload

    def calculate_authenticity(self, influencer_id: Any) -> Dict[str, Any]:
        """POST /authenticity/analyze — backward-compatible response shape."""
        full = self.get_authenticity_report(influencer_id)
        if "error" in full:
            return full
        return {
            "authenticity_score": full["authenticity_score"],
            "engagement_rate": full["engagement_rate"],
            "risk_level": full["risk_level"],
            "fake_follower_probability": full["fake_follower_probability"],
            "engagement_pod_probability": full["engagement_pod_probability"],
            "bot_activity_probability": full["bot_activity_probability"],
            "artificial_spike_probability": full["artificial_spike_probability"],
            "engagement_quality_score": full.get("audience_quality_score"),
            "audience_quality_score": full["audience_quality_score"],
            "comment_quality_score": full.get("comment_quality_score"),
            "anomaly_score": full.get("anomaly_score"),
        }
