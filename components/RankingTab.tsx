// src/components/RankingTab.tsx
import React, { useState } from 'react';

export default function RankingTab({ klassement, actieveSpeler, toggleBetaald }: any) {
  const [toonBonus, setToonBonus] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* STIJLVOLLE SCHAKELAAR */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.7)', borderRadius: '16px', padding: '6px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)', marginBottom: '5px' }}>
        <button 
          onClick={() => { setToonBonus(false); setExpandedId(null); }} 
          style={{ 
            flex: 1, padding: '12px 5px', borderRadius: '12px', border: 'none', 
            background: !toonBonus ? '#FFF' : 'transparent', 
            fontWeight: 900, color: !toonBonus ? 'var(--crayola)' : '#ADB5BD', 
            boxShadow: !toonBonus ? '0 4px 10px rgba(0,0,0,0.1)' : 'none', 
            cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚽ Matchen</span>
          <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>(Tussenstand)</span>
        </button>
        <button 
          onClick={() => setToonBonus(true)} 
          style={{ 
            flex: 1, padding: '12px 5px', borderRadius: '12px', border: 'none', 
            background: toonBonus ? '#FFF' : 'transparent', 
            fontWeight: 900, color: toonBonus ? 'var(--magenta)' : '#ADB5BD', 
            boxShadow: toonBonus ? '0 4px 10px rgba(0,0,0,0.1)' : 'none', 
            cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💎 Bonus</span>
          <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>(Eindklassement)</span>
        </button>
      </div>

      {/* STRAKKE LIJST WEERGAVE */}
      {gesorteerd.map((speler, index) => {
        const isMij = speler.id === actieveSpeler.id;
        const isOpen = expandedId === speler.id;
        const score = toonBonus ? speler.totaal_score : speler.prono_score;
        const isLaatste = index === gesorteerd.length - 1 && gesorteerd.length > 1;
        
        // Medailles & Randen
        let positieIcoon = <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ADB5BD' }}>{index + 1}</span>;
        let cardBorder = '1px solid #E9ECEF';
        let cardBg = isMij ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.7)';
        
        if (index === 0) {
          positieIcoon = <span style={{ fontSize: '2.2rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>🥇</span>;
          cardBorder = '2px solid #FFD700';
          cardBg = 'linear-gradient(to right, rgba(255, 215, 0, 0.1), rgba(255, 255, 255, 0.9))';
        } else if (index === 1) {
          positieIcoon = <span style={{ fontSize: '2rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>🥈</span>;
        } else if (index === 2) {
          positieIcoon = <span style={{ fontSize: '2rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>🥉</span>;
        }
        
        if (isMij && index > 0) cardBorder = '2px solid var(--crayola)';

        return (
          <div 
            key={speler.id} 
            onClick={() => toonBonus && setExpandedId(isOpen ? null : speler.id)}
            style={{ 
              background: cardBg, borderRadius: '20px', padding: '16px 18px', 
              border: cardBorder, boxShadow: '0 6px 15px rgba(0,0,0,0.03)', 
              display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
              cursor: toonBonus ? 'pointer' : 'default', transition: 'all 0.2s ease'
            }}
          >
            {/* HOOFD-RIJ: Positie, Naam, Stats, Score */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              
              {/* Positie Indicator */}
              <div style={{ width: '45px', textAlign: 'center', flexShrink: 0 }}>
                {positieIcoon}
              </div>

              {/* Midden: Naam & Stats */}
              <div style={{ flex: 1, minWidth: 0 }}>
                
                {/* Naam en grappige icoontjes */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ 
                    fontWeight: 900, fontSize: '1.25rem', color: '#111827', 
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
                  }}>
                    {speler.naam}
                  </span>
                  {index === 0 && <span title="Koploper">👑</span>}
                  {isLaatste && <span title="Rode Lantaarn">🏮</span>}
                </div>

                {/* Strakke Stat-pillen */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F1F3F5', padding: '3px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, color: '#495057' }}>
                    <span>🎯</span> <span>{speler.exact}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F1F3F5', padding: '3px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, color: '#495057' }}>
                    <span>🟢</span> <span>{speler.winnaarCorrect}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F1F3F5', padding: '3px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, color: '#495057' }}>
                    <span>❌</span> <span>{speler.fout}</span>
                  </div>
                </div>

              </div>

              {/* Rechts: Grote Score */}
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '3rem', lineHeight: 0.9, color: index === 0 ? '#D4AF37' : (isMij ? 'var(--crayola)' : '#111827') }}>
                  {score}
                </div>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: '#ADB5BD', letterSpacing: '1px', marginTop: '4px' }}>
                  PUNTEN
                </div>
              </div>
            </div>

            {/* ONDERSCHEID PRONO vs BONUS (Alleen zichtbaar in eindklassement modus) */}
            {toonBonus && (
              <div style={{ 
                marginTop: '15px', paddingTop: '12px', borderTop: '2px dashed rgba(0,0,0,0.06)', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
              }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ background: '#E7F1FF', color: 'var(--crayola)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900 }}>
                    ⚽ {speler.prono_score} PT
                  </div>
                  <div style={{ background: '#FDF0FF', color: 'var(--magenta)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900 }}>
                    💎 {speler.bonus_score} PT
                  </div>
                </div>
                
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--crayola)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isOpen ? 'SLUITEN ▲' : 'BEKIJK ▼'}
                </div>
              </div>
            )}

            {/* UITKLAPBARE BONUS DETAILS */}
            {toonBonus && isOpen && (
              <div style={{ 
                marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.7)', 
                borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px',
                border: '1px solid rgba(240, 56, 255, 0.2)'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--magenta)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Verdiende Bonuspunten:
                </div>
                
                {!speler.bonus_breakdown || speler.bonus_breakdown.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: '#6C757D', fontWeight: 800, fontStyle: 'italic' }}>
                    Nog geen bonuspunten behaald...
                  </div>
                ) : (
                  speler.bonus_breakdown.map((b: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx !== speler.bonus_breakdown.length - 1 ? '1px dashed #DEE2E6' : 'none', paddingBottom: idx !== speler.bonus_breakdown.length - 1 ? '4px' : '0' }}>
                      <span style={{ fontSize: '0.8rem', color: '#495057', fontWeight: 800 }}>{b.label}</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--magenta)', fontWeight: 900 }}>+{b.pt}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Admin Betaalknop over de hele breedte (indien admin) */}
            {isAdmin && (
              <div style={{ marginTop: '15px' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleBetaald(speler.id, speler.betaald); }}
                  style={{ 
                    width: '100%', padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    background: speler.betaald ? 'rgba(64, 192, 87, 0.15)' : 'rgba(250, 82, 82, 0.15)', 
                    color: speler.betaald ? '#2B8A3E' : '#C92A2A',
                    fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', transition: '0.2s'
                  }}
                >
                  {speler.betaald ? 'BETAALD (TIK OM TE ANNULEREN)' : 'NIET BETAALD (TIK OM TE BEVESTIGEN)'}
                </button>
              </div>
            )}
            
            {/* Status voor normale spelers */}
            {!isAdmin && !speler.betaald && (
              <div style={{ position: 'absolute', top: 0, right: 0, background: '#FA5252', color: '#FFF', fontSize: '0.55rem', fontWeight: 900, padding: '4px 10px', borderBottomLeftRadius: '12px' }}>
                NOG NIET BETAALD
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
