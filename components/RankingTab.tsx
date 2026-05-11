// src/components/RankingTab.tsx
import React, { useState } from 'react';

export default function RankingTab({ klassement, actieveSpeler, toggleBetaald }: any) {
  const [toonBonus, setToonBonus] = useState(false);
  const isAdmin = actieveSpeler?.naam?.toLowerCase() === 'jorden ricour'.toLowerCase();

  // Sorteren op basis van de geselecteerde weergave
  const gesorteerd = [...klassement].sort((a, b) => {
    const scoreA = toonBonus ? a.totaal_score : a.prono_score;
    const scoreB = toonBonus ? b.totaal_score : b.prono_score;
    if (scoreB !== scoreA) return scoreB - scoreA;
    if (b.exact !== a.exact) return b.exact - a.exact; 
    return a.naam.localeCompare(b.naam);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* STIJLVOLLE SCHAKELAAR */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.7)', borderRadius: '16px', padding: '5px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)', marginBottom: '10px' }}>
        <button 
          onClick={() => setToonBonus(false)} 
          style={{ 
            flex: 1, padding: '10px 5px', borderRadius: '12px', border: 'none', 
            background: !toonBonus ? '#FFF' : 'transparent', 
            fontWeight: 900, color: !toonBonus ? 'var(--crayola)' : '#ADB5BD', 
            boxShadow: !toonBonus ? '0 4px 10px rgba(0,0,0,0.1)' : 'none', 
            cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚽ Matchen</span>
          <span style={{ fontSize: '0.55rem', opacity: 0.8 }}>(Tussenstand)</span>
        </button>
        <button 
          onClick={() => setToonBonus(true)} 
          style={{ 
            flex: 1, padding: '10px 5px', borderRadius: '12px', border: 'none', 
            background: toonBonus ? '#FFF' : 'transparent', 
            fontWeight: 900, color: toonBonus ? 'var(--magenta)' : '#ADB5BD', 
            boxShadow: toonBonus ? '0 4px 10px rgba(0,0,0,0.1)' : 'none', 
            cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💎 Bonus</span>
          <span style={{ fontSize: '0.55rem', opacity: 0.8 }}>(Eindklassement)</span>
        </button>
      </div>

      {/* STRAKKE LIJST WEERGAVE */}
      {gesorteerd.map((speler, index) => {
        const isMij = speler.id === actieveSpeler.id;
        const score = toonBonus ? speler.totaal_score : speler.prono_score;
        const isLaatste = index === gesorteerd.length - 1 && gesorteerd.length > 1;
        
        // Medailles & Randen
        let positieIcoon = <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ADB5BD' }}>{index + 1}</span>;
        let cardBorder = '1px solid #E9ECEF';
        let cardBg = isMij ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.7)';
        
        if (index === 0) {
          positieIcoon = <span style={{ fontSize: '2rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>🥇</span>;
          cardBorder = '2px solid #FFD700';
          cardBg = 'linear-gradient(to right, rgba(255, 215, 0, 0.1), rgba(255, 255, 255, 0.9))';
        } else if (index === 1) {
          positieIcoon = <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>🥈</span>;
        } else if (index === 2) {
          positieIcoon = <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>🥉</span>;
        }
        
        if (isMij && index > 0) cardBorder = '2px solid var(--crayola)';

        return (
          <div 
            key={speler.id} 
            style={{ 
              background: cardBg, borderRadius: '16px', padding: '12px 15px', 
              border: cardBorder, boxShadow: '0 4px 10px rgba(0,0,0,0.03)', 
              display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', overflow: 'hidden'
            }}
          >
            {/* Positie Indicator */}
            <div style={{ width: '40px', textAlign: 'center', flexShrink: 0 }}>
              {positieIcoon}
            </div>

            {/* Midden: Naam & Stats */}
            <div style={{ flex: 1, minWidth: 0 }}>
              
              {/* Naam en grappige icoontjes */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ 
                  fontWeight: 900, fontSize: '1.15rem', color: '#111827', 
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
                }}>
                  {speler.naam}
                </span>
                {index === 0 && <span title="Koploper">👑</span>}
                {isLaatste && <span title="Rode Lantaarn">🏮</span>}
              </div>

              {/* Strakke Stat-pillen */}
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#F1F3F5', padding: '2px 6px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, color: '#495057' }}>
                  <span>🎯</span> <span>{speler.exact}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#F1F3F5', padding: '2px 6px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, color: '#495057' }}>
                  <span>🟢</span> <span>{speler.winnaarCorrect}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#F1F3F5', padding: '2px 6px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, color: '#495057' }}>
                  <span>❌</span> <span>{speler.fout}</span>
                </div>
              </div>

            </div>

            {/* Rechts: Grote Score */}
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', lineHeight: 0.9, color: index === 0 ? '#D4AF37' : (isMij ? 'var(--crayola)' : '#111827') }}>
                {score}
              </div>
              <div style={{ fontSize: '0.55rem', fontWeight: 900, color: '#ADB5BD', letterSpacing: '1px' }}>
                PUNTEN
              </div>
            </div>

            {/* Admin Betaalknop over de hele breedte (indien admin) */}
            {isAdmin && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleBetaald(speler.id, speler.betaald); }}
                  style={{ 
                    width: '100%', padding: '3px', border: 'none', cursor: 'pointer',
                    background: speler.betaald ? 'rgba(64, 192, 87, 0.2)' : 'rgba(250, 82, 82, 0.2)', 
                    color: speler.betaald ? '#2B8A3E' : '#C92A2A',
                    fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase'
                  }}
                >
                  {speler.betaald ? 'Betaald (Tik om te annuleren)' : 'Niet betaald (Tik om te bevestigen)'}
                </button>
              </div>
            )}
            
            {/* Status voor normale spelers */}
            {!isAdmin && !speler.betaald && (
              <div style={{ position: 'absolute', top: 0, right: 0, background: '#FA5252', color: '#FFF', fontSize: '0.5rem', fontWeight: 900, padding: '2px 6px', borderBottomLeftRadius: '8px' }}>
                NOG NIET BETAALD
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
