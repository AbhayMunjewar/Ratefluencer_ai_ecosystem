import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { TrendingUp, Target, Zap } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AvatarRing } from '../components/AvatarRing';
import influencerData from '../../data/influencers.json';

type Scenario = 'conservative' | 'baseline' | 'optimistic';

function buildChartData(inf: typeof influencerData[0], scenario: Scenario) {
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const multipliers = { conservative: 1.06, baseline: 1.12, optimistic: 1.22 };
  const m = multipliers[scenario];
  const base = inf.followers;

  return months.map((month, i) => {
    const isPast = i < 12;
    const val = isPast
      ? Math.round(base * inf.growth[Math.min(i, 11)] / 100)
      : null;
    const pred = !isPast
      ? Math.round(base * Math.pow(m, i - 11))
      : null;
    const confLow = pred ? Math.round(pred * 0.88) : null;
    const confHigh = pred ? Math.round(pred * 1.12) : null;
    return { month, historical: val, predicted: pred, confLow, confHigh, isPast };
  });
}

const scenarios = [
  { key: 'conservative' as Scenario, label: 'Conservative', icon: Target, growth: '6%/mo', color: '#7DD3FC' },
  { key: 'baseline' as Scenario, label: 'Baseline', icon: TrendingUp, growth: '12%/mo', color: '#38BDF8' },
  { key: 'optimistic' as Scenario, label: 'Optimistic', icon: Zap, growth: '22%/mo', color: '#BAE6FD' },
];

export default function GrowthPrediction() {
  const [scenario, setScenario] = useState<Scenario>('baseline');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inf = influencerData[selectedIdx];
  const data = buildChartData(inf, scenario);
  const activeScenario = scenarios.find(s => s.key === scenario)!;

  const projected = data.find(d => d.predicted && !d.historical);
  const projectedMax = data.filter(d => d.predicted).slice(-1)[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <div>
        <div className="label-caps" style={{ marginBottom: 12 }}>AI PREDICTION ENGINE</div>
        <h2 style={{ fontSize: 40, color: '#fff', margin: '0 0 8px' }}>Growth Prediction</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 15, color: '#64748B' }}>
          90-day follower growth forecasts powered by behavioral pattern analysis.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>
        {/* Creator selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <GlassCard style={{ padding: 16 }}>
            <div className="label-caps" style={{ marginBottom: 12 }}>SELECT CREATOR</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {influencerData.slice(0, 8).map((inf, i) => (
                <div
                  key={inf.id}
                  onClick={() => setSelectedIdx(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: selectedIdx === i ? 'rgba(56,189,248,0.08)' : 'transparent',
                    border: `1px solid ${selectedIdx === i ? 'rgba(56,189,248,0.25)' : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'all 200ms',
                  }}
                >
                  <AvatarRing name={inf.name} size={28} />
                  <div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: selectedIdx === i ? '#BAE6FD' : '#94A3B8' }}>
                      {inf.name.split(' ')[0]}
                    </div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#64748B' }}>{inf.platform}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Chart area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Scenario tabs */}
          <div style={{ display: 'flex', gap: 8 }}>
            {scenarios.map(s => (
              <button
                key={s.key}
                onClick={() => setScenario(s.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 20px',
                  borderRadius: 10,
                  background: scenario === s.key ? 'rgba(56,189,248,0.1)' : 'transparent',
                  border: `1px solid ${scenario === s.key ? '#38BDF8' : 'rgba(56,189,248,0.12)'}`,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  fontWeight: 500,
                  color: scenario === s.key ? '#BAE6FD' : '#64748B',
                  cursor: 'pointer',
                  transition: 'all 200ms',
                }}
              >
                <s.icon size={14} />
                {s.label}
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: s.color }}>
                  +{s.growth}
                </span>
              </button>
            ))}
          </div>

          <GlassCard style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 15, color: '#fff', margin: '0 0 4px' }}>
                  {inf.name} — Follower Trajectory
                </h3>
                <div className="label-caps">Historical + AI Prediction ({activeScenario.label})</div>
              </div>
              <div style={{
                display: 'flex',
                gap: 16,
                alignItems: 'center',
              }}>
                {[
                  { c: '#38BDF8', l: 'Historical', dash: false },
                  { c: '#BAE6FD', l: 'Predicted', dash: true },
                  { c: 'rgba(56,189,248,0.12)', l: 'Confidence', dash: false },
                ].map(item => (
                  <div key={item.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 20,
                      height: 2,
                      background: item.c,
                      borderTop: item.dash ? `2px dashed ${item.c}` : 'none',
                    }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#64748B' }}>{item.l}</span>
                  </div>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={data}>
                <defs>
                  <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.06)" />
                <XAxis dataKey="month" tick={{ fontFamily: 'Inter', fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#64748B' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip />
                <ReferenceLine x="May" stroke="rgba(56,189,248,0.3)" strokeDasharray="4 4" label={{ value: 'Today', fill: '#38BDF8', fontSize: 11 }} />
                <Area type="monotone" dataKey="confHigh" fill="rgba(56,189,248,0.06)" stroke="none" />
                <Area type="monotone" dataKey="confLow" fill="rgba(2,4,8,0.5)" stroke="none" />
                <Line type="monotone" dataKey="historical" stroke="#38BDF8" strokeWidth={2} dot={false} connectNulls={false} />
                <Line type="monotone" dataKey="predicted" stroke="#BAE6FD" strokeWidth={2} strokeDasharray="6 4" dot={false} connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Projection cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'Current Followers', value: `${(inf.followers / 1000000).toFixed(2)}M`, sub: 'Baseline today' },
              { label: '90-day Projection', value: projectedMax?.predicted ? `${(projectedMax.predicted / 1000000).toFixed(2)}M` : '—', sub: `${activeScenario.label} scenario` },
              { label: 'Projected Growth', value: projectedMax?.predicted ? `+${Math.round((projectedMax.predicted - inf.followers) / 1000)}K` : '—', sub: 'New followers' },
            ].map(card => (
              <GlassCard key={card.label} style={{ padding: 20 }}>
                <div className="label-caps" style={{ marginBottom: 8 }}>{card.label}</div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 500,
                  fontSize: 26,
                  color: '#38BDF8',
                  marginBottom: 4,
                }}>
                  {card.value}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B' }}>{card.sub}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
