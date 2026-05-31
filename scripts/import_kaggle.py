"""CLI: import Kaggle CSV for Instagram or TikTok."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.services.kaggle_import_service import KaggleImportService


def main() -> int:
    parser = argparse.ArgumentParser(description="Import Kaggle CSV into influencers.json")
    parser.add_argument("csv", help="Filename in backend/data/imports/ or full path")
    parser.add_argument(
        "--platform",
        required=True,
        choices=["Instagram", "TikTok"],
        help="Platform label for imported rows",
    )
    parser.add_argument("--limit", type=int, default=20, help="Max rows to import")
    parser.add_argument(
        "--keep-existing",
        action="store_true",
        help="Do not remove existing rows for this platform",
    )
    args = parser.parse_args()

    service = KaggleImportService()
    try:
        result = service.import_from_csv(
            args.csv,
            args.platform,
            limit=args.limit,
            replace_platform=not args.keep_existing,
        )
    except FileNotFoundError as exc:
        print(f"ERROR: {exc}")
        return 1

    if "error" in result:
        print(f"ERROR: {result['error']}")
        return 1

    print(f"Imported {result['imported_count']} {result['platform']} creators")
    print(f"Total influencers: {result['total_influencers']}")
    print(f"Sample: {result.get('sample_handles')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
