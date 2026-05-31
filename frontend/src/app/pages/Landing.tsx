import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import * as THREE from 'three';
import { ArrowRight, Brain, TrendingUp, Shield, Target, BarChart3, Check } from 'lucide-react';

function ThreeHero() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020408, 0.012);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);

    const dirLight = new THREE.DirectionalLight(0xBAE6FD, 3);
    dirLight.position.set(5, 5, 3);
    scene.add(dirLight);
    const ambLight = new THREE.AmbientLight(0x0C1A2E, 0.5);
    scene.add(ambLight);
    const pointLight = new THREE.PointLight(0x0369A1, 1, 20);
    pointLight.position.set(-5, -3, 2);
    scene.add(pointLight);

    const panels: THREE.Mesh[] = [];
    const panelData = [
      { w: 4, h: 6, x: 2, y: 0, z: -2, rx: 0.1, ry: -0.3 },
      { w: 5, h: 4, x: -1, y: 1, z: -4, rx: -0.1, ry: 0.2 },
      { w: 3, h: 5, x: 4, y: -1, z: -3, rx: 0.2, ry: -0.5 },
      { w: 6, h: 3, x: -3, y: -2, z: -5, rx: -0.15, ry: 0.1 },
      { w: 2, h: 7, x: 1, y: 3, z: -6, rx: 0.05, ry: -0.4 },
    ];

    panelData.forEach(pd => {
      const geo = new THREE.PlaneGeometry(pd.w, pd.h, 8, 8);
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x0A1628,
        metalness: 1,
        roughness: 0.05,
        reflectivity: 1,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(pd.x, pd.y, pd.z);
      mesh.rotation.set(pd.rx, pd.ry, 0);
      scene.add(mesh);
      panels.push(mesh);
    });

    let frame = 0;
    const animate = () => {
      frame++;
      const t = frame * 0.0002;
      panels.forEach((p, i) => {
        p.rotation.y += 0.0003 * (i % 2 === 0 ? 1 : -1);
        p.rotation.x += 0.0001 * (i % 3 === 0 ? 1 : -0.5);
      });
      renderer.render(scene, camera);
      return requestAnimationFrame(animate);
    };
    const raf = animate();

    const onResize = () => {
      if (!mountRef.current) return;
      const nw = mountRef.current.clientWidth;
      const nh = mountRef.current.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />;
}

const features = [
  { icon: Search2, title: 'Influencer Discovery', desc: 'AI scans 2.4M creators across all platforms to surface perfect matches for your brand in seconds.', large: true },
  { icon: Shield, title: 'Authenticity Score', desc: 'Bot detection and engagement quality scoring powered by behavioral AI models.', tall: true },
  { icon: TrendingUp, title: 'Viral Predictor', desc: 'Predict content virality 2–3 weeks before peak with 94% accuracy.' },
  { icon: Brain, title: 'Content AI', desc: 'Generate platform-optimized hooks, scripts, and captions in one click.' },
  { icon: Target, title: 'Brand Matching', desc: 'Semantic brand-creator compatibility scoring across 40+ dimensions.' },
  { icon: BarChart3, title: 'Analytics Suite', desc: 'Real-time dashboards, ROI tracking, and predictive performance modeling.' },
];

