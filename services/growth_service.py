from typing import Any, Dict, List, Union

from backend.repositories.influencer_repository import InfluencerRepository
from backend.utils import metrics as m


class GrowthService:
    def __init__(self, influencer_repo: InfluencerRepository) -> None:
        self.influencer_repo = influencer_repo

    def predict_growth(
        self, influencer_id: Union[int, str], scenario: str = "baseline"
    ) -> Dict[str, Any]:
        influencer = self.influencer_repo.get_by_id(influencer_id)
        if not influencer:
            return {"error": "Influencer not found"}

        profile = m.normalize_profile(influencer)
        current_followers = profile["followers"]
        growth_history = profile.get("growth", [100])

        if len(growth_history) >= 3:
            recent = growth_history[-3:]
            rates = [
                (recent[i] - recent[i - 1]) / recent[i - 1]
                for i in range(1, len(recent))
                if recent[i - 1] > 0
            ]
            base_rate = sum(rates) / len(rates) if rates else 0.05
        else:
            base_rate = 0.05

        scenario_key = scenario.lower()
        if scenario_key in ("aggressive", "optimistic"):
            multiplier = 1.6
            growth_score_bonus = 10
        elif scenario_key == "conservative":
            multiplier = 0.5
            growth_score_bonus = -10
        else:
            multiplier = 1.0
            growth_score_bonus = 0

        months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"]
        timeline: List[Dict[str, Any]] = []
        followers_tracker = current_followers
        for month in months:
            followers_tracker = int(followers_tracker * (1 + base_rate * multiplier))
            timeline.append({"month": month, "followers": followers_tracker})

        total_growth_pct = (followers_tracker - current_followers) / max(1, current_followers)
        growth_score = int(total_growth_pct * 100 * 3) + 70 + growth_score_bonus
        growth_score = int(m.clamp(growth_score))

        return {
            "growth_score": growth_score,
            "current_followers": current_followers,
            "predicted_followers": followers_tracker,
            "timeline": timeline,
        }
