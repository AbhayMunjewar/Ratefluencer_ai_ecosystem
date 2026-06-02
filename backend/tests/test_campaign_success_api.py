"""Campaign success API with CSV-trained classifier."""
from fastapi.testclient import TestClient

from backend.main import app
from backend.ml.campaign_success_classifier import is_model_available
from backend.repositories.influencer_repository import InfluencerRepository
from backend.repositories.repositories import CampaignRepository

client = TestClient(app)


def _instagram_influencer_id() -> str:
    for inf in InfluencerRepository().get_all():
        if inf.get("platform") == "Instagram":
            return str(inf["id"])
    raise AssertionError("No Instagram influencer in catalog")


def test_campaign_success_classifier_endpoint():
    if not is_model_available():
        return

    influencer_id = _instagram_influencer_id()
    response = client.post(
        "/campaign-success",
        json={"campaign_id": "c1", "influencer_id": influencer_id},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert 0 <= data["success_probability"] <= 100
    assert data["predicted_outcome"] in ("Success", "Failure")
    assert data.get("source") == "csv_classifier"
    assert data.get("confidence") is not None


def test_campaign_success_platform_mismatch():
    if not is_model_available():
        return

    campaign = CampaignRepository().get_by_id("c2")
    assert campaign is not None
    blocked_platform = campaign["platforms"][0]
    influencer_id = None
    for inf in InfluencerRepository().get_all():
        if inf.get("platform") and inf.get("platform") not in campaign["platforms"]:
            influencer_id = str(inf["id"])
            break
    assert influencer_id is not None

    response = client.post(
        "/campaign-success",
        json={"campaign_id": "c2", "influencer_id": influencer_id},
    )
    assert response.status_code == 400, response.text