function Search2({ size }: { size: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

const testimonials = [
  { quote: "Ratefluencer found us a nano-creator who drove 4x the ROI of our last macro-influencer campaign. The AI authenticity score is genuinely predictive.", name: "Priya Rajan", company: "Head of Brand, Lumière Labs" },
  { quote: "We went from 3-week manual influencer vetting to 20 minutes. The data depth is what Bloomberg Terminal is to finance.", name: "Alex Hartmann", company: "CMO, Apex Devices" },
  { quote: "The growth prediction model flagged three micro-creators who all crossed 1M followers within the projected window. Remarkable.", name: "Camille Durand", company: "Creative Director, Maison Éclat" },
];

const pricingTiers = [
  { name: 'Starter', price: 199, features: ['500 creator profiles/mo', '5 authenticity scans', 'Basic analytics', '1 brand profile', 'Email support'] },
  { name: 'Pro', price: 649, features: ['Unlimited creator profiles', '100 authenticity scans', 'Growth prediction', '10 brand profiles', 'AI Copilot (50 outputs)', 'Priority support'], highlight: true },
  { name: 'Enterprise', price: 1899, features: ['White-label platform', 'Custom AI models', 'Unlimited everything', 'API access', 'Dedicated CSM', 'SLA guarantee'] },
];

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: '#020408', minHeight: '100vh', color: '#ffffff' }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: '0 48px',
        background: scrolled ? 'rgba(2,4,8,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(56,189,248,0.08)' : '1px solid transparent',
        transition: 'all 400ms ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28,
            height: 28,
            background: 'linear-gradient(135deg, #0EA5E9, #1D4ED8)',
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            boxShadow: '0 0 16px rgba(14,165,233,0.5)',
          }} />
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 20, color: '#fff' }}>
            Ratefluencer
          </span>
          <span style={{
            padding: '1px 7px',
            background: 'rgba(14,165,233,0.12)',
            border: '1px solid rgba(56,189,248,0.25)',
            borderRadius: 12,
            fontSize: 10,
            fontWeight: 600,
            color: '#38BDF8',
          }}>AI</span>
        </div>

        <div style={{ display: 'flex', gap: 32, marginLeft: 48 }}>
          {['Platform', 'Intelligence', 'Pricing', 'Enterprise'].map(link => (
            <span key={link} style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 400,
              color: '#94A3B8',
              cursor: 'pointer',
              transition: 'color 200ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
            >
              {link}
            </span>
          ))}
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            marginLeft: 'auto',
            padding: '8px 20px',
            background: 'transparent',
            border: '1px solid rgba(59,130,246,0.5)',
            borderRadius: 8,
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 500,
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 300ms ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #0EA5E9, #1D4ED8)';
            (e.currentTarget as HTMLElement).style.borderColor = '#0EA5E9';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(14,165,233,0.3)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.5)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          Get Early Access
        </button>
      </nav>

      {/* Hero */}
      <section style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #020408 0%, #0C1A2E 50%, #0F2944 100%)',
      }}>
        <ThreeHero />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(2,4,8,0.85) 50%, rgba(2,4,8,0.3) 100%)',
          zIndex: 1,
        }} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '0 80px',
          maxWidth: 700,
        }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="label-caps" style={{ marginBottom: 24, color: '#94A3B8' }}>
              COLLECTION / AI INTELLIGENCE PLATFORM
            </div>
          </motion.div>

          <div style={{ overflow: 'hidden', marginBottom: 4 }}>
            <motion.h1
              initial={{ clipPath: 'inset(100% 0 0 0)' }}
              animate={{ clipPath: 'inset(0% 0 0 0)' }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
              style={{ fontSize: 88, lineHeight: 0.95, margin: 0, color: '#ffffff' }}
            >
              Influence
            </motion.h1>
          </div>
          <div style={{ overflow: 'hidden', marginBottom: 4 }}>
            <motion.h1
              initial={{ clipPath: 'inset(100% 0 0 0)' }}
              animate={{ clipPath: 'inset(0% 0 0 0)' }}
              transition={{ duration: 0.8, delay: 0.28, ease: [0.23, 1, 0.32, 1] }}
              style={{ fontSize: 88, lineHeight: 0.95, margin: 0, fontStyle: 'italic', fontWeight: 300, color: '#BAE6FD' }}
            >
              Intelligence,
            </motion.h1>
          </div>
          <div style={{ overflow: 'hidden', marginBottom: 40 }}>
            <motion.h1
              initial={{ clipPath: 'inset(100% 0 0 0)' }}
              animate={{ clipPath: 'inset(0% 0 0 0)' }}
              transition={{ duration: 0.8, delay: 0.36, ease: [0.23, 1, 0.32, 1] }}
              style={{ fontSize: 88, lineHeight: 0.95, margin: 0, color: '#ffffff' }}
            >
              Redefined.
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 300,
              fontSize: 17,
              lineHeight: 1.9,
              color: '#94A3B8',
              maxWidth: 420,
              marginBottom: 40,
            }}
          >
            Discover rising creators before they peak. Predict viral content.
            Match brands with{' '}
            <span style={{ color: '#93C5FD' }}>perfect precision.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.68 }}
            style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}
          >
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '14px 28px',
                borderRadius: 40,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 300ms ease',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              Explore Platform
              <ArrowRight size={14} />
            </button>
            <button
              style={{
                padding: '14px 28px',
                borderRadius: 40,
                background: '#0EA5E9',
                border: '1px solid #0EA5E9',
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 300ms ease',
                boxShadow: '0 0 30px rgba(14,165,233,0.3)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 50px rgba(14,165,233,0.5)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(14,165,233,0.3)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: '#fff',
                boxShadow: '0 0 8px rgba(255,255,255,0.8)',
                animation: 'pulse2 1.5s ease-in-out infinite',
              }} />
              Get Started
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            style={{ marginTop: 60, display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <div className="label-caps" style={{ color: '#475569' }}>SCROLL</div>
            <div style={{
              width: 1,
              background: 'linear-gradient(to bottom, rgba(56,189,248,0.4), transparent)',
              animation: 'scrollLine 1.5s ease-in-out infinite alternate',
            }} />
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{
        borderTop: '1px solid rgba(56,189,248,0.08)',
        borderBottom: '1px solid rgba(56,189,248,0.08)',
        background: 'rgba(8,12,21,0.6)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
        }}>
          {[
            { value: '2.4M', label: 'Creators Indexed' },
            { value: '98.7%', label: 'AI Accuracy' },
            { value: '$240M+', label: 'ROI Generated' },
            { value: '12K+', label: 'Brands Trust Us' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              style={{
                padding: '32px 48px',
                borderRight: i < 3 ? '1px solid rgba(56,189,248,0.08)' : 'none',
              }}
            >
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 500,
                fontSize: 32,
                color: '#ffffff',
                marginBottom: 6,
              }}>
                {stat.value}
              </div>
              <div className="label-caps">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Bento */}
      <section style={{ padding: '120px 80px', maxWidth: 1280, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: 64, textAlign: 'center' }}
        >
          <div className="label-caps" style={{ marginBottom: 16 }}>CAPABILITIES</div>
          <h2 style={{ fontSize: 52, color: '#ffffff', margin: '0 auto', maxWidth: 600 }}>
            The complete intelligence suite
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Large card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card"
            style={{ padding: 32, minHeight: 280 }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(56,189,248,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38BDF8',
              marginBottom: 20,
            }}>
              <Search2 size={22} />
            </div>
            <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 12 }}>Influencer Discovery</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 24 }}>
              AI scans 2.4M creators across all platforms to surface perfect matches for your brand in seconds. Filter by authenticity, niche, audience quality, and predicted growth.
            </p>
            {/* Mini chart */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 60 }}>
              {[42, 56, 48, 72, 65, 84, 78, 95, 88, 100].map((v, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${v}%`,
                    background: `linear-gradient(to top, #0EA5E9, rgba(186,230,253,${v / 120}))`,
                    borderRadius: '3px 3px 0 0',
                    opacity: 0.8,
                    transition: 'height 300ms ease',
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Tall card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(56,189,248,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38BDF8',
              marginBottom: 20,
            }}>
              <Shield size={22} />
            </div>
            <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 12 }}>Authenticity Score</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 28 }}>
              Bot detection and engagement quality scoring powered by behavioral AI.
            </p>
            {/* Gauge */}
            <svg width={120} height={70} viewBox="0 0 120 70">
              <defs>
                <linearGradient id="bentoGauge" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#BAE6FD" />
                  <stop offset="100%" stopColor="#0EA5E9" />
                </linearGradient>
                <filter id="bentoGlow">
                  <feGaussianBlur stdDeviation="3" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="rgba(56,189,248,0.12)" strokeWidth={8} strokeLinecap="round" />
              <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="url(#bentoGauge)" strokeWidth={8} strokeLinecap="round"
                strokeDasharray={`${0.94 * Math.PI * 50} ${Math.PI * 50}`} filter="url(#bentoGlow)" />
              <text x="60" y="52" textAnchor="middle" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, fill: '#BAE6FD' }}>94</text>
            </svg>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#22D3EE', marginTop: 8 }}>AUTHENTIC</div>
          </motion.div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { icon: TrendingUp, title: 'Viral Predictor', desc: 'Predict content virality 2–3 weeks before peak with 94% accuracy.' },
            { icon: Brain, title: 'Content AI', desc: 'Generate platform-optimized hooks, scripts, and captions instantly.' },
            { icon: Target, title: 'Brand Matching', desc: 'Semantic compatibility scoring across 40+ brand-creator dimensions.' },
            { icon: BarChart3, title: 'Analytics Suite', desc: 'Real-time dashboards, ROI tracking, and predictive performance.' },
          ].map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="glass-card"
              style={{ padding: 24 }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(56,189,248,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8',
                marginBottom: 16,
              }}>
                <feat.icon size={18} />
              </div>
              <h3 style={{ fontSize: 15, color: '#fff', marginBottom: 8 }}>{feat.title}</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        padding: '100px 80px',
        background: 'rgba(8,12,21,0.4)',
        borderTop: '1px solid rgba(56,189,248,0.06)',
        borderBottom: '1px solid rgba(56,189,248,0.06)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 80 }}
          >
            <div className="label-caps" style={{ marginBottom: 16 }}>PROCESS</div>
            <h2 style={{ fontSize: 48, color: '#fff', margin: 0 }}>How it works</h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
            {[
              { n: '01', title: 'Connect Your Brand', desc: 'Define your brand voice, target audience, and campaign objectives. Our AI builds a semantic brand model in minutes.' },
              { n: '02', title: 'Discover & Analyze', desc: 'Browse AI-curated creator shortlists with authenticity scores, audience quality metrics, and predicted ROI.' },
              { n: '03', title: 'Launch & Optimize', desc: 'Activate campaigns with one click. Real-time performance tracking with AI optimization recommendations.' },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
              >
                <div style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontWeight: 600,
                  fontSize: 64,
                  color: 'rgba(186,230,253,0.12)',
                  lineHeight: 1,
                  marginBottom: 16,
                }}>
                  {step.n}
                </div>
                <div style={{
                  width: 32,
                  height: 1,
                  background: 'linear-gradient(to right, #38BDF8, transparent)',
                  marginBottom: 20,
                }} />
                <h3 style={{ fontSize: 20, color: '#fff', marginBottom: 12 }}>
                  {step.title}
                </h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 15, color: '#64748B', lineHeight: 1.7 }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '100px 80px', maxWidth: 1280, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <div className="label-caps" style={{ marginBottom: 16 }}>TRUSTED BY LEADERS</div>
          <h2 style={{ fontSize: 48, color: '#fff', margin: 0 }}>What our clients say</h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card"
              style={{ padding: 32 }}
            >
              <p style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 18,
                color: '#E2E8F0',
                lineHeight: 1.6,
                marginBottom: 24,
              }}>
                "{t.quote}"
              </p>
              <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, color: '#fff', marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#60A5FA' }}>{t.company}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{
        padding: '100px 80px',
        background: 'rgba(8,12,21,0.4)',
        borderTop: '1px solid rgba(56,189,248,0.06)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <div className="label-caps" style={{ marginBottom: 16 }}>PRICING</div>
            <h2 style={{ fontSize: 48, color: '#fff', margin: 0 }}>Simple, transparent pricing</h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  padding: 32,
                  background: tier.highlight ? 'rgba(12,17,32,0.9)' : 'rgba(8,12,21,0.75)',
                  backdropFilter: 'blur(24px)',
                  border: tier.highlight ? '1px solid rgba(56,189,248,0.40)' : '1px solid rgba(56,189,248,0.10)',
                  borderRadius: 20,
                  boxShadow: tier.highlight ? '0 0 60px rgba(14,165,233,0.12)' : 'none',
                  position: 'relative',
                }}
              >
                {tier.highlight && (
                  <div style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '4px 16px',
                    background: 'linear-gradient(135deg, #0EA5E9, #1D4ED8)',
                    borderRadius: 20,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#fff',
                    whiteSpace: 'nowrap',
                  }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, color: '#94A3B8', marginBottom: 16 }}>{tier.name}</div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize: 42,
                    color: '#fff',
                  }}>${tier.price}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#64748B' }}>/mo</span>
                </div>
                <div style={{
                  height: 1,
                  background: 'linear-gradient(to right, rgba(56,189,248,0.2), transparent)',
                  margin: '24px 0',
                }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                  {tier.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Check size={14} color={tier.highlight ? '#22D3EE' : '#38BDF8'} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94A3B8' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 10,
                    background: tier.highlight ? 'linear-gradient(135deg, #0EA5E9, #1D4ED8)' : 'transparent',
                    border: tier.highlight ? 'none' : '1px solid rgba(56,189,248,0.25)',
                    color: '#fff',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 14,
                    cursor: 'pointer',
                    boxShadow: tier.highlight ? '0 0 30px rgba(14,165,233,0.25)' : 'none',
                    transition: 'all 300ms ease',
                  }}
                >
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#020408',
        borderTop: '1px solid rgba(56,189,248,0.06)',
        padding: '64px 80px 40px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 48, marginBottom: 64 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  background: 'linear-gradient(135deg, #0EA5E9, #1D4ED8)',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }} />
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 18, color: '#fff' }}>Ratefluencer</span>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 300, color: '#475569', lineHeight: 1.7, maxWidth: 260 }}>
                The world's most advanced AI influencer intelligence platform. Trusted by 12,000+ brands globally.
              </p>
            </div>
            {[
              { title: 'Platform', links: ['Dashboard', 'Influencer Search', 'Brand Matching', 'AI Copilot'] },
              { title: 'Intelligence', links: ['Authenticity AI', 'Growth Prediction', 'Viral Scores', 'Analytics'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'GDPR'] },
            ].map(col => (
              <div key={col.title}>
                <div className="label-caps" style={{ marginBottom: 16, color: '#475569' }}>{col.title}</div>
                {col.links.map(link => (
                  <div key={link} style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 300,
                    fontSize: 13,
                    color: '#475569',
                    marginBottom: 10,
                    cursor: 'pointer',
                    transition: 'color 200ms',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#94A3B8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
                  >
                    {link}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{
            borderTop: '1px solid rgba(56,189,248,0.06)',
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#334155' }}>
              © 2026 Ratefluencer AI. All rights reserved.
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#334155' }}>
              Built for the future of creator economy.
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes scrollLine {
          from { height: 20px; }
          to { height: 48px; }
        }
        @keyframes pulse2 {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.9); }
        }
      `}</style>
    </div>
  );
}
