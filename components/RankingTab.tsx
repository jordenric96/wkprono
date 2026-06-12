// src/components/RankingTab.tsx
import React, { useState, useEffect } from 'react';

// De officiële WK 2026 TV-Broadcast Gradient (Blauw -> Paars -> Rood -> Oranje -> Lime -> Cyaan)
const wkGradient = 'linear-gradient(135deg, #2B00FF, #7A00E6, #E30022, #FF6B00, #CCFF00, #00E5FF)';

export default function RankingTab({ klassement = [], actieveSpeler, toggleBetaald, isJorden }: any) {
  const [modus, setModus] = useState('tussenstand'); 
  const [expandedBonusId, setExpandedBonusId] = useState<number | null>(null);

  // --- AUTO-SCROLL NAAR JEZELF ---
  useEffect(() => {
    if (actieveSpeler?.id) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`speler-${actieveSpeler.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [actieveSpeler?.id]);

  // Sorteer de spelers op basis van de gekozen modus
  const gesorteerd = [...klassement].sort((a: any, b: any) => {
    if (modus === 'tussenstand') {
      if (b.prono_score !== a.prono_score) return b.prono_score - a.prono_score;
      if (b.exact !== a.exact) return b.exact - a.exact;
      if (b.winnaarCorrect !== a.winnaarCorrect) return b.winnaarCorrect - a.winnaarCorrect;
    } else {
      if (b.totaal_score !== a.totaal_score) return b.totaal_score - a.totaal_score;
      if (b.exact !== a.exact) return b.exact - a.exact;
      if (b.winnaarCorrect !== a.winnaarCorrect) return b.winnaarCorrect - a.winnaarCorrect;
    }
    return (a.naam || '').localeCompare(b.naam || '');
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      {/* HIGH CONTRAST MENU KNOPPEN */}
      <div style={{ display: 'flex', background: '#000', borderRadius: '16px', padding: '6px', border: '2px solid #00E5FF', boxShadow: '0 10px 20px rgba(0,0,0,0.5)', marginBottom: '4px' }}>
        <button
          onClick={() => { setModus('tussenstand'); setExpandedBonusId(null); }}
          style={{
            flex: 1, padding: '8px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer',
            background: modus === 'tussenstand' ? '#CCFF00' : 'transparent',
            color: modus === 'tussenstand' ? '#000' : '#ADB5BD',
            transition: 'all 0.3s',
            boxShadow: modus === 'tussenstand' ? '0 0 15px rgba(204, 255, 0, 0.4)' : 'none'
          }}
        >
          ⚽ TUSSENSTAND <br/><span style={{fontSize:'0.6rem', fontWeight:700, opacity: 0.8}}>(Enkel Matchen)</span>
        </button>
        <button
          onClick={() => setModus('eindstand')}
          style={{
            flex: 1, padding: '8px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer',
            background: modus === 'eindstand' ? '#CCFF00' : 'transparent',
            color: modus === 'eindstand' ? '#000' : '#ADB5BD',
            transition: 'all 0.3s',
            boxShadow: modus === 'eindstand' ? '0 0 15px rgba(204, 255, 0, 0.4)' : 'none'
          }}
        >
          🏆 EINDSTAND <br/><span style={{fontSize:'0.6rem', fontWeight:700, opacity: 0.8}}>(Matchen + Bonus)</span>
        </button>
      </div>

      {/* DUIDELIJKE UITLEG BANNERS PER MODUS */}
      {modus === 'tussenstand' && (
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '4px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#ADB5BD', margin: 0, fontWeight: 800 }}>
            ℹ️ <strong style={{color: '#FFF'}}>ZUIVERE TUSSENSTAND</strong><br/>
            Puur de punten uit match-voorspellingen, zónder de bonusvragen inberekend.
          </p>
        </div>
      )}

      {modus === 'eindstand' && (
        <div style={{ background: 'rgba(204, 255, 0, 0.1)', padding: '10px', borderRadius: '12px', border: '1px solid #CCFF00', marginBottom: '4px', textAlign: 'center', boxShadow: '0 4px 10px rgba(204, 255, 0, 0.1)' }}>
          <p style={{ fontSize: '0.75rem', color: '#FFF', margin: 0, fontWeight: 800 }}>
            ⚠️ <strong style={{color: '#CCFF00'}}>DIT KLASSEMENT TELT VOOR DE PRIJZEN!</strong><br/>
            Hier is de verdiende bonus bij opgeteld. Tik op een speler om details te zien.
          </p>
        </div>
      )}

      {/* KLASSEMENT LIJST (TV BROADCAST STIJL) */}
      {gesorteerd.map((speler: any, index: number) => {
        const isMij = speler.id === actieveSpeler?.id;
        const isExpanded = expandedBonusId === speler.id;
        
        let rankIcon = <span style={{ opacity: 0.6, color: '#FFF' }}>{index + 1}</span>;
        if (index === 0) rankIcon = <span style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'}}>🥇</span>;
        if (index === 1) rankIcon = <span style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'}}>🥈</span>;
        if (index === 2) rankIcon = <span style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'}}>🥉</span>;

        return (
          <div 
            id={`speler-${speler.id}`}
            key={speler.id} 
            onClick={() => { if (modus === 'eindstand') setExpandedBonusId(isExpanded ? null : speler.id); }}
            style={{ 
              // MAGISCHE CSS TRUC VOOR GRADIENT BORDERS MET EEN ZWARTE ACHTERGROND
              background: `linear-gradient(#05020A, #05020A) padding-box, ${wkGradient} border-box`,
              border: isMij ? '4px solid transparent' : '2px solid transparent',
              borderRadius: '16px', 
              padding: '12px 14px', 
              boxShadow: isMij ? '0 0 25px rgba(255,255,255,0.4), inset 0 0 15px rgba(255,255,255,0.1)' : '0 8px 20px rgba(0,0,0,0.6)', 
              cursor: modus === 'eindstand' ? 'pointer' : 'default',
              transition: 'all 0.2s',
              transform: isMij ? 'scale(1.02)' : 'scale(1)', 
              position: 'relative',
              zIndex: isMij ? 10 : 1
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '1.4rem', width: '30px', textAlign: 'center', fontWeight: 900 }}>{rankIcon}</div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#FFF', letterSpacing: '0.5px' }}>
                  {speler.naam}
                </div>
                
                <div style={{ fontSize: '0.7rem', marginTop: '2px', fontWeight: 800, color: '#ADB5BD' }}>
                  🎯 {speler.exact} &nbsp; 🟢 {speler.winnaarCorrect} &nbsp; ❌ {speler.fout}
                  {modus === 'eindstand' && (
                    <div style={{ marginTop: '6px', color: '#00E5FF', fontWeight: 900 }}>
                      Bekijk bonusdetails {isExpanded ? '▲' : '▼'}
                    </div>
                  )}
                </div>
              </div>

              {/* ADMIN CONTROLS EN SCORES */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                
                {isJorden && toggleBetaald && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBetaald(speler.id, speler.betaald); }}
                    style={{
                      background: speler.betaald ? 'rgba(255,255,255,0.1)' : '#E30022',
                      border: 'none', color: '#FFF',
                      padding: '4px 8px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer',
                      boxShadow: speler.betaald ? 'none' : '0 2px 5px rgba(0,0,0,0.3)'
                    }}
                  >
                    {speler.betaald ? '✅ OK' : '💰 BETALEN'}
                  </button>
                )}

                <div style={{ textAlign: 'center' }}>
                  {/* GRADIENT TEXT VOOR DE SCORE! */}
                  <div style={{ 
                    fontFamily: 'Bebas Neue', 
                    fontSize: '2.5rem', 
                    lineHeight: 0.9, 
                    background: wkGradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block',
                    filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))'
                  }}>
                    {modus === 'tussenstand' ? speler.prono_score : speler.totaal_score}
                  </div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', color: '#ADB5BD', marginTop: '2px' }}>Punten</div>
                </div>
              </div>
            </div>

            {/* UITKLAPBARE BONUS DETAILS */}
            {modus === 'eindstand' && isExpanded && (
              <div style={{ 
                marginTop: '12px', paddingTop: '12px', 
                borderTop: '1px dashed rgba(255,255,255,0.2)', 
                fontSize: '0.75rem', fontWeight: 800, color: '#FFF'
              }}>
                {speler.bonus_breakdown && speler.bonus_breakdown.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {speler.bonus_breakdown.map((b: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9, background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '8px' }}>
                        <span>• {b.label}</span>
                        <span style={{ fontWeight: 900, color: '#00E5FF' }}>+{b.pt} pt</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ opacity: 0.6, fontStyle: 'italic', textAlign: 'center' }}>Nog geen extra punten gescoord...</div>
                )}
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}
