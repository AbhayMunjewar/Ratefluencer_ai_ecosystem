from __future__ import annotations

import os
from typing import Any, Dict, List, Optional, Union

from backend.repositories.base_repository import BaseRepository
from backend.config import get_youtube_api_key
from backend.services.dataset_loader import load_dataset_influencers
from backend.services.youtube_influencer_store import load_youtube_influencers
from backend.services.youtube_ingestion_service import YouTubeIngestionService


class InfluencerRepository(BaseRepository):
    """Instagram + TikTok from dataset CSV; YouTube from API cache JSON."""

    def __init__(self) -> None:
        super().__init__("influencer_overrides.json")

    def get_all(self) -> List[Dict[str, Any]]:
        dataset_rows = load_dataset_influencers()
        youtube_rows = load_youtube_influencers()
        overrides = self._load_overrides()
        return self._merge_lists(dataset_rows + youtube_rows, overrides)

    def get_by_id(self, influencer_id: Union[int, str]) -> Optional[Dict[str, Any]]:
        sid = str(influencer_id)
        if sid.startswith("yt_search_"):
            return self.resolve_by_id(influencer_id)
        for inf in self.get_all():
            if str(inf.get("id")) == sid:
                return inf
        return None

    def resolve_by_id(self, influencer_id: Union[int, str]) -> Optional[Dict[str, Any]]:
        """Catalog lookup plus live YouTube search IDs (yt_search_{channelId})."""
        sid = str(influencer_id)
        if sid.startswith("yt_search_"):
            channel_id = sid.removeprefix("yt_search_")
            if not channel_id:
                return None

            service = YouTubeIngestionService()
            profile = service.fetch_channel_profile(channel_id)
            if "error" in profile:
                overrides = self._load_overrides()
                for ovr in overrides:
                    if str(ovr.get("id")) == sid:
                        found = dict(ovr)
                        found.setdefault("platform", "YouTube")
                        found.setdefault("niche", "Entertainment")
                        found.setdefault("categories", ["YouTube"])
                        found.setdefault("risk", "medium")
                        found.setdefault("authenticity", 75)
                        found.setdefault("growth", [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155])
                        found.setdefault("campaigns", 0)
                        return found
                return None

            profile["id"] = sid
            profile.setdefault("platform", "YouTube")
            profile.setdefault("niche", "Entertainment")
            profile.setdefault("categories", ["YouTube"])
            profile.setdefault("risk", "medium")
            profile.setdefault("authenticity", 75)
            profile.setdefault("aiScore", min(99, 60 + int(profile.get("engagement", 0) * 3)))
            profile.setdefault(
                "growth", [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155]
            )
            profile.setdefault("campaigns", 0)

            overrides = self._load_overrides()
            for ovr in overrides:
                if str(ovr.get("id")) == sid:
                    profile.update(ovr)
                    break
            return profile

        found = self.get_by_id(influencer_id)
        if found:
            return found
        return None

    def get_by_platform(self, platform: str) -> List[Dict[str, Any]]:
        plat = platform.lower()
        return [i for i in self.get_all() if (i.get("platform") or "").lower() == plat]

    def save(self, influencer: Dict[str, Any]) -> None:
        """Persist score updates (authenticity scans) without mutating CSV source data."""
        overrides = self._load_overrides()
        updated = False
        for idx, inf in enumerate(overrides):
            if str(inf.get("id")) == str(influencer.get("id")):
                overrides[idx] = {**inf, **influencer}
                updated = True
                break
        if not updated:
            overrides.append(influencer)
        self._save_data(overrides)

    def save_all(self, influencers: List[Dict[str, Any]]) -> None:
        self._save_data(influencers)

    def _load_overrides(self) -> List[Dict[str, Any]]:
        if not os.path.exists(self.filepath):
            return []
        data = self._load_data()
        return data if isinstance(data, list) else []

    def _merge_lists(
        self,
        primary: List[Dict[str, Any]],
        overrides: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        if not overrides:
            return primary
        override_map = {str(o.get("id")): o for o in overrides}
        primary_ids: set[str] = set()
        merged: List[Dict[str, Any]] = []
        for row in primary:
            oid = str(row.get("id"))
            primary_ids.add(oid)
            if oid in override_map:
                merged.append({**row, **override_map[oid]})
            else:
                merged.append(row)
        for oid, override in override_map.items():
            if oid not in primary_ids:
                if not oid.startswith("yt_search_"):
                    merged.append(override)
        return merged
