// src/components/RankingTab.tsx
import React, { useState } from 'react';

// Handige helper om de lange bonusnamen om te zetten naar prachtige, compacte icoon-badges
const krijgBonusBadge = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('goals')) return { tekst: 'Goals 🎯', bg: 'rgba(204, 255, 0, 0.15)', grens: 'var(--wk-lime)' };
  if (l.includes('gele')) return { tekst: 'Geel 🟨', bg: 'rgba(0, 225, 255, 0.15)', grens: 'var(--wk-aqua)' };
  if (l.includes('rode')) return { tekst: 'Rood 🟥', bg: 'rgba(227, 0, 34, 0.15)', grens: 'var(--wk-red)' };
  if (l.includes('wereldkampioen')) return { tekst: 'WK Winnaar 👑', bg: 'rgba(255, 215, 0, 0.2)', grens: '#FFD700' };
  if (l.includes('aanval')) return { tekst: 'Aanval ⚽', bg: 'rgba(43, 0, 255, 0.15)', grens: 'var(--wk-blue)' };
  if (l.includes('verdediging')) return { tekst: 'Defensie 🛡️', bg: 'rgba(122, 0, 230, 0.15)', grens: 'var(--wk-purple)' };
  if (l.includes('halve')) {
    // Haal de teamnaam uit de tekst, bijv. "Halve Finalist (België)" -> "België"
    const land = label.match(/\(([^)]+)\)/);
    return { tekst: `HF: ${land ? land[1] : '💎'}`, bg: 'rgba(255,255,255,0.05)', grens: 'rgba(255,255,255,0.3)' };
  }
  return { tekst: '💎 Bonus', bg: 'rgba(255,255,255,0.05)', grens: 'rgba(255,255,255,0.2)' };
};

