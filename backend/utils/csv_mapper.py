"""Map Kaggle / export CSV rows to influencer JSON records."""
from __future__ import annotations

import csv
import re
from datetime import date
from typing import Any, Dict, Iterable, List, Optional


def _norm_header(name: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (name or "").lower())


# Common Kaggle / Instagram export column aliases
_HEADER_ALIASES: Dict[str, tuple[str, ...]] = {
    "handle": (
        "handle",
        "username",
        "user",
        "user_name",
        "account",
        "instagram",
        "influencer",
        "name",
    ),
    "name": ("name", "fullname", "full_name", "displayname", "display_name", "title"),
    "followers": ("followers", "follower", "followercount", "subscriber", "subscribers", "fans"),
    "avgLikes": ("avglikes", "averagelikes", "likes", "like", "avglike"),
    "avgComments": ("avgcomments", "comments", "comment", "avgcomment", "averagecomments"),
    "bio": ("bio", "biography", "description", "about"),
    "niche": ("niche", "category", "categories", "topic", "industry", "type"),
    "country": ("country", "location", "region", "nation"),
    "engagement": ("engagement", "engagementrate", "er", "rate"),
}


def _pick(row: Dict[str, str], field: str) -> Optional[str]:
    norm_row = {_norm_header(k): (v or "").strip() for k, v in row.items()}
    for alias in _HEADER_ALIASES.get(field, (field,)):
        val = norm_row.get(_norm_header(alias))
        if val:
            return val
    return None


def _parse_int(value: Optional[str]) -> int:
    if not value:
        return 0
    cleaned = re.sub(r"[^\d.]", "", str(value).replace(",", ""))
    if not cleaned:
        return 0
    try:
        return int(float(cleaned))
    except ValueError:
        return 0


def _parse_float(value: Optional[str]) -> float:
    if not value:
        return 0.0
    cleaned = re.sub(r"[^\d.]", "", str(value).replace(",", ""))
    if not cleaned:
        return 0.0
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def normalize_handle(raw: Optional[str]) -> str:
    if not raw:
        return "@unknown"
    h = str(raw).strip()
    if h.startswith("http"):
        part = h.rstrip("/").split("/")[-1]
        h = part or h
    if not h.startswith("@"):
        h = f"@{h}"
    return h


def _default_growth() -> List[int]:
    return [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155]


def row_to_influencer(
    row: Dict[str, str],
    *,
    platform: str,
    record_id: str,
    default_niche: str = "Lifestyle",
) -> Dict[str, Any]:
    handle = normalize_handle(_pick(row, "handle") or _pick(row, "name"))
    name_raw = _pick(row, "name") or handle.lstrip("@")
    name = name_raw.replace("@", "").strip() or "Creator"

    followers = _parse_int(_pick(row, "followers"))
    avg_likes = _parse_int(_pick(row, "avgLikes"))
    avg_comments = _parse_int(_pick(row, "avgComments"))
    engagement = _parse_float(_pick(row, "engagement"))

    if engagement <= 0 and followers > 0 and avg_likes > 0:
        engagement = round(((avg_likes + avg_comments) / followers) * 100, 2)
    if avg_likes <= 0 and followers > 0 and engagement > 0:
        avg_likes = int(followers * (engagement / 100.0) * 0.85)
    if avg_comments <= 0 and avg_likes > 0:
        avg_comments = max(1, int(avg_likes * 0.04))

    niche = (_pick(row, "niche") or default_niche).strip()
    categories = [c.strip() for c in re.split(r"[,|;]", niche) if c.strip()] or [niche]

    country_raw = (_pick(row, "country") or "US").strip()
    country = country_raw.upper() if len(country_raw) == 2 else "US"

    bio = (_pick(row, "bio") or f"{platform} creator — {niche}.").strip()

    return {
        "id": record_id,
        "name": name[:80],
        "handle": handle,
        "platform": platform,
        "niche": categories[0],
        "followers": max(followers, 0),
        "engagement": round(engagement, 2),
        "aiScore": 75,
        "authenticity": 75,
        "risk": "medium",
        "country": country,
        "growth": _default_growth(),
        "verified": False,
        "location": _pick(row, "country") or country,
        "bio": bio[:500],
        "campaigns": 0,
        "avgLikes": avg_likes,
        "avgComments": avg_comments,
        "categories": categories[:5],
        "dataSource": f"kaggle_csv:{platform.lower()}",
        "dataAsOf": date.today().isoformat(),
    }


def read_csv_rows(path: str, limit: Optional[int] = None) -> List[Dict[str, str]]:
    rows: List[Dict[str, str]] = []
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append({k: (v or "") for k, v in row.items()})
            if limit and len(rows) >= limit:
                break
    return rows


def rows_to_influencers(
    rows: Iterable[Dict[str, str]],
    *,
    platform: str,
    start_id: int = 1,
    limit: Optional[int] = None,
) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    next_id = start_id
    for row in rows:
        if limit and len(out) >= limit:
            break
        out.append(
            row_to_influencer(
                row,
                platform=platform,
                record_id=str(next_id),
            )
        )
        next_id += 1
    return out
