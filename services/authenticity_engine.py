"""
Heuristic Influencer Authenticity Engine.

Estimates risk of fake followers, bots, pods, and inflated metrics.
Does NOT claim certainty — outputs scores, confidence, and reasoning.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

from backend.utils import metrics as m
from backend.utils.parse_counts import parse_count


@dataclass
class InfluencerTier:
    name: str
    min_followers: int
    max_followers: int


TIERS: List[InfluencerTier] = [
    InfluencerTier("Micro", 10_000, 100_000),
    InfluencerTier("Mid", 100_000, 1_000_000),
    InfluencerTier("Macro", 1_000_000, 10_000_000),
    InfluencerTier("Mega", 10_000_000, 10_000_000_000),
]


# (min_er, max_er) expected engagement rate % by platform and tier
ER_BASELINES: Dict[str, Dict[str, Tuple[float, float]]] = {
    "Instagram": {
        "Micro": (2.0, 8.0),
        "Mid": (1.2, 5.0),
        "Macro": (0.8, 3.5),
        "Mega": (0.3, 2.0),
    },
    "TikTok": {
        "Micro": (4.0, 15.0),
        "Mid": (3.0, 10.0),
        "Macro": (2.0, 8.0),
        "Mega": (1.0, 5.0),
    },
    "YouTube": {
        "Micro": (2.0, 10.0),
        "Mid": (1.5, 6.0),
        "Macro": (0.8, 4.0),
        "Mega": (0.3, 2.5),
    },
}

LIKE_RATIO_BASELINES: Dict[str, Tuple[float, float]] = {
    "Instagram": (0.01, 0.12),
    "TikTok": (0.02, 0.20),
    "YouTube": (0.005, 0.08),
}

COMMENT_LIKE_BASELINES: Dict[str, Tuple[float, float]] = {
    "Instagram": (0.01, 0.08),
    "TikTok": (0.002, 0.05),
    "YouTube": (0.005, 0.06),
}

VIEW_SUB_BASELINES: Dict[str, Tuple[float, float]] = {
    "YouTube": (0.05, 0.80),
    "TikTok": (0.10, 2.50),
    "Instagram": (0.02, 0.40),
}


@dataclass
class AuthenticityReport:
    authenticity_score: int
    risk_level: str
    confidence: float
    audience_quality_score: int
    engagement_rate: float
    signals: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    explanation: List[str] = field(default_factory=list)
    fake_follower_probability: int = 0
    engagement_pod_probability: int = 0
    bot_activity_probability: int = 0
    artificial_spike_probability: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "authenticityScore": self.authenticity_score,
            "authenticity_score": self.authenticity_score,
            "riskLevel": self.risk_level,
            "risk_level": self._legacy_risk_bucket(),
            "confidence": round(self.confidence, 2),
            "audienceQualityScore": self.audience_quality_score,
            "audience_quality_score": self.audience_quality_score,
            "engagementRate": self.engagement_rate,
            "engagement_rate": self.engagement_rate,
            "signals": self.signals,
            "warnings": self.warnings,
            "explanation": self.explanation,
            "fake_follower_probability": self.fake_follower_probability,
            "engagement_pod_probability": self.engagement_pod_probability,
            "bot_activity_probability": self.bot_activity_probability,
            "artificial_spike_probability": self.artificial_spike_probability,
            "engagement_quality_score": self.audience_quality_score,
            "comment_quality_score": max(0, 100 - self.bot_activity_probability),
            "anomaly_score": max(0, 100 - self.artificial_spike_probability),
            "disclaimer": (
                "Heuristic estimate only. This does not prove fraud or label an account as fake."
            ),
        }

    def _legacy_risk_bucket(self) -> str:
        if self.authenticity_score >= 85:
            return "Low"
        if self.authenticity_score >= 60:
            return "Medium"
        return "High"


def get_tier(followers: int) -> str:
    for tier in TIERS:
        if tier.min_followers <= followers < tier.max_followers:
            return tier.name
    if followers < 10_000:
        return "Nano"
    return "Mega"


def calculate_engagement_rate(profile: Dict[str, Any]) -> float:
    return m.engagement_rate(m.normalize_profile(profile))


def calculate_like_ratio(profile: Dict[str, Any]) -> float:
    profile = m.normalize_profile(profile)
    followers = max(1, profile["followers"])
    return profile["avgLikes"] / followers


def calculate_comment_ratio(profile: Dict[str, Any]) -> float:
    profile = m.normalize_profile(profile)
    likes = max(1.0, profile["avgLikes"])
    return profile["avgComments"] / likes


def calculate_view_ratio(profile: Dict[str, Any]) -> float:
    profile = m.normalize_profile(profile)
    followers = max(1, profile["followers"])
    views = float(profile.get("views") or 0)
    if views <= 0:
        views = followers * float(profile.get("engagement", 3)) * 5
    return views / followers


def detect_growth_anomalies(growth: List[float]) -> Tuple[int, float, List[str]]:
    if len(growth) < 3:
        return 100, 0.0, ["Growth history too short for spike analysis"]

    warnings: List[str] = []
    rates: List[float] = []
    for i in range(1, len(growth)):
        prev, curr = growth[i - 1], growth[i]
        if prev > 0:
            rates.append((curr - prev) / prev)

    if not rates:
        return 100, 0.0, warnings

    avg_rate = sum(rates) / len(rates)
    max_spike = max(rates)
    score = 100
    for rate in rates:
        if rate > 0.55:
            score -= 35
            warnings.append(f"Large growth jump detected ({rate * 100:.0f}% period increase)")
        elif rate > 0.35 and rate > 2.5 * max(avg_rate, 0.01):
            score -= 20
            warnings.append("Sudden follower spike relative to prior trend")

    if max_spike > 0.5:
        warnings.append("Pattern may indicate purchased follower bursts (heuristic)")

    return int(m.clamp(score)), max_spike, warnings


def calculate_audience_quality(profile: Dict[str, Any]) -> int:
    profile = m.normalize_profile(profile)
    er = calculate_engagement_rate(profile)
    like_r = calculate_like_ratio(profile)
    comment_r = calculate_comment_ratio(profile)
    view_r = calculate_view_ratio(profile)
    tier = get_tier(profile["followers"])
    platform = profile.get("platform", "Instagram")

    er_lo, er_hi = ER_BASELINES.get(platform, ER_BASELINES["Instagram"]).get(tier, (1.0, 5.0))
    er_mid = (er_lo + er_hi) / 2
    er_score = 100 - min(100, abs(er - er_mid) / max(er_mid, 0.1) * 40)

    lr_lo, lr_hi = LIKE_RATIO_BASELINES.get(platform, (0.01, 0.10))
    lr_mid = (lr_lo + lr_hi) / 2
    lr_score = 100 - min(100, abs(like_r - lr_mid) / max(lr_mid, 0.001) * 35)

    cr_lo, cr_hi = COMMENT_LIKE_BASELINES.get(platform, (0.01, 0.06))
    cr_score = 100 if cr_lo <= comment_r <= cr_hi else 100 - min(80, abs(comment_r - cr_hi) * 400)

    vr_lo, vr_hi = VIEW_SUB_BASELINES.get(platform, (0.05, 0.50))
    vr_score = 100 if vr_lo <= view_r <= vr_hi else 100 - min(70, abs(view_r - vr_hi) * 30)

    posting = profile.get("postingFrequency") or profile.get("postsPerWeek") or 3
    post_score = 100 - min(40, abs(posting - 4) * 8)

    raw = er_score * 0.35 + lr_score * 0.25 + cr_score * 0.2 + vr_score * 0.1 + post_score * 0.1
    return int(m.clamp(raw))


def _risk_label_from_score(score: int) -> str:
    if score >= 90:
        return "Highly Authentic"
    if score >= 75:
        return "Authentic"
    if score >= 60:
        return "Likely Authentic"
    if score >= 40:
        return "Suspicious"
    if score >= 20:
        return "High Risk"
    return "Very High Risk"


def _confidence_from_profile(profile: Dict[str, Any], growth_warnings: List[str]) -> float:
    score = 0.55
    if profile.get("followers", 0) > 0:
        score += 0.15
    if profile.get("avgLikes", 0) > 0:
        score += 0.12
    if profile.get("avgComments", 0) > 0:
        score += 0.08
    if profile.get("views", 0) > 0:
        score += 0.05
    if profile.get("dataSource"):
        score += 0.05
    if len(growth_warnings) > 2:
        score -= 0.08
    if len(profile.get("growth", [])) < 3:
        score -= 0.1
    return round(m.clamp(score * 100, 40, 98) / 100, 2) if score < 1 else round(min(0.98, max(0.4, score)), 2)


def calculate_authenticity_score(
    profile: Dict[str, Any],
    *,
    audience_quality: int,
    growth_score: int,
    er_penalty: int,
    like_penalty: int,
    comment_penalty: int,
    view_penalty: int,
    posting_penalty: int,
) -> int:
    base = (
        audience_quality * 0.45
        + growth_score * 0.20
        + max(0, 100 - er_penalty) * 0.15
        + max(0, 100 - like_penalty) * 0.10
        + max(0, 100 - comment_penalty) * 0.10
    )
    base -= posting_penalty * 0.05
    return int(m.clamp(base))


def _penalty_outside_range(value: float, low: float, high: float, weight: float = 100) -> int:
    if low <= value <= high:
        return 0
    if value < low:
        gap = (low - value) / max(low, 0.0001)
    else:
        gap = (value - high) / max(high, 0.0001)
    return int(m.clamp(gap * weight))


def generate_authenticity_report(profile: Dict[str, Any]) -> AuthenticityReport:
    profile = m.normalize_profile(profile)
    platform = profile.get("platform", "Instagram")
    tier = get_tier(profile["followers"])
    er = calculate_engagement_rate(profile)
    like_r = calculate_like_ratio(profile)
    comment_r = calculate_comment_ratio(profile)
    view_r = calculate_view_ratio(profile)

    signals: List[str] = []
    warnings: List[str] = []
    explanation: List[str] = []

    er_lo, er_hi = ER_BASELINES.get(platform, ER_BASELINES["Instagram"]).get(tier, (1.0, 5.0))
    er_penalty = _penalty_outside_range(er, er_lo, er_hi, 90)
    if er_penalty == 0:
        signals.append("Engagement rate within expected range for platform and tier")
    elif er < er_lo:
        warnings.append("Engagement rate is unusually low for audience size")
        explanation.append("Low interaction relative to followers may indicate inactive or purchased audiences")
    else:
        warnings.append("Engagement rate is unusually high — possible inflated interactions")
        explanation.append("Extreme engagement can sometimes reflect pods or purchased likes (heuristic)")

    lr_lo, lr_hi = LIKE_RATIO_BASELINES.get(platform, (0.01, 0.10))
    like_penalty = _penalty_outside_range(like_r, lr_lo, lr_hi, 85)
    if like_penalty == 0:
        signals.append("Like-to-follower ratio appears typical")
    elif like_r < lr_lo:
        warnings.append("Very low likes relative to followers")
        explanation.append("May suggest bought followers or disengaged audience")
    else:
        warnings.append("Elevated like-to-follower ratio")

    cr_lo, cr_hi = COMMENT_LIKE_BASELINES.get(platform, (0.01, 0.06))
    comment_penalty = _penalty_outside_range(comment_r, cr_lo, cr_hi, 95)
    if comment_penalty == 0:
        signals.append("Comment-to-like ratio looks organic")
    elif comment_r < cr_lo * 0.5:
        warnings.append("Very few comments compared to likes — possible purchased likes or pods")
        explanation.append("High likes with minimal comments is a common engagement-quality red flag")
    elif comment_r > cr_hi:
        signals.append("Strong comment participation relative to likes")

    view_penalty = 0
    if platform in {"YouTube", "TikTok"} or profile.get("views", 0) > 0:
        vr_lo, vr_hi = VIEW_SUB_BASELINES.get(platform, (0.05, 0.50))
        view_penalty = _penalty_outside_range(view_r, vr_lo, vr_hi, 80)
        if view_penalty == 0:
            signals.append("View-to-audience ratio is within a healthy band")
        elif view_r < vr_lo:
            warnings.append("Views/subscribers ratio is low — possible inactive subscribers")
        else:
            warnings.append("View ratio elevated relative to subscriber base")

    posting = float(profile.get("postingFrequency") or profile.get("postsPerWeek") or 0)
    posting_penalty = 0
    if posting <= 0.2 and profile["followers"] > 100_000:
        posting_penalty = 40
        warnings.append("Large audience with very low posting activity")
    elif posting > 14:
        posting_penalty = 15
        warnings.append("Extremely high posting frequency")

    growth_score, max_spike, growth_warnings = detect_growth_anomalies(profile.get("growth", []))
    warnings.extend(growth_warnings)
    if growth_score >= 85 and not growth_warnings:
        signals.append("No major artificial growth spikes detected in available history")

    audience_quality = calculate_audience_quality(profile)
    if audience_quality >= 75:
        signals.append("Overall audience quality heuristics are favorable")
    else:
        explanation.append("Combined engagement and ratio signals suggest elevated authenticity risk")

    auth_score = calculate_authenticity_score(
        profile,
        audience_quality=audience_quality,
        growth_score=growth_score,
        er_penalty=er_penalty,
        like_penalty=like_penalty,
        comment_penalty=comment_penalty,
        view_penalty=view_penalty,
        posting_penalty=posting_penalty,
    )

    fake_follower_probability = int(
        m.clamp(
            (like_penalty * 0.35 + er_penalty * 0.35 + view_penalty * 0.15 + posting_penalty * 0.15)
        )
    )
    engagement_pod_probability = int(m.clamp(comment_penalty * 0.7 + er_penalty * 0.3))
    bot_activity_probability = int(m.clamp(comment_penalty * 0.5 + like_penalty * 0.2))
    artificial_spike_probability = int(m.clamp(max_spike * 120 + (100 - growth_score) * 0.4))

    if not explanation:
        explanation.append(
            "This assessment is probabilistic. It highlights anomalies; it does not prove inauthenticity."
        )

    confidence = _confidence_from_profile(profile, growth_warnings)

    return AuthenticityReport(
        authenticity_score=auth_score,
        risk_level=_risk_label_from_score(auth_score),
        confidence=confidence,
        audience_quality_score=audience_quality,
        engagement_rate=er,
        signals=signals[:8],
        warnings=warnings[:8],
        explanation=explanation[:6],
        fake_follower_probability=fake_follower_probability,
        engagement_pod_probability=engagement_pod_probability,
        bot_activity_probability=bot_activity_probability,
        artificial_spike_probability=artificial_spike_probability,
    )
