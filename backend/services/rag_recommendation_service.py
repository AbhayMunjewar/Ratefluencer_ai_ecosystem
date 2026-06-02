"""RAG layer: ChromaDB retrieval + template reasoning from retrieved context."""
from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

from backend.repositories.brand_repository import BrandRepository
from backend.repositories.repositories import IndustryKnowledgeRepository
from backend.services.embedding_service import embed_text


class RAGRecommendationService:
    COLLECTION_NAME = "brand_knowledge"

    def __init__(
        self,
        brand_repo: BrandRepository,
        knowledge_repo: Optional[IndustryKnowledgeRepository] = None,
    ) -> None:
        self.brand_repo = brand_repo
        self.knowledge_repo = knowledge_repo or IndustryKnowledgeRepository()
        self._client = None
        self._collection = None
        self._indexed = False

    def _data_dir(self) -> str:
        return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

    def _ensure_index(self) -> None:
        if self._indexed:
            return

        try:
            import chromadb
            from chromadb.config import Settings
        except Exception:
            self._indexed = True
            return

        persist_dir = os.path.join(self._data_dir(), "chroma")
        os.makedirs(persist_dir, exist_ok=True)
        try:
            self._client = chromadb.PersistentClient(
                path=persist_dir,
                settings=Settings(anonymized_telemetry=False),
            )
            self._collection = self._client.get_or_create_collection(self.COLLECTION_NAME)
        except Exception:
            self._client = None
            self._collection = None
            self._indexed = True
            return

        documents: List[str] = []
        metadatas: List[Dict[str, Any]] = []
        ids: List[str] = []

        for brand in self.brand_repo.get_all():
            doc = " ".join(
                [
                    brand.get("name", ""),
                    brand.get("industry", ""),
                    brand.get("description", ""),
                    brand.get("targetAudience", ""),
                    " ".join(brand.get("targetNiches", [])),
                    brand.get("campaignObjectives", ""),
                ]
            ).strip()
            documents.append(doc)
            metadatas.append({"type": "brand", "brand_id": str(brand.get("id")), "name": brand.get("name", "")})
            ids.append(f"brand-{brand.get('id')}")

        for item in self.knowledge_repo.get_all():
            doc = f"{item.get('title', '')} {item.get('content', '')}".strip()
            documents.append(doc)
            metadatas.append({"type": "knowledge", "topic": item.get("topic", "")})
            ids.append(f"knowledge-{item.get('id')}")

        try:
            if documents:
                embeddings = [embed_text(d) for d in documents]
                self._collection.upsert(
                    ids=ids,
                    documents=documents,
                    embeddings=embeddings,
                    metadatas=metadatas,
                )
        except Exception:
            self._collection = None

        self._indexed = True

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        self._ensure_index()
        if self._collection is None:
            return self._fallback_retrieve(query, top_k)

        query_embedding = embed_text(query)
        results = self._collection.query(
            query_embeddings=[query_embedding],
            n_results=min(top_k, max(1, self._collection.count() or 1)),
        )

        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        retrieved: List[Dict[str, Any]] = []
        for doc, meta, dist in zip(docs, metas, distances):
            retrieved.append(
                {
                    "document": doc,
                    "metadata": meta or {},
                    "distance": dist,
                }
            )
        return retrieved

    def _fallback_retrieve(self, query: str, top_k: int) -> List[Dict[str, Any]]:
        query_tokens = set(query.lower().split())
        candidates: List[Dict[str, Any]] = []

        for brand in self.brand_repo.get_all():
            doc = " ".join(
                [
                    brand.get("name", ""),
                    brand.get("description", ""),
                    brand.get("targetAudience", ""),
                    " ".join(brand.get("targetNiches", [])),
                ]
            )
            overlap = len(query_tokens.intersection(set(doc.lower().split())))
            candidates.append(
                {
                    "document": doc,
                    "metadata": {"type": "brand", "brand_id": str(brand.get("id")), "name": brand.get("name")},
                    "distance": 1.0 / (1 + overlap),
                }
            )

        candidates.sort(key=lambda x: x["distance"])
        return candidates[:top_k]

    def build_recommendation_reasoning(
        self,
        influencer: Dict[str, Any],
        brand: Optional[Dict[str, Any]] = None,
        top_k: int = 3,
    ) -> str:
        query_parts = [
            influencer.get("bio", ""),
            influencer.get("niche", ""),
            " ".join(influencer.get("categories", [])),
        ]
        if brand:
            query_parts.extend(
                [
                    brand.get("name", ""),
                    brand.get("description", ""),
                    brand.get("campaignObjectives", ""),
                ]
            )
        query = " ".join(p for p in query_parts if p).strip()
        retrieved = self.retrieve(query, top_k=top_k)

        brand_names = [
            r["metadata"].get("name")
            for r in retrieved
            if r.get("metadata", {}).get("type") == "brand" and r["metadata"].get("name")
        ]
        primary_brand = brand.get("name") if brand else (brand_names[0] if brand_names else "a aligned brand partner")

        niche = influencer.get("niche", "lifestyle")
        categories = ", ".join(influencer.get("categories", [])) or niche
        objectives = brand.get("campaignObjectives", "") if brand else ""
        knowledge_snippet = retrieved[0]["document"][:180] if retrieved else ""

        reasoning = (
            f"This creator aligns strongly with {primary_brand} because their {niche.lower()} "
            f"positioning and content themes ({categories}) overlap retrieved campaign context. "
        )
        if objectives:
            reasoning += f"Campaign objectives emphasize {objectives.lower()}. "
        if knowledge_snippet:
            reasoning += f"Supporting intelligence: {knowledge_snippet}..."
        return reasoning.strip()
