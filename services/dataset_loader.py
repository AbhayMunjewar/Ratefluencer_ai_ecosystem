"""Load Instagram and TikTok influencers from backend/dataset CSV files."""
from __future__ import annotations

import csv
import os
import re
from functools import lru_cache
from typing import Any, Dict, List, Optional

from backend.utils.parse_counts import parse_count


DATASET_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "dataset",
)

# ---------- CSV file selection ----------
# Prefer the sep-2022 files which contain real influencer names (Cristiano, Virat Kohli, etc.)
# Fallback to other files if the preferred ones don't exist.

INSTAGRAM_CSV_CANDIDATES = [
    "social media influencers - instagram sep-2022.csv",
    "social media influencers-INSTAGRAM - -DEC 2022.csv",
    "social media influencers-instagram - -nov 2022.csv",
    "social media influencers-instagram june 2022 - june 2022.csv",
    "social media influencers - instagram.csv",
]

TIKTOK_CSV_CANDIDATES = [
    "social media influencers - Tiktok sep 2022.csv",
    "social media influencers-TIKTOK - ---DEC 2022.csv",
    "social media influencers - tiktok.csv",
]


def _pick_csv(candidates: List[str]) -> str:
    """Return the first CSV that exists in DATASET_DIR."""
    for name in candidates:
        path = os.path.join(DATASET_DIR, name)
        if os.path.isfile(path):
            return name
    return candidates[0]  # fallback


def _default_growth(seed: int) -> List[int]:
    base = 100
    out = [base]
    for i in range(1, 12):
        base += 3 + (seed % 7)
        out.append(base)
    return out


def _normalize_header(name: str) -> str:
    """Lowercase, strip whitespace/newlines, collapse spaces."""
    return re.sub(r"\s+", " ", (name or "").strip().lower())


def _row_dict(headers: List[str], values: List[str]) -> Dict[str, str]:
    padded = values + [""] * max(0, len(headers) - len(values))
    return {headers[i]: padded[i].strip() for i in range(len(headers))}


def _pick(row: Dict[str, str], *keys: str) -> str:
    """Try multiple normalised header keys, return first non-empty match."""
    for k in keys:
        val = row.get(k, "").strip()
        if val:
            return val
    return ""


# ---------- Instagram ----------
@lru_cache(maxsize=1)
def load_instagram_influencers(limit: Optional[int] = None) -> List[Dict[str, Any]]:
    csv_name = _pick_csv(INSTAGRAM_CSV_CANDIDATES)
    path = os.path.join(DATASET_DIR, csv_name)
    if not os.path.isfile(path):
        return []

    rows: List[Dict[str, Any]] = []
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        raw_headers = next(reader, [])
        headers = [_normalize_header(h) for h in raw_headers]

        for idx, values in enumerate(reader, start=1):
            if limit and len(rows) >= limit:
                break
            row = _row_dict(headers, values)

            # Handle varying header names across CSV versions:
            # sep-2022: "instagram name" = handle, "name" = display name
            # other:    "influencer insta name" = handle, "instagram name" = sometimes display
            handle_raw = (
                _pick(row, "instagram name")
                or _pick(row, "influencer insta name")
                or f"creator{idx}"
            )
            handle = handle_raw if handle_raw.startswith("@") else f"@{handle_raw}"

            # Display name: sep-2022 has " Name" (with leading space) → normalises to "name"
            name = (
                _pick(row, "name")
                or _pick(row, "instagram name")
                or handle_raw
            )

            niche = _pick(row, "category_1", "category 1") or "Lifestyle"
            cat2 = _pick(row, "category_2", "category 2")
            categories = [c for c in [niche, cat2] if c]

            # Followers / Subscribers (sep-2022 uses "subscribers")
            followers = parse_count(
                _pick(row, "subscribers", "followers")
            )

            # Engagement columns (handle newlines in headers)
            authentic_eng = parse_count(
                _pick(row, "authentic engagement", "authentic engagement\n")
            )
            engagement_avg = parse_count(
                _pick(row, "engagement average", "engagement avg", "engagement avg\n")
            )

            avg_likes = authentic_eng or engagement_avg
            avg_comments = max(1, int(avg_likes * 0.03)) if avg_likes else 0
            engagement = 0.0
            if followers > 0 and avg_likes > 0:
                engagement = round(((avg_likes + avg_comments) / followers) * 100, 2)

            # Country
            country_raw = (
                _pick(row, "audience country(mostly)", "audience country") or "US"
            ).strip()
            # Map full country names to 2-letter codes
            country_map = {
                "india": "IN", "united states": "US", "indonesia": "ID",
                "brazil": "BR", "spain": "ES", "south korea": "KR",
                "russia": "RU", "turkey": "TR", "mexico": "MX",
                "japan": "JP", "germany": "DE", "france": "FR",
                "united kingdom": "GB", "canada": "CA", "australia": "AU",
                "italy": "IT", "argentina": "AR", "colombia": "CO",
                "egypt": "EG", "pakistan": "PK", "philippines": "PH",
                "thailand": "TH", "vietnam": "VN", "malaysia": "MY",
                "nigeria": "NG", "saudi arabia": "SA", "uae": "AE",
                "china": "CN", "taiwan": "TW", "chile": "CL",
                "peru": "PE", "portugal": "PT", "netherlands": "NL",
                "poland": "PL", "ukraine": "UA", "iraq": "IQ",
                "morocco": "MA", "algeria": "DZ", "tunisia": "TN",
                "bangladesh": "BD", "south africa": "ZA",
            }
            country_code = country_map.get(country_raw.lower(), country_raw[:2].upper())
            if len(country_code) != 2:
                country_code = "US"

            rows.append(
                {
                    "id": f"ig_{idx}",
                    "name": name[:80],
                    "handle": handle,
                    "platform": "Instagram",
                    "niche": niche,
                    "followers": followers,
                    "engagement": engagement,
                    "aiScore": min(99, 60 + (engagement * 2) % 40),
                    "authenticity": 75,
                    "risk": "medium",
                    "country": country_code,
                    "growth": _default_growth(idx),
                    "verified": followers > 1_000_000,
                    "location": country_raw,
                    "bio": f"{niche} creator on Instagram. Audience primarily in {country_raw}.",
                    "campaigns": 0,
                    "avgLikes": avg_likes,
                    "avgComments": avg_comments,
                    "categories": categories or [niche],
                    "dataSource": f"dataset/{csv_name}",
                    "dataAsOf": "2022-09",
                }
            )
    return rows


