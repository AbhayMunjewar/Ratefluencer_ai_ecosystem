import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { ArrowLeft, MapPin, CheckCircle, Link2, Star, Users, TrendingUp } from 'lucide-react';
import { AvatarRing } from '../components/AvatarRing';
import { AIScoreGauge } from '../components/AIScoreGauge';
import { SparkLine } from '../components/SparkLine';
import { GlassCard } from '../components/GlassCard';
import { api } from '../services/api';

const tabs = ['Overview', 'Audience', 'Content', 'Campaigns', 'AI Insights'];

export default function InfluencerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [inf, setInf] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadInfluencer() {
      try {
        const data = await api.getInfluencerById(id || '1');
        if (mounted) {
          setInf(data);
        }
      } catch (error) {
        console.error('Failed to load influencer profile:', error);
      }
    }

    loadInfluencer();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (!inf) {
    return <div style={{ padding: 28, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Loading creator profile...</div>;
  }

  const audienceData = [
    { age: '13–17', pct: 8 },
    { age: '18–24', pct: 34 },
    { age: '25–34', pct: 28 },
    { age: '35–44', pct: 18 },
    { age: '45+', pct: 12 },
  ];

  const contentData = [
    { type: 'Photos', avg: 8.4, count: 48 },
    { type: 'Reels', avg: 12.1, count: 62 },
    { type: 'Stories', avg: 4.2, count: 210 },
    { type: 'Carousels', avg: 9.8, count: 31 },
  ];

  const growthMonths = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const growthData = inf.growth.map((v, i) => ({
    month: growthMonths[i],
    followers: Math.round(inf.followers * v / 100),
  }));

  const insightPoints = [
    { label: 'Peak posting time', value: 'Tues–Thurs, 6–9PM local' },
    { label: 'Avg response rate', value: '84% comments within 24h' },
    { label: 'Viral probability', value: `${Math.min(99, inf.aiScore + 2)}% next 30 days` },
    { label: 'Brand safety score', value: `${inf.authenticity}/100` },
    { label: 'Niche authority index', value: `Top ${100 - inf.aiScore + 5}th percentile` },
    { label: 'Content consistency', value: '4.2 posts / week avg' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      style={{ padding: '0 0 40px' }}
    >
      {/* Hero Banner */}
      <div style={{
        height: 160,
        background: 'linear-gradient(135deg, #020408, #0C2340, #0F1628)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 0,
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(135deg, transparent 30%, rgba(186,230,253,0.03) 50%, transparent 70%),
            radial-gradient(ellipse 600px 300px at 70% 50%, rgba(14,165,233,0.06), transparent)
          `,
        }} />
        <button
          onClick={() => navigate('/influencers')}
          style={{
            position: 'absolute',
            top: 24,
            left: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(8,12,21,0.6)',
            border: '1px solid rgba(56,189,248,0.15)',
            borderRadius: 8,
            padding: '7px 14px',
            color: '#94A3B8',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={14} />
          Back to Search
        </button>
      </div>

      {/* Profile Header */}
      <div style={{
        padding: '0 28px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 24,
        marginTop: -40,
        marginBottom: 32,
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{ flexShrink: 0, marginTop: 0 }}>
          <div style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)',
            padding: 3,
            boxShadow: '0 0 30px rgba(14,165,233,0.3)',
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#080C15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 700,
              fontSize: 36,
              color: '#BAE6FD',
            }}>
              {inf.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontSize: 40, color: '#fff', margin: 0, fontFamily: 'Cormorant Garamond, serif' }}>{inf.name}</h1>
            {inf.verified && <CheckCircle size={22} color="#38BDF8" />}
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#64748B' }}>{inf.handle}</span>
            <div style={{
              padding: '2px 10px',
              background: 'rgba(56,189,248,0.08)',
              border: '1px solid rgba(56,189,248,0.2)',
              borderRadius: 10,
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              color: '#38BDF8',
            }}>
              {inf.platform}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <MapPin size={12} color="#64748B" />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B' }}>{inf.location}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, paddingTop: 20 }}>
          <AIScoreGauge score={inf.aiScore} size={88} label="AI Score" />
          <AIScoreGauge score={inf.authenticity} size={88} label="Authenticity" />
        </div>

        <div style={{ paddingTop: 20, display: 'flex', gap: 10 }}>
          <button style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #0EA5E9, #1D4ED8)',
            border: 'none',
            borderRadius: 10,
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(14,165,233,0.3)',
          }}>
            Contact Creator
          </button>
          <button style={{
            padding: '10px 20px',
            background: 'transparent',
            border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: 10,
            color: '#94A3B8',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            cursor: 'pointer',
          }}>
            Add to List
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        padding: '0 28px',
        borderBottom: '1px solid rgba(56,189,248,0.08)',
        marginBottom: 28,
        position: 'relative',
      }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                border: 'none',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: activeTab === i ? 500 : 400,
                color: activeTab === i ? '#BAE6FD' : '#64748B',
                cursor: 'pointer',
                position: 'relative',
                transition: 'color 200ms',
              }}
            >
              {tab}
              {activeTab === i && (
                <motion.div
                  layoutId="tabIndicator"
                  style={{
                    position: 'absolute',
                    bottom: -1,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: '#38BDF8',
                    boxShadow: '0 0 8px rgba(56,189,248,0.6)',
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 28px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            {activeTab === 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <GlassCard style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 15, color: '#fff', margin: '0 0 6px' }}>About</h3>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14, color: '#94A3B8', lineHeight: 1.8 }}>
                      {inf.bio}
                    </p>
                  </GlassCard>
                  <GlassCard style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 15, color: '#fff', margin: '0 0 16px' }}>Follower Growth</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={growthData}>
                        <defs>
                          <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.06)" />
                        <XAxis dataKey="month" tick={{ fontFamily: 'Inter', fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
                        <Tooltip />
                        <Area type="monotone" dataKey="followers" stroke="#38BDF8" strokeWidth={2} fill="url(#profGrad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </GlassCard>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Total Followers', value: `${(inf.followers/1000000).toFixed(2)}M`, icon: Users },
                    { label: 'Avg Engagement', value: `${inf.engagement}%`, icon: TrendingUp },
                    { label: 'Avg Likes', value: `${(inf.avgLikes/1000).toFixed(0)}K`, icon: Star },
                    { label: 'Campaigns Run', value: `${inf.campaigns}`, icon: Link2 },
                  ].map(stat => (
                    <GlassCard key={stat.label} style={{ padding: 20 }}>
                      <div className="label-caps" style={{ marginBottom: 8 }}>{stat.label}</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 24, fontWeight: 500, color: '#38BDF8' }}>
                        {stat.value}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <GlassCard style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 15, color: '#fff', margin: '0 0 20px' }}>Age Distribution</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={audienceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.06)" />
                      <XAxis dataKey="age" tick={{ fontFamily: 'Inter', fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} unit="%" />
                      <Tooltip />
                      <Bar dataKey="pct" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </GlassCard>
                <GlassCard style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 15, color: '#fff', margin: '0 0 20px' }}>Audience Metrics</h3>
                  {[
                    { label: 'Real Followers', value: `${inf.authenticity}%` },
                    { label: 'Active Followers', value: `${Math.round(inf.authenticity * 0.72)}%` },
                    { label: 'Audience Match Score', value: `${inf.aiScore}/100` },
                    { label: 'Female / Male Split', value: '58% / 42%' },
                    { label: 'Top Country', value: inf.country },
                  ].map(m => (
                    <div key={m.label} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: '1px solid rgba(56,189,248,0.06)',
                    }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94A3B8' }}>{m.label}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#38BDF8' }}>{m.value}</span>
                    </div>
                  ))}
                </GlassCard>
              </div>
            )}

            {activeTab === 2 && (
              <GlassCard style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, color: '#fff', margin: '0 0 20px' }}>Content Performance by Type</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={contentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.06)" />
                    <XAxis dataKey="type" tick={{ fontFamily: 'Inter', fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip />
                    <Bar dataKey="avg" name="Avg Engagement %" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>
            )}

            {activeTab === 3 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[1, 2, 3].map(i => (
                  <GlassCard key={i} style={{ padding: 20 }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, color: '#fff', marginBottom: 12 }}>
                      Campaign #{i}
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#64748B', marginBottom: 8 }}>
                      Brand: Lumière Labs
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      padding: '2px 10px',
                      background: 'rgba(34,211,238,0.08)',
                      border: '1px solid rgba(34,211,238,0.2)',
                      borderRadius: 10,
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 11,
                      color: '#22D3EE',
                    }}>
                      Complete
                    </div>
                    <div style={{ marginTop: 12, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#38BDF8' }}>
                      ROI: {(3 + i * 0.8).toFixed(1)}x
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {activeTab === 4 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <GlassCard style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 15, color: '#fff', margin: '0 0 20px' }}>AI Intelligence Report</h3>
                  {insightPoints.map(pt => (
                    <div key={pt.label} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      borderBottom: '1px solid rgba(56,189,248,0.06)',
                    }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94A3B8' }}>{pt.label}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#BAE6FD', textAlign: 'right', maxWidth: 160 }}>{pt.value}</span>
                    </div>
                  ))}
                </GlassCard>
                <GlassCard style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 15, color: '#fff', margin: '0 0 16px' }}>Growth Forecast</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14, color: '#94A3B8', lineHeight: 1.7, marginBottom: 16 }}>
                    Based on current trajectory and niche momentum, our AI projects{' '}
                    <span style={{ color: '#22D3EE', fontWeight: 500 }}>
                      {Math.round(inf.followers * 0.18 / 1000)}K–{Math.round(inf.followers * 0.28 / 1000)}K new followers
                    </span>{' '}
                    over the next 90 days.
                  </p>
                  <div style={{
                    padding: '14px',
                    background: 'rgba(34,211,238,0.04)',
                    border: '1px solid rgba(34,211,238,0.12)',
                    borderRadius: 10,
                  }}>
                    <div className="label-caps" style={{ color: '#22D3EE', marginBottom: 6 }}>AI RECOMMENDATION</div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13, color: '#94A3B8', lineHeight: 1.6, margin: 0 }}>
                      High confidence match for brands in {inf.categories[0]} and {inf.categories[1]}.
                      Optimal campaign window: next 3–6 weeks before projected follower spike.
                    </p>
                  </div>
                </GlassCard>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
