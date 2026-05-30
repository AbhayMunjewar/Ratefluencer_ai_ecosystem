import { useState, useEffect, memo } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Users, Rocket, TrendingUp, Zap, ArrowUpRight } from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { GlassCard } from '../components/GlassCard';
import { AvatarRing } from '../components/AvatarRing';
import { SparkLine } from '../components/SparkLine';
import { AIScoreGauge } from '../components/AIScoreGauge';
import { api } from '../services/api';

const PIE_COLORS = ['#38BDF8', '#BAE6FD', '#0EA5E9', '#0369A1'];

const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(8,12,21,0.95)',
      border: '1px solid rgba(56,189,248,0.2)',
      borderRadius: 10,
      padding: '10px 14px',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: p.color || '#38BDF8' }}>
          {p.name}: {p.value}{p.name === 'Engagement' ? '%' : ''}
        </div>
      ))}
    </div>
  );
});

const quickActions = [
  { label: 'New Campaign', icon: Rocket, route: '/campaigns' },
  { label: 'Find Creators', icon: Users, route: '/influencers' },
  { label: 'Run AI Scan', icon: Zap, route: '/authenticity' },
  { label: 'View Trends', icon: TrendingUp, route: '/dashboard' },
  { label: 'Match Brand', icon: ArrowUpRight, route: '/brand-matching' },
  { label: 'Export Report', icon: ArrowUpRight, route: '/dashboard' },
];

