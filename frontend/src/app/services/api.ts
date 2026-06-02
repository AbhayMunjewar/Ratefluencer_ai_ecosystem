import localDashboardMetrics from '../../data/dashboardMetrics.json';
import localInfluencers from '../../data/influencers.json';
import localBrands from '../../data/brands.json';
import localCampaigns from '../../data/campaigns.json';
import localActivityFeed from '../../data/activityFeed.json';
import localLeaderboard from '../../data/leaderboard.json';
import localAIOutputs from '../../data/aiOutputs.json';

/** Dev: Vite proxies `/api` → backend. Prod: set VITE_API_BASE_URL or default localhost:8000. */
function resolveBaseUrl(): string {
  const env = import.meta.env.VITE_API_BASE_URL;
  if (env && String(env).trim()) {
    return String(env).replace(/\/$/, '');
  }
  if (import.meta.env.DEV) {
    return '/api';
  }
  return 'http://localhost:8000';
}

const BASE_URL = resolveBaseUrl();

export { BASE_URL };

export type CatalogFetchResult<T> = {
  data: T;
  live: boolean;
  error?: string;
};

let fallbackLogged = false;
function logFallback(reason: string) {
  if (!fallbackLogged) {
    console.warn(`[API] Fallback mode active: ${reason}`);
    fallbackLogged = true;
  }
}

function logSuccess() {
  if (fallbackLogged) {
    console.log('[API] Backend online! Switched to live API mode.');
    fallbackLogged = false;
  }
}

/** True when rows look like bundled demo JSON (numeric ids), not CSV dataset (ig_1, tt_1). */
export function isMockInfluencerCatalog(rows: unknown[]): boolean {
  if (!Array.isArray(rows) || rows.length === 0) return false;
  const sample = rows.slice(0, 5);
  return sample.every(
    row =>
      row &&
      typeof row === 'object' &&
      /^\d+$/.test(String((row as { id?: unknown }).id ?? '')),
  );
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let detail = errorText;
    try {
      const parsed = JSON.parse(errorText);
      detail = parsed.detail ?? parsed.error ?? errorText;
    } catch {
      /* keep raw */
    }
    throw new Error(
      typeof detail === 'string' ? detail : `HTTP ${response.status}: ${response.statusText}`,
    );
  }

  logSuccess();
  return (await response.json()) as T;
}

/**
 * Generic request helper with optional fallback (dashboard, brands, etc.).
 * Influencer catalog methods do NOT use fallback — they must hit the backend CSV/API.
 */
async function request<T>(path: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  try {
    return await fetchJson<T>(path, options);
  } catch (error: unknown) {
    logFallback(error instanceof Error ? error.message : 'Connection refused');
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw error;
  }
}

