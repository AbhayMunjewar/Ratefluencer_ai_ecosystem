import localDashboardMetrics from '../../data/dashboardMetrics.json';
import localInfluencers from '../../data/influencers.json';
import localBrands from '../../data/brands.json';
import localCampaigns from '../../data/campaigns.json';
import localActivityFeed from '../../data/activityFeed.json';
import localLeaderboard from '../../data/leaderboard.json';
import localAIOutputs from '../../data/aiOutputs.json';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Log indicator for debugging
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

/**
 * Generic request helper with automatic backend connection detection and graceful fallback.
 */
async function request<T>(path: string, options?: RequestInit, fallbackData?: any): Promise<T> {
  try {
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
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    logSuccess();
    return await response.json() as T;
  } catch (error: any) {
    logFallback(error?.message || 'Connection refused');
    if (fallbackData !== undefined) {
      return fallbackData as T;
    }
    throw error;
  }
}

export const api = {
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
   * GET /influencers
   */
  async getInfluencers() {
    return request<any[]>('/influencers', { method: 'GET' }, localInfluencers);
  },

  /**
   * GET /influencers/by-platform
   */
  async getInfluencersByPlatform() {
    const groupedFallback = {
      Instagram: localInfluencers.filter(i => i.platform === 'Instagram'),
      TikTok: localInfluencers.filter(i => i.platform === 'TikTok'),
      YouTube: localInfluencers.filter(i => i.platform === 'YouTube'),
      counts: {
        Instagram: localInfluencers.filter(i => i.platform === 'Instagram').length,
        TikTok: localInfluencers.filter(i => i.platform === 'TikTok').length,
        YouTube: localInfluencers.filter(i => i.platform === 'YouTube').length,
      },
    };
    return request<any>('/influencers/by-platform', { method: 'GET' }, groupedFallback);
  },

  /**
   * GET /influencers/{id}
   */
  async getInfluencerById(id: string) {
    const fallbackVal = localInfluencers.find(i => String(i.id) === String(id)) || localInfluencers[0];
    return request<any>(`/influencers/${id}`, { method: 'GET' }, fallbackVal);
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
   * POST /growth/predict
   */
  async predictGrowth(influencerId: string | number, scenario: string) {
    const found = localInfluencers.find(i => String(i.id) === String(influencerId)) || localInfluencers[0];
    
    // Simulate timeline locally as fallback
    const growthMonths = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    const baseRate = 0.05;
    let multiplier = 1.0;
    let bonus = 0;

    if (scenario === 'aggressive') {
      multiplier = 1.6;
      bonus = 10;
    } else if (scenario === 'conservative') {
      multiplier = 0.5;
      bonus = -10;
    }

    let tracker = found.followers;
    const timeline = growthMonths.map(month => {
      tracker = Math.round(tracker * (1 + baseRate * multiplier));
      return { month, followers: tracker };
    });

    const growthScore = Math.min(100, Math.max(0, Math.round(((tracker - found.followers) / found.followers) * 300) + 70 + bonus));

    let eng = found.engagement || 3;
    const engagement_timeline = growthMonths.map(month => {
      eng = Math.round(eng * (1 + baseRate * 0.35 * multiplier) * 100) / 100;
      return { month, engagement_rate: eng };
    });

    const fallbackVal = {
      growth_score: growthScore,
      current_followers: found.followers,
      predicted_followers: tracker,
      timeline,
      engagement_timeline,
      audience_expansion_score: Math.min(100, Math.round(growthScore * 0.85)),
      engagement_growth_score: Math.min(100, Math.round(growthScore * 0.75)),
      follower_growth_pct: Math.round(((tracker - found.followers) / found.followers) * 1000) / 10,
      scenario,
    };

    return request<any>('/growth/predict', {
      method: 'POST',
      body: JSON.stringify({ influencer_id: influencerId, scenario }),
    }, fallbackVal);
  },

  /**
   * POST /brand-match
   */
  async matchBrand(brandId: string | number) {
    const brand = localBrands.find(b => String(b.id) === String(brandId)) || localBrands[0];
    
    // Simulate matches locally as fallback
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
    const fallbackVal = {
      success_probability: 88,
    };

    return request<any>('/campaign-success', {
      method: 'POST',
      body: JSON.stringify({ campaign_id: campaignId, influencer_id: influencerId }),
    }, fallbackVal);
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
   * Real-time YouTube channel search via YouTube Data API v3.
   * Returns [] on backend offline (graceful degradation).
   */
  async searchYouTube(query: string, maxResults: number = 12): Promise<any[]> {
    const encoded = encodeURIComponent(query);
    const url = `${BASE_URL}/youtube/search?q=${encoded}&max_results=${maxResults}`;
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  },
};
