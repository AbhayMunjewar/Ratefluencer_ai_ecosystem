import { useState, useEffect, useMemo, useCallback, type CSSProperties } from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Rocket, TrendingUp, DollarSign, Users, Plus, Search, Sparkles, X } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AvatarRing } from '../components/AvatarRing';
import { api } from '../services/api';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  CREATOR_LIST_DISPLAY_LIMIT,
  YOUTUBE_SEARCH_MIN_CHARS,
  buildSearchTextMap,
  filterCampaignCreators,
  formatFollowers,
} from '../utils/creatorSearch';

type Platform = 'Instagram' | 'TikTok' | 'YouTube';
const platformOptions: Platform[] = ['Instagram', 'TikTok', 'YouTube'];

function matchesCategory(inf: any, category: string) {
  if (category === 'All') return true;
  if (inf.niche === category) return true;
  return (inf.categories || []).includes(category);
}

function campaignSupportsPlatform(campaign: any, platform: Platform) {
  return (campaign.platforms || []).includes(platform);
}

const statusConfig: Record<string, { bg: string; border: string; text: string; label: string }> = {
  active: { bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.25)', text: '#BAE6FD', label: 'Active' },
  paused: { bg: 'rgba(100,116,139,0.08)', border: '#334155', text: '#64748B', label: 'Paused' },
  complete: { bg: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.3)', text: '#ffffff', label: 'Complete' },
};

const ganttMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid rgba(56,189,248,0.2)',
  background: 'rgba(15,23,42,0.6)',
  color: '#E2E8F0',
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
};

