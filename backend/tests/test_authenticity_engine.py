from backend.services.authenticity_engine import (
    calculate_comment_ratio,
    calculate_engagement_rate,
    detect_growth_anomalies,
    generate_authenticity_report,
)
from backend.utils.metrics import normalize_profile


def test_engagement_rate_formula():
    raw = {
        "id": "t1",
        "followers": 100_000,
        "avgLikes": 3000,
        "avgComments": 150,
        "avgShares": 0,
        "avgSaves": 0,
    }
    profile = normalize_profile(raw)
    er = calculate_engagement_rate(profile)
    expected = round(
        (
            profile["avgLikes"]
            + profile["avgComments"]
            + profile["avgShares"]
            + profile["avgSaves"]
        )
        / profile["followers"]
        * 100,
        2,
    )
    assert er == expected


def test_comment_ratio_flags_low_comments():
    profile = {
        "id": "t2",
        "followers": 500_000,
        "avgLikes": 50_000,
        "avgComments": 10,
        "platform": "Instagram",
    }
    ratio = calculate_comment_ratio(profile)
    assert ratio < 0.01
    report = generate_authenticity_report(profile)
    assert report.authenticity_score < 90
    assert any("comment" in w.lower() for w in report.warnings)


def test_growth_spike_detection():
    score, spike, warnings = detect_growth_anomalies([100, 101, 102, 180, 185])
    assert spike > 0.5
    assert score < 85
    assert warnings


def test_report_includes_disclaimer():
    profile = {
        "id": "ig_1",
        "platform": "Instagram",
        "followers": 1_000_000,
        "avgLikes": 40_000,
        "avgComments": 2_000,
        "growth": [100, 105, 110, 115, 120],
    }
    report = generate_authenticity_report(profile)
    data = report.to_dict()
    assert 0 <= data["authenticityScore"] <= 100
    assert data["confidence"] <= 1.0
    assert "disclaimer" in data
    assert "fake" in data["disclaimer"].lower() or "heuristic" in data["disclaimer"].lower()
