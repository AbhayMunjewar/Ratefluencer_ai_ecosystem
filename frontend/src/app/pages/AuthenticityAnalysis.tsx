import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import influencerData from '../../data/influencers.json';

const mockBotData = [
  { category: 'Ghost Followers', count: 14200, pct: 6.1, risk: 'low' },
  { category: 'Bot Accounts', count: 8400, pct: 3.6, risk: 'low' },
  { category: 'Mass Follower Accounts', count: 11800, pct: 5.0, risk: 'medium' },
  { category: 'Inactive (90d)', count: 28600, pct: 12.2, risk: 'low' },
  { category: 'Suspicious Activity', count: 3200, pct: 1.4, risk: 'high' },
  { category: 'Pod Engagement', count: 5600, pct: 2.4, risk: 'medium' },
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

export default function AuthenticityAnalysis() {
  const [handle, setHandle] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [selectedInf, setSelectedInf] = useState(influencerData[0]);

  const handleScan = () => {
    if (!handle.trim()) return;
    setScanning(true);
    setScanned(false);
    setTimeout(() => {
      const found = influencerData.find(i => i.handle.toLowerCase().includes(handle.toLowerCase().replace('@', '')));
      if (found) setSelectedInf(found);
      setScanning(false);
      setScanned(true);
    }, 2800);
  };

  const verdictColor = selectedInf.authenticity >= 90 ? '#22D3EE' : selectedInf.authenticity >= 75 ? '#93C5FD' : '#F87171';
  const verdictText = selectedInf.authenticity >= 90 ? 'AUTHENTIC' : selectedInf.authenticity >= 75 ? 'MOSTLY REAL' : 'SUSPICIOUS';

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

      {/* Scan Input */}
      <GlassCard style={{ padding: 28 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: 10 }}>
            <input
              value={handle}
              onChange={e => setHandle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder="Enter @handle, username, or profile URL..."
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
              }}
            />
            <Search size={16} color="#38BDF8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            {/* Scanning beam */}
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
            disabled={scanning}
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
              cursor: scanning ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 20px rgba(14,165,233,0.3)',
              opacity: scanning ? 0.7 : 1,
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

        {scanning && (
          <div style={{ marginTop: 16 }}>
            {['Fetching follower graph...', 'Running bot detection model...', 'Analyzing engagement patterns...', 'Calculating authenticity score...'].map((step, i) => (
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
      </GlassCard>

      {/* Results */}
      <AnimatePresence>
        {scanned && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
              {/* Score Gauge */}
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
                    strokeDasharray={`${(selectedInf.authenticity / 100) * Math.PI * 80} ${Math.PI * 80}`}
                    filter="url(#authGlow)"
                    initial={{ strokeDasharray: `0 ${Math.PI * 80}` }}
                    animate={{ strokeDasharray: `${(selectedInf.authenticity / 100) * Math.PI * 80} ${Math.PI * 80}` }}
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
                  {selectedInf.authenticity}
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
              </GlassCard>

              {/* Bot Detection Table */}
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
                        {(row.count * selectedInf.followers / 234000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
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
              </GlassCard>
            </div>

            {/* Network Graph */}
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
            Enter a creator handle above to begin analysis
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, marginTop: 8 }}>
            Try: @ariavoss, @kai.nkm, @finnadeyemi
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
}
