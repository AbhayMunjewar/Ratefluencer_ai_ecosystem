import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Bell, Shield, Palette, Globe, CreditCard, Key, LogOut } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

const settingsSections = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'security', icon: Shield, label: 'Security' },
  { id: 'appearance', icon: Palette, label: 'Appearance' },
  { id: 'integrations', icon: Globe, label: 'Integrations' },
  { id: 'billing', icon: CreditCard, label: 'Billing' },
  { id: 'api', icon: Key, label: 'API Access' },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.div
      onClick={() => onChange(!value)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: value ? '#38BDF8' : '#0369A1',
        cursor: 'pointer',
        position: 'relative',
        boxShadow: value ? '0 0 10px rgba(56,189,248,0.4)' : 'none',
        transition: 'background 300ms, box-shadow 300ms',
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          position: 'absolute',
          top: 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
      />
    </motion.div>
  );
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile');
  const [toggles, setToggles] = useState({
    emailAlerts: true,
    pushNotifs: false,
    weeklyReport: true,
    scoreAlerts: true,
    campaignUpdates: true,
    twoFactor: false,
    apiAccess: true,
    dataSharing: false,
    darkMode: true,
    animations: true,
    compactMode: false,
  });

  const setToggle = (key: keyof typeof toggles, val: boolean) => {
    setToggles(prev => ({ ...prev, [key]: val }));
  };

  const accentColors = ['#38BDF8', '#0EA5E9', '#BAE6FD', '#7DD3FC', '#0369A1', '#22D3EE'];
  const [accent, setAccent] = useState('#38BDF8');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      style={{ padding: 28, display: 'flex', gap: 24 }}
    >
      {/* Sidebar */}
      <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {settingsSections.map(sec => (
          <div
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 16px',
              borderRadius: 10,
              background: activeSection === sec.id ? 'rgba(56,189,248,0.08)' : 'transparent',
              border: `1px solid ${activeSection === sec.id ? 'rgba(56,189,248,0.25)' : 'transparent'}`,
              cursor: 'pointer',
              transition: 'all 200ms',
            }}
          >
            <sec.icon size={16} color={activeSection === sec.id ? '#38BDF8' : '#475569'} />
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: activeSection === sec.id ? 500 : 400,
              color: activeSection === sec.id ? '#BAE6FD' : '#64748B',
            }}>
              {sec.label}
            </span>
          </div>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: 20 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 16px',
            borderRadius: 10,
            cursor: 'pointer',
            color: '#F87171',
          }}>
            <LogOut size={16} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>Log Out</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {activeSection === 'profile' && (
          <>
            <GlassCard style={{ padding: 28 }}>
              <h3 style={{ fontSize: 16, color: '#fff', margin: '0 0 24px' }}>Profile Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'First Name', value: 'Arjun' },
                  { label: 'Last Name', value: 'Mehta' },
                  { label: 'Email', value: 'arjun@company.io' },
                  { label: 'Company', value: 'Meridian Brands Inc.' },
                  { label: 'Role', value: 'Head of Growth' },
                  { label: 'Timezone', value: 'UTC-5 (EST)' },
                ].map(field => (
                  <div key={field.label}>
                    <div className="label-caps" style={{ marginBottom: 8 }}>{field.label}</div>
                    <input
                      defaultValue={field.value}
                      style={{
                        width: '100%',
                        height: 40,
                        background: 'rgba(8,12,21,0.8)',
                        border: '1px solid rgba(56,189,248,0.15)',
                        borderRadius: 8,
                        padding: '0 12px',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 13,
                        color: '#ffffff',
                        outline: 'none',
                        transition: 'border-color 200ms, box-shadow 200ms',
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = '#38BDF8';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.1)';
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(56,189,248,0.15)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
              <button style={{
                marginTop: 24,
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #0EA5E9, #1D4ED8)',
                border: 'none',
                borderRadius: 8,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 13,
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(14,165,233,0.2)',
              }}>
                Save Changes
              </button>
            </GlassCard>
          </>
        )}

        {activeSection === 'notifications' && (
          <GlassCard style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, color: '#fff', margin: '0 0 24px' }}>Notification Preferences</h3>
            {[
              { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive important alerts via email' },
              { key: 'pushNotifs', label: 'Push Notifications', desc: 'Browser push notifications' },
              { key: 'weeklyReport', label: 'Weekly Report', desc: 'AI-generated weekly performance summary' },
              { key: 'scoreAlerts', label: 'AI Score Alerts', desc: 'Alert when creator scores change significantly' },
              { key: 'campaignUpdates', label: 'Campaign Updates', desc: 'Real-time campaign performance updates' },
            ].map(item => (
              <div key={item.key} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 0',
                borderBottom: '1px solid rgba(56,189,248,0.06)',
              }}>
                <div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, color: '#fff', marginBottom: 4 }}>
                    {item.label}
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B' }}>{item.desc}</div>
                </div>
                <Toggle
                  value={toggles[item.key as keyof typeof toggles] as boolean}
                  onChange={v => setToggle(item.key as keyof typeof toggles, v)}
                />
              </div>
            ))}
          </GlassCard>
        )}

        {activeSection === 'security' && (
          <GlassCard style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, color: '#fff', margin: '0 0 24px' }}>Security Settings</h3>
            {[
              { key: 'twoFactor', label: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account' },
              { key: 'apiAccess', label: 'API Access', desc: 'Allow API key access to your account data' },
              { key: 'dataSharing', label: 'Analytics Data Sharing', desc: 'Share anonymized usage data to improve AI models' },
            ].map(item => (
              <div key={item.key} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 0',
                borderBottom: '1px solid rgba(56,189,248,0.06)',
              }}>
                <div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, color: '#fff', marginBottom: 4 }}>
                    {item.label}
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B' }}>{item.desc}</div>
                </div>
                <Toggle
                  value={toggles[item.key as keyof typeof toggles] as boolean}
                  onChange={v => setToggle(item.key as keyof typeof toggles, v)}
                />
              </div>
            ))}
          </GlassCard>
        )}

        {activeSection === 'appearance' && (
          <GlassCard style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, color: '#fff', margin: '0 0 24px' }}>Appearance</h3>
            <div style={{ marginBottom: 28 }}>
              <div className="label-caps" style={{ marginBottom: 16 }}>ACCENT COLOR</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {accentColors.map(c => (
                  <div
                    key={c}
                    onClick={() => setAccent(c)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: c,
                      cursor: 'pointer',
                      boxShadow: accent === c ? `0 0 0 3px rgba(2,4,8,1), 0 0 0 5px ${c}, 0 0 12px ${c}` : 'none',
                      transition: 'box-shadow 200ms',
                    }}
                  />
                ))}
              </div>
            </div>
            {[
              { key: 'darkMode', label: 'Dark Mode', desc: 'Use dark cinematic steel theme' },
              { key: 'animations', label: 'Animations', desc: 'Enable page transitions and micro-interactions' },
              { key: 'compactMode', label: 'Compact Mode', desc: 'Reduce spacing for data-dense layouts' },
            ].map(item => (
              <div key={item.key} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 0',
                borderBottom: '1px solid rgba(56,189,248,0.06)',
              }}>
                <div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, color: '#fff', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B' }}>{item.desc}</div>
                </div>
                <Toggle
                  value={toggles[item.key as keyof typeof toggles] as boolean}
                  onChange={v => setToggle(item.key as keyof typeof toggles, v)}
                />
              </div>
            ))}
          </GlassCard>
        )}

        {!['profile', 'notifications', 'security', 'appearance'].includes(activeSection) && (
          <GlassCard style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 22, color: '#334155' }}>
              {settingsSections.find(s => s.id === activeSection)?.label} settings coming soon
            </div>
          </GlassCard>
        )}
      </div>
    </motion.div>
  );
}
