// src/components/ChatTab.tsx
import React, { useState, useEffect } from 'react';

// Hulpmiddel om seconden om te zetten naar uren en minuten
const formatTime = (seconds: number) => {
  if (!seconds) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}u ${m}m`;
  return `${m}m`;
};

export default function ChatTab({ chatBerichten, actieveSpeler, chatEindeRef, nieuwBericht, setNieuwBericht, verstuurChat, alleSpelers }: any) {
  const [statsOpen, setStatsOpen] = useState(false);

  // Auto-scroll chat naar onderen bij een nieuw bericht
  useEffect(() => {
    if (chatEindeRef.current) {
      chatEindeRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatBerichten]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: '65vh' }}>
      
      {/* KLEEDKAMER STATISTIEKEN (Inklapbaar) */}
      <div style={{ width: '100%' }}>
        <button 
          onClick={() => setStatsOpen(!statsOpen)}
          style={{ width: '100%', background: 'rgba(255,255,255,0.9)', border: '2px solid var(--crayola)', color: 'var(--crayola)', padding: '10px', borderRadius: '12px', fontWeight: 900, fontSize: '0.8rem', cursor: 'pointer', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}
        >
          <span>⏱️ Activiteit & Schermtijd</span>
          <span>{statsOpen ? '▲' : '▼'}</span>
        </button>

        {statsOpen && (
          <div style={{ background: '#FFF', padding: '15px', borderRadius: '12px', borderLeft: '4px solid var(--crayola)', marginTop: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.75rem', textAlign: 'left', borderCollapse: 'collapse', color: '#495057' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E9ECEF', color: '#ADB5BD' }}>
                  <th style={{ padding: '8px 4px' }}>Speler</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center' }}>Logins</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>Tijd</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>Laatst Online</th>
                </tr>
              </thead>
              <tbody>
                {alleSpelers?.sort((a: any, b: any) => (b.aantal_logins || 0) - (a.aantal_logins || 0)).map((s: any) => {
                  const datum = s.laatste_login ? new Date(s.laatste_login).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Nooit';
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #F8F9FA' }}>
                      <td style={{ padding: '10px 4px', fontWeight: 900, color: '#111827' }}>{s.naam.split(' ')[0]}</td>
                      <td style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 800, color: 'var(--magenta)' }}>{s.aantal_logins || 0}</td>
                      <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 900, color: '#40C057' }}>{formatTime(s.tijd_gespendeerd || 0)}</td>
                      <td style={{ padding: '10px 4px', textAlign: 'right', fontSize: '0.65rem', color: '#6C757D' }}>{datum}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CHAT BERICHTEN */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(255,255,255,0.7)', borderRadius: '16px', padding: '15px', border: '1px solid #E9ECEF', display: 'flex', flexDirection: 'column', gap: '10px' }} className="hide-scrollbar">
        {chatBerichten.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#ADB5BD', fontWeight: 800, marginTop: '20px', fontSize: '0.8rem' }}>Nog geen berichten... Wees de eerste!</div>
        ) : (
          chatBerichten.map((b: any) => {
            const isMij = b.speler_id === actieveSpeler.id;
            return (
              <div key={b.id} style={{ alignSelf: isMij ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                {!isMij && <div style={{ fontSize: '0.6rem', color: '#6C757D', fontWeight: 900, marginBottom: '2px', marginLeft: '5px' }}>{b.spelers?.naam?.split(' ')[0]}</div>}
                <div style={{ 
                  background: isMij ? 'var(--crayola)' : '#FFF', 
                  color: isMij ? '#FFF' : '#111827', 
                  padding: '10px 14px', 
                  borderRadius: isMij ? '16px 16px 0 16px' : '16px 16px 16px 0',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  fontSize: '0.85rem', fontWeight: 700, wordBreak: 'break-word'
                }}>
                  {b.bericht}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEindeRef} />
      </div>

      {/* INPUT FORM */}
      <form onSubmit={verstuurChat} style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="text" value={nieuwBericht} onChange={(e) => setNieuwBericht(e.target.value)} placeholder="Zeg iets in de kleedkamer..."
          style={{ flex: 1, padding: '15px', borderRadius: '16px', border: '2px solid #E9ECEF', outline: 'none', fontSize: '0.9rem', fontWeight: 700 }}
        />
        <button type="submit" style={{ background: 'var(--magenta)', color: '#FFF', border: 'none', padding: '0 20px', borderRadius: '16px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 10px rgba(240, 56, 255, 0.3)' }}>
          ▶
        </button>
      </form>

    </div>
  );
}
