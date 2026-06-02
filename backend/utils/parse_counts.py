"""Parse social metric strings like 48.5M, 383.1K into integers."""
from __future__ import annotations

import re
from typing import Optional


def parse_count(value: Optional[str]) -> int:
    if value is None:
        return 0
    text = str(value).strip().replace(",", "")
    if not text or text.lower() in {"n/a", "na", "-", ""}:
        return 0

    mult = 1.0
    if text[-1:].upper() == "M":
        mult = 1_000_000
        text = text[:-1]
    elif text[-1:].upper() == "K":
        mult = 1_000
        text = text[:-1]
    elif text[-1:].upper() == "B":
        mult = 1_000_000_000
        text = text[:-1]

    text = re.sub(r"[^\d.]", "", text)
    if not text:
        return 0
    try:
        return int(float(text) * mult)
    except ValueError:
        return 0
