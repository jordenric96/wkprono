// src/components/RankingTab.tsx
import React, { useState, useEffect } from 'react';

// Hardcoded Hex-kleuren voor de Neon randen en tekst-accenten
const cardThemes = [
  { hex: '#2B00FF' }, // Blauw
  { hex: '#7A00E6' }, // Paars
  { hex: '#CCFF00' }, // Neon Lime Groen
  { hex: '#00E5FF' }, // Cyaan
  { hex: '#E30022' }  // Rood
];

export default function RankingTab({ klassement = [], actieveSpeler, toggleBetaald, isJorden }: any) {
  const [modus, setModus] = useState('tussenstand'); 
  const [expandedBonusId, setExpandedBonusId] = useState<number | null>(null);

  // --- AUTO-SCROLL NAAR JEZELF ---
  useEffect(() => {
    if (actieveSpeler?.id) {
      // Kleine timeout zorgt ervoor dat de lijst eerst netjes kan inladen op het scherm
      const timer = setTimeout(() => {
        const element = document.getElementById(`speler-${actieveSpeler.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [actieveSpeler?.id]);

  // Sorteer de spelers op basis van de gekozen modus (100% Vercel Strict Mode Proof!)
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      
      {/* HIGH CONTRAST MENU KNOPPEN */}
      <div style={{ display: 'flex', background: '#090514', borderRadius: '16px', padding: '6px', border: '2px solid #00E5FF', boxShadow: '0 10px 20px rgba(0,0,0,0.5)', marginBottom: '4px' }}>
        <button
          onClick={() => { setModus('tussenstand'); setExpandedBonusId(null); }}
          style={{
            flex: 1, padding: '8px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer',
            background: modus === 'tussenstand' ? '#CCFF00' : 'transparent',
            color: modus === 'tussenstand' ? '#111827' : '#ADB5BD',
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
            color: modus === 'eindstand' ? '#111827' : '#ADB5BD',
            transition: 'all 0.3s',
            boxShadow: modus === 'eindstand' ? '0 0 15px rgba(204, 255, 0, 0.4)' : 'none'
          }}
        >
          🏆 EINDSTAND <br/><span style={{fontSize:'0.6rem', fontWeight:700, opacity: 0.8}}>(Matchen + Bonus)</span>
        </button>
      </div>

      {/* DUIDELIJKE UITLEG BANNERS PER MODUS */}
      {modus === 'tussenstand' && (
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '8px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#ADB5BD', margin: 0, fontWeight: 800 }}>
            ℹ️ <strong style={{color: '#FFF'}}>ZUIVERE TUSSENSTAND</strong><br/>
            Hier zie je puur de punten uit je match-voorspellingen, zónder de bonusvragen inberekend.
          </p>
        </div>
      )}

      {modus === 'eindstand' && (
        <div style={{ background: 'rgba(204, 255, 0, 0.1)', padding: '10px', borderRadius: '12px', border: '1px solid #CCFF00', marginBottom: '8px', textAlign: 'center', boxShadow: '0 4px 10px rgba(204, 255, 0, 0.1)' }}>
          <p style={{ fontSize: '0.75rem', color: '#FFF', margin: 0, fontWeight: 800 }}>
            ⚠️ <strong style={{color: '#CCFF00'}}>DIT KLASSEMENT TELT VOOR DE PRIJZEN!</strong><br/>
            Hier is de verdiende bonus bij opgeteld. Tik op een speler om de details te zien.
          </p>
        </div>
      )}

      {/* KLASSEMENT LIJST */}
      {gesorteerd.map((speler: any, index: number) => {
        const isMij = speler.id === actieveSpeler?.id;
        const theme = cardThemes[index % cardThemes.length]; // Roteer door de 5 WK kleuren
        const isExpanded = expandedBonusId === speler.id;
        
        let rankIcon = <span style={{ opacity: 0.6, color: '#FFF' }}>{index + 1}</span>;
        if (index === 0) rankIcon = <span style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'}}>🥇</span>;
        if (index === 1) rankIcon = <span style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'}}>🥈</span>;
        if (index === 2) rankIcon = <span style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'}}>🥉</span>;

        return (
          <div 
            id={`speler-${speler.id}`} // Nodig voor de Auto-Scroll!
            key={speler.id} 
            onClick={() => { if (modus === 'eindstand') setExpandedBonusId(isExpanded ? null : speler.id); }}
            style={{ 
              // VOLLE KADER EFFECT VOOR DE ACTIEVE SPELER
              background: isMij ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)' : '#1A1423', 
              borderRadius: '14px', 
              padding: '10px 14px', 
              border: isMij ? '3px solid #FFF' : `2px solid ${theme.hex}`, 
              boxShadow: isMij ? '0 0 25px rgba(255,255,255,0.3), inset 0 0 10px rgba(255,255,255,0.2)' : `0 4px 10px ${theme.hex}30`, 
              cursor: modus === 'eindstand' ? 'pointer' : 'default',
              transition: 'all 0.2s',
              transform: isMij ? 'scale(1.02)' : 'scale(1)', // Maakt jouw blokje een fractie groter
              position: 'relative',
              zIndex: isMij ? 10 : 1
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '1.3rem', width: '30px', textAlign: 'center', fontWeight: 900 }}>{rankIcon}</div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#FFF', letterSpacing: '0.5px' }}>
                  {speler.naam}
                  {/* EXTRA BADGE OM JOUW NAAM TE ACCENTUEREN */}
                  {isMij && (
                    <span style={{ fontSize: '0.65rem', background: '#FFF', color: '#111827', padding: '2px 6px', borderRadius: '6px', marginLeft: '8px', verticalAlign: 'middle', fontWeight: 900 }}>
                      JIJ
                    </span>
                  )}
                </div>
                
                <div style={{ fontSize: '0.7rem', marginTop: '2px', fontWeight: 800, color: isMij ? '#E9ECEF' : '#ADB5BD' }}>
                  🎯 {speler.exact} &nbsp; 🟢 {speler.winnaarCorrect} &nbsp; ❌ {speler.fout}
                  {modus === 'eindstand' && (
                    <div style={{ marginTop: '4px', color: isMij ? '#FFF' : theme.hex }}>
                      Bekijk bonusdetails {isExpanded ? '▲' : '▼'}
                    </div>
                  )}
                </div>
              </div>

              {/* ADMIN CONTROLS EN SCORES */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                
                {/* GEHEIME KNOP VOOR JORDEN OM BETALINGEN GOED TE KEUREN */}
                {isJorden && toggleBetaald && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBetaald(speler.id, speler.betaald); }}
                    style={{
                      background: speler.betaald ? 'rgba(255,255,255,0.1)' : '#E30022',
                      border: 'none',
                      color: '#FFF',
                      padding: '4px 8px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer',
                      boxShadow: speler.betaald ? 'none' : '0 2px 5px rgba(0,0,0,0.3)'
                    }}
                  >
                    {speler.betaald ? '✅ OK' : '💰 BETALEN'}
                  </button>
                )}

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.2rem', lineHeight: 0.9, color: isMij ? '#FFF' : theme.hex }}>
                    {modus === 'tussenstand' ? speler.prono_score : speler.totaal_score}
                  </div>
                  <div style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', color: isMij ? '#E9ECEF' : '#ADB5BD', marginTop: '2px' }}>Punten</div>
                </div>
              </div>
            </div>

            {/* UITKLAPBARE BONUS DETAILS (Alleen in Eindstand Modus) */}
            {modus === 'eindstand' && isExpanded && (
              <div style={{ 
                marginTop: '10px', paddingTop: '10px', 
                borderTop: '1px dashed rgba(255,255,255,0.2)', 
                fontSize: '0.75rem', fontWeight: 800, color: '#FFF'
              }}>
                {speler.bonus_breakdown && speler.bonus_breakdown.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {speler.bonus_breakdown.map((b: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
                        <span>• {b.label}</span>
                        <span style={{ fontWeight: 900, color: isMij ? '#FFF' : theme.hex }}>+{b.pt} pt</span>
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
