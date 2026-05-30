import { ReactNode } from 'react';
import { motion } from 'motion/react';
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend: 'up' | 'down';
  trendValue: string;
  icon: ReactNode;
  delay?: number;
}

export function KPICard({ label, value, prefix = '', suffix = '', decimals = 0, trend, trendValue, icon, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      className="glass-card"
      style={{ padding: '24px', cursor: 'default' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4, borderColor: 'rgba(56,189,248,0.30)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'rgba(56,189,248,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#38BDF8',
        }}>
          {icon}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 10px',
          borderRadius: 20,
          background: trend === 'up' ? 'rgba(34,211,238,0.08)' : 'rgba(248,113,113,0.08)',
          border: `1px solid ${trend === 'up' ? 'rgba(34,211,238,0.2)' : 'rgba(248,113,113,0.2)'}`,
        }}>
          {trend === 'up' ? (
            <TrendingUp size={12} color="#22D3EE" />
          ) : (
            <TrendingDown size={12} color="#F87171" />
          )}
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 500,
            color: trend === 'up' ? '#22D3EE' : '#F87171',
          }}>
            {trendValue}
          </span>
        </div>
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 500,
        fontSize: 32,
        color: '#ffffff',
        lineHeight: 1,
        marginBottom: 8,
      }}>
        {prefix}
        <CountUp end={value} duration={2.5} decimals={decimals} separator="," delay={delay} />
        {suffix}
      </div>
      <div className="label-caps">{label}</div>
    </motion.div>
  );
}
