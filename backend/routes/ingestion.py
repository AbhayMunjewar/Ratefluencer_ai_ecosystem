"""Data ingestion: YouTube API + Kaggle CSV import."""
from __future__ import annotations

import os
import shutil
from typing import Optional

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from backend.models.schemas import (
    KaggleImportRequest,
    KaggleImportResponse,
    YouTubeSyncRequest,
    YouTubeSyncResponse,
)
from backend.repositories.influencer_repository import InfluencerRepository
from backend.services.kaggle_import_service import KaggleImportService
from backend.services.youtube_ingestion_service import YouTubeIngestionService

router = APIRouter(prefix="/data", tags=["data-ingestion"])

influencer_repo = InfluencerRepository()
youtube_service = YouTubeIngestionService()
kaggle_service = KaggleImportService(influencer_repo)


@router.get("/imports/csv")
async def list_import_csvs():
    """List CSV files placed in backend/data/imports/."""
    return {"files": kaggle_service.list_available_csvs()}


@router.post("/youtube/sync", response_model=YouTubeSyncResponse)
async def sync_youtube(request: YouTubeSyncRequest):
    if not youtube_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Set YOUTUBE_API_KEY in your environment. See backend/data/DATA_SOURCES.md",
        )

    if request.influencer_id is not None:
        influencer = influencer_repo.get_by_id(request.influencer_id)
        if not influencer:
            raise HTTPException(status_code=404, detail="Influencer not found")
        if (influencer.get("platform") or "").lower() != "youtube":
            raise HTTPException(
                status_code=400,
                detail="Influencer is not a YouTube profile",
            )
        result = youtube_service.sync_influencer(influencer)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        influencer_repo.save(result)
        return YouTubeSyncResponse(
            synced_count=1,
            error_count=0,
            message=f"Synced {result.get('handle')}",
        )

    all_influencers = influencer_repo.get_all()
    batch = youtube_service.sync_all_youtube(all_influencers)
    influencer_repo.save_all(batch["updated"])
    return YouTubeSyncResponse(
        synced_count=batch["synced_count"],
        error_count=batch["error_count"],
        errors=batch["errors"],
        message="YouTube sync finished. Rows without a real channel id/handle keep old data.",
    )


@router.post("/kaggle/import", response_model=KaggleImportResponse)
async def import_kaggle_csv(request: KaggleImportRequest):
    try:
        result = kaggle_service.import_from_csv(
            request.csv_path,
            request.platform,
            limit=request.limit,
            replace_platform=request.replace_platform,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return KaggleImportResponse(
        imported_count=result["imported_count"],
        platform=result["platform"],
        csv_path=result["csv_path"],
        total_influencers=result["total_influencers"],
        sample_handles=result.get("sample_handles") or [],
    )


@router.post("/kaggle/upload")
async def upload_kaggle_csv(
    platform: str,
    file: UploadFile = File(...),
    limit: Optional[int] = 20,
    replace_platform: bool = True,
):
    """Upload a Kaggle CSV, save to imports/, then import."""
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Upload a .csv file")

    imports_dir = kaggle_service._imports_dir()
    safe_name = os.path.basename(file.filename)
    dest = os.path.join(imports_dir, safe_name)

    with open(dest, "wb") as out:
        shutil.copyfileobj(file.file, out)

    result = kaggle_service.import_from_csv(
        safe_name,
        platform,
        limit=limit,
        replace_platform=replace_platform,
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
