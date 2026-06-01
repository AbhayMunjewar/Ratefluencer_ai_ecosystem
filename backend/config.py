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
    load_dotenv(root / ".env")


_load_dotenv()


def get_youtube_api_key() -> str | None:
    key = os.environ.get("YOUTUBE_API_KEY", "").strip()
    return key or None


YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"
