from backend.services.dashboard_service import DashboardService
from backend.repositories.repositories import ActivityRepository, DashboardMetricsRepository
from backend.repositories.influencer_repository import InfluencerRepository


def test_dashboard_endpoint_returns_dynamic_metrics(client):
    response = client.get("/dashboard")
    assert response.status_code == 200
    data = response.json()

    assert "metrics" in data
    assert "activity_feed" in data

    metrics = data["metrics"]
    assert "engagementOverTime" in metrics
    assert "platformSplit" in metrics
    assert "topNiches" in metrics
    assert "radarData" in metrics
    assert "kpis" in metrics

    kpis = metrics["kpis"]
    assert kpis["influencersTracked"] > 0
    assert kpis["avgEngagement"] > 0
    assert kpis["contentGenerated"] >= 0
    assert kpis["activeCampaigns"] >= 0


def test_dashboard_service_dynamic_aggregation():
    metrics_repo = DashboardMetricsRepository()
    activity_repo = ActivityRepository()
    influencer_repo = InfluencerRepository()

    service = DashboardService(metrics_repo, activity_repo, influencer_repo=influencer_repo)
    result = service.get_dashboard_data()

    assert "metrics" in result
    metrics = result["metrics"]
    
    assert len(metrics["platformSplit"]) == 3
    platforms = {item["name"] for item in metrics["platformSplit"]}
    assert "Instagram" in platforms
    assert "TikTok" in platforms
    assert "YouTube" in platforms

    assert len(metrics["engagementOverTime"]) == 12
    assert len(metrics["radarData"]) == 6
