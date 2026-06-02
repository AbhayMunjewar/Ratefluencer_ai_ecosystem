from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager

from backend.routes.endpoints import router
from backend.routes.ingestion import router as ingestion_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from backend.ml.training import ensure_models_trained

        ensure_models_trained()
    except Exception:
        pass
    try:
        from backend.config import get_youtube_api_key
        from backend.services.youtube_influencer_store import load_youtube_influencers, sync_youtube_from_seeds

        if get_youtube_api_key():
            sync_youtube_from_seeds(force=False)
            load_youtube_influencers()
    except Exception:
        pass
    yield


app = FastAPI(
    title="Ratefluencer AI Influencer Intelligence Engine API",
    description="""
    Production-ready backend API for the Ratefluencer AI Ecosystem.
    Exposes advanced analytical service engines for follower authenticity scoring, scenario-based growth timeline predictions, multi-metric brand compatibility matching, campaign success forecasts, and unified Ratefluencer intelligence scores.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routing endpoints
app.include_router(router)
app.include_router(ingestion_router)

# --- Global Exception Handlers ---

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Format request payload validation errors cleanly for frontend consumption.
    """
    errors = []
    for error in exc.errors():
        field = " -> ".join([str(loc) for loc in error.get("loc", []) if loc != "body"])
        message = error.get("msg", "Invalid value")
        errors.append({
            "field": field,
            "message": message,
            "type": error.get("type", "value_error")
        })
        
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Request validation failed",
            "details": errors
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catch any unhandled internal server exceptions.
    """
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "message": str(exc)
        }
    )

@app.get("/", summary="Health Check")
async def health_check():
    from backend.config import get_youtube_api_key
    from backend.repositories.repositories import InfluencerRepository

    repo = InfluencerRepository()
    return {
        "status": "healthy",
        "service": "Ratefluencer AI Intelligence API",
        "version": "1.0.0",
        "catalog": {
            "instagram": len(repo.get_by_platform("Instagram")),
            "tiktok": len(repo.get_by_platform("TikTok")),
            "youtube_cached": len(repo.get_by_platform("YouTube")),
        },
        "youtube_api_configured": bool(get_youtube_api_key()),
    }
