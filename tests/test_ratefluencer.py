def test_ratefluencer_score_formula(client):
    response = client.post("/ratefluencer", json={"influencer_id": "ig_1"})
    assert response.status_code == 200
    data = response.json()

    expected = int(0.50 * data["authenticity"] + 0.50 * data["brand_match"])
    assert data["ratefluencer_score"] == expected
    assert len(data["recommended_brands"]) > 0
    assert len(data["strengths"]) > 0
    assert data.get("recommendation_reasoning")


def test_ratefluencer_not_found(client):
    response = client.post("/ratefluencer", json={"influencer_id": "does-not-exist"})
    assert response.status_code == 404


def test_influencer_analytics_endpoint(client):
    response = client.get("/influencers/ig_1/analytics")
    assert response.status_code == 200
    data = response.json()
    assert data["followers"] > 0
    assert "engagement_rate" in data
    assert "audience_reach_score" in data
