interface AIScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
}

export function AIScoreGauge({ score, size = 80, label = 'AI Score' }: AIScoreGaugeProps) {
  const radius = (size - 12) / 2;
  const circumference = Math.PI * radius;
  const filled = (score / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: size, height: size / 2 + 12 }}>
        <svg width={size} height={size / 2 + 12} viewBox={`0 0 ${size} ${size / 2 + 12}`}>
          <defs>
            <linearGradient id={`gauge-grad-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
            <filter id={`gauge-glow-${score}`}>
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Track */}
          <path
            d={`M ${12 / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - 12 / 2} ${cy}`}
            fill="none"
            stroke="rgba(56,189,248,0.12)"
            strokeWidth={6}
            strokeLinecap="round"
          />
          {/* Fill */}
          <path
            d={`M ${12 / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - 12 / 2} ${cy}`}
            fill="none"
            stroke={`url(#gauge-grad-${score})`}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            filter={`url(#gauge-glow-${score})`}
          />
        </svg>
        <div style={{
          position: 'absolute',
          bottom: 2,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 700,
          fontSize: size * 0.24,
          color: '#BAE6FD',
        }}>
          {score}
        </div>
      </div>
      <span style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#64748B',
      }}>
        {label}
      </span>
    </div>
  );
}