export default function Dashboard() {
  const [metricsData, setMetricsData] = useState<any>(null);
  const [influencerList, setInfluencerList] = useState<any[]>([]);
  const [campaignList, setCampaignList] = useState<any[]>([]);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    async function loadData() {
      try {
        const dash = await api.getDashboard();
        const infs = await api.getInfluencers();
        const camps = await api.getCampaigns();
        
        setMetricsData(dash.metrics);
        setFeedItems(dash.activity_feed.slice(0, 8));
        setInfluencerList(infs);
        setCampaignList(camps);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (feedItems.length === 0) return;
    const interval = setInterval(() => {
      const newItem = {
        id: Date.now(),
        type: ['info', 'success', 'alert'][Math.floor(Math.random() * 3)] as string,
        message: feedItems[Math.floor(Math.random() * feedItems.length)]?.message || 'AI intelligence calculation updated',
        time: 'just now',
      };
      setFeedItems(prev => [newItem, ...prev.slice(0, 11)]);
    }, 8000);
    return () => clearInterval(interval);
  }, [feedItems]);

  const dotColors: Record<string, string> = {
    info: '#38BDF8',
    success: '#22D3EE',
    alert: '#F87171',
  };

  const statusColors: Record<string, string> = {
    active: '#22D3EE',
    paused: '#64748B',
    complete: '#38BDF8',
  };

  if (loading || !metricsData) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 500,
        gap: 16,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '3px solid rgba(56,189,248,0.1)',
          borderTopColor: '#38BDF8',
          animation: 'spin 1s linear infinite',
        }} />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#64748B' }}>
          Initializing AI Intelligence Engines...
        </span>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100%' }}
    >
      {/* Greeting */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontWeight: 400,
            fontStyle: 'italic',
            fontSize: 28,
            color: '#ffffff',
          }}>
            {greeting}, Arjun
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', marginTop: 4 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          background: 'rgba(14,165,233,0.06)',
          border: '1px solid rgba(56,189,248,0.15)',
          borderRadius: 24,
        }}>
          <div style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#22D3EE',
            boxShadow: '0 0 8px #22D3EE',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: '#22D3EE' }}>
            AI Systems Nominal
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KPICard label="Influencers Tracked" value={metricsData.kpis?.influencersTracked || 2400000} suffix="+" trend="up" trendValue="+12.4%" icon={<Users size={20} />} delay={0} />
        <KPICard label="Active Campaigns" value={metricsData.kpis?.activeCampaigns || 1847} trend="up" trendValue="+8.1%" icon={<Rocket size={20} />} delay={0.08} />
        <KPICard label="Avg Engagement Rate" value={metricsData.kpis?.avgEngagement || 6.8} suffix="%" decimals={1} trend="up" trendValue="+0.6pp" icon={<TrendingUp size={20} />} delay={0.16} />
        <KPICard label="AI Content Generated" value={metricsData.kpis?.contentGenerated || 3291} trend="up" trendValue="+24%" icon={<Zap size={20} />} delay={0.24} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <GlassCard style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, color: '#fff', margin: 0, marginBottom: 4 }}>Engagement Over Time</h3>
              <div className="label-caps">12 month average</div>
            </div>
            <div style={{
              padding: '4px 12px',
              background: 'rgba(34,211,238,0.08)',
              border: '1px solid rgba(34,211,238,0.2)',
              borderRadius: 16,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              color: '#22D3EE',
            }}>
              ↑ 61.5%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={metricsData.engagementOverTime}>
              <defs>
                <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.06)" />
              <XAxis dataKey="month" tick={{ fontFamily: 'Inter', fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" name="Engagement" stroke="#38BDF8" strokeWidth={2} fill="url(#engGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 15, color: '#fff', margin: '0 0 20px' }}>Platform Split</h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={metricsData.platformSplit}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {metricsData.platformSplit.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {metricsData.platformSplit.map((p: any, i: number) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i] }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94A3B8' }}>{p.name}</span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: PIE_COLORS[i] }}>{p.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Second Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '5fr 4fr 3fr', gap: 16 }}>
        {/* Live Activity Feed */}
        <GlassCard style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, color: '#fff', margin: 0 }}>Live Activity</h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              color: '#22D3EE',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22D3EE', animation: 'pulse 1.5s ease-in-out infinite' }} />
              LIVE
            </div>
          </div>
          <div style={{
            background: '#020408',
            borderRadius: 8,
            padding: '12px',
            height: 240,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            {feedItems.map((item, i) => (
              <motion.div
                key={item.id || i}
                initial={i === 0 ? { opacity: 0, x: 16 } : {}}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}
              >
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: dotColors[item.type] || '#38BDF8',
                  marginTop: 4,
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${dotColors[item.type] || '#38BDF8'}`,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>
                    {item.message}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#334155', marginTop: 2 }}>
                    {item.time || 'just now'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Radar Chart */}
        <GlassCard style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, color: '#fff', margin: '0 0 8px' }}>Performance Radar</h3>
          <ResponsiveContainer width="100%" height={230}>
            <RadarChart data={metricsData.radarData}>
              <PolarGrid stroke="rgba(56,189,248,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontFamily: 'Inter', fontSize: 11, fill: '#64748B' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Score" dataKey="A" stroke="#38BDF8" fill="rgba(56,189,248,0.12)" strokeWidth={1.5} dot={{ fill: '#38BDF8', r: 3 }} />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Top Niches */}
        <GlassCard style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, color: '#fff', margin: '0 0 20px' }}>Top Niches</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {metricsData.topNiches.map((niche: any) => (
              <div key={niche.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94A3B8' }}>{niche.name}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#38BDF8' }}>{niche.pct}%</span>
                </div>
                <div style={{ height: 3, background: 'rgba(56,189,248,0.08)', borderRadius: 2 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${niche.pct}%` }}
                    transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
                    style={{
                      height: '100%',
                      background: 'linear-gradient(to right, #0EA5E9, #38BDF8)',
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Third Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '5fr 4fr 3fr', gap: 16 }}>
        {/* Top Influencers */}
        <GlassCard style={{ padding: 24, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, color: '#fff', margin: 0 }}>Top Influencers</h3>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#38BDF8', cursor: 'pointer' }}>View all →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 80px 80px 80px',
              gap: 8,
              padding: '0 0 8px',
              borderBottom: '1px solid rgba(56,189,248,0.06)',
            }}>
              {['Creator', 'Followers', 'AI Score', 'Trend'].map(h => (
                <span key={h} className="label-caps" style={{ fontSize: 10 }}>{h}</span>
              ))}
            </div>
            {influencerList.slice(0, 5).map(inf => (
              <div key={inf.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 80px 80px',
                gap: 8,
                padding: '10px 0',
                borderBottom: '1px solid rgba(56,189,248,0.04)',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AvatarRing name={inf.name} size={32} />
                  <div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: '#fff' }}>{inf.name}</div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#64748B' }}>{inf.platform}</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#94A3B8' }}>
                  {(inf.followers / 1000000).toFixed(1)}M
                </div>
                <div style={{
                  display: 'inline-flex',
                  padding: '2px 8px',
                  background: 'rgba(34,211,238,0.08)',
                  border: '1px solid rgba(34,211,238,0.2)',
                  borderRadius: 10,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  color: '#22D3EE',
                  width: 'fit-content',
                }}>
                  {inf.aiScore}
                </div>
                <SparkLine data={inf.growth} width={72} height={28} />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Campaigns */}
        <GlassCard style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, color: '#fff', margin: 0 }}>Recent Campaigns</h3>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#38BDF8', cursor: 'pointer' }}>View all →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {campaignList.slice(0, 5).map(camp => (
              <div key={camp.id} style={{
                padding: '12px',
                background: 'rgba(8,12,21,0.6)',
                borderRadius: 10,
                border: '1px solid rgba(56,189,248,0.06)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: '#fff' }}>{camp.name}</div>
                  <div style={{
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: camp.status === 'active' ? 'rgba(56,189,248,0.08)' : camp.status === 'complete' ? 'rgba(14,165,233,0.12)' : 'rgba(100,116,139,0.08)',
                    border: `1px solid ${camp.status === 'active' ? 'rgba(56,189,248,0.25)' : camp.status === 'complete' ? 'rgba(14,165,233,0.3)' : '#334155'}`,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 10,
                    fontWeight: 500,
                    color: camp.status === 'active' ? '#BAE6FD' : camp.status === 'complete' ? '#fff' : '#64748B',
                    textTransform: 'capitalize',
                  }}>
                    {camp.status}
                  </div>
                </div>
                <div style={{ height: 3, background: 'rgba(56,189,248,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    width: `${camp.progress}%`,
                    height: '100%',
                    background: 'linear-gradient(to right, #0EA5E9, #38BDF8)',
                    borderRadius: 2,
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#64748B' }}>{camp.progress}% complete</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#38BDF8' }}>ROI {camp.roi}x</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, color: '#fff', margin: '0 0 16px' }}>Quick Actions</h3>
          <div style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: 10 }}>
            {quickActions.map(action => (
              <motion.button
                type="button"
                key={action.label}
                whileHover={{ scale: 1.02, borderColor: 'rgba(56,189,248,0.3)' }}
                onClick={() => navigate(action.route)}
                style={{
                  padding: '14px 12px',
                  background: 'rgba(8,12,21,0.6)',
                  border: '1px solid rgba(56,189,248,0.08)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 200ms ease',
                }}
              >
                <action.icon size={18} color="#38BDF8" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#94A3B8' }}>{action.label}</div>
              </motion.button>
            ))}
          </div>
        </GlassCard>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </motion.div>
  );
}
