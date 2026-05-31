import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Zap, Send, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { api } from '../services/api';

const pipelines = [
  { id: 'hook', label: 'Viral Hook Generator', desc: 'Generate high-converting hooks' },
  { id: 'caption', label: 'Caption Optimizer', desc: 'Platform-native captions' },
  { id: 'script', label: 'Script Writer', desc: 'Full video scripts' },
  { id: 'hashtag', label: 'Hashtag Intelligence', desc: 'Trending tag clusters' },
];

const platforms = ['TikTok', 'Instagram', 'YouTube', 'Twitter/X'];

interface TerminalLine {
  id: number;
  type: 'info' | 'success' | 'system' | 'error';
  text: string;
}

const initialLog: TerminalLine[] = [
  { id: 1, type: 'system', text: '> Ratefluencer AI Copilot v4.2.1 initialized' },
  { id: 2, type: 'system', text: '> Model: Ratefluencer-Content-Large-v2' },
  { id: 3, type: 'info', text: '> Ready. Select pipeline and platform to generate content.' },
];

export default function AICopilot() {
  const [pipeline, setPipeline] = useState(pipelines[0]);
  const [platform, setPlatform] = useState('TikTok');
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [outputs, setOutputs] = useState<any[]>([]);
  const [log, setLog] = useState<TerminalLine[]>(initialLog);
  const [copied, setCopied] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (type: TerminalLine['type'], text: string) => {
    setLog(prev => [...prev, { id: Date.now(), type, text }]);
  };

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  useEffect(() => {
    let mounted = true;

    async function loadOutputs() {
      try {
        const seedOutputs = await api.getAIOutputs();
        if (mounted) {
          setOutputs(seedOutputs.slice(0, 2));
        }
      } catch (error) {
        console.error('Failed to load AI outputs:', error);
      }
    }

    loadOutputs();

    return () => {
      mounted = false;
    };
  }, []);

  const generate = () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setOutputs([]);

    const steps = [
      { type: 'info' as const, text: `> Analyzing topic: "${topic}"` },
      { type: 'info' as const, text: `> Loading ${platform} content patterns...` },
      { type: 'info' as const, text: `> Running ${pipeline.label} pipeline...` },
      { type: 'system' as const, text: `> Scoring viral potential...` },
      { type: 'success' as const, text: `> Generation complete. 3 outputs ready.` },
    ];

    steps.forEach((step, i) => {
      setTimeout(() => addLog(step.type, step.text), i * 600);
    });

    setTimeout(() => {
      const generated = [
        { id: 'g1', type: pipeline.id, platform, content: `The ${topic} secret that 99% of ${platform} creators miss — and why it's costing them views.`, viralScore: 92 + Math.round(Math.random() * 6), predictedReach: 2000000 + Math.round(Math.random() * 3000000) },
        { id: 'g2', type: pipeline.id, platform, content: `I tested every ${topic} strategy for 30 days. Here's what actually worked (data inside).`, viralScore: 87 + Math.round(Math.random() * 8), predictedReach: 1200000 + Math.round(Math.random() * 1800000) },
        { id: 'g3', type: pipeline.id, platform, content: `Stop doing ${topic} this way. The algorithm rewards creators who understand this one shift.`, viralScore: 89 + Math.round(Math.random() * 7), predictedReach: 900000 + Math.round(Math.random() * 1400000) },
      ];
      setOutputs(generated);
      setGenerating(false);
    }, 3200);
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const typeColors: Record<string, string> = {
    info: '#38BDF8',
    success: '#BAE6FD',
    system: '#7DD3FC',
    error: '#F87171',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <div>
        <div className="label-caps" style={{ marginBottom: 12 }}>GENERATIVE AI</div>
        <h2 style={{ fontSize: 40, color: '#fff', margin: '0 0 8px' }}>AI Copilot</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 15, color: '#64748B' }}>
          Generate viral hooks, scripts, captions, and hashtag strategies with AI trained on 10M+ viral posts.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Pipeline selector */}
          <GlassCard style={{ padding: 20 }}>
            <div className="label-caps" style={{ marginBottom: 14 }}>SELECT PIPELINE</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {pipelines.map(p => (
                <div
                  key={p.id}
                  onClick={() => setPipeline(p)}
                  style={{
                    padding: '12px',
                    borderRadius: 10,
                    background: pipeline.id === p.id ? 'rgba(56,189,248,0.08)' : 'rgba(8,12,21,0.5)',
                    border: `1px solid ${pipeline.id === p.id ? 'rgba(56,189,248,0.4)' : 'rgba(56,189,248,0.08)'}`,
                    cursor: 'pointer',
                    transition: 'all 200ms',
                    position: 'relative',
                  }}
                >
                  {pipeline.id === p.id && (
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#38BDF8',
                      boxShadow: '0 0 8px rgba(56,189,248,0.6)',
                      animation: 'pulse 2s ease-in-out infinite',
                    }} />
                  )}
                  <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 12, color: pipeline.id === p.id ? '#BAE6FD' : '#94A3B8', marginBottom: 4 }}>{p.label}</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#475569' }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Platform + Topic */}
          <GlassCard style={{ padding: 20 }}>
            <div className="label-caps" style={{ marginBottom: 14 }}>PLATFORM</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              {platforms.map(p => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: platform === p ? '1px solid #38BDF8' : '1px solid rgba(56,189,248,0.1)',
                    background: platform === p ? 'rgba(56,189,248,0.1)' : 'transparent',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 12,
                    color: platform === p ? '#BAE6FD' : '#64748B',
                    cursor: 'pointer',
                    transition: 'all 200ms',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="label-caps" style={{ marginBottom: 10 }}>TOPIC / BRIEF</div>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Describe your content topic, product, or campaign objective..."
              rows={3}
              style={{
                width: '100%',
                background: 'rgba(8,12,21,0.8)',
                border: '1px solid rgba(56,189,248,0.15)',
                borderRadius: 8,
                padding: '12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                fontWeight: 300,
                color: '#ffffff',
                outline: 'none',
                resize: 'none',
                lineHeight: 1.6,
              }}
            />
          </GlassCard>

          <button
            onClick={generate}
            disabled={generating || !topic.trim()}
            style={{
              padding: '14px',
              background: generating ? 'rgba(56,189,248,0.1)' : 'linear-gradient(135deg, #0EA5E9, #1D4ED8)',
              border: generating ? '1px solid rgba(56,189,248,0.3)' : 'none',
              borderRadius: 12,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              color: '#fff',
              cursor: generating || !topic.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: !generating && topic.trim() ? '0 0 30px rgba(14,165,233,0.25)' : 'none',
              opacity: !topic.trim() ? 0.5 : 1,
            }}
          >
            {generating ? (
              <>
                <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Generating...
              </>
            ) : (
              <>
                <Zap size={16} />
                Generate Content
              </>
            )}
          </button>

          {/* Terminal Log */}
          <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '10px 16px',
              borderBottom: '1px solid rgba(56,189,248,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22D3EE', boxShadow: '0 0 6px #22D3EE', animation: 'pulse 2s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#38BDF8' }}>SYSTEM LOG</span>
            </div>
            <div
              ref={logRef}
              style={{
                background: '#020408',
                padding: '12px 16px',
                height: 160,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {log.map(line => (
                <div key={line.id} style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  color: typeColors[line.type],
                  lineHeight: 1.6,
                }}>
                  {line.text}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Outputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="label-caps">GENERATED OUTPUTS</div>
          <AnimatePresence mode="popLayout">
            {outputs.map((output, i) => {
              const isCopied = copied === output.content;
              return (
                <motion.div
                  key={output.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.12 }}
                  className="glass-card"
                  style={{ padding: 22 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{
                        padding: '3px 10px',
                        background: 'rgba(56,189,248,0.08)',
                        border: '1px solid rgba(56,189,248,0.2)',
                        borderRadius: 8,
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 10,
                        fontWeight: 500,
                        color: '#38BDF8',
                        textTransform: 'capitalize',
                      }}>
                        {output.type}
                      </div>
                      <div style={{
                        padding: '3px 10px',
                        background: 'rgba(14,165,233,0.06)',
                        border: '1px solid rgba(14,165,233,0.15)',
                        borderRadius: 8,
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 10,
                        color: '#64748B',
                      }}>
                        {output.platform}
                      </div>
                    </div>
                    <button
                      onClick={() => copy(output.content)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isCopied ? '#22D3EE' : '#64748B',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 11,
                        transition: 'color 200ms',
                      }}
                    >
                      {isCopied ? <CheckCircle size={13} /> : <Copy size={13} />}
                      {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 300,
                    fontSize: 15,
                    color: '#E2E8F0',
                    lineHeight: 1.7,
                    marginBottom: 16,
                    padding: '12px 16px',
                    background: 'rgba(8,12,21,0.5)',
                    borderRadius: 8,
                    borderLeft: '2px solid rgba(56,189,248,0.3)',
                  }}>
                    {output.content}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Virality gauge */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div>
                        <div className="label-caps" style={{ marginBottom: 4 }}>VIRAL SCORE</div>
                        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                          {Array.from({ length: 10 }, (_, i) => (
                            <div
                              key={i}
                              style={{
                                width: 6,
                                height: 6 + i * 2,
                                borderRadius: 2,
                                background: i < Math.round(output.viralScore / 10)
                                  ? `rgba(14,165,233,${0.4 + i * 0.06})`
                                  : 'rgba(56,189,248,0.06)',
                              }}
                            />
                          ))}
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#38BDF8', marginLeft: 8 }}>
                            {output.viralScore}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="label-caps" style={{ marginBottom: 4 }}>PREDICTED REACH</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#22D3EE' }}>
                        {output.predictedReach >= 1000000
                          ? `${(output.predictedReach / 1000000).toFixed(1)}M`
                          : `${(output.predictedReach / 1000).toFixed(0)}K`}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {outputs.length === 0 && !generating && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#334155' }}>
              <Bot size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 20 }}>
                Configure your pipeline and generate content
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </motion.div>
  );
}
