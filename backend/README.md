# Ratefluencer Backend

FastAPI backend for Ratefluencer AI Ecosystem. It provides creator analytics, authenticity scoring, growth prediction, brand matching, campaign success forecasting, data ingestion, and ML-powered Ratefluencer scoring.

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

## Environment

Copy `.env.example` to `.env` in the repository root.

```env
YOUTUBE_API_KEY=your_key_here
```

The YouTube key is optional unless you use live YouTube search or sync.

## Useful URLs

- Health: `http://127.0.0.1:8000/`
- Swagger: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Tests

```powershell
pytest backend\tests
```

## Key Folders

- `routes/` - API endpoints
- `services/` - scoring, matching, analytics, ingestion logic
- `repositories/` - JSON-backed data access
- `ml/` - model training, prediction, feature engineering
- `models/` - Pydantic schemas and trained model artifacts
- `data/` - app data, cached data, import directory
- `dataset/` - source creator CSV datasets
- `tests/` - backend tests
