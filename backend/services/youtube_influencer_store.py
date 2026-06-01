"""YouTube influencers: API sync + JSON cache."""
from __future__ import annotations

import json
import os
from functools import lru_cache
from typing import Any, Dict, List, Optional

from backend.config import get_youtube_api_key
from backend.services.youtube_ingestion_service import YouTubeIngestionService


def _data_dir() -> str:
    return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")


def _cache_path() -> str:
    return os.path.join(_data_dir(), "youtube_influencers.json")


def _seeds_path() -> str:
    return os.path.join(_data_dir(), "youtube_seeds.json")


def _load_json(path: str) -> Any:
    if not os.path.isfile(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_cache(rows: List[Dict[str, Any]]) -> None:
    os.makedirs(os.path.dirname(_cache_path()), exist_ok=True)
    with open(_cache_path(), "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2, ensure_ascii=False)


def sync_youtube_from_seeds(force: bool = False) -> Dict[str, Any]:
    if not get_youtube_api_key():
        return {"error": "YOUTUBE_API_KEY not set", "synced": 0}

    if not force and os.path.isfile(_cache_path()):
        cached = _load_json(_cache_path())
        if cached:
            return {"synced": len(cached), "cached": True}

    service = YouTubeIngestionService()
    seeds = _load_json(_seeds_path())
    synced: List[Dict[str, Any]] = []
    errors: List[Dict[str, str]] = []

    for seed in seeds:
        stub = {
            "id": seed.get("id"),
            "platform": "YouTube",
            "handle": seed.get("handle", "@youtube"),
            "youtubeChannelId": seed.get("youtubeChannelId"),
            "niche": seed.get("niche", "Lifestyle"),
            "categories": seed.get("categories", ["YouTube"]),
            "growth": [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155],
        }
        result = service.sync_influencer(stub)
        if "error" in result:
            errors.append({"id": str(seed.get("id")), "error": result["error"]})
            continue
        result["niche"] = seed.get("niche", result.get("niche", "Lifestyle"))
        result["categories"] = seed.get("categories", [result["niche"]])
        result["aiScore"] = min(99, 70 + int(result.get("engagement", 3) * 3))
        result["authenticity"] = 80
        result["risk"] = "medium"
        result["campaigns"] = 0
        synced.append(result)

    _save_cache(synced)
    return {"synced": len(synced), "errors": errors, "cached": False}


@lru_cache(maxsize=1)
def load_youtube_influencers() -> List[Dict[str, Any]]:
    if os.path.isfile(_cache_path()):
        data = _load_json(_cache_path())
        if isinstance(data, list) and data:
            return data

    result = sync_youtube_from_seeds(force=True)
    if result.get("error"):
        return []
    return _load_json(_cache_path()) if os.path.isfile(_cache_path()) else []


def get_youtube_by_id(influencer_id: str) -> Optional[Dict[str, Any]]:
    for row in load_youtube_influencers():
        if str(row.get("id")) == str(influencer_id):
            return dict(row)
    return None


def clear_youtube_cache() -> None:
    load_youtube_influencers.cache_clear()