export const api = {
  baseUrl: BASE_URL,

  async pingBackend(): Promise<{ ok: boolean; error?: string }> {
    const health = await this.getBackendHealth();
    return { ok: health.ok, error: health.error };
  },

  async getBackendHealth(): Promise<{
    ok: boolean;
    youtube_api_configured?: boolean;
    catalog?: { instagram?: number; tiktok?: number; youtube_cached?: number };
    error?: string;
  }> {
    try {
      const data = await fetchJson<{
        status?: string;
        youtube_api_configured?: boolean;
        catalog?: { instagram?: number; tiktok?: number; youtube_cached?: number };
      }>('/');
      return {
        ok: data.status === 'healthy',
        youtube_api_configured: data.youtube_api_configured,
        catalog: data.catalog,
      };
    } catch (error: unknown) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Cannot reach backend',
      };
    }
  },

  /**
   * GET /influencers — Instagram/TikTok from CSV on server; YouTube from API cache + live search.
   * Never returns local mock JSON (use allowMockFallback only for legacy demos).
   */
  async getInfluencers(
    platform?: string,
    options?: { allowMockFallback?: boolean },
  ): Promise<CatalogFetchResult<any[]>> {
    const qs =
      platform && platform !== 'All'
        ? `?platform=${encodeURIComponent(platform)}`
        : '';

    if (options?.allowMockFallback) {
      try {
        const data = await fetchJson<any[]>(`/influencers${qs}`);
        return { data, live: !isMockInfluencerCatalog(data) };
      } catch (error: unknown) {
        const fallback =
          platform && platform !== 'All'
            ? localInfluencers.filter(i => i.platform === platform)
            : localInfluencers;
        return {
          data: fallback,
          live: false,
          error: error instanceof Error ? error.message : 'Backend unavailable',
        };
      }
    }

    try {
      const data = await fetchJson<any[]>(`/influencers${qs}`);
      if (isMockInfluencerCatalog(data)) {
        return {
          data: [],
          live: false,
          error:
            'Unexpected demo catalog from API. Restart the backend and reload — expect ids like ig_1, tt_1.',
        };
      }
      return { data, live: true };
    } catch (error: unknown) {
      return {
        data: [],
        live: false,
        error:
          (error instanceof Error ? error.message : 'Backend unavailable') +
          ` (API: ${BASE_URL})`,
      };
    }
  },

  /**
   * GET /influencers/by-platform
   */
  async getInfluencersByPlatform(): Promise<
    CatalogFetchResult<{
      Instagram: any[];
      TikTok: any[];
      YouTube: any[];
      counts: Record<string, number>;
    }>
  > {
    try {
      const data = await fetchJson<{
        Instagram: any[];
        TikTok: any[];
        YouTube: any[];
        counts: Record<string, number>;
      }>('/influencers/by-platform');
      const mock =
        isMockInfluencerCatalog(data.Instagram) ||
        isMockInfluencerCatalog(data.TikTok);
      if (mock) {
        return {
          data: { Instagram: [], TikTok: [], YouTube: [], counts: {} },
          live: false,
          error: 'Backend returned demo data instead of CSV catalog.',
        };
      }
      return { data, live: true };
    } catch (error: unknown) {
      return {
        data: {
          Instagram: [],
          TikTok: [],
          YouTube: [],
          counts: {},
        },
        live: false,
        error: error instanceof Error ? error.message : 'Backend unavailable',
      };
    }
  },

  /**
   * GET /influencers/{id}
   */
  async getInfluencerById(id: string) {
    return fetchJson<any>(`/influencers/${encodeURIComponent(id)}`);
  },

  /**
   * GET /dashboard
   */
  async getDashboard() {
    return request<any>('/dashboard', { method: 'GET' }, {
      metrics: localDashboardMetrics,
      activity_feed: localActivityFeed,
    });
  },

  /**
   * GET /brands
   */
  async getBrands() {
    return request<any[]>('/brands', { method: 'GET' }, localBrands);
  },

  /**
   * GET /campaigns
   */
  async getCampaigns() {
    return request<any[]>('/campaigns', { method: 'GET' }, localCampaigns);
  },

  async createCampaign(payload: Record<string, unknown>) {
    return request<any>(
      '/campaigns',
      { method: 'POST', body: JSON.stringify(payload) },
      { ...payload, id: `c${localCampaigns.length + 1}` },
    );
  },

  /**
   * GET /influencers/{id}/authenticity
   */
  async getAuthenticityReport(influencerId: string | number) {
    const found = localInfluencers.find(i => String(i.id) === String(influencerId)) || localInfluencers[0];
    const fallbackVal = {
      authenticityScore: found.authenticity,
      riskLevel: found.risk === 'high' ? 'High' : found.risk === 'medium' ? 'Medium' : 'Low',
      confidence: 0.75,
      audienceQualityScore: found.authenticity,
      engagementRate: found.engagement,
      signals: ['Analysis from local catalog'],
      warnings: [],
      explanation: ['Heuristic authenticity estimate'],
    };

    return request<any>(`/influencers/${influencerId}/authenticity`, { method: 'GET' }, fallbackVal);
  },

  /**
   * POST /authenticity/analyze
   */
  async analyzeAuthenticity(influencerId: string | number) {
    const found = localInfluencers.find(i => String(i.id) === String(influencerId)) || localInfluencers[0];
    const fallbackVal = {
      authenticity_score: found.authenticity,
      engagement_rate: found.engagement,
      risk_level: found.risk.charAt(0).toUpperCase() + found.risk.slice(1),
    };

    return request<any>('/authenticity/analyze', {
      method: 'POST',
      body: JSON.stringify({ influencer_id: influencerId }),
    }, fallbackVal);
  },

  /**
   * POST /growth/predict — ML growth tier classification
   */
  async predictGrowth(influencerId: string | number, scenario?: string) {
    const found = localInfluencers.find(i => String(i.id) === String(influencerId)) || localInfluencers[0];
    const er = found.engagement || 3;
    const followers = found.followers || 100000;
    const likes = Math.round(followers * (er / 100) * 0.85);

    const fallbackVal = {
      growthTier: er >= 5 ? 'High Growth' : er >= 2 ? 'Medium Growth' : 'Low Growth',
      confidence: 0.72,
      growthScore: Math.min(99, Math.round(found.aiScore || 70)),
      topFactors: ['Engagement rate from catalog', 'Audience size tier'],
      improvementSuggestions: ['Increase save rate', 'Use stronger CTA content'],
      probabilities: {
        'Low Growth': 0.15,
        'Medium Growth': 0.35,
        'High Growth': 0.5,
      },
      modelVersion: 'fallback',
      influencer_id: influencerId,
      current_followers: followers,
    };

    const body: Record<string, unknown> = { influencer_id: influencerId };
    if (scenario) body.scenario = scenario;

    return request<any>('/growth/predict', {
      method: 'POST',
      body: JSON.stringify(body),
    }, fallbackVal);
  },

  /**
   * POST /brand-match
   */
  async matchBrand(brandId: string | number) {
    const brand = localBrands.find(b => String(b.id) === String(brandId)) || localBrands[0];

    const scored = localInfluencers.map(inf => {
      let nicheFit = 40;
      if (brand.targetNiches.includes(inf.niche)) {
        nicheFit = 100;
      } else if (inf.categories.some(c => brand.targetNiches.includes(c))) {
        nicheFit = 85;
      }

      const followerFit = inf.followers >= brand.minFollowers ? 100 : Math.max(0, 100 - Math.round(((brand.minFollowers - inf.followers) / brand.minFollowers) * 100));
      const scoreFit = inf.aiScore >= brand.minAiScore ? 100 : Math.max(0, 100 - (brand.minAiScore - inf.aiScore) * 5);

      const score = Math.min(100, Math.max(0, Math.round(0.4 * nicheFit + 0.3 * followerFit + 0.3 * scoreFit)));

      return {
        influencer: inf.name,
        score,
      };
    }).sort((a, b) => b.score - a.score);

    const fallbackVal = {
      matches: scored,
    };

    return request<any>('/brand-match', {
      method: 'POST',
      body: JSON.stringify({ brand_id: brandId }),
    }, fallbackVal);
  },

  /**
   * POST /campaign-success
   */
  async projectCampaignSuccess(campaignId: string | number, influencerId: string | number) {
    try {
      const data = await fetchJson<Record<string, unknown>>('/campaign-success', {
        method: 'POST',
        body: JSON.stringify({
          campaign_id: campaignId,
          influencer_id: influencerId,
        }),
      });
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Connection failed';
      return {
        error: `Cannot reach API at ${BASE_URL}. Start the backend (uvicorn) and use dataset creator IDs (e.g. ig_1). ${message}`,
      };
    }
  },

  /**
   * POST /ratefluencer
   */
  async calculateRatefluencerScore(influencerId: string | number) {
    const found = localInfluencers.find(i => String(i.id) === String(influencerId)) || localInfluencers[0];

    const fallbackVal = {
      authenticity: found.authenticity,
      growth: 85,
      brand_match: found.aiScore - 2,
      campaign_success: 90,
      ratefluencer_score: found.aiScore,
      recommended_brands: [localBrands[0].name, localBrands[1].name],
      insights: ['Authentic audience detected', 'Strong growth trajectory', 'High campaign success probability'],
    };

    return request<any>('/ratefluencer', {
      method: 'POST',
      body: JSON.stringify({ influencer_id: influencerId }),
    }, fallbackVal);
  },

  /**
   * GET /leaderboard
   */
  async getLeaderboard() {
    return request<any[]>('/leaderboard', { method: 'GET' }, localLeaderboard);
  },

  /**
   * GET /ai-outputs
   */
  async getAIOutputs() {
    return request<any[]>('/ai-outputs', { method: 'GET' }, localAIOutputs);
  },

  /**
   * GET /youtube/search?q=...
   * Real-time YouTube channel search via YouTube Data API v3 (requires YOUTUBE_API_KEY on server).
   */
  async searchYouTube(
    query: string,
    maxResults: number = 12,
  ): Promise<{ results: any[]; error?: string }> {
    const encoded = encodeURIComponent(query);
    try {
      const data = await fetchJson<{ results?: any[] }>(
        `/youtube/search?q=${encoded}&max_results=${maxResults}`,
        { method: 'GET' },
      );
      return { results: data.results || [] };
    } catch (error: unknown) {
      return {
        results: [],
        error: error instanceof Error ? error.message : 'YouTube search failed',
      };
    }
  },
};