function GanttBar({ campaign }: { campaign: any }) {
  const start = new Date(campaign.startDate);
  const end = new Date(campaign.endDate);
  const now = new Date('2026-05-30');
  const janStart = new Date('2026-01-01').getTime();
  const total = new Date('2026-08-31').getTime() - janStart;
  const left = ((start.getTime() - janStart) / total) * 100;
  const width = ((end.getTime() - start.getTime()) / total) * 100;
  const progress = ((Math.min(now.getTime(), end.getTime()) - start.getTime()) / (end.getTime() - start.getTime())) * 100;
  const cfg = statusConfig[campaign.status];

  return (
    <div style={{ height: 28, position: 'relative', background: 'rgba(8,12,21,0.4)', borderRadius: 4 }}>
      <div style={{
        position: 'absolute',
        left: `${Math.max(0, left)}%`,
        width: `${Math.min(100 - left, width)}%`,
        height: '100%',
        background: 'rgba(56,189,248,0.08)',
        border: `1px solid ${cfg.border}`,
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${Math.max(0, Math.min(100, progress))}%`,
          height: '100%',
          background: 'linear-gradient(to right, #0EA5E9, #38BDF8)',
          opacity: campaign.status === 'paused' ? 0.4 : 0.8,
        }} />
      </div>
    </div>
  );
}

export default function Campaigns() {
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'complete'>('all');
  const [campaignData, setCampaignData] = useState<any[]>([]);
  const [platformInfluencers, setPlatformInfluencers] = useState<any[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogSource, setCatalogSource] = useState<'api' | 'offline'>('api');
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [liveYouTubeError, setLiveYouTubeError] = useState<string | null>(null);
  const [youtubeApiReady, setYoutubeApiReady] = useState<boolean | null>(null);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [predicting, setPredicting] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);
  const [liveYouTubeResults, setLiveYouTubeResults] = useState<any[] | null>(null);
  const [liveYouTubeLoading, setLiveYouTubeLoading] = useState(false);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignBrand, setNewCampaignBrand] = useState('');
  const [newCampaignCategory, setNewCampaignCategory] = useState('Fashion');
  const [newCampaignBudget, setNewCampaignBudget] = useState('50000');
  const [creatingCampaign, setCreatingCampaign] = useState(false);

  const reloadCampaigns = useCallback(async () => {
    const campaigns = await api.getCampaigns();
    setCampaignData(Array.isArray(campaigns) ? campaigns : []);
  }, []);

  useEffect(() => {
    reloadCampaigns().catch(console.error);
  }, [reloadCampaigns]);

  useEffect(() => {
    if (!platform) {
      setPlatformInfluencers([]);
      return;
    }

    let mounted = true;
    setCatalogLoading(true);
    setLiveYouTubeResults(null);

    api
      .getInfluencers(platform)
      .then(({ data, live, error }) => {
        if (!mounted) return;
        setPlatformInfluencers(Array.isArray(data) ? data : []);
        setCatalogSource(live ? 'api' : 'offline');
        setCatalogError(error ?? null);
      })
      .finally(() => {
        if (mounted) setCatalogLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [platform]);

  useEffect(() => {
    setCategory('All');
    setSearchQuery('');
    setSelectedInfluencerId(null);
    setPrediction(null);
    setPredictError(null);
    setLiveYouTubeResults(null);
    setLiveYouTubeError(null);
    setCatalogError(null);
  }, [platform]);

  useEffect(() => {
    setPrediction(null);
    setPredictError(null);
  }, [category, selectedCampaignId, selectedInfluencerId]);

  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 200);

  useEffect(() => {
    if (platform !== 'YouTube') {
      setYoutubeApiReady(null);
      return;
    }
    let mounted = true;
    api.getBackendHealth().then(health => {
      if (mounted) setYoutubeApiReady(Boolean(health.youtube_api_configured));
    });
    return () => {
      mounted = false;
    };
  }, [platform]);

  useEffect(() => {
    if (platform !== 'YouTube' || debouncedSearch.length < YOUTUBE_SEARCH_MIN_CHARS) {
      setLiveYouTubeResults(null);
      setLiveYouTubeLoading(false);
      setLiveYouTubeError(null);
      return;
    }

    let cancelled = false;
    setLiveYouTubeLoading(true);
    setLiveYouTubeError(null);
    setLiveYouTubeResults(null);

    const timer = window.setTimeout(() => {
      api
        .searchYouTube(debouncedSearch, 15)
        .then(({ results, error }) => {
          if (!cancelled) {
            setLiveYouTubeResults(results);
            setLiveYouTubeError(error ?? null);
            setLiveYouTubeLoading(false);
          }
        });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [platform, debouncedSearch]);

  const searchTextMap = useMemo(
    () =>
      buildSearchTextMap([
        ...platformInfluencers,
        ...(liveYouTubeResults ?? []),
      ]),
    [platformInfluencers, liveYouTubeResults],
  );

  const filtered = filter === 'all' ? campaignData : campaignData.filter(c => c.status === filter);

  const totalBudget = campaignData.reduce((a, c) => a + (c.budget || 0), 0);
  const totalSpent = campaignData.reduce((a, c) => a + (c.spent || 0), 0);
  const activeCampaigns = campaignData.filter(c => c.status === 'active').length;
  const avgRoi = campaignData.length
    ? (campaignData.reduce((a, c) => a + (c.roi || 0), 0) / campaignData.length).toFixed(1)
    : '0';

  const roiChartData = campaignData.slice(0, 8).map(c => ({
    name: c.name.split(' ')[0],
    roi: c.roi,
    engagement: c.engagement,
  }));

  const { pool: creatorPool, emptyHint: creatorEmptyHint } = useMemo(() => {
    if (!platform) return { pool: [], emptyHint: null };
    return filterCampaignCreators({
      platform,
      catalog: platformInfluencers,
      query: debouncedSearch,
      category,
      searchTextMap,
      liveYouTubeResults,
      liveYouTubeLoading,
      matchesCategory,
    });
  }, [
    platform,
    platformInfluencers,
    debouncedSearch,
    category,
    searchTextMap,
    liveYouTubeResults,
    liveYouTubeLoading,
  ]);

  const categoryOptions = useMemo(() => {
    const labels = new Set<string>();
    for (const inf of creatorPool) {
      if (inf.niche) labels.add(inf.niche);
      for (const c of inf.categories || []) labels.add(c);
    }
    return ['All', ...Array.from(labels).sort((a, b) => a.localeCompare(b))];
  }, [creatorPool]);

  const filteredInfluencers = useMemo(
    () => [...creatorPool].sort((a, b) => (b.followers ?? 0) - (a.followers ?? 0)),
    [creatorPool],
  );

  const visibleInfluencers = useMemo(
    () => filteredInfluencers.slice(0, CREATOR_LIST_DISPLAY_LIMIT),
    [filteredInfluencers],
  );

  const filteredCampaigns = useMemo(() => {
    if (!platform) return [];
    return campaignData.filter(c => campaignSupportsPlatform(c, platform));
  }, [campaignData, platform]);

  const selectedCampaign = campaignData.find(c => String(c.id) === String(selectedCampaignId));
  const selectedInfluencer = useMemo(() => {
    if (!selectedInfluencerId) return null;
    return (
      creatorPool.find(inf => String(inf.id) === String(selectedInfluencerId)) ??
      platformInfluencers.find(inf => String(inf.id) === String(selectedInfluencerId)) ??
      null
    );
  }, [creatorPool, platformInfluencers, selectedInfluencerId]);

  async function handleCreateCampaign() {
    if (!newCampaignName.trim() || !platform) return;
    setCreatingCampaign(true);
    try {
      const created = await api.createCampaign({
        name: newCampaignName.trim(),
        brand: newCampaignBrand.trim() || 'New brand',
        status: 'active',
        budget: Number(newCampaignBudget) || 50000,
        spent: 0,
        influencers: 0,
        reach: 0,
        engagement: 0,
        roi: 0,
        progress: 0,
        startDate: '2026-05-01',
        endDate: '2026-07-31',
        platforms: [platform],
        category: newCampaignCategory,
      });
      await reloadCampaigns();
      setSelectedCampaignId(String(created.id));
      setShowNewCampaign(false);
      setNewCampaignName('');
      setNewCampaignBrand('');
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingCampaign(false);
    }
  }

  async function runPrediction() {
    if (!selectedCampaignId || !selectedInfluencerId) return;
    setPredicting(true);
    setPredictError(null);
    try {
      const result = await api.projectCampaignSuccess(
        selectedCampaignId,
        selectedInfluencerId,
      );
      if (result?.error) {
        setPredictError(result.error);
        setPrediction(null);
      } else {
        setPrediction(result);
      }
    } catch (e) {
      setPredictError(e instanceof Error ? e.message : 'Prediction failed');
      setPrediction(null);
    } finally {
      setPredicting(false);
    }
  }

  const outcomeColor =
    prediction?.predicted_outcome === 'Success' ? '#38BDF8' : '#94A3B8';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="label-caps" style={{ marginBottom: 12 }}>CAMPAIGN INTELLIGENCE</div>
          <h2 style={{ fontSize: 40, color: '#fff', margin: 0 }}>Campaign Success</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowNewCampaign(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #0EA5E9, #1D4ED8)',
            border: 'none',
            borderRadius: 10,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 13,
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(14,165,233,0.25)',
          }}
        >
          <Plus size={16} />
          New Campaign
        </button>
      </div>

      {showNewCampaign && (
        <GlassCard style={{ padding: 20, position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowNewCampaign(false)}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
          <div className="label-caps" style={{ marginBottom: 12 }}>Create campaign</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 560 }}>
            <input
              value={newCampaignName}
              onChange={e => setNewCampaignName(e.target.value)}
              placeholder="Campaign name"
              style={inputStyle}
            />
            <input
              value={newCampaignBrand}
              onChange={e => setNewCampaignBrand(e.target.value)}
              placeholder="Brand"
              style={inputStyle}
            />
            <select value={newCampaignCategory} onChange={e => setNewCampaignCategory(e.target.value)} style={inputStyle}>
              {['Fashion', 'Tech', 'Beauty', 'Fitness', 'Food', 'Finance', 'Wellness'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              value={newCampaignBudget}
              onChange={e => setNewCampaignBudget(e.target.value)}
              placeholder="Budget (USD)"
              type="number"
              style={inputStyle}
            />
          </div>
          <p style={{ fontSize: 12, color: '#64748B', margin: '10px 0 0' }}>
            Platform: {platform ?? 'select a platform in the ML panel first'}
          </p>
          <button
            type="button"
            disabled={!newCampaignName.trim() || !platform || creatingCampaign}
            onClick={handleCreateCampaign}
            style={{
              marginTop: 14,
              padding: '10px 18px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg, #0EA5E9, #1D4ED8)',
              color: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              cursor: !newCampaignName.trim() || !platform || creatingCampaign ? 'not-allowed' : 'pointer',
              opacity: !newCampaignName.trim() || !platform || creatingCampaign ? 0.5 : 1,
            }}
          >
            {creatingCampaign ? 'Saving…' : 'Save campaign'}
          </button>
        </GlassCard>
      )}

      <GlassCard style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Sparkles size={18} color="#38BDF8" />
          <div className="label-caps">ML CAMPAIGN SUCCESS (CSV CLASSIFIER)</div>
        </div>

        <div className="label-caps" style={{ marginBottom: 8 }}>Platform</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {platformOptions.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => setPlatform(opt)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: platform === opt ? '1px solid #38BDF8' : '1px solid rgba(56,189,248,0.15)',
                background: platform === opt ? 'rgba(56,189,248,0.12)' : 'transparent',
                color: platform === opt ? '#BAE6FD' : '#64748B',
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        {platform && (
          <>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B', margin: '0 0 8px' }}>
              {platform === 'Instagram' || platform === 'TikTok'
                ? 'Catalog source: backend CSV dataset'
                : 'Catalog: cached YouTube rows + live API search'}
              {' · '}
              {catalogLoading
                ? 'loading…'
                : catalogSource === 'api'
                  ? `${platformInfluencers.length} ${platform} creators loaded`
                  : 'backend not connected'}
              {platform === 'YouTube' && debouncedSearch && liveYouTubeLoading ? ' · YouTube API search…' : ''}
            </p>
            {platform === 'YouTube' && youtubeApiReady === false && (
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 11,
                  color: '#FCD34D',
                  margin: '0 0 8px',
                  lineHeight: 1.45,
                }}
              >
                Add YOUTUBE_API_KEY to the project .env file and restart the backend to enable live YouTube search.
              </p>
            )}
            {(catalogError || liveYouTubeError) && (
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 11,
                  color: '#FCA5A5',
                  margin: '0 0 12px',
                  lineHeight: 1.45,
                }}
              >
                {catalogError || liveYouTubeError}
              </p>
            )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 16 }}>
            <div>
              <div className="label-caps" style={{ marginBottom: 8 }}>Campaign ({platform})</div>
              <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {filteredCampaigns.length === 0 ? (
                  <div style={{ fontSize: 11, color: '#64748B' }}>No campaigns for {platform}.</div>
                ) : filteredCampaigns.map(camp => (
                  <div
                    key={camp.id}
                    onClick={() => setSelectedCampaignId(String(camp.id))}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      border: `1px solid ${selectedCampaignId === camp.id ? 'rgba(56,189,248,0.35)' : 'transparent'}`,
                      background: selectedCampaignId === camp.id ? 'rgba(56,189,248,0.08)' : 'transparent',
                    }}
                  >
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#E2E8F0' }}>
                      {camp.name}
                    </div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#64748B' }}>
                      {camp.category} · ${(camp.budget / 1000).toFixed(0)}K
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="label-caps" style={{ marginBottom: 8 }}>Category</div>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  marginBottom: 10,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(56,189,248,0.2)',
                  background: 'rgba(15,23,42,0.6)',
                  color: '#E2E8F0',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                }}
              >
                {categoryOptions.map(opt => (
                  <option key={opt} value={opt}>
                    {opt === 'All' ? `All ${platform}` : opt}
                  </option>
                ))}
              </select>
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <Search size={14} color="#64748B" style={{ position: 'absolute', left: 10, top: 10 }} />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={
                    platform === 'YouTube'
                      ? `Search YouTube (min ${YOUTUBE_SEARCH_MIN_CHARS} chars), e.g. mrbeast`
                      : 'Search name or @handle from dataset…'
                  }
                  autoComplete="off"
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 32px',
                    borderRadius: 8,
                    border: '1px solid rgba(56,189,248,0.2)',
                    background: 'rgba(15,23,42,0.5)',
                    color: '#fff',
                    fontSize: 12,
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
              </div>
              <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {catalogLoading ? (
                  <div style={{ fontSize: 11, color: '#64748B' }}>Loading {platform} creators…</div>
                ) : liveYouTubeLoading && platform === 'YouTube' ? (
                  <div style={{ fontSize: 11, color: '#64748B' }}>Searching YouTube API…</div>
                ) : filteredInfluencers.length === 0 ? (
                  <div style={{ fontSize: 11, color: '#64748B' }}>
                    {creatorEmptyHint || 'No creators match filters.'}
                  </div>
                ) : (
                  <>
                    {filteredInfluencers.length > CREATOR_LIST_DISPLAY_LIMIT && (
                      <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4 }}>
                        Showing {CREATOR_LIST_DISPLAY_LIMIT} of {filteredInfluencers.length} — refine search
                      </div>
                    )}
                    {visibleInfluencers.map(inf => (
                    <div
                      key={inf.id}
                      onClick={() => setSelectedInfluencerId(String(inf.id))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 8px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: selectedInfluencerId === String(inf.id) ? 'rgba(56,189,248,0.08)' : 'transparent',
                      }}
                    >
                      <AvatarRing name={inf.name} size={24} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: '#BAE6FD' }}>{inf.name}</div>
                        <div style={{ fontSize: 10, color: '#64748B' }}>
                          {inf.handle} · {formatFollowers(inf.followers)} · {inf.niche}
                        </div>
                      </div>
                    </div>
                  ))}
                  </>
                )}
              </div>
            </div>

            <div>
              <button
                type="button"
                disabled={!selectedCampaignId || !selectedInfluencerId || predicting}
                onClick={runPrediction}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  marginBottom: 12,
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #0EA5E9, #1D4ED8)',
                  color: '#fff',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: selectedCampaignId && selectedInfluencerId && !predicting ? 'pointer' : 'not-allowed',
                  opacity: selectedCampaignId && selectedInfluencerId && !predicting ? 1 : 0.5,
                }}
              >
                {predicting ? 'Running classifier…' : 'Predict campaign success'}
              </button>

              {predictError && (
                <div style={{ color: '#F87171', fontSize: 12, marginBottom: 8 }}>{predictError}</div>
              )}

              {prediction && !predictError && (
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, color: outcomeColor }}>
                    {prediction.predicted_outcome}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, color: '#fff', marginTop: 8 }}>
                    {prediction.success_probability}% success probability
                  </div>
                  {prediction.confidence != null && (
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>
                      Confidence {Math.round(prediction.confidence * 100)}% · Model {prediction.model_version}
                    </div>
                  )}
                  {prediction.top_factors?.length > 0 && (
                    <ul style={{ margin: '12px 0 0', paddingLeft: 18, fontSize: 12, color: '#BAE6FD' }}>
                      {prediction.top_factors.map((f: string) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  )}
                  {selectedCampaign && selectedInfluencer && (
                    <div style={{ marginTop: 12, fontSize: 11, color: '#64748B' }}>
                      {selectedCampaign.name} × {selectedInfluencer.name} ({selectedInfluencer.handle},{' '}
                      {formatFollowers(selectedInfluencer.followers)} followers) · ID {selectedInfluencer.id}
                    </div>
                  )}
                </div>
              )}

              {!prediction && !predictError && (
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  Select a {platform} campaign and creator, then run the CSV-trained classifier.
                </div>
              )}
            </div>
          </div>
          </>
        )}

        {!platform && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', margin: 0 }}>
            Choose a platform to filter campaigns and creators before running ML success prediction.
          </p>
        )}
      </GlassCard>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Budget', value: `$${(totalBudget / 1000).toFixed(0)}K`, icon: DollarSign, sub: 'Allocated' },
          { label: 'Total Spent', value: `$${(totalSpent / 1000).toFixed(0)}K`, icon: TrendingUp, sub: totalBudget > 0 ? `${Math.round(totalSpent / totalBudget * 100)}% utilized` : '—' },
          { label: 'Active Campaigns', value: activeCampaigns.toString(), icon: Rocket, sub: 'Running now' },
          { label: 'Avg ROI', value: `${avgRoi}x`, icon: Users, sub: 'Across all campaigns' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card"
            style={{ padding: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(56,189,248,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8',
              }}>
                <kpi.icon size={18} />
              </div>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 26, fontWeight: 500, color: '#fff', marginBottom: 4 }}>
              {kpi.value}
            </div>
            <div className="label-caps" style={{ marginBottom: 2 }}>{kpi.label}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#475569' }}>{kpi.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts + Gantt */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <GlassCard style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, color: '#fff', margin: '0 0 16px' }}>ROI by Campaign</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={roiChartData}>
              <defs>
                <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.06)" />
              <XAxis dataKey="name" tick={{ fontFamily: 'Inter', fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} unit="x" />
              <Tooltip />
              <Area type="monotone" dataKey="roi" stroke="#38BDF8" strokeWidth={2} fill="url(#roiGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, color: '#fff', margin: '0 0 16px' }}>Campaign Timeline</h3>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {ganttMonths.map(m => (
              <div key={m} style={{
                flex: 1,
                fontFamily: 'Inter, sans-serif',
                fontSize: 9,
                color: '#475569',
                textAlign: 'center',
              }}>{m}</div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {campaignData.slice(0, 6).map(camp => (
              <div key={camp.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 88, fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {camp.name.split(' ')[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <GanttBar campaign={camp} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Filter + Campaign List */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
        {['all', 'active', 'paused', 'complete'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: filter === f ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(56,189,248,0.08)',
              background: filter === f ? 'rgba(56,189,248,0.08)' : 'transparent',
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 500,
              color: filter === f ? '#BAE6FD' : '#64748B',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {f} {f !== 'all' && `(${campaignData.filter(c => c.status === f).length})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((camp, i) => {
          const cfg = statusConfig[camp.status];
          return (
            <motion.div
              key={camp.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card"
              style={{ padding: 20 }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 120px 120px 120px 120px 120px', gap: 16, alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color: '#fff' }}>
                      {camp.name}
                    </div>
                    <div style={{
                      padding: '2px 10px',
                      borderRadius: 10,
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 10,
                      fontWeight: 500,
                      color: cfg.text,
                    }}>
                      {cfg.label}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B' }}>
                    {camp.brand} · {camp.category} · {camp.platforms.join(', ')}
                  </div>
                  <div style={{ marginTop: 8, height: 3, background: 'rgba(56,189,248,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${camp.progress}%` }}
                      transition={{ duration: 1, ease: [0.23, 1, 0.32, 1], delay: 0.3 + i * 0.05 }}
                      style={{ height: '100%', background: 'linear-gradient(to right, #0EA5E9, #38BDF8)', borderRadius: 2 }}
                    />
                  </div>
                </div>
                {[
                  { label: 'Budget', val: `$${(camp.budget / 1000).toFixed(0)}K` },
                  { label: 'Creators', val: camp.influencers.toString() },
                  { label: 'Engagement', val: `${camp.engagement}%` },
                  { label: 'ROI', val: `${camp.roi}x` },
                  { label: 'Progress', val: `${camp.progress}%` },
                ].map(col => (
                  <div key={col.label}>
                    <div className="label-caps" style={{ fontSize: 9, marginBottom: 4 }}>{col.label}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#38BDF8' }}>{col.val}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
