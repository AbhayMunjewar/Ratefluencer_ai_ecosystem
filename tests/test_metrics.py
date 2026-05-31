from backend.utils import metrics as m


def test_engagement_rate_computed_from_profile_fields():
    profile = m.normalize_profile(
        {
            "id": "test-1",
            "followers": 100_000,
            "avgLikes": 5000,
            "avgComments": 250,
        }
    )
    er = m.engagement_rate(profile)
    assert er > 0
    assert er < 20


def test_fake_follower_signal_increases_with_low_engagement():
    high_er_profile = m.normalize_profile(
        {"id": "a", "followers": 1_000_000, "engagement": 9.0, "avgLikes": 90_000}
    )
    low_er_profile = m.normalize_profile(
        {"id": "b", "followers": 1_000_000, "engagement": 0.4, "avgLikes": 4000}
    )

    from backend.services.authenticity_engine import generate_authenticity_report

    high_report = generate_authenticity_report(high_er_profile)
    low_report = generate_authenticity_report(low_er_profile)
    assert low_report.fake_follower_probability != high_report.fake_follower_probability
    assert any("engagement" in w.lower() for w in low_report.warnings)
