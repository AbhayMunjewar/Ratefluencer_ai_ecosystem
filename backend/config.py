"""Environment configuration for external data sources."""
from __future__ import annotations

import os
from pathlib import Path


def _load_dotenv() -> None:
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    root = Path(__file__).resolve().parents[1]
    backend_dir = Path(__file__).resolve().parent
    # Prefer repo-root .env; also allow backend/.env for local overrides.
    load_dotenv(root / ".env")
    load_dotenv(backend_dir / ".env", override=False)


_load_dotenv()


def get_youtube_api_key() -> str | None:
    key = os.environ.get("YOUTUBE_API_KEY", "").strip()
    return key or None


YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"
