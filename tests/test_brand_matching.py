from backend.repositories.brand_repository import BrandRepository
from backend.repositories.influencer_repository import InfluencerRepository
from backend.services.brand_matching_service import BrandMatchingService


def test_brand_matching_embedding_score_range():
    service = BrandMatchingService(BrandRepository(), InfluencerRepository())
    brand = BrandRepository().get_by_id("b4")
    influencer = InfluencerRepository().get_by_id("ig_1")
    assert brand is not None
    assert influencer is not None

    score = service.score_pair(influencer, brand)
    assert 0 <= score <= 100


def test_brand_match_api_sorted_matches(client):
    response = client.post("/brand-match", json={"brand_id": "b3"})
    assert response.status_code == 200
    data = response.json()

    assert "matches" in data
    assert len(data["matches"]) > 0
    scores = [m["score"] for m in data["matches"]]
    assert scores == sorted(scores, reverse=True)
    assert data["brand_match_score"] == scores[0]
    assert data.get("recommendation_reasoning")


def test_brand_match_not_found(client):
    response = client.post("/brand-match", json={"brand_id": "unknown"})
    assert response.status_code == 404
