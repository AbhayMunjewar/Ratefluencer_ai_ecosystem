"""Sentence-transformer embeddings with deterministic hash fallback."""
from __future__ import annotations

import hashlib
import math
import re
from typing import List, Optional

_model = None
_model_load_failed = False


def _tokenize(text: str) -> List[str]:
    return re.findall(r"[a-z0-9]+", (text or "").lower())


def _hash_embedding(text: str, dim: int = 384) -> List[float]:
    tokens = _tokenize(text)
    if not tokens:
        tokens = ["empty"]
    vec = [0.0] * dim
    for token in tokens:
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        for i in range(dim):
            vec[i] += ((digest[i % len(digest)] / 255.0) - 0.5) / len(tokens)
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


def _load_model():
    global _model, _model_load_failed
    if _model is not None or _model_load_failed:
        return _model
    import os
    import sys
    if "pytest" in sys.modules or os.environ.get("FORCE_HASH_EMBEDDING") == "true":
        _model_load_failed = True
        return None
    try:
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer("all-MiniLM-L6-v2")
    except Exception:
        _model_load_failed = True
        _model = None
    return _model


def embed_text(text: str) -> List[float]:
    model = _load_model()
    if model is None:
        return _hash_embedding(text)
    vector = model.encode(text or "", normalize_embeddings=True)
    return vector.tolist()


def embed_texts(texts: List[str]) -> List[List[float]]:
    model = _load_model()
    if model is None:
        return [_hash_embedding(t) for t in texts]
    vectors = model.encode(texts, normalize_embeddings=True)
    return [v.tolist() for v in vectors]


def cosine_similarity(a: List[float], b: List[float]) -> float:
    if not a or not b:
        return 0.0
    length = min(len(a), len(b))
    dot = sum(a[i] * b[i] for i in range(length))
    norm_a = math.sqrt(sum(x * x for x in a[:length])) or 1.0
    norm_b = math.sqrt(sum(x * x for x in b[:length])) or 1.0
    return dot / (norm_a * norm_b)


def similarity_to_score(similarity: float) -> int:
    return int(max(0, min(100, round((similarity + 1) / 2 * 100))))
