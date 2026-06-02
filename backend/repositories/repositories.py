from typing import Any, Dict, List, Optional, Union

from backend.repositories.base_repository import BaseRepository
from backend.repositories.brand_repository import BrandRepository
from backend.repositories.influencer_repository import InfluencerRepository

__all__ = [
    "BaseRepository",
    "InfluencerRepository",
    "BrandRepository",
    "CampaignRepository",
    "ActivityRepository",
    "DashboardMetricsRepository",
    "LeaderboardRepository",
    "AIOutputsRepository",
    "IndustryKnowledgeRepository",
]


class CampaignRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__("campaigns.json")

    def get_all(self) -> List[Dict[str, Any]]:
        return self._load_data()

    def get_by_id(self, campaign_id: Union[int, str]) -> Optional[Dict[str, Any]]:
        for camp in self._load_data():
            if str(camp.get("id")) == str(campaign_id):
                return camp
        return None

    def create(self, campaign: Dict[str, Any]) -> Dict[str, Any]:
        campaigns = self._load_data()
        if not isinstance(campaigns, list):
            campaigns = []

        existing_ids: list[int] = []
        for camp in campaigns:
            raw = str(camp.get("id", ""))
            if raw.startswith("c") and raw[1:].isdigit():
                existing_ids.append(int(raw[1:]))
        next_num = max(existing_ids, default=0) + 1
        new_id = campaign.get("id") or f"c{next_num}"

        record = {
            "id": new_id,
            "name": campaign.get("name", "Untitled Campaign"),
            "brand": campaign.get("brand", ""),
            "status": campaign.get("status", "active"),
            "budget": int(campaign.get("budget", 0)),
            "spent": int(campaign.get("spent", 0)),
            "influencers": int(campaign.get("influencers", 0)),
            "reach": int(campaign.get("reach", 0)),
            "engagement": float(campaign.get("engagement", 0)),
            "roi": float(campaign.get("roi", 0)),
            "startDate": campaign.get("startDate", ""),
            "endDate": campaign.get("endDate", ""),
            "progress": int(campaign.get("progress", 0)),
            "platforms": campaign.get("platforms") or [],
            "category": campaign.get("category", "General"),
        }
        campaigns.append(record)
        self._save_data(campaigns)
        return record


class ActivityRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__("activityFeed.json")

    def get_all(self) -> List[Dict[str, Any]]:
        return self._load_data()

    def add_activity(self, activity: Dict[str, Any]) -> None:
        activities = self._load_data()
        max_id = 0
        for act in activities:
            try:
                max_id = max(max_id, int(act.get("id", 0)))
            except (TypeError, ValueError):
                pass
        activity["id"] = max_id + 1
        activities.insert(0, activity)
        self._save_data(activities)


class DashboardMetricsRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__("dashboardMetrics.json")

    def get_metrics(self) -> Dict[str, Any]:
        data = self._load_data()
        return data if isinstance(data, dict) else {}


class LeaderboardRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__("leaderboard.json")

    def get_all(self) -> List[Dict[str, Any]]:
        return self._load_data()


class AIOutputsRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__("aiOutputs.json")

    def get_all(self) -> List[Dict[str, Any]]:
        return self._load_data()


class IndustryKnowledgeRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__("industryKnowledge.json")

    def get_all(self) -> List[Dict[str, Any]]:
        data = self._load_data()
        return data if isinstance(data, list) else []
