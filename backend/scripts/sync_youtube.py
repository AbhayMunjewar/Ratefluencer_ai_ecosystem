"""CLI: sync all YouTube influencers using YOUTUBE_API_KEY."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.repositories.influencer_repository import InfluencerRepository
from backend.services.youtube_ingestion_service import YouTubeIngestionService


def main() -> int:
    service = YouTubeIngestionService()
    if not service.is_configured():
        print("ERROR: Set YOUTUBE_API_KEY before running this script.")
        print("See backend/data/DATA_SOURCES.md")
        return 1

    repo = InfluencerRepository()
    batch = service.sync_all_youtube(repo.get_all())
    repo.save_all(batch["updated"])

    print(f"Synced: {batch['synced_count']}, errors: {batch['error_count']}")
    for err in batch.get("errors") or []:
        print(f"  - id={err.get('id')} {err.get('handle')}: {err.get('error')}")
    return 0 if batch["error_count"] == 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
