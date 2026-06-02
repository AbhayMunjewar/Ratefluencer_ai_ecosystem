# Ratefluencer Frontend

React/Vite frontend for Ratefluencer AI Ecosystem. It provides dashboard, influencer search, authenticity analysis, growth prediction, brand matching, campaigns, leaderboard, AI copilot, and admin workflows.

## Setup

```powershell
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Backend Connection

During development, Vite proxies `/api` requests to:

```text
http://127.0.0.1:8000
```

Start the backend before using API-powered screens.

To override the API URL, set this in the root `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Scripts

```powershell
npm run dev
npm run build
```

## Key Folders

- `src/app/pages/` - main application pages
- `src/app/components/` - shared UI and layout components
- `src/app/services/` - API client logic
- `src/app/hooks/` - reusable React hooks
- `src/app/utils/` - frontend utility functions
- `src/styles/` - global styling and theme files
