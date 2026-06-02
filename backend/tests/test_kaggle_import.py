import csv
from backend.services.kaggle_import_service import KaggleImportService
from backend.repositories.influencer_repository import InfluencerRepository


def test_kaggle_import_replaces_instagram_only(tmp_path, monkeypatch):
    repo = InfluencerRepository()
    original_path = repo.filepath
    test_file = tmp_path / "influencers.json"
    test_file.write_text(
        '[{"id":"1","platform":"Instagram","handle":"@old"},'
        '{"id":"2","platform":"YouTube","handle":"@yt"}]',
        encoding="utf-8",
    )
    monkeypatch.setattr(repo, "filepath", str(test_file))

    csv_path = tmp_path / "instagram.csv"
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["username", "followers", "biography", "category"],
        )
        writer.writeheader()
        writer.writerow(
            {
                "username": "newcreator",
                "followers": "100000",
                "biography": "Fashion blogger",
                "category": "Fashion",
            }
        )

    service = KaggleImportService(repo)
    result = service.import_from_csv(str(csv_path), "Instagram", limit=5)

    assert result["imported_count"] == 1
    data = repo.get_all()
    assert any(i["handle"] == "@newcreator" for i in data)
    assert any(i["platform"] == "YouTube" for i in data)

    monkeypatch.setattr(repo, "filepath", original_path)
