import { useState } from 'react';
import { useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Search, Bell, Sparkles } from 'lucide-react';

const routeNames: Record<string, { name: string; sub: string }> = {
  '/dashboard': { name: 'Dashboard', sub: 'Overview' },
  '/influencers': { name: 'Influencer Search', sub: 'Discovery' },
  '/leaderboard': { name: 'Leaderboard', sub: 'Rankings' },
  '/authenticity': { name: 'Authenticity Analysis', sub: 'Intelligence' },
  '/growth': { name: 'Growth Prediction', sub: 'Intelligence' },
  '/brand-matching': { name: 'Brand Matching', sub: 'Monetize' },
  '/campaigns': { name: 'Campaign Success', sub: 'Monetize' },
  '/copilot': { name: 'AI Copilot', sub: 'Tools' },
  '/admin': { name: 'Admin Panel', sub: 'Tools' },
  '/settings': { name: 'Settings', sub: 'Tools' },
};

export function Topbar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();
  const route = routeNames[location.pathname] || { name: 'Ratefluencer', sub: 'AI Platform' };

  return (
    <div style={{
      height: 60,
      background: 'rgba(2,4,8,0.92)',
      backdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(56,189,248,0.08)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 24,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Breadcrumb */}
      <div style={{ flexShrink: 0 }}>
        <div style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontWeight: 500,
          fontSize: 18,
          color: '#ffffff',
          lineHeight: 1.2,
        }}>
          {route.name}
        </div>
        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 11,
          color: '#64748B',
          letterSpacing: '0.05em',
        }}>
          {route.sub}
        </div>
      </div>

      {/* Search */}
      <motion.div
        animate={{ width: searchFocused ? 360 : 280 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        style={{
          position: 'relative',
          marginLeft: 'auto',
        }}
      >
        <Search
          size={14}
          color="#38BDF8"
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
        <input
          placeholder="Search creators, campaigns, trends..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            width: '100%',
            height: 36,
            background: 'rgba(8,12,21,0.8)',
            border: `1px solid ${searchFocused ? 'rgba(56,189,248,0.5)' : 'rgba(56,189,248,0.1)'}`,
            borderRadius: 8,
            padding: '0 12px 0 36px',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#ffffff',
            outline: 'none',
            boxShadow: searchFocused ? '0 0 0 3px rgba(56,189,248,0.1)' : 'none',
            transition: 'border-color 200ms, box-shadow 200ms',
          }}
        />
        {searchFocused && (
          <div style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            color: '#64748B',
          }}>
            ⌘K
          </div>
        )}
      </motion.div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={18} color="#64748B" />
          <div style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#38BDF8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9,
            fontWeight: 700,
            color: '#020408',
          }}>
            3
          </div>
        </div>

        <div style={{
          width: 1,
          height: 20,
          background: 'rgba(56,189,248,0.1)',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)',
            padding: 2,
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#080C15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 12,
              color: '#38BDF8',
            }}>
              A
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            background: 'rgba(14,165,233,0.08)',
            border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: 20,
          }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#22D3EE',
              boxShadow: '0 0 6px rgba(34,211,238,0.8)',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 11,
              fontWeight: 500,
              color: '#22D3EE',
            }}>
              AI Active
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
