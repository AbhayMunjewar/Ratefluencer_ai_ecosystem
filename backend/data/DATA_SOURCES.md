# Data sources (free hybrid)

| Platform | Source | How |
|----------|--------|-----|
| **YouTube** | YouTube Data API v3 | API key + sync |
| **Instagram** | Kaggle CSV | Download → import |
| **TikTok** | Kaggle CSV | Download → import |

---

## 1. YouTube (API key)

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project → **APIs & Services** → enable **YouTube Data API v3**.
3. **Credentials** → Create **API key**.
4. Set environment variable (PowerShell):

```powershell
$env:YOUTUBE_API_KEY = "your-key-here"
```

Or create `.env` in the project root:

```
YOUTUBE_API_KEY=your-key-here
```

5. For each YouTube row in `influencers.json`, set a **real** channel:

```json
"youtubeChannelId": "UCxxxxxxxxxxxxxxxx"
```

You can find this in the channel URL or YouTube Studio.

6. Sync:

```powershell
cd d:\ratefluencer_ai_ecosystem
py -3.14 backend\scripts\sync_youtube.py
```

Or via API (backend running):

```http
POST http://localhost:8000/data/youtube/sync
Content-Type: application/json

{}
```

Sync one creator:

```json
{ "influencer_id": "3" }
```

Swagger: `http://localhost:8000/docs` → **data-ingestion**

---

## 2. Instagram / TikTok (Kaggle CSV)

1. Create a free [Kaggle](https://www.kaggle.com/) account.
2. Download a dataset, for example:
   - [Instagram Analytics Dataset](https://www.kaggle.com/datasets/kundanbedmutha/instagram-analytics-dataset)
   - [Social Media Engagement (2025)](https://www.kaggle.com/datasets/dagaca/social-media-engagement-2025)
3. Extract the `.csv` file.
4. Copy it to:

```
backend/data/imports/instagram.csv
backend/data/imports/tiktok.csv
```

5. Import:

```powershell
py -3.14 backend\scripts\import_kaggle.py instagram.csv --platform Instagram --limit 20
py -3.14 backend\scripts\import_kaggle.py tiktok.csv --platform TikTok --limit 20
```

Or upload via API:

```http
POST http://localhost:8000/data/kaggle/upload?platform=Instagram&limit=20
```

(multipart form, field name `file`)

Or JSON import if the file is already in `imports/`:

```http
POST http://localhost:8000/data/kaggle/import
Content-Type: application/json

{
  "csv_path": "instagram.csv",
  "platform": "Instagram",
  "limit": 20,
  "replace_platform": true
}
```

**Note:** `replace_platform: true` removes old Instagram rows and replaces them with CSV rows. YouTube rows are kept.

---

## 3. Suggested order

1. Import **Instagram** CSV.
2. Import **TikTok** CSV.
3. Set real `youtubeChannelId` on YouTube rows.
4. Run **YouTube sync**.
5. Restart backend and test the frontend.

---

## CSV columns (flexible)

The importer recognizes many header names, for example:

- `username`, `handle`, `Name` → handle
- `followers`, `Followers` → followers
- `likes`, `avg_likes` → avgLikes
- `biography`, `bio` → bio
- `category`, `niche` → niche

Each imported row gets `dataSource` and `dataAsOf` for transparency.
