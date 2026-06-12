// src/components/RankingTab.tsx
import React, { useState, useEffect } from 'react';

// Kleuren die roteren voor de "Broadcast" look
const cardThemes = [
  { hex: '#2B00FF' }, // Blauw
  { hex: '#7A00E6' }, // Paars
  { hex: '#CCFF00' }, // Neon Lime
  { hex: '#00E5FF' }, // Cyaan
  { hex: '#E30022' }  // Rood
];

export default function RankingTab({ klassement = [], actieveSpeler, toggleBetaald, isJorden }: any) {
  const [modus, setModus] = useState('tussenstand'); 
  const [expandedBonusId, setExpandedBonusId] = useState<number | null>(null);

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
      <div style={{ display: 'flex', background: '#000', borderRadius: '16px', padding: '6px', border: '2px solid #333', marginBottom: '4px' }}>
        <button
          onClick={() => { setModus('tussenstand'); setExpandedBonusId(null); }}
          style={{
            flex: 1, padding: '10px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer',
            background: modus === 'tussenstand' ? '#FFF' : 'transparent',
            color: modus === 'tussenstand' ? '#000' : '#FFF',
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
            color: modus === 'eindstand' ? '#000' : '#FFF',
            transition: 'all 0.3s'
          }}
        >
          EINDSTAND
        </button>
      </div>

      {/* KLASSEMENT LIJST (HARD DESIGN) */}
      {gesorteerd.map((speler: any, index: number) => {
        const isMij = speler.id === actieveSpeler?.id;
        const isExpanded = expandedBonusId === speler.id;
        const theme = cardThemes[index % cardThemes.length];
        
        let rankIcon = <span style={{ opacity: 0.6, color: '#FFF' }}>{index + 1}</span>;
        if (index === 0) rankIcon = <span>🥇</span>;
        if (index === 1) rankIcon = <span>🥈</span>;
        if (index === 2) rankIcon = <span>🥉</span>;

        return (
          <div 
            id={`speler-${speler.id}`}
            key={speler.id} 
            onClick={() => { if (modus === 'eindstand') setExpandedBonusId(isExpanded ? null : speler.id); }}
            style={{ 
              // VOLLE BLOK STIJL
              background: isMij ? theme.hex : '#000', 
              borderRadius: '0px', // Straks voor TV look
              padding: '14px', 
              border: `${isMij ? '6px' : '4px'} solid ${theme.hex}`, 
              cursor: modus === 'eindstand' ? 'pointer' : 'default',
              transition: 'all 0.2s',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '1.4rem', width: '30px', textAlign: 'center', fontWeight: 900, color: isMij ? '#000' : '#FFF' }}>{rankIcon}</div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: '1.2rem', color: isMij ? '#000' : '#FFF', letterSpacing: '0.5px' }}>
                  {speler.naam}
                </div>
                <div style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: 800, color: isMij ? 'rgba(0,0,0,0.7)' : '#ADB5BD' }}>
                  🎯 {speler.exact} &nbsp; 🟢 {speler.winnaarCorrect} &nbsp; ❌ {speler.fout}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontFamily: 'Bebas Neue', 
                  fontSize: '2.5rem', 
                  lineHeight: 0.9, 
                  color: isMij ? '#000' : '#FFF'
                }}>
                  {modus === 'tussenstand' ? speler.prono_score : speler.totaal_score}
                </div>
              </div>
            </div>

            {/* UITKLAPBAAR BONUS BLOK */}
            {modus === 'eindstand' && isExpanded && (
              <div style={{ 
                marginTop: '12px', paddingTop: '12px', 
                borderTop: `1px solid ${isMij ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)'}`, 
                fontSize: '0.75rem', fontWeight: 800, color: isMij ? '#000' : '#FFF'
              }}>
                {speler.bonus_breakdown && speler.bonus_breakdown.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {speler.bonus_breakdown.map((b: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9, background: isMij ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)', padding: '6px 10px' }}>
                        <span>• {b.label}</span>
                        <span style={{ fontWeight: 900 }}>+{b.pt} pt</span>
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
