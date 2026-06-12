// src/components/RankingTab.tsx
import React, { useState, useEffect } from 'react';

// De felle WK Kleuren
const cardThemes = [
  { hex: '#2B00FF' }, // Blauw
  { hex: '#7A00E6' }, // Paars
  { hex: '#E30022' }, // Rood
  { hex: '#CCFF00' }, // Lime Groen
  { hex: '#00E5FF' }  // Cyaan
];

// De harde TV-Broadcast balk (Horizontaal georiënteerd voor de header)
const tvBroadcastBar = 'linear-gradient(90deg, #2B00FF 0%, #2B00FF 16.6%, #7A00E6 16.6%, #7A00E6 33.3%, #E30022 33.3%, #E30022 50%, #FF6B00 50%, #FF6B00 66.6%, #CCFF00 66.6%, #CCFF00 83.3%, #00E5FF 83.3%, #00E5FF 100%)';

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
  }, [actieveSpeler?.id, modus]);

  // Sorteer de spelers
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
      
      {/* MENU KNOPPEN */}
      <div style={{ display: 'flex', background: '#090514', borderRadius: '16px', padding: '6px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '4px' }}>
        <button
          onClick={() => { setModus('tussenstand'); setExpandedBonusId(null); }}
          style={{
            flex: 1, padding: '10px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer',
            background: modus === 'tussenstand' ? '#FFF' : 'transparent',
            color: modus === 'tussenstand' ? '#000' : '#ADB5BD',
            transition: 'all 0.3s'
          }}
        >
          TUSSENSTAND
        </button>
        <button
          onClick={() => { setModus('eindstand'); }}
          style={{
            flex: 1, padding: '10px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer',
            background: modus === 'eindstand' ? '#FFF' : 'transparent',
            color: modus === 'eindstand' ? '#000' : '#ADB5BD',
            transition: 'all 0.3s'
          }}
        >
          EINDSTAND
        </button>
      </div>

      {/* DUIDELIJKE UITLEG BANNERS */}
      {modus === 'tussenstand' ? (
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#ADB5BD', margin: 0, fontWeight: 800 }}>
            ℹ️ <strong style={{color: '#FFF'}}>ZUIVERE TUSSENSTAND</strong>: Puur de matchen, zónder bonusvragen.
          </p>
        </div>
      ) : (
        <div style={{ background: 'rgba(204, 255, 0, 0.1)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(204, 255, 0, 0.3)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#FFF', margin: 0, fontWeight: 800 }}>
            ⚠️ <strong style={{color: '#CCFF00'}}>TELT VOOR DE PRIJZEN</strong>: Inclusief bonus. Tik op een speler voor details.
          </p>
        </div>
      )}

      {/* TV BROADCAST HEADER BAR */}
      <div style={{ 
        width: '100%', 
        height: '6px', 
        background: tvBroadcastBar, 
        borderRadius: '3px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
        marginTop: '5px',
        marginBottom: '5px'
      }} />

      {/* KLASSEMENT LIJST (NEON WATERVAL) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {gesorteerd.map((speler: any, index: number) => {
          const isMij = speler.id === actieveSpeler?.id;
          const isExpanded = expandedBonusId === speler.id;
          const theme = cardThemes[index % cardThemes.length];
          
          let rankIcon = <span style={{ opacity: 0.5, color: '#FFF' }}>{index + 1}</span>;
          if (index === 0) rankIcon = <span style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'}}>🥇</span>;
          if (index === 1) rankIcon = <span style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'}}>🥈</span>;
          if (index === 2) rankIcon = <span style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'}}>🥉</span>;

          return (
            <div 
              id={`speler-${speler.id}`}
              key={speler.id} 
              onClick={() => { if (modus === 'eindstand') setExpandedBonusId(isExpanded ? null : speler.id); }}
              style={{ 
                // ESPORTS DASHBOARD STYLING
                background: isMij ? `linear-gradient(90deg, ${theme.hex}25 0%, #1A1423 100%)` : '#1A1423',
                border: isMij ? `1px solid ${theme.hex}80` : '1px solid rgba(255,255,255,0.03)',
                borderLeft: `8px solid ${theme.hex}`, 
                borderRadius: '12px', 
                padding: '12px 14px', 
                cursor: modus === 'eindstand' ? 'pointer' : 'default',
                transition: 'all 0.2s',
                transform: isMij ? 'scale(1.02)' : 'scale(1)', 
                boxShadow: isMij ? `0 0 20px ${theme.hex}30, 0 4px 15px rgba(0,0,0,0.5)` : '0 4px 10px rgba(0,0,0,0.3)',
                position: 'relative',
                zIndex: isMij ? 10 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '1.2rem', width: '25px', textAlign: 'center', fontWeight: 900 }}>{rankIcon}</div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 900, 
                    fontSize: '1.1rem', 
                    color: isMij ? theme.hex : '#FFF', 
                    letterSpacing: '0.5px',
                    textShadow: isMij ? `0 0 10px ${theme.hex}50` : 'none'
                  }}>
                    {speler.naam}
                  </div>
                  <div style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: 800, color: '#6C757D' }}>
                    🎯 {speler.exact} &nbsp; 🟢 {speler.winnaarCorrect} &nbsp; ❌ {speler.fout}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  
                  {/* ADMIN KNOP (Enkel nog zichtbaar als er NIET betaald is) */}
                  {isJorden && toggleBetaald && !speler.betaald && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleBetaald(speler.id, speler.betaald); }}
                      style={{
                        background: '#E30022',
                        border: 'none',
                        color: '#FFF',
                        padding: '4px 8px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer',
                      }}
                    >
                      💰 BETALEN
                    </button>
                  )}

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontFamily: 'Bebas Neue', 
                      fontSize: '2.4rem', 
                      lineHeight: 0.9, 
                      color: theme.hex, // Punten altijd in de kleur van de verticale balk!
                      textShadow: `0 2px 10px ${theme.hex}40`
                    }}>
                      {modus === 'tussenstand' ? speler.prono_score : speler.totaal_score}
                    </div>
                    <div style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', color: '#6C757D', marginTop: '4px' }}>
                      Punten
                    </div>
                  </div>
                </div>
              </div>

              {/* UITKLAPBAAR BONUS BLOK (Alleen in de Eindstand tab) */}
              {modus === 'eindstand' && isExpanded && (
                <div style={{ 
                  marginTop: '12px', paddingTop: '12px', 
                  borderTop: '1px dashed rgba(255,255,255,0.1)', 
                  fontSize: '0.75rem', fontWeight: 800, color: '#FFF'
                }}>
                  {speler.bonus_breakdown && speler.bonus_breakdown.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {speler.bonus_breakdown.map((b: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9, background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px' }}>
                          <span style={{ color: '#ADB5BD' }}>• {b.label}</span>
                          <span style={{ fontWeight: 900, color: theme.hex }}>+{b.pt} pt</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ opacity: 0.5, fontStyle: 'italic', textAlign: 'center' }}>Nog geen extra punten gescoord...</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
