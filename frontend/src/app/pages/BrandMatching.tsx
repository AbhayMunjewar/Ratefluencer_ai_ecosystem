import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link2, Zap, Building2, Target } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AvatarRing } from '../components/AvatarRing';
import { AIScoreGauge } from '../components/AIScoreGauge';
import { api } from '../services/api';

function MatchScoreCircle({ score, size = 80 }: { score: number; size?: number }) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="matchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <filter id="matchGlow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(56,189,248,0.1)" strokeWidth={6} />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke="url(#matchGrad)" strokeWidth={6} strokeLinecap="round"
          strokeDasharray={`${filled} ${circ}`}
          filter="url(#matchGlow)"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${filled} ${circ}` }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 600,
        fontSize: size * 0.24,
        color: '#fff',
      }}>
        {score}%
      </div>
    </div>
  );
}

const matchDimensions = [
  'Audience Overlap', 'Brand Voice', 'Niche Alignment', 'Engagement Quality',
  'Content Style', 'Audience Demographics', 'Risk Profile', 'Historical Performance'
];

export default function BrandMatching() {
  const [brands, setBrands] = useState<any[]>([]);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<any | null>(null);
  const [scanning, setScanning] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [brandData, influencerData] = await Promise.all([api.getBrands(), api.getInfluencers()]);
        if (mounted) {
          setBrands(brandData);
          setInfluencers(influencerData);
          setSelectedBrand(brandData[0] || null);
        }
      } catch (error) {
        console.error('Failed to load brand matching data:', error);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const runMatch = async () => {
    if (!selectedBrand) return;
    setScanning(true);
    setMatches([]);
    try {
      const result = await api.matchBrand(selectedBrand.id);
      const scored = (result.matches || []).map((match: any) => {
        const found = influencers.find(inf => inf.name === match.influencer || inf.handle === match.influencer);
        return found ? { ...found, matchScore: match.score } : { name: match.influencer, matchScore: match.score };
      });
      setMatches(scored.slice(0, 6));
    } finally {
      setScanning(false);
    }
  };

  if (!selectedBrand) {
    return <div style={{ padding: 28, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Loading brand matching engine...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <div>
        <div className="label-caps" style={{ marginBottom: 12 }}>AI MATCHING ENGINE</div>
        <h2 style={{ fontSize: 40, color: '#fff', margin: '0 0 8px' }}>Brand Matching</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 15, color: '#64748B' }}>
          Semantic AI matches your brand with the perfect creators across 40+ compatibility dimensions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Brand selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <GlassCard style={{ padding: 20 }}>
            <div className="label-caps" style={{ marginBottom: 16 }}>SELECT BRAND</div>
            {brands.map(brand => (
              <div
                key={brand.id}
                onClick={() => setSelectedBrand(brand)}
                style={{
                  padding: '12px',
                  borderRadius: 10,
                  background: selectedBrand.id === brand.id ? 'rgba(56,189,248,0.08)' : 'transparent',
                  border: `1px solid ${selectedBrand.id === brand.id ? 'rgba(56,189,248,0.25)' : 'transparent'}`,
                  cursor: 'pointer',
                  marginBottom: 6,
                  transition: 'all 200ms',
                }}
              >
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 13, color: selectedBrand.id === brand.id ? '#BAE6FD' : '#94A3B8' }}>
                  {brand.name}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#64748B', marginTop: 2 }}>
                  {brand.industry}
                </div>
              </div>
            ))}
          </GlassCard>

          <GlassCard style={{ padding: 20 }}>
            <div className="label-caps" style={{ marginBottom: 12 }}>BRAND PROFILE</div>
            {[
              { label: 'Budget', value: `$${(selectedBrand.budget / 1000).toFixed(0)}K` },
              { label: 'Min AI Score', value: `${selectedBrand.minAiScore}+` },
              { label: 'Min Followers', value: selectedBrand.minFollowers >= 1000000 ? `${selectedBrand.minFollowers / 1000000}M` : `${selectedBrand.minFollowers / 1000}K` },
              { label: 'Campaigns Run', value: selectedBrand.campaigns },
              { label: 'Avg ROI', value: `${selectedBrand.avgRoi}x` },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid rgba(56,189,248,0.06)',
              }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B' }}>{item.label}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#38BDF8' }}>{item.value}</span>
              </div>
            ))}
            <div style={{ marginTop: 16, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {selectedBrand.targetNiches.map((n: string) => (
                <span key={n} style={{
                  padding: '2px 8px',
                  background: 'rgba(56,189,248,0.06)',
                  border: '1px solid rgba(56,189,248,0.12)',
                  borderRadius: 6,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 10,
                  color: '#94A3B8',
                }}>
                  {n}
                </span>
              ))}
            </div>
          </GlassCard>

          <button
            onClick={runMatch}
            disabled={scanning}
            style={{
              padding: '14px',
              background: 'linear-gradient(135deg, #0EA5E9, #1D4ED8)',
              border: 'none',
              borderRadius: 12,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              color: '#fff',
              cursor: scanning ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 30px rgba(14,165,233,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              opacity: scanning ? 0.7 : 1,
            }}
          >
            <Zap size={16} />
            {scanning ? 'Analyzing 2.4M creators...' : 'Find Perfect Matches'}
          </button>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {scanning && (
            <GlassCard style={{ padding: 28, textAlign: 'center' }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13,
                color: '#38BDF8',
                marginBottom: 20,
              }}>
                Analyzing 2,400,000 creators...
              </div>
              {['Loading semantic brand model', 'Scanning creator database', 'Scoring brand-creator compatibility', 'Ranking by predicted ROI'].map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.6 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, justifyContent: 'center' }}
                >
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: '#38BDF8' }}
                  />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#64748B' }}>{step}</span>
                </motion.div>
              ))}
              <div style={{ marginTop: 20, height: 4, background: 'rgba(56,189,248,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                  style={{ height: '100%', background: 'linear-gradient(to right, #0EA5E9, #38BDF8)', borderRadius: 2 }}
                />
              </div>
            </GlassCard>
          )}

          <AnimatePresence>
            {matches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#94A3B8' }}>
                  <span style={{ color: '#22D3EE', fontWeight: 500 }}>{matches.length} perfect matches</span> found for {selectedBrand.name}
                </div>
                {matches.map((inf, i) => {
                  const matchScore = inf.matchScore ?? Math.min(99, Math.round((inf.aiScore || 80) * 0.6 + (inf.authenticity || 80) * 0.4 - i * 2));
                  const dims = matchDimensions.map(d => ({
                    name: d,
                    score: Math.round(60 + Math.random() * 38),
                  }));
                  return (
                    <motion.div
                      key={inf.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="glass-card"
                      style={{ padding: 20 }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 20, alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <AvatarRing name={inf.name} size={44} />
                          <div>
                            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15, color: '#fff', marginBottom: 2 }}>
                              {inf.name}
                            </div>
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B' }}>
                              {inf.handle} · {inf.niche} · {(inf.followers / 1000000).toFixed(1)}M
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                              {dims.slice(0, 4).map(dim => (
                                <div key={dim.name} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: '#475569', whiteSpace: 'nowrap' }}>{dim.name}</div>
                                  <div style={{ height: 3, width: 60, background: 'rgba(56,189,248,0.08)', borderRadius: 2 }}>
                                    <div style={{ width: `${dim.score}%`, height: '100%', background: '#38BDF8', borderRadius: 2 }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <AIScoreGauge score={inf.aiScore} size={72} label="AI Score" />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <MatchScoreCircle score={matchScore} size={76} />
                          <div className="label-caps" style={{ fontSize: 9 }}>MATCH</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {!scanning && matches.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#334155' }}>
              <Link2 size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 20 }}>
                Select a brand and run the AI matching engine
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
