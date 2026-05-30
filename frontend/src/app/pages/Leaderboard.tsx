import { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AvatarRing } from '../components/AvatarRing';
import { AIScoreGauge } from '../components/AIScoreGauge';
import { SparkLine } from '../components/SparkLine';
import { GlassCard } from '../components/GlassCard';
import leaderboardData from '../../data/leaderboard.json';
import influencerData from '../../data/influencers.json';

const growthMap: Record<string, number[]> = {};
influencerData.forEach(inf => {
  growthMap[inf.handle] = inf.growth;
});

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 18, color: '#BAE6FD', textShadow: '0 0 12px rgba(186,230,253,0.6)' }}>#1</div>;
  if (rank === 2) return <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 18, color: '#7DD3FC' }}>#2</div>;
  if (rank === 3) return <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 18, color: '#38BDF8' }}>#3</div>;
  return <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, fontSize: 14, color: '#64748B', width: 28, textAlign: 'center' }}>#{rank}</div>;
}

function RankChange({ rank, prev }: { rank: number; prev: number }) {
  const diff = prev - rank;
  if (diff > 0) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#22D3EE' }}>
      <TrendingUp size={11} />+{diff}
    </div>
  );
  if (diff < 0) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#F87171' }}>
      <TrendingDown size={11} />{diff}
    </div>
  );
  return <Minus size={11} color="#475569" />;
}

export default function Leaderboard() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const podium = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 28 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="label-caps" style={{ marginBottom: 12 }}>GLOBAL RANKINGS</div>
          <h2 style={{ fontSize: 40, color: '#fff', margin: 0 }}>Creator Leaderboard</h2>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['week', 'month', 'quarter'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                border: period === p ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(56,189,248,0.08)',
                background: period === p ? 'rgba(56,189,248,0.08)' : 'transparent',
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                fontWeight: 500,
                color: period === p ? '#BAE6FD' : '#64748B',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Podium */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: 16, alignItems: 'end' }}>
        {[podium[1], podium[0], podium[2]].map((entry, i) => {
          const realRank = i === 0 ? 2 : i === 1 ? 1 : 3;
          const isFirst = realRank === 1;
          const heights = [180, 220, 160];
          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.2, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              style={{
                padding: '28px 20px 20px',
                background: isFirst ? 'rgba(14,165,233,0.06)' : 'rgba(8,12,21,0.75)',
                backdropFilter: 'blur(24px)',
                border: isFirst ? '1px solid rgba(56,189,248,0.35)' : '1px solid rgba(56,189,248,0.1)',
                borderRadius: 16,
                textAlign: 'center',
                boxShadow: isFirst ? '0 0 50px rgba(14,165,233,0.1), 0 0 80px rgba(56,189,248,0.05)' : 'none',
                minHeight: heights[i],
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {isFirst && (
                <div style={{ marginBottom: 4 }}>
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="#38BDF8" />
                  </svg>
                </div>
              )}
              <AvatarRing name={entry.name} size={isFirst ? 56 : 44} animated={isFirst} />
              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: isFirst ? 800 : 600,
                fontSize: isFirst ? 20 : 17,
                color: '#fff',
                textShadow: isFirst ? '0 0 12px rgba(186,230,253,0.4)' : 'none',
              }}>
                {entry.name}
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#64748B' }}>
                {entry.handle} · {entry.niche}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  padding: '2px 10px',
                  background: 'rgba(34,211,238,0.08)',
                  border: '1px solid rgba(34,211,238,0.2)',
                  borderRadius: 10,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  color: '#22D3EE',
                }}>
                  AI {entry.aiScore}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#22D3EE' }}>
                  {entry.growth}
                </div>
              </div>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 600,
                fontSize: isFirst ? 36 : 28,
                color: isFirst ? '#BAE6FD' : '#7DD3FC',
                lineHeight: 1,
                textShadow: isFirst ? '0 0 20px rgba(186,230,253,0.5)' : 'none',
              }}>
                #{realRank}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Rest of leaderboard */}
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '48px 1fr 100px 100px 100px 80px 90px',
          gap: 8,
          padding: '14px 20px',
          borderBottom: '1px solid rgba(56,189,248,0.08)',
        }}>
          {['Rank', 'Creator', 'Platform', 'Followers', 'Engagement', 'Score', 'Growth'].map(h => (
            <span key={h} className="label-caps" style={{ fontSize: 10 }}>{h}</span>
          ))}
        </div>
        {rest.map((entry, i) => {
          const sparkData = growthMap[entry.handle] || [100, 110, 120, 130, 140, 150, 160, 170, 180, 192, 204, 218];
          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr 100px 100px 100px 80px 90px',
                gap: 8,
                padding: '14px 20px',
                borderBottom: '1px solid rgba(56,189,248,0.04)',
                alignItems: 'center',
                transition: 'background 200ms',
                cursor: 'pointer',
              }}
              whileHover={{ backgroundColor: 'rgba(56,189,248,0.02)' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <RankBadge rank={entry.rank} />
                <RankChange rank={entry.rank} prev={entry.prev} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <AvatarRing name={entry.name} size={36} />
                <div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 13, color: '#fff' }}>{entry.name}</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#64748B' }}>{entry.handle} · {entry.niche}</div>
                </div>
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B' }}>{entry.platform}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#94A3B8' }}>
                {entry.followers >= 1000000 ? `${(entry.followers / 1000000).toFixed(1)}M` : `${(entry.followers / 1000).toFixed(0)}K`}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#22D3EE' }}>{entry.engagement}%</div>
              <div style={{
                display: 'inline-flex',
                padding: '2px 8px',
                background: 'rgba(34,211,238,0.06)',
                border: '1px solid rgba(34,211,238,0.15)',
                borderRadius: 8,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                color: '#22D3EE',
                width: 'fit-content',
              }}>
                {entry.aiScore}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SparkLine data={sparkData} width={56} height={24} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#22D3EE' }}>{entry.growth}</span>
              </div>
            </motion.div>
          );
        })}
      </GlassCard>
    </motion.div>
  );
}
