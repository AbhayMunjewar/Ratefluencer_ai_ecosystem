from backend.services.youtube_ingestion_service import YouTubeIngestionService


def test_youtube_not_configured_without_key(monkeypatch):
    monkeypatch.delenv("YOUTUBE_API_KEY", raising=False)
    service = YouTubeIngestionService(api_key=None)
    assert not service.is_configured()
    result = service.fetch_channel_profile("UCtest")
    assert "error" in result


def test_search_channels_returns_error_without_key(monkeypatch):
    monkeypatch.delenv("YOUTUBE_API_KEY", raising=False)
    service = YouTubeIngestionService(api_key=None)
    payload = service.search_channels("mrbeast", max_results=3)
    assert payload.get("results") == []
    assert payload.get("error")
