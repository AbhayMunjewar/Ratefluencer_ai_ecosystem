from backend.repositories.brand_repository import BrandRepository
from backend.services.rag_recommendation_service import RAGRecommendationService
from backend.repositories.influencer_repository import InfluencerRepository


def test_rag_retrieval_returns_documents():
    service = RAGRecommendationService(BrandRepository())
    results = service.retrieve("fitness protein creator campaign", top_k=2)
    assert len(results) >= 1
    assert results[0]["document"]


def test_rag_reasoning_mentions_brand():
    influencer = InfluencerRepository().get_by_id("ig_1")
    brand = BrandRepository().get_by_id("b1")
    service = RAGRecommendationService(BrandRepository())
    text = service.build_recommendation_reasoning(influencer, brand)
    assert "align" in text.lower()
    assert brand["name"] in text
