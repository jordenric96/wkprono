// src/components/RankingTab.tsx
import React, { useState } from 'react';

export default function RankingTab({ klassement, actieveSpeler, toggleBetaald, isJorden }: any) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
      `}</style>
      
      {klassement.map((speler: any, index: number) => {
        const isMe = actieveSpeler?.id === speler.id;
        const isTop3 = index < 3;
        
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
                  
                  {/* VORM BALKJE - Strak en altijd op 1 lijn, precies de 8 laatste */}
                  {speler.recent_scores && speler.recent_scores.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '6px' }}>
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
                  {speler.totaal_score}
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
                
                {speler.bonus_breakdown && speler.bonus_breakdown.length > 0 && (
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
