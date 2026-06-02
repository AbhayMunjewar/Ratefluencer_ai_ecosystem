from fastapi import APIRouter, HTTPException, status

from backend.models.schemas import (
    AuthenticityRequest,
    AuthenticityResponse,
    BrandMatchRequest,
    BrandMatchResponse,
    CampaignSuccessRequest,
    CampaignSuccessResponse,
    DashboardResponse,
    GrowthRequest,
    GrowthResponse,
    InfluencerAnalyticsResponse,
    AuthenticityReportResponse,
    RatefluencerRequest,
    RatefluencerResponse,
)
from backend.repositories.brand_repository import BrandRepository
from backend.repositories.influencer_repository import InfluencerRepository
from backend.repositories.repositories import (
    ActivityRepository,
    AIOutputsRepository,
    CampaignRepository,
    DashboardMetricsRepository,
    LeaderboardRepository,
)
from backend.services.authenticity_service import AuthenticityService
from backend.services.brand_matching_service import BrandMatchingService
from backend.services.campaign_success_service import CampaignSuccessService
from backend.services.dashboard_service import DashboardService
from backend.services.growth_service import GrowthService
from backend.services.influencer_analytics_service import InfluencerAnalyticsService
from backend.services.ratefluencer_service import RatefluencerService
from backend.services.rag_recommendation_service import RAGRecommendationService
from backend.services.youtube_ingestion_service import YouTubeIngestionService

router = APIRouter()

influencer_repo = InfluencerRepository()
brand_repo = BrandRepository()
campaign_repo = CampaignRepository()
activity_repo = ActivityRepository()
metrics_repo = DashboardMetricsRepository()
leaderboard_repo = LeaderboardRepository()
ai_outputs_repo = AIOutputsRepository()

authenticity_service = AuthenticityService(influencer_repo)
growth_service = GrowthService(influencer_repo)
brand_match_service = BrandMatchingService(brand_repo, influencer_repo)
rag_service = RAGRecommendationService(brand_repo)
campaign_success_service = CampaignSuccessService(
    campaign_repo, influencer_repo, authenticity_service, growth_service
)
ratefluencer_service = RatefluencerService(
    influencer_repo,
    brand_repo,
    authenticity_service,
    brand_match_service,
    rag_service,
    growth_service,
)
dashboard_service = DashboardService(metrics_repo, activity_repo)
analytics_service = InfluencerAnalyticsService(influencer_repo)
youtube_service = YouTubeIngestionService()


@router.get("/youtube/search")
async def search_youtube_live(q: str, max_results: int = 12):
    """Real-time YouTube channel search via YouTube Data API v3."""
    if not youtube_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="YOUTUBE_API_KEY is not configured on the server.",
        )
    if not q or not q.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query parameter 'q' is required.",
        )
    payload = youtube_service.search_channels(q.strip(), max_results=min(max_results, 20))
    if payload.get("error"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(payload["error"]),
        )
    return {
        "results": payload.get("results") or [],
        "query": q.strip(),
        "source": "youtube_api_v3",
    }


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard():
    try:
        return dashboard_service.get_dashboard_data()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load dashboard data: {exc}",
        ) from exc


@router.post("/authenticity/analyze", response_model=AuthenticityResponse)
async def analyze_authenticity(request: AuthenticityRequest):
    result = authenticity_service.calculate_authenticity(request.influencer_id)
    if "error" in result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result["error"])

    influencer = influencer_repo.get_by_id(request.influencer_id)
    if influencer:
        handle = influencer.get("handle", "@creator")
        activity_repo.add_activity(
            {
                "type": "alert" if result["authenticity_score"] < 70 else "info",
                "message": (
                    f"AI authenticity scan complete — {handle} score: "
                    f"{result['authenticity_score']}/100 ({result['risk_level']} risk)"
                ),
                "time": "Just now",
            }
        )
    return result


@router.post("/growth/predict", response_model=GrowthResponse)
async def predict_growth(request: GrowthRequest):
    feature_payload = None
    if request.followers is not None or request.likes is not None:
        feature_payload = request.model_dump(
            exclude={"influencer_id", "scenario"},
            exclude_none=True,
        )

    result = growth_service.predict_growth(
        influencer_id=request.influencer_id,
        scenario=request.scenario or "baseline",
        features=feature_payload,
    )
    if "error" in result:
        status_code = (
            status.HTTP_503_SERVICE_UNAVAILABLE
            if "not found at" in str(result["error"]).lower()
            or "train_growth_classifier" in str(result["error"])
            else status.HTTP_404_NOT_FOUND
        )
        raise HTTPException(status_code=status_code, detail=result["error"])

    if request.influencer_id:
        influencer = influencer_repo.get_by_id(request.influencer_id)
        if influencer:
            handle = influencer.get("handle", "@creator")
            activity_repo.add_activity(
                {
                    "type": "info",
                    "message": (
                        f"Growth tier for {handle}: {result['growthTier']} "
                        f"({int(result['confidence'] * 100)}% confidence, "
                        f"score {result['growthScore']}/100)"
                    ),
                    "time": "Just now",
                }
            )
    return result


