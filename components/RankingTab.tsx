// src/components/RankingTab.tsx
import React, { useState } from 'react';

export default function RankingTab({ klassement, actieveSpeler, toggleBetaald, isJorden }: any) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [toonEindklassement, setToonEindklassement] = useState(false);

  // Zorgt ervoor dat we dynamisch sorteren afhankelijk van welke tab je aanklikt
  const gesorteerdKlassement = [...klassement].sort((a, b) => {
    if (!toonEindklassement) {
      if (b.prono_score !== a.prono_score) return b.prono_score - a.prono_score;
      if (b.exact !== a.exact) return b.exact - a.exact;
      if (b.winnaarCorrect !== a.winnaarCorrect) return b.winnaarCorrect - a.winnaarCorrect;
      return a.naam.localeCompare(b.naam);
    } else {
      if (b.totaal_score !== a.totaal_score) return b.totaal_score - a.totaal_score;
      if (b.exact !== a.exact) return b.exact - a.exact;
      if (b.winnaarCorrect !== a.winnaarCorrect) return b.winnaarCorrect - a.winnaarCorrect;
      return a.naam.localeCompare(b.naam);
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <style>{`
        .streak-dot { 
          width: 13px; height: 13px; border-radius: 50%; display: flex; 
          align-items: center; justify-content: center; font-size: 0.5rem; 
          font-weight: 900; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }
        /* FLASHY WK KLEUREN VOOR DE VORM */
        .dot-3 { background: var(--wk-lime); color: #111827; }
        .dot-2 { background: var(--wk-purple); color: #FFF; }
        .dot-1 { background: var(--wk-aqua); color: #111827; }
        .dot-0 { background: var(--wk-red); color: #FFF; }
        
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* UITLEG BOX - Waarom 2 klassementen */}
      <div style={{ background: '#1A1423', borderRadius: '16px', padding: '15px', marginBottom: '5px', border: '1px solid rgba(255,255,255,0.1)', borderLeft: '4px solid var(--wk-aqua)' }}>
         <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--wk-aqua)', textTransform: 'uppercase', fontWeight: 900 }}>💡 Waarom twee klassementen?</h3>
         <div style={{ fontSize: '0.75rem', color: '#ADB5BD', display: 'flex', flexDirection: 'column', gap: '8px' }}>
           <div><strong style={{color: '#FFF'}}>1. Regulier Klassement:</strong> Dit zijn puur en alleen je punten uit de matchen. Winnaars hiervan strijden voor een deel van de reguliere prijzenpot.</div>
           <div><strong style={{color: '#FFF'}}>2. Eindklassement (+ Bonussen):</strong> Dit zijn je matchpunten én je bonuspunten samen. De top van dit klassement bepaalt de absolute eindwinnaar(s)!</div>
         </div>
      </div>

      {/* TOGGLE KNOPPEN */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button 
           onClick={() => setToonEindklassement(false)}
           style={{ flex: 1, padding: '12px 5px', borderRadius: '12px', background: !toonEindklassement ? 'var(--wk-blue)' : 'rgba(255,255,255,0.05)', color: !toonEindklassement ? '#FFF' : '#ADB5BD', fontWeight: 900, border: !toonEindklassement ? '2px solid var(--wk-blue)' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.8rem' }}
        >
           ⚽ REGULIER
        </button>
        <button 
           onClick={() => setToonEindklassement(true)}
           style={{ flex: 1, padding: '12px 5px', borderRadius: '12px', background: toonEindklassement ? 'var(--wk-purple)' : 'rgba(255,255,255,0.05)', color: toonEindklassement ? '#FFF' : '#ADB5BD', fontWeight: 900, border: toonEindklassement ? '2px solid var(--wk-purple)' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.8rem' }}
        >
           🏆 EINDKLASSEMENT
        </button>
      </div>
      
      {gesorteerdKlassement.map((speler: any, index: number) => {
        const isMe = actieveSpeler?.id === speler.id;
        const isTop3 = index < 3;
        
        // Laat de juiste score zien afhankelijk van de gekozen knop
        const getoondeScore = toonEindklassement ? speler.totaal_score : speler.prono_score;
        
        return (
          <div key={speler.id} style={{
            background: isMe ? 'linear-gradient(135deg, rgba(43,0,255,0.4), rgba(43,0,255,0.1))' : 'rgba(255,255,255,0.05)',
            border: isMe ? '2px solid var(--wk-blue)' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px', padding: '15px', display: 'flex', flexDirection: 'column',
            boxShadow: isMe ? '0 4px 15px rgba(43,0,255,0.3)' : 'none',
            cursor: 'pointer', transition: 'all 0.2s ease'
          }} onClick={() => setExpandedId(expandedId === speler.id ? null : speler.id)}>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              
              {/* LINKER KANT: Rank, Naam en Vorm */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: isTop3 ? 'var(--wk-lime)' : 'rgba(255,255,255,0.1)',
                  color: isTop3 ? '#111827' : '#FFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '1rem', flexShrink: 0
                }}>
                  {index + 1}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, paddingTop: '2px' }}>
                  <div style={{ fontWeight: 900, fontSize: '1.1rem', color: isMe ? '#FFF' : '#E9ECEF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {speler.naam} {!speler.betaald && <span style={{fontSize: '0.7rem'}} title="Nog niet betaald">💰❌</span>}
                  </div>
                  
                  {/* VORM BALKJE - Strak en altijd op 1 lijn */}
                  {speler.recent_scores && speler.recent_scores.length > 0 && (
                    <div className="hide-scroll" style={{ display: 'flex', alignItems: 'center', marginTop: '6px', overflowX: 'auto' }}>
                      <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', marginRight: '6px', flexShrink: 0 }}>VORM:</span>
                      <div style={{ display: 'flex', gap: '3px', flexWrap: 'nowrap' }}>
                        {speler.recent_scores.map((score: number, i: number) => (
                           <div key={i} className={`streak-dot dot-${score}`}>{score}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* RECHTER KANT: Punten */}
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '10px' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.2rem', color: isTop3 ? 'var(--wk-lime)' : '#FFF', lineHeight: 1 }}>
                  {getoondeScore}
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', marginTop: '2px' }}>Punten</div>
              </div>

            </div>

            {/* DETAILS POP-UP */}
            {expandedId === speler.id && (
              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed rgba(255,255,255,0.2)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center', marginBottom: '15px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--wk-lime)' }}>{speler.exact}</div>
                    <div style={{ fontSize: '0.6rem', color: '#ADB5BD', fontWeight: 900, textTransform: 'uppercase' }}>Exact (3pt)</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--wk-aqua)' }}>{speler.winnaarCorrect}</div>
                    <div style={{ fontSize: '0.6rem', color: '#ADB5BD', fontWeight: 900, textTransform: 'uppercase' }}>Juist (1/2pt)</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--wk-red)' }}>{speler.fout}</div>
                    <div style={{ fontSize: '0.6rem', color: '#ADB5BD', fontWeight: 900, textTransform: 'uppercase' }}>Fout (0pt)</div>
                  </div>
                </div>
                
                {/* Toon de behaalde bonussen enkel als ze in het Eindklassement zitten (of hou het altijd zichtbaar als ze iets gehaald hebben) */}
                {toonEindklassement && speler.bonus_breakdown && speler.bonus_breakdown.length > 0 && (
                  <div style={{ background: 'rgba(204, 255, 0, 0.05)', border: '1px solid rgba(204, 255, 0, 0.2)', borderRadius: '12px', padding: '10px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--wk-lime)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>💎 Behaalde Bonussen:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {speler.bonus_breakdown.map((b: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, color: '#FFF' }}>
                          <span>{b.label}</span>
                          <span style={{ color: 'var(--wk-lime)' }}>+{b.pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isJorden && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleBetaald(speler.id, speler.betaald); }}
                    style={{ width: '100%', marginTop: '10px', padding: '10px', background: speler.betaald ? 'rgba(227,0,34,0.2)' : 'rgba(204,255,0,0.2)', color: speler.betaald ? 'var(--wk-red)' : 'var(--wk-lime)', border: `1px solid ${speler.betaald ? 'var(--wk-red)' : 'var(--wk-lime)'}`, borderRadius: '12px', fontWeight: 900, cursor: 'pointer' }}
                  >
                    ZET ALS {speler.betaald ? 'NIET BETAALD' : 'BETAALD'}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
