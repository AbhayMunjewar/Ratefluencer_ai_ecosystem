interface AvatarRingProps {
  name: string;
  size?: number;
  animated?: boolean;
}

function nameToColors(name: string): [string, string] {
  const palette: [string, string][] = [
    ['#38BDF8', '#0EA5E9'],
    ['#BAE6FD', '#38BDF8'],
    ['#0EA5E9', '#1D4ED8'],
    ['#7DD3FC', '#0369A1'],
    ['#93C5FD', '#2563EB'],
  ];
  const idx = name.charCodeAt(0) % palette.length;
  return palette[idx];
}

export function AvatarRing({ name, size = 48, animated = false }: AvatarRingProps) {
  const [c1, c2] = nameToColors(name);
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const ringSize = size + 4;

  return (
    <div style={{ position: 'relative', width: ringSize, height: ringSize, flexShrink: 0 }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: `conic-gradient(${c1}, ${c2}, #BAE6FD, ${c1})`,
        animation: animated ? 'spinRing 4s linear infinite' : undefined,
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
        }}>
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: size * 0.33,
            color: c1,
          }}>
            {initials}
          </span>
        </div>
      </div>
      <style>{`
        @keyframes spinRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