@router.post("/brand-match", response_model=BrandMatchResponse)
async def match_brand(request: BrandMatchRequest):
    result = brand_match_service.match_brand(request.brand_id)
    if "error" in result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result["error"])

    brand = brand_repo.get_by_id(request.brand_id)
    if brand and result.get("matches"):
        best = result["matches"][0]
        reasoning = rag_service.build_recommendation_reasoning(
            influencer_repo.get_by_id(best.get("influencer_id")) or {},
            brand,
        )
        result["recommendation_reasoning"] = reasoning

        activity_repo.add_activity(
            {
                "type": "success",
                "message": (
                    f"High compatibility brand match: {brand.get('name')} ↔ "
                    f"{best.get('influencer')} ({best.get('score')}% match)"
                ),
                "time": "Just now",
            }
        )

    return result


@router.post("/campaign-success", response_model=CampaignSuccessResponse)
async def campaign_success(request: CampaignSuccessRequest):
    from backend.ml.campaign_success_classifier import is_model_available

    result = campaign_success_service.predict_campaign_success(
        request.campaign_id, request.influencer_id
    )
    if "error" in result:
        detail = result["error"]
        if "not found" in detail.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
        if not is_model_available() and "classifier not found" in detail.lower():
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

    campaign = campaign_repo.get_by_id(request.campaign_id)
    influencer = influencer_repo.get_by_id(request.influencer_id)
    if campaign and influencer:
        activity_repo.add_activity(
            {
                "type": "success",
                "message": (
                    f"Campaign '{campaign.get('name')}' ROI projection: "
                    f"{result['success_probability']}% fit for {influencer.get('handle')}"
                ),
                "time": "Just now",
            }
        )
    return result


@router.post("/ratefluencer", response_model=RatefluencerResponse)
async def calculate_ratefluencer_score(request: RatefluencerRequest):
    result = ratefluencer_service.calculate_master_score(request.influencer_id)
    if "error" in result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result["error"])

    influencer = influencer_repo.get_by_id(request.influencer_id)
    if influencer:
        handle = influencer.get("handle", "@creator")
        activity_repo.add_activity(
            {
                "type": "success",
                "message": (
                    f"Ecosystem index updated: {handle} Master Ratefluencer score computed: "
                    f"{result['ratefluencer_score']}/100"
                ),
                "time": "Just now",
            }
        )
    return result


@router.get("/influencers/{id}/analytics", response_model=InfluencerAnalyticsResponse)
async def get_influencer_analytics(id: str):
    result = analytics_service.analyze_profile(id)
    if "error" in result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result["error"])
    return result


@router.get("/influencers")
async def get_all_influencers(platform: str | None = None):
    try:
        if platform and platform.lower() != "all":
            return influencer_repo.get_by_platform(platform)
        return influencer_repo.get_all()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch influencers: {exc}",
        ) from exc


@router.get("/influencers/by-platform")
async def get_influencers_by_platform():
    """Grouped catalog for search UI: Instagram, TikTok, YouTube."""
    try:
        return {
            "Instagram": influencer_repo.get_by_platform("Instagram"),
            "TikTok": influencer_repo.get_by_platform("TikTok"),
            "YouTube": influencer_repo.get_by_platform("YouTube"),
            "counts": {
                "Instagram": len(influencer_repo.get_by_platform("Instagram")),
                "TikTok": len(influencer_repo.get_by_platform("TikTok")),
                "YouTube": len(influencer_repo.get_by_platform("YouTube")),
            },
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to group influencers: {exc}",
        ) from exc


@router.get("/influencers/{id}/authenticity", response_model=AuthenticityReportResponse)
async def get_influencer_authenticity(id: str):
    result = authenticity_service.get_authenticity_report(id)
    if "error" in result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result["error"])
    return result


@router.get("/influencers/{id}")
async def get_influencer_by_id(id: str):
    influencer = influencer_repo.resolve_by_id(id)
    if influencer:
        return influencer
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Influencer not found")


@router.get("/brands")
async def get_all_brands():
    try:
        return brand_repo.get_all()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch brands: {exc}",
        ) from exc


@router.get("/campaigns")
async def get_all_campaigns():
    try:
        return campaign_repo.get_all()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch campaigns: {exc}",
        ) from exc


@router.post("/campaigns", status_code=status.HTTP_201_CREATED)
async def create_campaign(campaign: dict):
    try:
        if not campaign.get("name"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Campaign name is required",
            )
        return campaign_repo.create(campaign)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create campaign: {exc}",
        ) from exc


@router.get("/leaderboard")
async def get_leaderboard():
    try:
        return leaderboard_repo.get_all()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch leaderboard: {exc}",
        ) from exc


@router.get("/ai-outputs")
async def get_ai_outputs():
    try:
        return ai_outputs_repo.get_all()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch AI outputs: {exc}",
        ) from exc
