def test_growth_predict_ml_tier(client):
    response = client.post(
        "/growth/predict",
        json={"influencer_id": "ig_1"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["growthTier"] in ("Low Growth", "Medium Growth", "High Growth")
    assert 0.0 <= data["confidence"] <= 1.0
    assert 0 <= data["growthScore"] <= 100
    assert isinstance(data["topFactors"], list)
    assert isinstance(data["improvementSuggestions"], list)
    assert data.get("modelVersion")


def test_growth_predict_direct_features(client):
    response = client.post(
        "/growth/predict",
        json={
            "followers": 500000,
            "likes": 20000,
            "comments": 500,
            "shares": 1000,
            "saves": 3000,
            "reach": 150000,
            "impressions": 500000,
            "engagement_rate": 4.2,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "growthTier" in data
    assert data["confidence"] > 0
