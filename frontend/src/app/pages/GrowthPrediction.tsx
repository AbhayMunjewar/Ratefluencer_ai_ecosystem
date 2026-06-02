import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Target, Sparkles, Search } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AvatarRing } from '../components/AvatarRing';
import { api } from '../services/api';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  CREATOR_LIST_DISPLAY_LIMIT,
  buildSearchTextMap,
  matchesSearchQuery,
} from '../utils/creatorSearch';

type Platform = 'Instagram' | 'TikTok' | 'YouTube';

const platformOptions: Platform[] = ['Instagram', 'TikTok', 'YouTube'];

const TIER_COLORS: Record<string, string> = {
  'Low Growth': '#94A3B8',
  'Medium Growth': '#38BDF8',
  'High Growth': '#BAE6FD',
};

function matchesCategory(inf: any, category: string) {
  if (category === 'All') return true;
  if (inf.niche === category) return true;
  return (inf.categories || []).some((c: string) => c === category);
}

function mergeYouTubeResults(local: any[], live: any[]) {
  const merged = [...local];
  const seen = new Set(merged.map(item => item.youtubeChannelId || item.id));
  for (const item of live) {
    const key = item.youtubeChannelId || item.id;
    if (key && seen.has(key)) continue;
    merged.push({ ...item, _fromLiveSearch: true });
    if (key) seen.add(key);
  }
  return merged;
}

