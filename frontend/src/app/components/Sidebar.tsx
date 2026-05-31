import { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Search, Trophy, ShieldCheck, TrendingUp,
  Link2, Rocket, Bot, Settings, ChevronLeft, ChevronRight,
  Sparkles, BarChart3
} from 'lucide-react';

const navGroups = [
  {
    label: 'CORE',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/influencers', icon: Search, label: 'Influencer Search' },
      { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { to: '/authenticity', icon: ShieldCheck, label: 'Authenticity Analysis' },
      { to: '/growth', icon: TrendingUp, label: 'Growth Prediction' },
    ],
  },
  {
    label: 'MONETIZE',
    items: [
      { to: '/brand-matching', icon: Link2, label: 'Brand Matching' },
      { to: '/campaigns', icon: Rocket, label: 'Campaign Success' },
    ],
  },
  {
    label: 'TOOLS',
    items: [
      { to: '/copilot', icon: Bot, label: 'AI Copilot' },
      { to: '/admin', icon: BarChart3, label: 'Admin Panel' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.div
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      style={{
        height: '100vh',
        background: 'rgba(5,8,15,0.97)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(56,189,248,0.08)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(56,189,248,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 32,
          height: 32,
          flexShrink: 0,
          background: 'linear-gradient(135deg, #0EA5E9, #1D4ED8)',
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          boxShadow: '0 0 20px rgba(14,165,233,0.4)',
        }} />
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}
            >
              <span style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 600,
                fontSize: 18,
                color: '#ffffff',
                whiteSpace: 'nowrap',
              }}>
                Ratefluencer
              </span>
              <span style={{
                padding: '2px 8px',
                background: 'rgba(14,165,233,0.15)',
                border: '1px solid rgba(56,189,248,0.3)',
                borderRadius: 20,
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                fontWeight: 600,
                color: '#38BDF8',
                letterSpacing: '0.05em',
              }}>
                AI
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px 0' }}>
        {navGroups.map(group => (
          <div key={group.label} style={{ marginBottom: 8 }}>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: '8px 20px 4px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: '0.14em',
                    color: '#475569',
                    textTransform: 'uppercase',
                  }}
                >
                  {group.label}
                </motion.div>
              )}
            </AnimatePresence>
            {group.items.map(item => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: collapsed ? '11px 20px' : '10px 20px',
                    margin: '2px 8px',
                    borderRadius: 10,
                    background: isActive ? 'rgba(14,165,233,0.08)' : 'transparent',
                    borderLeft: isActive ? '3px solid #38BDF8' : '3px solid transparent',
                    boxShadow: isActive ? 'inset 0 0 20px rgba(56,189,248,0.05)' : 'none',
                    transition: 'all 200ms ease',
                    cursor: 'pointer',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(56,189,248,0.04)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                  >
                    <item.icon
                      size={18}
                      color={isActive ? '#38BDF8' : '#475569'}
                      style={{ flexShrink: 0 }}
                    />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 13,
                            fontWeight: isActive ? 500 : 400,
                            color: isActive ? '#BAE6FD' : '#64748B',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Card */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(56,189,248,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0EA5E9, #1D4ED8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 14,
            color: '#fff',
            flexShrink: 0,
          }}>
            A
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 13, color: '#fff' }}>Arjun Mehta</div>
                <div style={{
                  display: 'inline-block',
                  marginTop: 2,
                  padding: '1px 8px',
                  border: '1px solid rgba(56,189,248,0.3)',
                  borderRadius: 10,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 10,
                  color: '#38BDF8',
                }}>
                  Pro Plan
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          top: 28,
          right: -12,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#080C15',
          border: '1px solid rgba(56,189,248,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#38BDF8',
          zIndex: 10,
          transition: 'all 200ms ease',
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.div>
  );
}
