def test_authenticity_analyze_returns_computed_probabilities(client):
    response = client.post("/authenticity/analyze", json={"influencer_id": "ig_1"})
    assert response.status_code == 200
    data = response.json()

    assert 0 <= data["authenticity_score"] <= 100
    assert data["risk_level"] in {"Low", "Medium", "High"}
    assert "engagement_rate" in data
    for key in (
        "fake_follower_probability",
        "engagement_pod_probability",
        "bot_activity_probability",
        "artificial_spike_probability",
    ):
        assert 0 <= data[key] <= 100


def test_authenticity_not_found(client):
    response = client.post("/authenticity/analyze", json={"influencer_id": "missing-id"})
    assert response.status_code == 404


def test_get_authenticity_report(client):
    response = client.get("/influencers/ig_1/authenticity")
    assert response.status_code == 200
    data = response.json()
    assert "authenticityScore" in data
    assert "confidence" in data
    assert "signals" in data


def test_engagement_pod_detection_signal(client):
    response = client.post("/authenticity/analyze", json={"influencer_id": "tt_1"})
    assert response.status_code == 200
    data = response.json()
    assert "engagement_pod_probability" in data