# ---------- TikTok ----------
@lru_cache(maxsize=1)
def load_tiktok_influencers(limit: Optional[int] = None) -> List[Dict[str, Any]]:
    csv_name = _pick_csv(TIKTOK_CSV_CANDIDATES)
    path = os.path.join(DATASET_DIR, csv_name)
    if not os.path.isfile(path):
        return []

    rows: List[Dict[str, Any]] = []
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        raw_headers = next(reader, [])
        headers = [_normalize_header(h) for h in raw_headers]

        for idx, values in enumerate(reader, start=1):
            if limit and len(rows) >= limit:
                break
            row = _row_dict(headers, values)

            handle_raw = (
                _pick(row, "tiktoker name")
                or f"tiktok{idx}"
            )
            handle = handle_raw if handle_raw.startswith("@") else f"@{handle_raw}"
            name = _pick(row, "tiktok name") or handle_raw

            # sep-2022 uses "subscribers", DEC-2022 uses "followers"
            followers = parse_count(
                _pick(row, "subscribers", "followers")
            )
            # Views: "views avg." vs "views(avg)"
            avg_views = parse_count(
                _pick(row, "views avg.", "views(avg)")
            )
            # Likes: "likes avg." vs "likes(avg.)"
            avg_likes = parse_count(
                _pick(row, "likes avg.", "likes(avg.)")
            )
            # Comments: "comments avg." vs "comments(avg.)"
            avg_comments = parse_count(
                _pick(row, "comments avg.", "comments(avg.)")
            )
            # Shares: "shares avg." vs "shares(avg.)"
            avg_shares = parse_count(
                _pick(row, "shares avg.", "shares(avg.)")
            )

            engagement = 0.0
            if followers > 0:
                engagement = round(
                    ((avg_likes + avg_comments + avg_shares) / followers) * 100,
                    2,
                )

            rows.append(
                {
                    "id": f"tt_{idx}",
                    "name": name[:80],
                    "handle": handle,
                    "platform": "TikTok",
                    "niche": "Entertainment",
                    "followers": followers,
                    "engagement": engagement,
                    "aiScore": min(99, 58 + (engagement * 2) % 42),
                    "authenticity": 75,
                    "risk": "medium",
                    "country": "US",
                    "growth": _default_growth(idx + 1000),
                    "verified": followers > 5_000_000,
                    "location": "Global",
                    "bio": f"TikTok creator {name}.",
                    "campaigns": 0,
                    "avgLikes": avg_likes,
                    "avgComments": avg_comments,
                    "avgShares": avg_shares,
                    "views": avg_views,
                    "categories": ["Entertainment", "TikTok"],
                    "dataSource": f"dataset/{csv_name}",
                    "dataAsOf": "2022-09",
                }
            )
    return rows


# ---------- Combined ----------
def load_dataset_influencers(
    *,
    instagram_limit: Optional[int] = None,
    tiktok_limit: Optional[int] = None,
) -> List[Dict[str, Any]]:
    return load_instagram_influencers(instagram_limit) + load_tiktok_influencers(tiktok_limit)


def get_by_id_from_dataset(influencer_id: str) -> Optional[Dict[str, Any]]:
    for inf in load_dataset_influencers():
        if str(inf.get("id")) == str(influencer_id):
            return dict(inf)
    return None


def clear_dataset_cache() -> None:
    load_instagram_influencers.cache_clear()
    load_tiktok_influencers.cache_clear()
