import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Server, Database, Cpu, Activity, Users, Zap, Globe, Shield } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

const systemServices = [
  { name: 'AI Scoring Engine', status: 'healthy', latency: '42ms', uptime: '99.98%' },
  { name: 'Creator Indexer', status: 'healthy', latency: '18ms', uptime: '99.99%' },
  { name: 'Authenticity Model', status: 'healthy', latency: '124ms', uptime: '99.95%' },
  { name: 'Growth Predictor', status: 'warning', latency: '310ms', uptime: '99.81%' },
  { name: 'Brand Matching API', status: 'healthy', latency: '67ms', uptime: '99.97%' },
  { name: 'Content Generator', status: 'healthy', latency: '890ms', uptime: '99.89%' },
  { name: 'Analytics Pipeline', status: 'healthy', latency: '23ms', uptime: '99.99%' },
  { name: 'Notification Service', status: 'down', latency: '—', uptime: '97.4%' },
];

const trafficData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  requests: Math.round(12000 + Math.sin(i / 3) * 4000 + Math.random() * 2000),
  errors: Math.round(20 + Math.random() * 30),
}));

const featureHeatmap = [
  { feature: 'Dashboard', mon: 94, tue: 88, wed: 92, thu: 96, fri: 89, sat: 72, sun: 68 },
  { feature: 'Inf. Search', mon: 87, tue: 91, wed: 85, thu: 88, fri: 82, sat: 61, sun: 55 },
  { feature: 'Auth Analysis', mon: 62, tue: 71, wed: 68, thu: 74, fri: 66, sat: 44, sun: 38 },
  { feature: 'AI Copilot', mon: 78, tue: 84, wed: 81, thu: 88, fri: 79, sat: 58, sun: 49 },
  { feature: 'Campaigns', mon: 55, tue: 61, wed: 59, thu: 64, fri: 60, sat: 38, sun: 32 },
  { feature: 'Leaderboard', mon: 72, tue: 69, wed: 74, thu: 71, fri: 68, sat: 52, sun: 47 },
];

const statusDot: Record<string, string> = {
  healthy: '#22D3EE',
  warning: '#93C5FD',
  down: '#F87171',
};

export default function AdminPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <div>
        <div className="label-caps" style={{ marginBottom: 12 }}>SYSTEM ADMINISTRATION</div>
        <h2 style={{ fontSize: 40, color: '#fff', margin: 0 }}>Admin Panel</h2>
      </div>

      {/* System Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'API Requests / hr', value: '847K', icon: Globe, color: '#38BDF8', sub: '+12% vs yesterday' },
          { label: 'Active Users', value: '12,847', icon: Users, color: '#22D3EE', sub: '98 online now' },
          { label: 'CPU Utilization', value: '34%', icon: Cpu, color: '#BAE6FD', sub: '8 cores active' },
          { label: 'DB Read Latency', value: '8ms', icon: Database, color: '#7DD3FC', sub: 'p99: 24ms' },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card"
            style={{ padding: 20 }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${m.color}12`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <m.icon size={18} color={m.color} />
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 24, fontWeight: 500, color: '#fff', marginBottom: 4 }}>
              {m.value}
            </div>
            <div className="label-caps" style={{ marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#475569' }}>{m.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Services + Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
        {/* Service Health */}
        <GlassCard style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, color: '#fff', margin: 0 }}>Service Health</h3>
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
          {systemServices.map((svc, i) => (
            <motion.div
              key={svc.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid rgba(56,189,248,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: statusDot[svc.status],
                  boxShadow: `0 0 6px ${statusDot[svc.status]}`,
                  animation: svc.status === 'down' ? 'none' : 'pulse 2s ease-in-out infinite',
                }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: svc.status === 'down' ? '#F87171' : '#94A3B8' }}>
                  {svc.name}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#64748B' }}>{svc.latency}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: statusDot[svc.status] }}>{svc.uptime}</span>
              </div>
            </motion.div>
          ))}
        </GlassCard>

        {/* Traffic Chart */}
        <GlassCard style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, color: '#fff', margin: '0 0 16px' }}>API Traffic (24h)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trafficData}>
              <defs>
                <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.06)" />
              <XAxis dataKey="hour" tick={{ fontFamily: 'Inter', fontSize: 9, fill: '#64748B' }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="requests" stroke="#38BDF8" strokeWidth={2} fill="url(#trafficGrad)" dot={false} />
              <Area type="monotone" dataKey="errors" stroke="#F87171" strokeWidth={1.5} fill="rgba(248,113,113,0.05)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Feature Heatmap */}
      <GlassCard style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, color: '#fff', margin: '0 0 20px' }}>Feature Usage Heatmap (Last 7 Days)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '6px 12px', textAlign: 'left', fontFamily: 'Inter', fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569' }}>Feature</th>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <th key={d} style={{ padding: '6px 8px', textAlign: 'center', fontFamily: 'Inter', fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569' }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureHeatmap.map(row => (
                <tr key={row.feature}>
                  <td style={{ padding: '6px 12px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94A3B8' }}>{row.feature}</td>
                  {[row.mon, row.tue, row.wed, row.thu, row.fri, row.sat, row.sun].map((val, i) => (
                    <td key={i} style={{ padding: '4px 8px' }}>
                      <div style={{
                        width: '100%',
                        height: 28,
                        borderRadius: 4,
                        background: `rgba(56,189,248,${val / 100 * 0.6})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        color: val > 60 ? '#BAE6FD' : '#475569',
                      }}>
                        {val}%
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </motion.div>
  );
}
