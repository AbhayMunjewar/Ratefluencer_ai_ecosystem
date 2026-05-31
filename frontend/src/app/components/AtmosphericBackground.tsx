export function AtmosphericBackground() {
  return (
    <div className="atmospheric-bg">
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse 700px 500px at 80% 10%, rgba(14,165,233,0.07) 0%, transparent 70%),
          radial-gradient(ellipse 600px 400px at 10% 80%, rgba(12,33,64,0.4) 0%, transparent 70%),
          radial-gradient(ellipse 900px 700px at 50% 50%, rgba(30,58,138,0.05) 0%, transparent 70%)
        `,
        animation: 'atmosphericPulse 90s ease-in-out infinite alternate',
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          linear-gradient(135deg, transparent 0%, rgba(186,230,253,0.025) 30%, transparent 60%),
          linear-gradient(150deg, transparent 20%, rgba(186,230,253,0.015) 50%, transparent 80%)
        `,
      }} />
      <style>{`
        @keyframes atmosphericPulse {
          0% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
          100% { opacity: 0.9; transform: scale(0.99); }
        }
      `}</style>
    </div>
  );
}
