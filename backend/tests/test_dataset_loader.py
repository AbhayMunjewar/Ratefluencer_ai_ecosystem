from backend.services.dataset_loader import load_instagram_influencers, load_tiktok_influencers


def test_instagram_dataset_loads():
    rows = load_instagram_influencers(limit=5)
    assert len(rows) == 5
    assert all(r["platform"] == "Instagram" for r in rows)
    assert rows[0]["followers"] > 0
    assert rows[0]["id"].startswith("ig_")


def test_tiktok_dataset_loads():
    rows = load_tiktok_influencers(limit=3)
    assert len(rows) == 3
    assert all(r["platform"] == "TikTok" for r in rows)
    assert rows[0]["views"] > 0
