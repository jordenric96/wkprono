'use client';

export default function Home() {
  return (
    <main style={{
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(-45deg, #F3C98B, #DAA588, #C46D5E, #F56960)',
      backgroundSize: '400% 400%',
      animation: 'gradientBG 15s ease infinite',
      color: '#ffffff',
      textAlign: 'center',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glass-container {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 4rem 5rem;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          animation: fadeInUp 1.5s ease-out;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .accent-loader {
          display: inline-block;
          width: 60px;
          height: 4px;
          background: #9CF6F6;
          border-radius: 5px;
          box-shadow: 0 0 10px #9CF6F6;
          animation: pulse 2s infinite ease-in-out;
        }
        @keyframes pulse {
          0% { transform: scaleX(0.5); opacity: 0.6; }
          50% { transform: scaleX(1.5); opacity: 1; }
          100% { transform: scaleX(0.5); opacity: 0.6; }
        }
        @media (max-width: 600px) {
          .glass-container { padding: 2.5rem 2rem; width: 80%; }
          h1 { font-size: 2.2rem; }
          p { font-size: 0.9rem; }
        }
      `}</style>

      <div className="glass-container">
        <h1 style={{ fontSize: '3.5rem', fontWeight: 600, margin: '0 0 10px 0', textShadow: '2px 4px 6px rgba(0,0,0,0.1)' }}>WK Pronostiek</h1>
        <p style={{ fontSize: '1.2rem', fontWeight: 300, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '30px', color: 'rgba(255, 255, 255, 0.9)' }}>Website in opbouw</p>
        <div className="accent-loader"></div>
      </div>
    </main>
  );
}