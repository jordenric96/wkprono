// src/components/RankingTab.tsx
import { useState, useMemo } from 'react';

export default function RankingTab({ klassement, actieveSpeler, toggleBetaald }: any) {
  const isAdmin = actieveSpeler?.naam?.toLowerCase() === 'jorden ricour'.toLowerCase();
  
  // Schakelaars
  const [toonBonus, setToonBonus] = useState(false);
  const [openBonusId, setOpenBonusId] = useState<string | null>(null); // Onthoudt welk bonus-bonnetje open staat

  // Sorteer het klassement live op basis van de schakelaar
  const gesorteerdKlassement = useMemo(() => {
    return [...klassement].sort((a, b) => {
      if (toonBonus) {
        return b.totaal_score - a.totaal_score;
      } else {
        return b.prono_score - a.prono_score;
      }
    });
  }, [klassement, toonBonus]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      <style>{`
        .rank-card {
          background: rgba(255, 255, 255, 0.95); border-radius: 16px; padding: 15px; border: 2px solid #E9ECEF;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 15px; position: relative;
          overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;
        }

        .rank-card.rank-1 { border-color: #FFD700; background: linear-gradient(135deg, #FFFDF5, #FFF); box-shadow: 0 8px 20px rgba(255, 215, 0, 0.2); }
        .rank-card.rank-2 { border-color: #C0C0C0; background: linear-gradient(135deg, #F8F9FA, #FFF); box-shadow: 0 8px 20px rgba(192, 192, 192, 0.2); }
        .rank-card.rank-3 { border-color: #CD7F32; background: linear-gradient(135deg, #FFF9F5, #FFF); box-shadow: 0 8px 20px rgba(205, 127, 50, 0.2); }

        .rank-badge {
          width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; color: white; background: var(--crayola); flex-shrink: 0; z-index: 2;
        }

        .rank-1 .rank-badge { background: linear-gradient(135deg, #FFD700, #F1BF00); color: #000; box-shadow: 0 4px 10px rgba(255, 215, 0, 0.4); text-shadow: 0 1px 2px rgba(255,255,255,0.8); }
        .rank-2 .rank-badge { background: linear-gradient(135deg, #E9ECEF, #ADB5BD); color: #111827; box-shadow: 0 4px 10px rgba(173, 181, 189, 0.4); }
        .rank-3 .rank-badge { background: linear-gradient(135deg, #E6A15C, #CD7F32); color: #FFF; box-shadow: 0 4px 10px rgba(205, 127, 50, 0.4); }

        .rank-info { flex: 1; display: flex; flex-direction: column; z-index: 2; }
        .rank-name { font-size: 1.1rem; font-weight: 900; color: #111827; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
        
        .points-breakdown { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
        .pt-tag { font-size: 0.65rem; font-weight: 900; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; transition: 0.3s; display: flex; align-items: center; gap: 4px; }
        .pt-prono { background: rgba(55, 114, 255, 0.1); color: var(--crayola); border: 1px solid rgba(55, 114, 255, 0.2); }
        .pt-bonus { background: rgba(240, 56, 255, 0.1); color: var(--magenta); border: 1px solid rgba(240, 56, 255, 0.2); cursor: pointer; }
        
        .pt-active { background: var(--crayola); color: #FFF; border-color: var(--crayola); }
        .pt-bonus-active { background: var(--magenta); color: #FFF; border-color: var(--magenta); cursor: pointer; }

        .rank-stats { display: flex; gap: 8px; font-size: 0.65rem; font-weight: 800; color: #6C757D; text-transform: uppercase; letter-spacing: 0.5px; }

        .rank-score-container { text-align: right; z-index: 2; display: flex; flex-direction: column; align-items: flex-end; justify-content: center; }
        .rank-score { font-family: 'Bebas Neue', sans-serif; font-size: 2.8rem; color: var(--magenta); line-height: 1; transition: 0.3s; }
        .rank-score-label { font-size: 0.6rem; font-weight: 900; color: #ADB5BD; text-transform: uppercase; letter-spacing: 1px; margin-bottom: -2px; }

        .betaal-status { font-size: 0.6rem; font-weight: 900; padding: 4px 8px; border-radius: 8px; display: inline-block; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .status-ok { background: #D3F9D8; color: #2B8A3E; }
        .status-wait { background: #FFE3E3; color: #E03131; }

        .admin-toggle-btn { margin-top: 8px; font-size: 0.65rem; font-weight: 900; padding: 6px 10px; border-radius: 8px; border: none; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; transition: 0.2s; }
        .admin-toggle-btn.ok { background: #D3F9D8; color: #2B8A3E; border: 1px solid #B2F2BB; }
        .admin-toggle-btn.wait { background: #FFE3E3; color: #E03131; border: 1px solid #FFC9C9; }
      `}</style>

      {/* DE TOGGLE SCHAKELAAR */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', padding: '4px', border: '2px solid #E9ECEF' }}>
        <button onClick={() => setToonBonus(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: !toonBonus ? '#FFF' : 'transparent', fontWeight: 900, color: !toonBonus ? 'var(--crayola)' : '#6C757D', boxShadow: !toonBonus ? '0 2px 8px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: '0.2s', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          ⚽ Zonder Bonus
        </button>
        <button onClick={() => setToonBonus(true)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: toonBonus ? '#FFF' : 'transparent', fontWeight: 900, color: toonBonus ? 'var(--magenta)' : '#6C757D', boxShadow: toonBonus ? '0 2px 8px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: '0.2s', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          💎 Met Live Bonus
        </button>
      </div>

      {gesorteerdKlassement.map((s: any, i: number) => {
        const podiumClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
        const isMij = s.id === actieveSpeler?.id;

        return (
          <div key={s.id} className={`rank-card ${podiumClass}`} style={{ border: isMij && i > 2 ? '2px solid var(--crayola)' : '', flexDirection: 'column', alignItems: 'stretch' }}>
            
            {isMij && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(90deg, rgba(55,114,255,0.05), transparent)', zIndex: 1, pointerEvents: 'none' }} />}

            {/* Bovenste rij (Standaard weergave) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>
              <div className="rank-badge">{i + 1}</div>

              <div className="rank-info">
                <div className="rank-name">
                  {s.naam} {isMij && <span style={{fontSize:'0.6rem', background:'var(--crayola)', color:'#FFF', padding:'2px 6px', borderRadius:'10px'}}>JIJ</span>}
                </div>
                
                <div className="points-breakdown">
                  <span className={`pt-tag ${!toonBonus ? 'pt-active' : 'pt-prono'}`}>⚽ {s.prono_score || 0} Pronos</span>
                  <span 
                    className={`pt-tag ${toonBonus ? 'pt-bonus-active' : 'pt-bonus'}`} 
                    onClick={(e) => { e.stopPropagation(); setOpenBonusId(openBonusId === s.id ? null : s.id); }}
                  >
                    💎 {s.bonus_score || 0} Bonus {openBonusId === s.id ? '▲' : '▼'}
                  </span>
                </div>

                <div className="rank-stats">
                  <span>{s.exact} Exact</span><span>•</span><span>{s.winnaarCorrect} Winnaar</span>
                </div>

                <div>
                  {isAdmin ? (
                    <button onClick={() => toggleBetaald(s.id, s.betaald)} className={`admin-toggle-btn ${s.betaald ? 'ok' : 'wait'}`}>
                      {s.betaald ? '💰 Betaald (Klik = Annuleren)' : '⏳ Niet betaald (Klik = OK)'}
                    </button>
                  ) : (
                    <span className={`betaal-status ${s.betaald ? 'status-ok' : 'status-wait'}`}>
                      {s.betaald ? '💰 Inleg Betaald' : '⏳ Wacht op betaling'}
                    </span>
                  )}
                </div>
              </div>

              <div className="rank-score-container">
                <div className="rank-score-label">{toonBonus ? 'TOTAAL' : 'PRONOS'}</div>
                <div className="rank-score" style={{ color: toonBonus ? 'var(--magenta)' : 'var(--crayola)' }}>
                  {toonBonus ? s.totaal_score : s.prono_score}
                </div>
              </div>
            </div>

            {/* Uitklapbaar Bonus Detail Panel */}
            {openBonusId === s.id && (
              <div style={{ background: 'rgba(240, 56, 255, 0.05)', borderRadius: '8px', padding: '10px 12px', marginTop: '10px', fontSize: '0.75rem', borderLeft: '4px solid var(--magenta)', color: '#111827', zIndex: 2 }}>
                <div style={{ fontWeight: 900, color: 'var(--magenta)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem' }}>Detail Bonuspunten:</div>
                {s.bonus_breakdown && s.bonus_breakdown.length > 0 ? (
                  s.bonus_breakdown.map((b: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.1)', padding: '5px 0', fontWeight: 800 }}>
                      <span>{b.label}</span>
                      <span style={{ color: '#40C057', fontSize: '0.85rem' }}>+{b.pt}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#ADB5BD', fontStyle: 'italic', fontWeight: 700, padding: '5px 0' }}>Nog geen bonuspunten verdiend...</div>
                )}
              </div>
            )}

          </div>
        );
      })}

      {gesorteerdKlassement.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6C757D', fontWeight: 900 }}>Nog geen klassement beschikbaar...</div>
      )}

    </div>
  );
}