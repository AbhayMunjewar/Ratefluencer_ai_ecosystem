import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Rocket, TrendingUp, DollarSign, Users, Plus } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { api } from '../services/api';

const statusConfig: Record<string, { bg: string; border: string; text: string; label: string }> = {
  active: { bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.25)', text: '#BAE6FD', label: 'Active' },
  paused: { bg: 'rgba(100,116,139,0.08)', border: '#334155', text: '#64748B', label: 'Paused' },
  complete: { bg: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.3)', text: '#ffffff', label: 'Complete' },
};

const ganttMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

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

  useEffect(() => {
    let mounted = true;

    async function loadCampaigns() {
      try {
        const data = await api.getCampaigns();
        if (mounted) {
          setCampaignData(data);
        }
      } catch (error) {
        console.error('Failed to load campaigns:', error);
      }
    }

    loadCampaigns();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = filter === 'all' ? campaignData : campaignData.filter(c => c.status === filter);

  const totalBudget = campaignData.reduce((a, c) => a + c.budget, 0);
  const totalSpent = campaignData.reduce((a, c) => a + c.spent, 0);
  const activeCampaigns = campaignData.filter(c => c.status === 'active').length;
  const avgRoi = (campaignData.reduce((a, c) => a + c.roi, 0) / campaignData.length).toFixed(1);

  const roiChartData = campaignData.slice(0, 8).map(c => ({
    name: c.name.split(' ')[0],
    roi: c.roi,
    engagement: c.engagement,
  }));

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
        <button style={{
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
        }}>
          <Plus size={16} />
          New Campaign
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Budget', value: `$${(totalBudget / 1000).toFixed(0)}K`, icon: DollarSign, sub: 'Allocated' },
          { label: 'Total Spent', value: `$${(totalSpent / 1000).toFixed(0)}K`, icon: TrendingUp, sub: `${Math.round(totalSpent / totalBudget * 100)}% utilized` },
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