export default function RankingTab({ klassement, actieveSpeler, toggleBetaald, isJorden }: any) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Sortering staat nu permanent en rotsvast op TOTAAL_SCORE (Match + Bonus)
  const gesorteerdKlassement = [...klassement].sort((a, b) => {
    if (b.totaal_score !== a.totaal_score) return b.totaal_score - a.totaal_score;
    if (b.exact !== a.exact) return b.exact - a.exact;
    if (b.winnaarCorrect !== a.winnaarCorrect) return b.winnaarCorrect - a.winnaarCorrect;
    return a.naam.localeCompare(b.naam);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <style>{`
        .streak-dot { 
          width: 13px; height: 13px; border-radius: 50%; display: flex; 
          align-items: center; justify-content: center; font-size: 0.5rem; 
          font-weight: 900; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }
        .dot-3 { background: var(--wk-lime); color: #111827; }
        .dot-2 { background: var(--wk-purple); color: #FFF; }
        .dot-1 { background: var(--wk-aqua); color: #111827; }
        .dot-0 { background: var(--wk-red); color: #FFF; }
        
        .bonus-pill {
          font-size: 0.6rem; font-weight: 900; padding: 2px 6px; 
          border-radius: 6px; text-transform: uppercase; white-space: nowrap;
          border: 1px solid transparent; display: inline-flex; align-items: center;
        }
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* HEADER KROON BANNER */}
      <div style={{ background: 'linear-gradient(135deg, #1A1423 0%, #090514 100%)', borderRadius: '16px', padding: '15px', marginBottom: '5px', border: '2px solid var(--wk-lime)', textAlign: 'center', boxShadow: '0 4px 20px rgba(204, 255, 0, 0.15)' }}>
         <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2.2rem', color: 'var(--wk-lime)', margin: 0, letterSpacing: '1.5px', lineHeight: 1 }}>
           🏆 OFFICIEEL EINDKLASSEMENT
         </h2>
         <p style={{ fontSize: '0.7rem', color: '#ADB5BD', margin: '4px 0 0 0', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
           Matchvoorspellingen + Toernooibonussen gecombineerd
         </p>
      </div>
      
      {gesorteerdKlassement.map((speler: any, index: number) => {
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
              
              {/* LINKER KANT: Rank, Naam, Vorm, Stats & Bonussen */}
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
                  
                  {/* VORM BALKJE - Altijd strak 8 bolletjes */}
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

                  {/* STATISTIEKEN BALKJE (Exact, Juist, Fout inclusief punten berekening) */}
                  <div className="hide-scroll" style={{ display: 'flex', gap: '6px', marginTop: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
                    <div style={{ background: 'rgba(204, 255, 0, 0.05)', border: '1px solid rgba(204, 255, 0, 0.2)', padding: '4px 6px', borderRadius: '8px', color: 'var(--wk-lime)', fontSize: '0.65rem', fontWeight: 900, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>🎯 {speler.exact}x</span>
                      <span style={{ background: 'var(--wk-lime)', color: '#111827', padding: '2px 4px', borderRadius: '4px', fontSize: '0.6rem' }}>{speler.exact * 3} PT</span>
                    </div>
                    <div style={{ background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.2)', padding: '4px 6px', borderRadius: '8px', color: 'var(--wk-aqua)', fontSize: '0.65rem', fontWeight: 900, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>🟢 {speler.winnaarCorrect}x</span>
                      <span style={{ background: 'var(--wk-aqua)', color: '#111827', padding: '2px 4px', borderRadius: '4px', fontSize: '0.6rem' }}>{speler.prono_score - (speler.exact * 3)} PT</span>
                    </div>
                    <div style={{ background: 'rgba(227, 0, 34, 0.05)', border: '1px solid rgba(227, 0, 34, 0.2)', padding: '4px 6px', borderRadius: '8px', color: 'var(--wk-red)', fontSize: '0.65rem', fontWeight: 900, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>🔴 {speler.fout}x</span>
                    </div>
                  </div>

                  {/* MINI BONUS BADGES DIRECT VISUEEL OP DE KAART */}
                  {speler.bonus_breakdown && speler.bonus_breakdown.length > 0 && (
                    <div className="hide-scroll" style={{ display: 'flex', gap: '4px', marginTop: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                      {speler.bonus_breakdown.map((b: any, i: number) => {
                        const badgeStyle = krijgBonusBadge(b.label);
                        return (
                          <span key={i} className="bonus-pill" style={{ background: badgeStyle.bg, border: `1px solid ${badgeStyle.grens}`, color: badgeStyle.grens }}>
                            {badgeStyle.tekst}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              {/* RECHTER KANT: Grote Totaalscore */}
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '10px' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.4rem', color: isTop3 ? 'var(--wk-lime)' : '#FFF', lineHeight: 1 }}>
                  {speler.totaal_score}
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', marginTop: '2px' }}>Punten</div>
              </div>

            </div>

            {/* UITGEBREIDE VERDELING BIJ TIKKEN (Alleen overzicht van Match/Bonus totalen) */}
            {expandedId === speler.id && (
              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed rgba(255,255,255,0.2)' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, color: '#FFF' }}>
                   <span style={{ color: '#ADB5BD' }}>Totaal Match Punten:</span>
                   <span>{speler.prono_score} pt</span>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, color: '#FFF', marginTop: '4px' }}>
                   <span style={{ color: 'var(--wk-lime)' }}>Totaal Bonus Punten:</span>
                   <span style={{ color: 'var(--wk-lime)' }}>+{speler.bonus_score} pt</span>
                </div>
                
                {speler.bonus_breakdown && speler.bonus_breakdown.length > 0 && (
                  <div style={{ background: 'rgba(204, 255, 0, 0.05)', border: '1px solid rgba(204, 255, 0, 0.2)', borderRadius: '12px', padding: '10px', marginTop: '10px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--wk-lime)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>💎 Volledig Bonus Overzicht:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {speler.bonus_breakdown.map((b: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, color: '#FFF' }}>
                          <span>{b.label}</span>
                          <span style={{ color: 'var(--wk-lime)' }}>+{b.pt} pt</span>
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
