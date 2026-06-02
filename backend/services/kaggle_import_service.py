"""Import Instagram / TikTok rows from a Kaggle CSV into influencer storage."""
from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

from backend.repositories.influencer_repository import InfluencerRepository
from backend.utils.csv_mapper import read_csv_rows, row_to_influencer


class KaggleImportService:
    ALLOWED_PLATFORMS = ("Instagram", "TikTok")

    def __init__(self, repo: Optional[InfluencerRepository] = None) -> None:
        self.repo = repo or InfluencerRepository()

    def _imports_dir(self) -> str:
        base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        path = os.path.join(base, "data", "imports")
        os.makedirs(path, exist_ok=True)
        return path

    def resolve_csv_path(self, csv_path: str) -> str:
        if os.path.isabs(csv_path):
            full = csv_path
        else:
            normalized = csv_path.replace("\\", "/").lstrip("/")
            if normalized.startswith("data/"):
                base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                full = os.path.join(base, normalized)
            elif normalized.startswith("imports/"):
                full = os.path.join(self._imports_dir(), os.path.basename(normalized))
            else:
                full = os.path.join(self._imports_dir(), normalized)
        if not os.path.isfile(full):
            raise FileNotFoundError(f"CSV not found: {full}")
        return full

    def _next_id(self, influencers: List[Dict[str, Any]]) -> int:
        ids = []
        for inf in influencers:
            try:
                ids.append(int(inf.get("id", 0)))
            except (TypeError, ValueError):
                continue
        return max(ids, default=0) + 1

    def import_from_csv(
        self,
        csv_path: str,
        platform: str,
        *,
        limit: Optional[int] = 20,
        replace_platform: bool = True,
    ) -> Dict[str, Any]:
        platform = platform.strip().capitalize()
        if platform == "Tiktok":
            platform = "TikTok"
        if platform not in self.ALLOWED_PLATFORMS:
            return {
                "error": f"platform must be one of: {', '.join(self.ALLOWED_PLATFORMS)}",
            }

        full_path = self.resolve_csv_path(csv_path)
        rows = read_csv_rows(full_path, limit=limit)
        if not rows:
            return {"error": "CSV has no data rows", "path": full_path}

        existing = self.repo.get_all()
        if replace_platform:
            kept = [i for i in existing if (i.get("platform") or "") != platform]
        else:
            kept = list(existing)

        start_id = self._next_id(kept)
        imported: List[Dict[str, Any]] = []
        for idx, row in enumerate(rows):
            if limit and len(imported) >= limit:
                break
            record = row_to_influencer(
                row,
                platform=platform,
                record_id=str(start_id + idx),
            )
            imported.append(record)

        merged = kept + imported
        self.repo.save_all(merged)

        return {
            "imported_count": len(imported),
            "platform": platform,
            "csv_path": full_path,
            "total_influencers": len(merged),
            "replaced_platform_rows": replace_platform,
            "sample_handles": [i.get("handle") for i in imported[:5]],
        }

    def list_available_csvs(self) -> List[str]:
        folder = self._imports_dir()
        return sorted(
            f for f in os.listdir(folder) if f.lower().endswith(".csv")
        )
