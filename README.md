# Ratefluencer AI Ecosystem

Ratefluencer AI Ecosystem is an influencer intelligence platform for evaluating creators, matching them with brands, forecasting campaign outcomes, and supporting data-driven creator discovery across Instagram, TikTok, and YouTube.

The project combines a React/Vite frontend with a FastAPI backend, local JSON/CSV datasets, machine-learning models, and optional YouTube Data API integration.

## Features

- Creator discovery across Instagram, TikTok, and cached/live YouTube profiles
- Authenticity analysis for follower quality and risk signals
- Growth prediction using trained ML classifiers and profile metrics
- Brand-to-influencer compatibility matching
- Campaign success probability forecasting
- Unified Ratefluencer score for creator evaluation
- Dashboard, leaderboard, campaign, brand, and AI-output views
- Kaggle CSV import and YouTube channel sync endpoints

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Material UI, Radix UI, Recharts
- Backend: FastAPI, Pydantic, Uvicorn
- ML/Data: pandas, NumPy, scikit-learn, XGBoost, joblib, sentence-transformers, ChromaDB
- Testing: pytest, FastAPI TestClient

## Repository Structure

```text
.
|-- backend/                 # FastAPI API, services, repositories, ML models, tests
|   |-- data/                # JSON data, sample catalogs, import folder, lightweight model artifacts
|   |-- dataset/             # Creator CSV datasets used by the app
|   |-- ml/                  # Training, prediction, and feature engineering code
|   |-- models/              # API schemas and trained model files
|   |-- routes/              # API route modules
|   |-- services/            # Business logic and scoring engines
|   |-- tests/               # Backend test suite
|   `-- requirements.txt     # Backend Python dependencies
|-- frontend/                # React/Vite application
|   |-- src/app/             # Pages, layout, components, hooks, services
|   |-- package.json         # Frontend dependencies and scripts
|   `-- vite.config.ts       # Vite config and /api proxy
|-- .env.example             # Environment variable template
|-- requirements.txt         # Root Python dependency reference
`-- .gitignore
```

## Prerequisites

- Python 3.11 or newer
- Node.js 18 or newer
- npm 9 or newer
- Optional: Google Cloud YouTube Data API v3 key

## Environment Setup

Create a local `.env` file from the example:

```powershell
Copy-Item .env.example .env
```

Set the values you need:

```env
YOUTUBE_API_KEY=your_key_here
VITE_API_BASE_URL=http://localhost:8000
```

`YOUTUBE_API_KEY` is required only for live YouTube search and sync. Without it, the app still works with local Instagram, TikTok, and cached data.

## Backend Setup

From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Backend URLs:

- API health check: `http://127.0.0.1:8000/`
- Swagger docs: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Frontend Setup

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

- `http://localhost:5173`

The Vite dev server proxies `/api` requests to `http://127.0.0.1:8000`, so the frontend and backend work together during local development.

## Common API Endpoints

- `GET /` - API health and catalog counts
- `GET /dashboard` - dashboard metrics and activity feed
- `GET /influencers` - creator catalog
- `GET /influencers/by-platform` - creators grouped by platform
- `GET /brands` - brand catalog
- `GET /campaigns` - campaign catalog
- `POST /authenticity/analyze` - authenticity score
- `POST /growth/predict` - growth forecast
- `POST /brand-match` - brand compatibility ranking
- `POST /campaign-success` - campaign success forecast
- `POST /ratefluencer` - unified Ratefluencer score
- `GET /youtube/search?q=<query>` - live YouTube channel search
- `POST /data/youtube/sync` - sync YouTube metrics
- `POST /data/kaggle/import` - import a CSV from `backend/data/imports`
- `POST /data/kaggle/upload` - upload and import a CSV

## Running Tests

```powershell
pytest backend\tests
```

## Build

Build the frontend production bundle:

```powershell
cd frontend
npm run build
```

## Git Hygiene

The repository intentionally ignores generated and local-only files, including:

- `.env`
- `.venv/` and other virtual environments
- `frontend/node_modules/`
- `frontend/dist/`
- `__pycache__/` and test caches
- generated Chroma/vector database data
- backup files and local TODO notes

Keep secrets in `.env` only. Commit reusable configuration through `.env.example`.

## Project Status

This project is prepared as a full-stack AI hackathon/product prototype with working backend services, frontend workflows, local datasets, model artifacts, and API documentation through FastAPI.
