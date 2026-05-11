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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* SCHAKELAAR: ZONDER BONUS / MET BONUS */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.5)', borderRadius: '15px', padding: '5px', border: '2px solid #E9ECEF', marginBottom: '10px' }}>
        <button 
          onClick={() => setToonBonus(false)} 
          style={{ 
            flex: 1, padding: '12px 5px', borderRadius: '12px', border: 'none', 
            background: !toonBonus ? 'var(--crayola)' : 'transparent', 
            fontWeight: 900, color: !toonBonus ? '#FFF' : '#6C757D', 
            boxShadow: !toonBonus ? '0 4px 12px rgba(55, 114, 255, 0.3)' : 'none', 
            cursor: 'pointer', transition: '0.3s', textTransform: 'uppercase', fontSize: '0.7rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}
        >
          <span>⚽ Matchen</span>
          <span style={{ fontSize: '0.5rem', opacity: 0.8 }}>(Tussenstand)</span>
        </button>
        <button 
          onClick={() => setToonBonus(true)} 
          style={{ 
            flex: 1, padding: '12px 5px', borderRadius: '12px', border: 'none', 
            background: toonBonus ? 'var(--magenta)' : 'transparent', 
            fontWeight: 900, color: toonBonus ? '#FFF' : '#6C757D', 
            boxShadow: toonBonus ? '0 4px 12px rgba(240, 56, 255, 0.3)' : 'none', 
            cursor: 'pointer', transition: '0.3s', textTransform: 'uppercase', fontSize: '0.7rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}
        >
          <span>💎 Live Bonus</span>
          <span style={{ fontSize: '0.5rem', opacity: 0.8 }}>(Eindstand)</span>
        </button>
      </div>

      {/* FUT CARDS GRID / LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {gesorteerd.map((speler, index) => {
          const isMij = speler.id === actieveSpeler.id;
          const score = toonBonus ? speler.totaal_score : speler.prono_score;
          
          // FIFA Kaart Kleuren
          let cardBg = 'linear-gradient(135deg, #d4d9dd 0%, #a1a8ad 100%)'; // Brons
          let accentColor = '#3e4449';
          let textColor = '#1a1d20';
          let borderColor = 'rgba(255,255,255,0.4)';

          if (index === 0) { // Goud - Nummer 1
            cardBg = 'linear-gradient(135deg, #fceb92 0%, #f7d046 50%, #d4af37 100%)';
            accentColor = '#7a5e10';
          } else if (index === 1 || index === 2) { // Zilver - Nummer 2 & 3
            cardBg = 'linear-gradient(135deg, #e5e7eb 0%, #bcbec0 50%, #9ca3af 100%)';
            accentColor = '#4b5563';
          }

          return (
            <div key={speler.id} style={{ position: 'relative', width: '100%', maxWidth: '350px', margin: '0 auto' }}>
              
              {/* DE FIFA KAART (Shield Shape) */}
              <div style={{ 
                background: cardBg,
                padding: '20px',
                borderRadius: '15px 15px 50% 50% / 15px 15px 15% 15%', // FUT Shield shape
                border: isMij ? '4px solid var(--crayola)' : `2px solid ${borderColor}`,
                boxShadow: index === 0 ? '0 15px 30px rgba(212, 175, 55, 0.4)' : '0 10px 20px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: textColor,
                position: 'relative',
                overflow: 'hidden'
              }}>
                
                {/* Glanseffect over de kaart */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)', pointerEvents: 'none' }} />

                {/* BOVENKANT: RATING & POSITIE */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ textAlign: 'center', lineHeight: 1.1 }}>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '3.5rem', margin: 0, color: accentColor }}>{score}</div>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.2rem', opacity: 0.8, letterSpacing: '1px' }}>PTS</div>
                    <div style={{ height: '2px', background: accentColor, width: '30px', margin: '4px auto', opacity: 0.3 }} />
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: accentColor }}>#{index + 1}</div>
                  </div>
                  
                  {/* AVATAR/ICON */}
                  <div style={{ width: '100px', height: '100px', background: 'rgba(255,255,255,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${accentColor}22` }}>
                    <span style={{ fontSize: '4rem' }}>{index === 0 ? '👑' : (index === klassement.length - 1 ? '🐢' : '👤')}</span>
                  </div>
                </div>

                {/* NAAM */}
                <div style={{ 
                  fontFamily: 'Bebas Neue', fontSize: '1.8rem', width: '100%', textAlign: 'center', 
                  borderBottom: `2px solid ${accentColor}33`, padding: '10px 0', margin: '5px 0',
                  textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  {speler.naam}
                </div>

                {/* STATS (EXA - WIN - ERR) */}
                <div style={{ display: 'flex', gap: '15px', padding: '10px 0' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem' }}>{speler.exact}</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.7 }}>EXA</div>
                  </div>
                  <div style={{ width: '1px', background: accentColor, opacity: 0.2 }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem' }}>{speler.winnaarCorrect}</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.7 }}>WIN</div>
                  </div>
                  <div style={{ width: '1px', background: accentColor, opacity: 0.2 }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem' }}>{speler.fout}</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.7 }}>ERR</div>
                  </div>
                </div>

                {/* ADMIN/BETAALD STATUS */}
                {isAdmin ? (
                  <button 
                    onClick={() => toggleBetaald(speler.id, speler.betaald)}
                    style={{ 
                      marginTop: '10px', padding: '5px 15px', borderRadius: '20px', border: 'none', 
                      background: speler.betaald ? '#40C057' : '#FA5252', color: '#FFF',
                      fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer'
                    }}
                  >
                    {speler.betaald ? 'BETAALD ✅' : 'NIET BETAALD ⏳'}
                  </button>
                ) : (
                  !speler.betaald && (
                    <div style={{ marginTop: '10px', fontSize: '0.6rem', fontWeight: 900, color: '#FA5252', background: 'rgba(255,255,255,0.5)', padding: '3px 10px', borderRadius: '10px' }}>
                      NOG NIET BETAALD 💸
                    </div>
                  )
                )}

                {/* JOUW INDICATOR */}
                {isMij && (
                  <div style={{ 
                    position: 'absolute', top: '10px', right: '10px', background: 'var(--crayola)', 
                    color: '#FFF', fontSize: '0.6rem', fontWeight: 900, padding: '3px 8px', borderRadius: '10px' 
                  }}>
                    JIJ
                  </div>
                )}
              </div>

              {/* Bonus Breakdown (Alleen zichtbaar als er op de kaart geklikt zou worden, maar we tonen het hier subtiel onder de kaart als er bonuspunten zijn) */}
              {toonBonus && speler.bonus_score > 0 && (
                <div style={{ textAlign: 'center', marginTop: '10px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px' }}>
                  {speler.bonus_breakdown.map((b: any, i: number) => (
                    <span key={i} style={{ background: 'rgba(255,255,255,0.6)', padding: '2px 8px', borderRadius: '8px', fontSize: '0.55rem', fontWeight: 800, color: '#6C757D', border: '1px solid #E9ECEF' }}>
                      {b.label} (+{b.pt})
                    </span>
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
