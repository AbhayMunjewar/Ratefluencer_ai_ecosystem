import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Shield, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { api } from '../services/api';

type Platform = 'Instagram' | 'TikTok' | 'YouTube';

const platformOptions: Platform[] = ['Instagram', 'TikTok', 'YouTube'];

const mockBotData = [
  { category: 'Ghost Followers', pct: 6.1, risk: 'low' },
  { category: 'Bot Accounts', pct: 3.6, risk: 'low' },
  { category: 'Mass Follower Accounts', pct: 5.0, risk: 'medium' },
  { category: 'Inactive (90d)', pct: 12.2, risk: 'low' },
  { category: 'Suspicious Activity', pct: 1.4, risk: 'high' },
  { category: 'Pod Engagement', pct: 2.4, risk: 'medium' },
];

const networkNodes = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  x: 80 + Math.random() * 440,
  y: 40 + Math.random() * 220,
  isBot: i > 24,
  size: i < 3 ? 12 : 4 + Math.random() * 6,
}));

const riskColors: Record<string, string> = { low: '#22D3EE', medium: '#93C5FD', high: '#F87171' };
const riskBg: Record<string, string> = { low: 'rgba(34,211,238,0.08)', medium: 'rgba(147,197,253,0.08)', high: 'rgba(248,113,113,0.08)' };

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function buildSearchableText(inf: any) {
  return [inf.name, inf.handle, inf.niche, ...(inf.categories || []), inf.platform]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/** Strict creator match — no fuzzy character overlap (fixes false positives). */
function scoreCreatorMatch(inf: any, query: string): number {
  const cleanQuery = normalizeText(query);
  if (!cleanQuery) return 0;

  const cleanHandle = normalizeText(String(inf.handle || '').replace(/^@/, ''));
  const cleanName = normalizeText(String(inf.name || ''));

  if (cleanHandle === cleanQuery || cleanName === cleanQuery) return 1;
  if (cleanHandle && (cleanHandle.includes(cleanQuery) || cleanQuery.includes(cleanHandle))) return 0.95;
  if (cleanName && (cleanName.includes(cleanQuery) || cleanQuery.includes(cleanName))) return 0.9;

  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length > 0) {
    const searchable = buildSearchableText(inf);
    if (tokens.every(token => searchable.includes(token.replace(/^@/, '')))) {
      return 0.85;
    }
  }

  return 0;
}

function findBestMatch(pool: any[], query: string): any | null {
  let best: any | null = null;
  let bestScore = 0;
  for (const inf of pool) {
    const score = scoreCreatorMatch(inf, query);
    if (score > bestScore) {
      bestScore = score;
      best = inf;
    }
  }
  return bestScore >= 0.85 ? best : null;
}

