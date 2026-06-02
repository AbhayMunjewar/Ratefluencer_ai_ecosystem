from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, Field


class AuthenticityRequest(BaseModel):
    influencer_id: Union[int, str] = Field(..., description="ID of the influencer to analyze")


class AuthenticityResponse(BaseModel):
    authenticity_score: int = Field(..., ge=0, le=100)
    engagement_rate: float = Field(...)
    risk_level: str = Field(...)
    fake_follower_probability: int = Field(..., ge=0, le=100)
    engagement_pod_probability: int = Field(..., ge=0, le=100)
    bot_activity_probability: int = Field(..., ge=0, le=100)
    artificial_spike_probability: int = Field(..., ge=0, le=100)
    engagement_quality_score: Optional[int] = Field(None, ge=0, le=100)
    audience_quality_score: Optional[int] = Field(None, ge=0, le=100)
    comment_quality_score: Optional[int] = Field(None, ge=0, le=100)
    anomaly_score: Optional[int] = Field(None, ge=0, le=100)


class GrowthRequest(BaseModel):
    """Classify growth tier via influencer_id or direct post metrics."""

    influencer_id: Optional[Union[int, str]] = None
    scenario: Optional[str] = Field(
        default=None,
        description="Deprecated; ignored by ML tier classifier.",
    )
    followers: Optional[int] = Field(None, ge=0)
    likes: Optional[int] = Field(None, ge=0)
    comments: Optional[int] = Field(None, ge=0)
    shares: Optional[int] = Field(None, ge=0)
    saves: Optional[int] = Field(None, ge=0)
    reach: Optional[int] = Field(None, ge=0)
    impressions: Optional[int] = Field(None, ge=0)
    engagement_rate: Optional[float] = Field(None, ge=0)
    caption_length: Optional[int] = Field(None, ge=0)
    hashtags_count: Optional[int] = Field(None, ge=0)
    post_hour: Optional[int] = Field(None, ge=0, le=23)
    account_type: Optional[str] = None
    content_category: Optional[str] = None
    media_type: Optional[str] = None
    traffic_source: Optional[str] = None
    day_of_week: Optional[str] = None
    has_call_to_action: Optional[bool] = None


class GrowthResponse(BaseModel):
    growthTier: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    growthScore: int = Field(..., ge=0, le=100)
    topFactors: List[str] = Field(default_factory=list)
    improvementSuggestions: List[str] = Field(default_factory=list)
    probabilities: Optional[Dict[str, float]] = None
    modelVersion: Optional[str] = None
    influencer_id: Optional[Union[int, str]] = None
    current_followers: Optional[int] = None


class BrandMatchItem(BaseModel):
    influencer: str
    score: int = Field(..., ge=0, le=100)
    influencer_id: Optional[Union[int, str]] = None


class BrandMatchRequest(BaseModel):
    brand_id: Union[int, str]


class BrandMatchResponse(BaseModel):
    matches: List[BrandMatchItem]
    brand_match_score: Optional[int] = Field(None, ge=0, le=100)
    recommendation_reasoning: Optional[str] = None
    embedding_model: Optional[str] = None


class CampaignSuccessRequest(BaseModel):
    campaign_id: Union[int, str]
    influencer_id: Union[int, str]


class CampaignSuccessResponse(BaseModel):
    success_probability: int = Field(..., ge=0, le=100)
    predicted_outcome: Optional[str] = None
    confidence: Optional[float] = Field(None, ge=0, le=1)
    probability_success: Optional[float] = Field(None, ge=0, le=1)
    probability_failure: Optional[float] = Field(None, ge=0, le=1)
    model_version: Optional[str] = None
    brand_match_score: Optional[int] = Field(None, ge=0, le=100)
    top_factors: Optional[List[str]] = None
    source: Optional[str] = None
    campaign_id: Optional[Union[int, str]] = None
    influencer_id: Optional[Union[int, str]] = None
    campaign_name: Optional[str] = None
    influencer_name: Optional[str] = None
    platform: Optional[str] = None
    category: Optional[str] = None


class RatefluencerRequest(BaseModel):
    influencer_id: Union[int, str]


class RatefluencerResponse(BaseModel):
    authenticity: int = Field(..., ge=0, le=100)
    growth: int = Field(..., ge=0, le=100)
    brand_match: int = Field(..., ge=0, le=100)
    campaign_success: int = Field(..., ge=0, le=100)
    ratefluencer_score: int = Field(..., ge=0, le=100)
    recommended_brands: List[str]
    ml_model_version: Optional[str] = None
    insights: List[str]
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    recommendation_reasoning: Optional[str] = None
    brand_match_score: Optional[int] = Field(None, ge=0, le=100)


class InfluencerAnalyticsResponse(BaseModel):
    influencer_id: Union[int, str]
    handle: Optional[str]
    followers: int
    following: int
    likes: int
    comments: int
    shares: int
    saves: int
    views: int
    posting_frequency_per_week: float
    audience_demographics: Dict[str, Any]
    engagement_rate: float
    share_rate: float
    save_rate: float
    comment_rate: float
    audience_quality: int
    posting_consistency: int
    audience_reach_score: int


class DashboardResponse(BaseModel):
    metrics: Dict[str, Any]
    activity_feed: List[Dict[str, Any]]


class AuthenticityReportResponse(BaseModel):
    authenticityScore: int = Field(..., ge=0, le=100)
    riskLevel: str
    confidence: float = Field(..., ge=0, le=1)
    audienceQualityScore: int = Field(..., ge=0, le=100)
    engagementRate: float
    signals: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    explanation: List[str] = Field(default_factory=list)
    fake_follower_probability: int = Field(0, ge=0, le=100)
    engagement_pod_probability: int = Field(0, ge=0, le=100)
    bot_activity_probability: int = Field(0, ge=0, le=100)
    artificial_spike_probability: int = Field(0, ge=0, le=100)
    disclaimer: Optional[str] = None


class YouTubeSyncRequest(BaseModel):
    influencer_id: Optional[Union[int, str]] = Field(
        None, description="Sync one influencer; omit to sync all YouTube rows"
    )


class YouTubeSyncResponse(BaseModel):
    synced_count: int
    error_count: int
    errors: List[Dict[str, Any]] = Field(default_factory=list)
    message: str = ""


class KaggleImportRequest(BaseModel):
    csv_path: str = Field(
        ...,
        description="Path under backend/data/imports/ e.g. instagram.csv",
    )
    platform: str = Field(..., description="Instagram or TikTok")
    limit: Optional[int] = Field(20, ge=1, le=500)
    replace_platform: bool = Field(
        True,
        description="Remove existing rows for this platform before import",
    )


class KaggleImportResponse(BaseModel):
    imported_count: int
    platform: str
    csv_path: str
    total_influencers: int
    sample_handles: List[str] = Field(default_factory=list)
