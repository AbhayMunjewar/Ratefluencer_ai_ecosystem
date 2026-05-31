import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Star, MapPin, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router';
import { AvatarRing } from '../components/AvatarRing';
import { AIScoreGauge } from '../components/AIScoreGauge';
import { SparkLine } from '../components/SparkLine';
import { GlassCard } from '../components/GlassCard';
import { api } from '../services/api';

const platforms = ['All', 'Instagram', 'TikTok', 'YouTube'];
const niches = ['All', 'Fashion', 'Tech', 'Beauty', 'Fitness', 'Gaming', 'Finance', 'Food', 'Travel'];
const followerRanges = ['All', '0–100K', '100K–1M', '1M–10M', '10M+'];
const riskLabels = ['low', 'medium', 'high'];

export default function InfluencerSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState('All');
  const [niche, setNiche] = useState('All');
  const [follower, setFollower] = useState('All');
  const [minScore, setMinScore] = useState(0);
  const [influencers, setInfluencers] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadInfluencers() {
      try {
        const data = await api.getInfluencers();
        if (mounted) {
          setInfluencers(data);
        }
      } catch (error) {
        console.error('Failed to load influencers:', error);
      }
    }

    loadInfluencers();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const results = influencers
      .filter(inf => {
        if (normalizedQuery) {
          const searchable = [inf.name, inf.handle, inf.niche, ...(inf.categories || []), inf.platform, inf.country]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          if (!searchable.includes(normalizedQuery)) return false;
        }
        if (platform !== 'All' && inf.platform !== platform) return false;
        if (niche !== 'All' && inf.niche !== niche) return false;
        if (follower !== 'All') {
          if (follower === '0–100K' && inf.followers >= 100000) return false;
          if (follower === '100K–1M' && (inf.followers < 100000 || inf.followers >= 1000000)) return false;
          if (follower === '1M–10M' && (inf.followers < 1000000 || inf.followers >= 10000000)) return false;
          if (follower === '10M+' && inf.followers < 10000000) return false;
        }
        if (inf.aiScore < minScore) return false;
        return true;
      })
      .map(inf => {
        const relevance = normalizedQuery
          ? [inf.name, inf.handle, inf.niche, ...(inf.categories || []), inf.platform]
              .filter(Boolean)
              .reduce((score, value) => score + (String(value).toLowerCase().includes(normalizedQuery) ? 1 : 0), 0)
          : 0;
        return { ...inf, relevance };
      })
      .sort((a, b) => {
        if (b.relevance !== a.relevance) return b.relevance - a.relevance;
        return b.aiScore - a.aiScore;
      });

    return results;
  }, [influencers, query, platform, niche, follower, minScore]);

  const topResult = filtered[0];
  const groupedFiltered = useMemo(() => {
    return {
      Instagram: filtered.filter(inf => inf.platform === 'Instagram'),
      TikTok: filtered.filter(inf => inf.platform === 'TikTok'),
      YouTube: filtered.filter(inf => inf.platform === 'YouTube'),
    };
  }, [filtered]);
  const activeFilters = [platform !== 'All', niche !== 'All', follower !== 'All', minScore > 0, query.trim().length > 0].filter(Boolean).length;

  const riskColors: Record<string, string> = {
    low: '#22D3EE',
    medium: '#93C5FD',
    high: '#F87171',
  };
  const riskBg: Record<string, string> = {
    low: 'rgba(34,211,238,0.08)',
    medium: 'rgba(147,197,253,0.08)',
    high: 'rgba(248,113,113,0.08)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      style={{ padding: 28 }}
    >
      {/* Hero search */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{
          fontSize: 40,
          color: '#ffffff',
          marginBottom: 8,
        }}>
          Discover <em style={{ fontStyle: 'italic', fontWeight: 300, color: '#BAE6FD' }}>extraordinary</em> creators
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#64748B', marginBottom: 24 }}>
          AI-powered search across 2.4M verified creators
        </p>

        <div style={{ position: 'relative', marginBottom: 20 }}>
          <Search
            size={18}
            color="#38BDF8"
            style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            placeholder="Search by name, handle, niche, or keyword..."
            style={{
              width: '100%',
              height: 56,
              background: 'rgba(8,12,21,0.8)',
              border: '1px solid rgba(56,189,248,0.22)',
              borderRadius: 12,
              padding: '0 160px 0 52px',
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              color: '#ffffff',
              outline: 'none',
              transition: 'border-color 200ms, box-shadow 200ms',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'rgba(56,189,248,0.5)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.1)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'rgba(56,189,248,0.22)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            type="button"
            onClick={() => {
              const firstCard = document.querySelector('[data-search-results]');
              if (firstCard instanceof HTMLElement) {
                firstCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #0EA5E9, #1D4ED8)',
            borderRadius: 8,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(14,165,233,0.3)',
            border: 'none',
          }}>
            Search
          </button>
        </div>

        {topResult && (
          <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div className="label-caps" style={{ marginBottom: 6 }}>Live match</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#fff' }}>
                {activeFilters > 0 ? `${filtered.length} creators matched your filters` : `Showing the full creator catalog`}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 14, background: 'rgba(8,12,21,0.72)', border: '1px solid rgba(56,189,248,0.16)' }}>
              <AvatarRing name={topResult.name} size={44} animated />
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#fff', fontWeight: 600 }}>{topResult.name}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B' }}>{topResult.handle} · {topResult.platform}</div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/influencers/${topResult.id}`)}
                style={{
                  marginLeft: 12,
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(56,189,248,0.2)',
                  background: 'rgba(56,189,248,0.1)',
                  color: '#BAE6FD',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                }}
              >
                Open profile
              </button>
            </div>
          </div>
        )}

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'Platform', options: platforms, value: platform, setter: setPlatform },
            { label: 'Niche', options: niches, value: niche, setter: setNiche },
            { label: 'Followers', options: followerRanges, value: follower, setter: setFollower },
          ].map(filter => (
            <div key={filter.label} style={{ display: 'flex', gap: 6 }}>
              <span className="label-caps" style={{ display: 'flex', alignItems: 'center', marginRight: 4 }}>{filter.label}:</span>
              {filter.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => filter.setter(opt)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 20,
                    border: filter.value === opt ? '1px solid #38BDF8' : '1px solid rgba(56,189,248,0.1)',
                    background: filter.value === opt ? 'rgba(56,189,248,0.1)' : 'transparent',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 12,
                    color: filter.value === opt ? '#BAE6FD' : '#64748B',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <GlassCard style={{ padding: 20 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 13, color: '#fff', marginBottom: 16 }}>
              Min AI Score
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[0, 70, 80, 90, 95].map(v => (
                <button
                  key={v}
                  onClick={() => setMinScore(v)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 8,
                    border: minScore === v ? '1px solid #38BDF8' : '1px solid rgba(56,189,248,0.1)',
                    background: minScore === v ? 'rgba(56,189,248,0.1)' : 'transparent',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 12,
                    color: minScore === v ? '#BAE6FD' : '#64748B',
                    cursor: 'pointer',
                  }}
                >
                  {v === 0 ? 'Any' : `${v}+`}
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard style={{ padding: 20 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 13, color: '#fff', marginBottom: 16 }}>
              Risk Level
            </div>
            {riskLabels.map(risk => (
              <div key={risk} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{
                  padding: '3px 10px',
                  borderRadius: 10,
                  background: riskBg[risk],
                  border: `1px solid ${riskColors[risk]}30`,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 11,
                  fontWeight: 500,
                  color: riskColors[risk],
                  textTransform: 'capitalize',
                }}>
                  {risk}
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#64748B' }}>
                  {influencers.filter(i => i.risk === risk).length}
                </span>
              </div>
            ))}
          </GlassCard>

          <GlassCard style={{ padding: 20 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 13, color: '#fff', marginBottom: 8 }}>
              Results
            </div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 28,
              fontWeight: 700,
              color: '#38BDF8',
            }}>
              {filtered.length}
            </div>
            <div className="label-caps" style={{ marginTop: 4 }}>creators found</div>
          </GlassCard>
        </div>

        {/* Grid */}
        <motion.div
          variants={{ container: { staggerChildren: 0.07 }, show: {} }}
          initial="container"
          animate="container"
          data-search-results
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <div style={{ gridColumn: '1 / -1' }}>
                <GlassCard style={{ padding: 28, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, color: '#fff', marginBottom: 8 }}>No creators matched your search</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#64748B' }}>
                    Try a different name, platform, niche, or lower the score filter.
                  </div>
                </GlassCard>
              </div>
            ) : (['Instagram', 'TikTok', 'YouTube'] as const).map(platformName => (
              groupedFiltered[platformName].length > 0 && (
                <div key={platformName}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', color: '#BAE6FD', fontWeight: 600, fontSize: 14 }}>
                      {platformName}
                    </div>
                    <div className="label-caps">{groupedFiltered[platformName].length} creators</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {groupedFiltered[platformName].map(inf => (
                      <motion.div
                        key={inf.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.35 }}
                        className="glass-card"
                        onClick={() => navigate(`/influencers/${inf.id}`)}
                        style={{ padding: 20, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                      >
                {/* Animated ring */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <AvatarRing name={inf.name} size={44} animated />
                  <div style={{
                    padding: '3px 10px',
                    borderRadius: 10,
                    background: riskBg[inf.risk],
                    border: `1px solid ${riskColors[inf.risk]}30`,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 10,
                    fontWeight: 500,
                    color: riskColors[inf.risk],
                    textTransform: 'capitalize',
                  }}>
                    {inf.risk} risk
                  </div>
                </div>

                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15, color: '#fff', marginBottom: 2 }}>
                  {inf.name}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B', marginBottom: 12 }}>
                  {inf.handle} · {inf.platform}
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Users size={12} color="#64748B" />
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#fff' }}>
                      {inf.followers >= 1000000 ? `${(inf.followers / 1000000).toFixed(1)}M` : `${(inf.followers / 1000).toFixed(0)}K`}
                    </span>
                  </div>
                  <div style={{ width: 1, height: 12, background: 'rgba(56,189,248,0.1)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <TrendingUp size={12} color="#64748B" />
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#22D3EE' }}>
                      {inf.engagement}%
                    </span>
                  </div>
                  <div style={{ width: 1, height: 12, background: 'rgba(56,189,248,0.1)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={12} color="#64748B" />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#64748B' }}>{inf.country}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <AIScoreGauge score={inf.aiScore} size={72} label="AI Score" />
                  <div>
                    <div className="label-caps" style={{ marginBottom: 4, textAlign: 'right' }}>12mo growth</div>
                    <SparkLine data={inf.growth} width={88} height={32} />
                  </div>
                </div>

                {/* Niche badge */}
                <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {inf.categories.slice(0, 2).map(cat => (
                    <span key={cat} style={{
                      padding: '2px 8px',
                      background: 'rgba(56,189,248,0.06)',
                      border: '1px solid rgba(56,189,248,0.12)',
                      borderRadius: 6,
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 10,
                      color: '#94A3B8',
                    }}>
                      {cat}
                    </span>
                  ))}
                </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