export default function AuthenticityAnalysis() {
  const [handle, setHandle] = useState('');
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [selectedInf, setSelectedInf] = useState<any | null>(null);
  const [authReport, setAuthReport] = useState<any | null>(null);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [catalogLoaded, setCatalogLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadInfluencers() {
      const { data, live } = await api.getInfluencersByPlatform();
      if (mounted) {
        if (live) {
          setInfluencers([
            ...(data.Instagram || []),
            ...(data.TikTok || []),
            ...(data.YouTube || []),
          ]);
        } else {
          setInfluencers([]);
        }
        setCatalogLoaded(true);
      }
    }

    loadInfluencers();

    return () => {
      mounted = false;
    };
  }, []);

  const resolveCreator = async (): Promise<any | null> => {
    if (!platform || !handle.trim()) return null;

    const query = handle.trim();
    const platformPool = influencers.filter(inf => inf.platform === platform);
    let match = findBestMatch(platformPool, query);

    if (!match && platform === 'YouTube') {
      const liveResults = await api.searchYouTube(query, 8);
      if (liveResults.error) {
        throw new Error(liveResults.error);
      }
      match = findBestMatch(liveResults.results, query);
    }

    return match;
  };

  const handleScan = async () => {
    if (!handle.trim()) {
      setScanError('Enter a creator name or handle.');
      return;
    }
    if (!platform) {
      setScanError('Select a platform: Instagram, TikTok, or YouTube.');
      return;
    }
    if (!catalogLoaded) {
      setScanError('Creator catalog is still loading. Try again in a moment.');
      return;
    }

    setScanning(true);
    setScanned(false);
    setScanError(null);
    setAuthReport(null);

    try {
      const match = await resolveCreator();

      if (!match) {
        setScanError(
          `No ${platform} creator found matching "${handle}". Check the spelling or try their @handle.`,
        );
        setScanned(false);
        setSelectedInf(null);
        return;
      }

      const report = await api.getAuthenticityReport(match.id);
      const analysis = await api.analyzeAuthenticity(match.id);

      setSelectedInf({
        ...match,
        authenticity: report.authenticityScore ?? analysis.authenticity_score,
        engagement: report.engagementRate ?? analysis.engagement_rate,
        risk: String(report.riskLevel || analysis.risk_level || 'medium').toLowerCase(),
      });
      setAuthReport(report);
      setScanned(true);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'An error occurred during authenticity scanning.';
      setScanError(
        platform === 'YouTube'
          ? `Live YouTube lookup failed: ${message}`
          : message,
      );
      setScanned(false);
      setSelectedInf(null);
    } finally {
      setScanning(false);
    }
  };

  const authenticityScore = selectedInf?.authenticity ?? 0;
  const verdictColor = authenticityScore >= 90 ? '#22D3EE' : authenticityScore >= 75 ? '#93C5FD' : '#F87171';
  const verdictText = authenticityScore >= 90 ? 'AUTHENTIC' : authenticityScore >= 75 ? 'MOSTLY REAL' : 'SUSPICIOUS';
  const followerBase = Math.max(selectedInf?.followers ?? 1, 1);

  if (!catalogLoaded) {
    return <div style={{ padding: 28, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Loading authenticity engine...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <div>
        <div className="label-caps" style={{ marginBottom: 12 }}>AI ANALYSIS ENGINE</div>
        <h2 style={{ fontSize: 40, color: '#fff', margin: '0 0 8px' }}>Authenticity Analysis</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 15, color: '#64748B' }}>
          Deep-scan any creator for bot followers, engagement fraud, and audience quality.
        </p>
      </div>

      <GlassCard style={{ padding: 28 }}>
        <div className="label-caps" style={{ marginBottom: 10 }}>Step 1 — Select platform</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {platformOptions.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                setPlatform(opt);
                setScanned(false);
                setScanError(null);
              }}
              style={{
                padding: '8px 18px',
                borderRadius: 20,
                border: platform === opt ? '1px solid #38BDF8' : '1px solid rgba(56,189,248,0.15)',
                background: platform === opt ? 'rgba(56,189,248,0.12)' : 'transparent',
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                fontWeight: 500,
                color: platform === opt ? '#BAE6FD' : '#64748B',
                cursor: 'pointer',
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="label-caps" style={{ marginBottom: 10 }}>Step 2 — Enter creator</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: 10 }}>
            <input
              value={handle}
              onChange={e => setHandle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder={
                platform === 'YouTube'
                  ? 'e.g. Mr Indian Hacker, @mrindianhacker'
                  : platform === 'Instagram'
                    ? 'e.g. @cristiano or creator name'
                    : platform === 'TikTok'
                      ? 'e.g. @charlidamelio or creator name'
                      : 'Select a platform above, then enter name or @handle'
              }
              disabled={!platform}
              style={{
                width: '100%',
                height: 50,
                background: 'rgba(8,12,21,0.8)',
                border: '1px solid rgba(56,189,248,0.2)',
                borderRadius: 10,
                padding: '0 16px 0 44px',
                fontFamily: 'Inter, sans-serif',
                fontSize: 15,
                color: '#ffffff',
                outline: 'none',
                opacity: platform ? 1 : 0.55,
              }}
            />
            <Search size={16} color="#38BDF8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            {scanning && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                overflow: 'hidden',
                borderRadius: 10,
              }}>
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    width: '40%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(186,230,253,0.4), transparent)',
                  }}
                />
              </div>
            )}
          </div>
          <button
            onClick={handleScan}
            disabled={scanning || !platform}
            style={{
              padding: '0 28px',
              height: 50,
              background: 'linear-gradient(135deg, #0EA5E9, #1D4ED8)',
              border: 'none',
              borderRadius: 10,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              color: '#fff',
              cursor: scanning || !platform ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 20px rgba(14,165,233,0.3)',
              opacity: scanning || !platform ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {scanning ? (
              <>
                <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                Scanning...
              </>
            ) : (
              <>
                <Shield size={16} />
                Analyze
              </>
            )}
          </button>
        </div>

        {platform && (
          <p style={{ marginTop: 12, fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B' }}>
            Searching {platform} catalog
            {platform === 'YouTube' ? ' and YouTube Data API' : ''} for an exact or name/handle match.
          </p>
        )}

        {scanning && (
          <div style={{ marginTop: 16 }}>
            {['Resolving creator on selected platform...', 'Running bot detection model...', 'Analyzing engagement patterns...', 'Calculating authenticity score...'].map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.5 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}
              >
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: '#38BDF8' }}
                />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#64748B' }}>{step}</span>
              </motion.div>
            ))}
          </div>
        )}

        {scanError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 16,
              padding: '12px 16px',
              background: 'rgba(248,113,113,0.06)',
              border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: 8,
              color: '#F87171',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertTriangle size={15} />
            <span>{scanError}</span>
          </motion.div>
        )}
      </GlassCard>

      <AnimatePresence>
        {scanned && selectedInf && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
              <GlassCard style={{ padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="label-caps" style={{ marginBottom: 24 }}>OVERALL AUTHENTICITY</div>
                <svg width={200} height={120} viewBox="0 0 200 120">
                  <defs>
                    <linearGradient id="authGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#BAE6FD" />
                      <stop offset="100%" stopColor="#38BDF8" />
                    </linearGradient>
                    <filter id="authGlow">
                      <feGaussianBlur stdDeviation="4" result="b" />
                      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(56,189,248,0.12)" strokeWidth={10} strokeLinecap="round" />
                  <motion.path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="url(#authGrad)"
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray={`${(authenticityScore / 100) * Math.PI * 80} ${Math.PI * 80}`}
                    filter="url(#authGlow)"
                    initial={{ strokeDasharray: `0 ${Math.PI * 80}` }}
                    animate={{ strokeDasharray: `${(authenticityScore / 100) * Math.PI * 80} ${Math.PI * 80}` }}
                    transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
                  />
                </svg>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  fontSize: 64,
                  color: '#ffffff',
                  lineHeight: 1,
                  marginTop: -20,
                  filter: `drop-shadow(0 0 12px ${verdictColor})`,
                }}>
                  {authenticityScore}
                </div>
                <div style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontStyle: 'italic',
                  fontSize: 20,
                  color: verdictColor,
                  marginTop: 8,
                }}>
                  {verdictText}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', marginTop: 8 }}>
                  {selectedInf.name} · {selectedInf.platform}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#38BDF8', marginTop: 4 }}>
                  {selectedInf.handle}
                </div>
                {authReport?.confidence != null && (
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#64748B', marginTop: 8 }}>
                    Confidence: {Math.round(authReport.confidence * 100)}%
                  </div>
                )}
              </GlassCard>

              <GlassCard style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, color: '#fff', margin: '0 0 16px' }}>Follower Quality Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 80px 80px 80px',
                    gap: 8,
                    padding: '0 0 10px',
                    borderBottom: '1px solid rgba(56,189,248,0.08)',
                  }}>
                    {['Category', 'Count', '%', 'Risk'].map(h => (
                      <span key={h} className="label-caps" style={{ fontSize: 10 }}>{h}</span>
                    ))}
                  </div>
                  {mockBotData.map(row => (
                    <motion.div
                      key={row.category}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 80px 80px 80px',
                        gap: 8,
                        padding: '12px 0',
                        borderBottom: '1px solid rgba(56,189,248,0.04)',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94A3B8' }}>{row.category}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#64748B' }}>
                        {Math.round((row.pct / 100) * followerBase).toLocaleString()}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#94A3B8' }}>{row.pct}%</span>
                      <div style={{
                        padding: '2px 10px',
                        borderRadius: 10,
                        background: riskBg[row.risk],
                        border: `1px solid ${riskColors[row.risk]}30`,
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 10,
                        fontWeight: 500,
                        color: riskColors[row.risk],
                        width: 'fit-content',
                        textTransform: 'capitalize',
                      }}>
                        {row.risk}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {authReport?.signals?.length > 0 && (
                  <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(56,189,248,0.08)' }}>
                    <div className="label-caps" style={{ marginBottom: 8 }}>Signals</div>
                    {authReport.signals.slice(0, 4).map((signal: string) => (
                      <div key={signal} style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
                        · {signal}
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>

            <GlassCard style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, color: '#fff', margin: '0 0 16px' }}>Follower Network Graph</h3>
              <div style={{ position: 'relative', height: 300, overflow: 'hidden', borderRadius: 8, background: 'rgba(2,4,8,0.6)' }}>
                <svg width="100%" height="300" viewBox="0 0 600 300">
                  {networkNodes.flatMap(n =>
                    networkNodes.filter(m => m.id !== n.id && Math.random() > 0.87).slice(0, 2).map(m => (
                      <line
                        key={`${n.id}-${m.id}`}
                        x1={n.x} y1={n.y} x2={m.x} y2={m.y}
                        stroke={n.isBot || m.isBot ? 'rgba(248,113,113,0.08)' : 'rgba(56,189,248,0.12)'}
                        strokeWidth={0.5}
                      />
                    ))
                  )}
                  {networkNodes.map(n => (
                    <motion.circle
                      key={n.id}
                      cx={n.x} cy={n.y} r={n.size}
                      fill={n.isBot ? 'rgba(248,113,113,0.6)' : '#38BDF8'}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: n.id * 0.03 }}
                      style={{ filter: `drop-shadow(0 0 ${n.size / 2}px ${n.isBot ? '#F87171' : '#38BDF8'})` }}
                    />
                  ))}
                </svg>
                <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 16 }}>
                  {[['#38BDF8', 'Real Cluster'], ['rgba(248,113,113,0.8)', 'Suspicious']].map(([c, l]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: c as string }} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#64748B' }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {!scanned && !scanning && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#334155' }}>
          <Shield size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 20 }}>
            Select a platform, then enter a creator to analyze
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, marginTop: 8 }}>
            YouTube: Mr Indian Hacker · Instagram: @cristiano · TikTok: charli d&apos;amelio
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
}
