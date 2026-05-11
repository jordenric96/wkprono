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
    if (b.exact !== a.exact) return b.exact - a.exact; // Tiebreaker: meeste exacte pronos
    return a.naam.localeCompare(b.naam);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      {/* SCHAKELAAR: ZONDER BONUS / MET BONUS */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', padding: '4px', border: '2px solid #E9ECEF', marginBottom: '5px' }}>
        <button 
          onClick={() => setToonBonus(false)} 
          style={{ 
            flex: 1, padding: '10px 4px', borderRadius: '10px', border: 'none', 
            background: !toonBonus ? '#FFF' : 'transparent', 
            fontWeight: 900, color: !toonBonus ? 'var(--crayola)' : '#6C757D', 
            boxShadow: !toonBonus ? '0 2px 8px rgba(0,0,0,0.1)' : 'none', 
            cursor: 'pointer', transition: '0.2s', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'
          }}
        >
          <span>⚽ Zonder Bonus</span>
          <span style={{ fontSize: '0.55rem', opacity: 0.7, letterSpacing: '1px' }}>(Tussenstand)</span>
        </button>
        <button 
          onClick={() => setToonBonus(true)} 
          style={{ 
            flex: 1, padding: '10px 4px', borderRadius: '10px', border: 'none', 
            background: toonBonus ? '#FFF' : 'transparent', 
            fontWeight: 900, color: toonBonus ? 'var(--magenta)' : '#6C757D', 
            boxShadow: toonBonus ? '0 2px 8px rgba(0,0,0,0.1)' : 'none', 
            cursor: 'pointer', transition: '0.2s', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'
          }}
        >
          <span>💎 Met Bonus</span>
          <span style={{ fontSize: '0.55rem', opacity: 0.7, letterSpacing: '1px' }}>(Eindklassement)</span>
        </button>
      </div>

      {/* SPELERS LIJST */}
      {gesorteerd.map((speler, index) => {
        const isMij = speler.id === actieveSpeler.id;
        const score = toonBonus ? speler.totaal_score : speler.prono_score;
        
        // Medaille kleuren voor de top 3
        let rankBg = '#E9ECEF'; 
        let rankColor = '#495057';
        if (index === 0) { rankBg = 'linear-gradient(135deg, #FFD700, #FBB034)'; rankColor = '#FFF'; } // Goud
        else if (index === 1) { rankBg = 'linear-gradient(135deg, #E0E0E0, #9E9E9E)'; rankColor = '#FFF'; } // Zilver
        else if (index === 2) { rankBg = 'linear-gradient(135deg, #CD7F32, #A0522D)'; rankColor = '#FFF'; } // Brons

        return (
          <div 
            key={speler.id} 
            style={{ 
              background: isMij ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)', 
              borderRadius: '16px', padding: '15px', 
              border: isMij ? '3px solid var(--crayola)' : (index === 0 ? '3px solid #FFD700' : '2px solid #E9ECEF'),
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              
              {/* Cirkel met Positie */}
              <div style={{ 
                width: '45px', height: '45px', borderRadius: '50%', background: rankBg, color: rankColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontFamily: 'Bebas Neue', fontSize: '1.8rem', flexShrink: 0,
                boxShadow: index < 3 ? '0 4px 10px rgba(0,0,0,0.1)' : 'none'
              }}>
                {index + 1}
              </div>

              {/* Middelste Kolom: Naam & Stats */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Naam (Geforceerd op 1 lijn via text-overflow) */}
                <div style={{ 
                  fontWeight: 900, fontSize: '1.1rem', color: '#111827', 
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  marginBottom: '6px'
                }}>
                  {speler.naam}
                </div>

                {/* Punten onderverdeling (Naast elkaar in strakke labels) */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ background: '#E7F1FF', color: 'var(--crayola)', padding: '3px 8px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>
                    ⚽ Matchen: {speler.prono_score} pt
                  </span>
                  {toonBonus && (
                    <span style={{ background: '#FDF0FF', color: 'var(--magenta)', padding: '3px 8px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>
                      💎 Bonus: {speler.bonus_score} pt
                    </span>
                  )}
                </div>

                {/* Duidelijke statistieken (Exact, Winnaar, Fout) */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px', fontSize: '0.65rem', fontWeight: 800, color: '#6C757D' }}>
                  <span style={{display:'flex', alignItems:'center', gap:'3px'}}><span>🎯</span> {speler.exact} Exact</span>
                  <span style={{display:'flex', alignItems:'center', gap:'3px'}}><span>🟢</span> {speler.winnaarCorrect} Winnaar</span>
                  <span style={{display:'flex', alignItems:'center', gap:'3px'}}><span>❌</span> {speler.fout} Fout</span>
                </div>
              </div>

              {/* Totaal Punten (Rechts, in het groot) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: '5px' }}>
                <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  PUNTEN
                </span>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: '2.8rem', lineHeight: 1, color: isMij ? 'var(--crayola)' : '#111827' }}>
                  {score}
                </span>
              </div>
            </div>

            {/* Beheerder / Betaling Status knop onderaan */}
            {isAdmin ? (
              <button 
                onClick={() => toggleBetaald(speler.id, speler.betaald)}
                style={{ 
                  width: '100%', padding: '8px', borderRadius: '8px', border: 'none', fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer',
                  background: speler.betaald ? '#E8F5E9' : '#FCE4E4', color: speler.betaald ? '#2E7D32' : '#C62828',
                  marginTop: '5px'
                }}
              >
                {speler.betaald ? '✅ BETAALD (KLIK = ANNULEER)' : '⏳ NIET BETAALD (KLIK = OK)'}
              </button>
            ) : (
              !speler.betaald && (
                <div style={{ width: '100%', padding: '6px', borderRadius: '8px', background: '#FCE4E4', color: '#C62828', fontWeight: 900, fontSize: '0.7rem', textAlign: 'center', marginTop: '5px' }}>
                  ⏳ NOG NIET BETAALD
                </div>
              )
            )}

          </div>
        );
      })}
    </div>
  );
}
