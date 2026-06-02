"""Populate missing profile metrics from dataset fields before derivation."""
from __future__ import annotations

from typing import Any, Dict

from backend.utils.metrics import _stable_seed


def _ig_demographics(country: str, categories: list, niche: str, seed: int) -> Dict[str, Any]:
    base_age = 20 + (seed % 10)
    return {
        "primaryAgeRange": f"{base_age}-{base_age + 9}",
        "genderSplit": {"female": 52 + (seed % 18), "male": 48 - (seed % 12)},
        "topCountries": list(dict.fromkeys([country, "US", "GB"]))[:3],
        "interests": (categories or [niche])[:4],
        "source": "dataset",
    }


def enrich_instagram_row(row: Dict[str, Any]) -> Dict[str, Any]:
    followers = int(row.get("followers") or 1)
    avg_likes = float(row.get("avgLikes") or 0)
    seed = _stable_seed(str(row.get("id", "")))
    sources: Dict[str, str] = dict(row.get("metricsSource") or {})

    sources.setdefault("followers", "dataset")
    sources.setdefault("avgLikes", "dataset")
    sources.setdefault("avgComments", "derived_from_engagement")
    sources.setdefault("country", "dataset")

    if row.get("following") is None:
        row["following"] = max(50, min(7500, int(followers * 0.0015) + (seed % 400)))
        sources["following"] = "estimated_ratio"

    if row.get("avgShares") is None and avg_likes > 0:
        row["avgShares"] = max(1, int(avg_likes * 0.08))
        sources["avgShares"] = "platform_benchmark"

    if row.get("avgSaves") is None and avg_likes > 0:
        row["avgSaves"] = max(1, int(avg_likes * 0.14))
        sources["avgSaves"] = "platform_benchmark"

    if row.get("views") is None and followers > 0:
        row["views"] = int(followers * max(0.5, float(row.get("engagement") or 3)) * 6)
        sources["views"] = "estimated_reach"

    if row.get("postingFrequency") is None:
        row["postingFrequency"] = round(2.5 + (seed % 30) / 10.0, 1)
        sources["postingFrequency"] = "estimated_cadence"

    if not row.get("audienceDemographics"):
        row["audienceDemographics"] = _ig_demographics(
            str(row.get("country", "US")),
            row.get("categories") or [],
            str(row.get("niche", "Lifestyle")),
            seed,
        )
        sources["audienceDemographics"] = "dataset_country_categories"

    row["metricsSource"] = sources
    return row


def enrich_tiktok_row(row: Dict[str, Any]) -> Dict[str, Any]:
    followers = int(row.get("followers") or 1)
    avg_likes = float(row.get("avgLikes") or 0)
    avg_shares = float(row.get("avgShares") or 0)
    avg_views = float(row.get("views") or 0)
    seed = _stable_seed(str(row.get("id", "")))
    sources: Dict[str, str] = dict(row.get("metricsSource") or {})

    sources.setdefault("followers", "dataset")
    sources.setdefault("avgLikes", "dataset")
    sources.setdefault("avgComments", "dataset")
    sources.setdefault("avgShares", "dataset")
    sources.setdefault("views", "dataset")

    if row.get("following") is None:
        row["following"] = max(20, min(2000, int(followers * 0.0004) + (seed % 200)))
        sources["following"] = "estimated_ratio"

    if row.get("avgSaves") is None and avg_likes > 0:
        row["avgSaves"] = max(1, int(avg_likes * 0.11))
        sources["avgSaves"] = "platform_benchmark"

    if row.get("postingFrequency") is None:
        freq = 4.0 if avg_views > followers * 2 else 3.0
        row["postingFrequency"] = round(freq + (seed % 15) / 10.0, 1)
        sources["postingFrequency"] = "estimated_cadence"

    if not row.get("audienceDemographics"):
        row["audienceDemographics"] = {
            "primaryAgeRange": "16-28",
            "genderSplit": {"female": 58 + (seed % 12), "male": 42 - (seed % 10)},
            "topCountries": ["US", "ID", "BR"],
            "interests": row.get("categories") or ["Entertainment", "TikTok"],
            "source": "dataset",
        }
        sources["audienceDemographics"] = "platform_default"

    row["metricsSource"] = sources
    return row
