from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from backend.routes.endpoints import router
from backend.routes.ingestion import router as ingestion_router

app = FastAPI(
    title="Ratefluencer AI Influencer Intelligence Engine API",
    description="""
    Production-ready backend API for the Ratefluencer AI Ecosystem.
    Exposes advanced analytical service engines for follower authenticity scoring, scenario-based growth timeline predictions, multi-metric brand compatibility matching, campaign success forecasts, and unified Ratefluencer intelligence scores.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173"
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
    return {
        "status": "healthy",
        "service": "Ratefluencer AI Intelligence API",
        "version": "1.0.0"
    }