export default function GrowthPrediction() {
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [growth, setGrowth] = useState<any>(null);
  const [loadingGrowth, setLoadingGrowth] = useState(false);
  const [liveYouTubeResults, setLiveYouTubeResults] = useState<any[] | null>(null);
  const [liveYouTubeLoading, setLiveYouTubeLoading] = useState(false);
  const [liveYouTubeError, setLiveYouTubeError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadInfluencers() {
      const { data, live } = await api.getInfluencersByPlatform();
      if (!mounted) return;
      if (live) {
        setInfluencers([
          ...(data.Instagram || []),
          ...(data.TikTok || []),
          ...(data.YouTube || []),
        ]);
      } else {
        setInfluencers([]);
      }
    }

    loadInfluencers();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setCategory('All');
    setQuery('');
    setSelectedId(null);
    setGrowth(null);
    setLiveYouTubeResults(null);
    setLiveYouTubeError(null);
  }, [platform]);

  useEffect(() => {
    setSelectedId(null);
    setGrowth(null);
  }, [category]);

  const normalizedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(normalizedQuery, 200);
  const searchTextMap = useMemo(() => buildSearchTextMap(influencers), [influencers]);

  useEffect(() => {
    if (platform !== 'YouTube' || !debouncedQuery) {
      setLiveYouTubeResults(null);
      setLiveYouTubeLoading(false);
      setLiveYouTubeError(null);
      return;
    }

    let cancelled = false;
    setLiveYouTubeLoading(true);
    setLiveYouTubeError(null);

    const timer = window.setTimeout(() => {
      api
        .searchYouTube(debouncedQuery, 12)
        .then(({ results, error }) => {
          if (cancelled) return;
          setLiveYouTubeResults(results);
          setLiveYouTubeError(error ?? null);
          setLiveYouTubeLoading(false);
        });
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [platform, debouncedQuery]);

  const platformPool = useMemo(() => {
    if (!platform) return [];
    return influencers.filter(inf => inf.platform === platform);
  }, [influencers, platform]);

  const categoryOptions = useMemo(() => {
    const labels = new Set<string>();
    for (const inf of platformPool) {
      if (inf.niche) labels.add(inf.niche);
      for (const c of inf.categories || []) labels.add(c);
    }
    return ['All', ...Array.from(labels).sort((a, b) => a.localeCompare(b))];
  }, [platformPool]);

  useEffect(() => {
    if (category !== 'All' && !categoryOptions.includes(category)) {
      setCategory('All');
    }
  }, [category, categoryOptions]);

  const localYouTubeMatches = useMemo(() => {
    if (platform !== 'YouTube' || !debouncedQuery) return [];
    return platformPool.filter(inf => matchesSearchQuery(inf, debouncedQuery, searchTextMap));
  }, [platform, platformPool, debouncedQuery, searchTextMap]);

  const searchSourceInfluencers = useMemo(() => {
    if (!platform) return [];
    if (platform === 'YouTube' && debouncedQuery) {
      const live = liveYouTubeResults ?? [];
      if (live.length > 0 || !liveYouTubeLoading) {
        return mergeYouTubeResults(localYouTubeMatches, live);
      }
      return localYouTubeMatches;
    }
    return platformPool;
  }, [
    platform,
    platformPool,
    debouncedQuery,
    liveYouTubeResults,
    liveYouTubeLoading,
    localYouTubeMatches,
  ]);

  const filteredCreators = useMemo(() => {
    return searchSourceInfluencers
      .filter(inf => {
        if (!matchesCategory(inf, category)) return false;
        if (debouncedQuery && !matchesSearchQuery(inf, debouncedQuery, searchTextMap)) return false;
        return true;
      })
      .sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0));
  }, [searchSourceInfluencers, category, debouncedQuery]);

  const visibleCreators = useMemo(
    () => filteredCreators.slice(0, CREATOR_LIST_DISPLAY_LIMIT),
    [filteredCreators],
  );

  const inf = useMemo(
    () => filteredCreators.find(c => String(c.id) === String(selectedId)) ?? null,
    [filteredCreators, selectedId],
  );

  useEffect(() => {
    if (!inf?.id) return;
    let mounted = true;
    setLoadingGrowth(true);

    api
      .predictGrowth(inf.id)
      .then(data => {
        if (mounted) setGrowth(data);
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoadingGrowth(false);
      });

    return () => {
      mounted = false;
    };
  }, [inf?.id]);

  const tierColor = TIER_COLORS[growth?.growthTier] || '#38BDF8';
  const confidencePct = growth?.confidence != null ? Math.round(growth.confidence * 100) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <div>
        <div className="label-caps" style={{ marginBottom: 12 }}>ML GROWTH CLASSIFIER</div>
        <h2 style={{ fontSize: 40, color: '#fff', margin: '0 0 8px' }}>Growth Prediction</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 15, color: '#64748B' }}>
          XGBoost tier classification (Low / Medium / High growth) — no exact follower forecasting.
        </p>
      </div>

      <GlassCard style={{ padding: 20 }}>
        <div className="label-caps" style={{ marginBottom: 10 }}>Step 1 — Platform</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
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
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                fontWeight: 500,
                color: platform === opt ? '#BAE6FD' : '#64748B',
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        {platform && (
          <>
            <div className="label-caps" style={{ marginBottom: 10 }}>Step 2 — Category</div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                width: '100%',
                maxWidth: 320,
                marginBottom: 20,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid rgba(56,189,248,0.2)',
                background: 'rgba(15,23,42,0.6)',
                color: '#E2E8F0',
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {categoryOptions.map(opt => (
                <option key={opt} value={opt}>
                  {opt === 'All' ? `All ${platform} categories` : opt}
                </option>
              ))}
            </select>

            <div className="label-caps" style={{ marginBottom: 10 }}>Step 3 — Search creator</div>
            <div style={{ position: 'relative', maxWidth: 480, marginBottom: 8 }}>
              <Search
                size={16}
                color="#64748B"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={
                  platform === 'YouTube'
                    ? 'Name or @handle (live YouTube search when typing)'
                    : `Search ${platform} creators by name or @handle`
                }
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: 8,
                  border: '1px solid rgba(56,189,248,0.2)',
                  background: 'rgba(15,23,42,0.5)',
                  color: '#fff',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B', margin: 0 }}>
              Results are limited to <strong style={{ color: '#94A3B8' }}>{platform}</strong>
              {category !== 'All' ? (
                <>
                  {' '}
                  · category <strong style={{ color: '#94A3B8' }}>{category}</strong>
                </>
              ) : null}
              {platform === 'YouTube' && normalizedQuery ? ' · includes live YouTube API matches' : null}
            </p>
            {liveYouTubeError && platform === 'YouTube' && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#F87171', marginTop: 8 }}>
                Live YouTube search: {liveYouTubeError}
              </p>
            )}
          </>
        )}

        {!platform && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', margin: 0 }}>
            Select Instagram, TikTok, or YouTube to browse creators for growth classification.
          </p>
        )}
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>
        <GlassCard style={{ padding: 16, maxHeight: 520, overflowY: 'auto' }}>
          <div className="label-caps" style={{ marginBottom: 12 }}>
            {platform ? `${platform} · ${filteredCreators.length} creators` : 'SELECT PLATFORM'}
          </div>

          {!platform ? (
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B' }}>
              Choose a platform above.
            </div>
          ) : liveYouTubeLoading && platform === 'YouTube' && normalizedQuery ? (
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B' }}>
              Searching YouTube…
            </div>
          ) : filteredCreators.length === 0 ? (
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B' }}>
              No creators match this platform
              {category !== 'All' ? ` and category “${category}”` : ''}
              {normalizedQuery ? ` for “${query.trim()}”` : ''}.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {filteredCreators.length > CREATOR_LIST_DISPLAY_LIMIT && (
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#64748B', marginBottom: 6 }}>
                  Showing {CREATOR_LIST_DISPLAY_LIMIT} of {filteredCreators.length} — type to narrow
                </div>
              )}
              {visibleCreators.map(creator => {
                const isSelected = String(creator.id) === String(selectedId);
                return (
                  <div
                    key={creator.id}
                    onClick={() => setSelectedId(String(creator.id))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: isSelected ? 'rgba(56,189,248,0.08)' : 'transparent',
                      border: `1px solid ${isSelected ? 'rgba(56,189,248,0.25)' : 'transparent'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <AvatarRing name={creator.name} size={28} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 12,
                          fontWeight: 500,
                          color: isSelected ? '#BAE6FD' : '#94A3B8',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {creator.name}
                      </div>
                      <div
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 10,
                          color: '#64748B',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {creator.handle} · {creator.niche}
                        {creator._fromLiveSearch ? ' · live' : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!inf ? (
            <GlassCard style={{ padding: 28 }}>
              <div style={{ color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                {platform
                  ? 'Select a creator from the list to run growth tier classification.'
                  : 'Select platform, category, and a creator to see growth prediction.'}
              </div>
            </GlassCard>
          ) : (
            <>
              <GlassCard style={{ padding: 28 }}>
                {loadingGrowth ? (
                  <div style={{ color: '#64748B', fontFamily: 'Inter, sans-serif' }}>Running classifier…</div>
                ) : growth?.error ? (
                  <div style={{ color: '#F87171', fontFamily: 'Inter, sans-serif' }}>{growth.error}</div>
                ) : growth ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
                    <div>
                      <div className="label-caps" style={{ marginBottom: 8 }}>GROWTH TIER</div>
                      <div
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 36,
                          fontWeight: 600,
                          color: tierColor,
                        }}
                      >
                        {growth.growthTier}
                      </div>
                    </div>
                    <div>
                      <div className="label-caps" style={{ marginBottom: 8 }}>CONFIDENCE</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 32, color: '#fff' }}>
                        {confidencePct}%
                      </div>
                    </div>
                    <div>
                      <div className="label-caps" style={{ marginBottom: 8 }}>GROWTH SCORE</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 32, color: '#38BDF8' }}>
                        {growth.growthScore}/100
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#64748B' }}>Loading prediction…</div>
                )}
              </GlassCard>

              {growth?.probabilities && !growth?.error && (
                <GlassCard style={{ padding: 20 }}>
                  <div className="label-caps" style={{ marginBottom: 16 }}>TIER PROBABILITIES</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {Object.entries(growth.probabilities).map(([tier, prob]) => {
                      const pct = Math.round((prob as number) * 100);
                      return (
                        <div key={tier}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: 6,
                              fontFamily: 'Inter, sans-serif',
                              fontSize: 12,
                              color: '#94A3B8',
                            }}
                          >
                            <span>{tier}</span>
                            <span>{pct}%</span>
                          </div>
                          <div
                            style={{
                              height: 8,
                              borderRadius: 4,
                              background: 'rgba(56,189,248,0.08)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: '100%',
                                background: TIER_COLORS[tier] || '#38BDF8',
                                borderRadius: 4,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <GlassCard style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Sparkles size={16} color="#38BDF8" />
                    <div className="label-caps">TOP GROWTH DRIVERS</div>
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 18,
                      color: '#BAE6FD',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 13,
                    }}
                  >
                    {(growth?.topFactors || []).map((factor: string) => (
                      <li key={factor} style={{ marginBottom: 8 }}>
                        {factor}
                      </li>
                    ))}
                    {!growth?.topFactors?.length && (
                      <li style={{ color: '#64748B', listStyle: 'none', marginLeft: -18 }}>
                        —
                      </li>
                    )}
                  </ul>
                </GlassCard>

                <GlassCard style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Target size={16} color="#7DD3FC" />
                    <div className="label-caps">IMPROVEMENT SUGGESTIONS</div>
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 18,
                      color: '#94A3B8',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 13,
                    }}
                  >
                    {(growth?.improvementSuggestions || []).map((tip: string) => (
                      <li key={tip} style={{ marginBottom: 8 }}>
                        {tip}
                      </li>
                    ))}
                    {!growth?.improvementSuggestions?.length && (
                      <li style={{ color: '#64748B', listStyle: 'none', marginLeft: -18 }}>
                        —
                      </li>
                    )}
                  </ul>
                </GlassCard>
              </div>

              <GlassCard style={{ padding: 16 }}>
                <div className="label-caps" style={{ marginBottom: 8 }}>
                  CREATOR CONTEXT
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 24,
                    flexWrap: 'wrap',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    color: '#64748B',
                  }}
                >
                  <span>{inf.name}</span>
                  <span>Followers: {(inf.followers / 1000).toFixed(1)}K</span>
                  <span>Engagement: {inf.engagement}%</span>
                  <span>Platform: {inf.platform}</span>
                  <span>Category: {inf.niche}</span>
                  {growth?.modelVersion && <span>Model v{growth.modelVersion}</span>}
                </div>
              </GlassCard>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
