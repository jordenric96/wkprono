// src/components/RankingTab.tsx
import React, { useState } from 'react';

// De WK kleuren voor de afwisselende kaarten (Nu mét lime groen!)
const cardThemes = [
  { bg: 'var(--wk-blue)', color: '#FFF' },
  { bg: 'var(--wk-purple)', color: '#FFF' },
  { bg: 'var(--wk-lime)', color: '#111827' }, 
  { bg: 'var(--wk-aqua)', color: '#111827' }, 
  { bg: 'var(--wk-red)', color: '#FFF' }
];

export default function RankingTab({ klassement, actieveSpeler }: any) {
  const [modus, setModus] = useState('matchen'); 
  const [expandedBonusId, setExpandedBonusId] = useState<number | null>(null);

  // Sorteer de spelers op basis van de gekozen modus
  const gesorteerd = [...klassement].sort((a, b) => {
    if (modus === 'matchen') {
      if (b.totaal_score !== a.totaal_score) return b.totaal_score - a.totaal_score;
      if (b.exact !== a.exact) return b.exact - a.exact;
      if (b.winnaarCorrect !== a.winnaarCorrect) return b.winnaarCorrect - a.winnaarCorrect;
    } else {
      if (b.bonus_score !== a.bonus_score) return b.bonus_score - a.bonus_score;
    }
    return a.naam.localeCompare(b.naam);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      {/* HIGH CONTRAST MENU KNOPPEN */}
      <div style={{ display: 'flex', background: '#090514', borderRadius: '16px', padding: '6px', border: '2px solid var(--wk-aqua)', boxShadow: '0 10px 20px rgba(0,0,0,0.5)', marginBottom: '10px' }}>
        <button
          onClick={() => { setModus('matchen'); setExpandedBonusId(null); }}
          style={{
            flex: 1, padding: '10px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer',
            background: modus === 'matchen' ? 'var(--wk-lime)' : 'transparent',
            color: modus === 'matchen' ? '#111827' : '#ADB5BD',
            transition: 'all 0.3s',
            boxShadow: modus === 'matchen' ? '0 0 15px rgba(204, 255, 0, 0.4)' : 'none'
          }}
        >
          ⚽ MATCHEN <br/><span style={{fontSize:'0.65rem', fontWeight:700, opacity: 0.8}}>(Tussenstand)</span>
        </button>
        <button
          onClick={() => setModus('bonus')}
          style={{
            flex: 1, padding: '10px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer',
            background: modus === 'bonus' ? 'var(--wk-lime)' : 'transparent',
            color: modus === 'bonus' ? '#111827' : '#ADB5BD',
            transition: 'all 0.3s',
            boxShadow: modus === 'bonus' ? '0 0 15px rgba(204, 255, 0, 0.4)' : 'none'
          }}
        >
          💎 BONUS <br/><span style={{fontSize:'0.65rem', fontWeight:700, opacity: 0.8}}>(Eindstand)</span>
        </button>
      </div>

      {/* COMPACTE KLASSEMENT LIJST IN NEON KLEUREN */}
      {gesorteerd.map((speler, index) => {
        const isMij = speler.id === actieveSpeler?.id;
        const theme = cardThemes[index % cardThemes.length]; // Roteer door de 5 WK kleuren
        const isExpanded = expandedBonusId === speler.id;
        
        let rankIcon = <span style={{ opacity: 0.6 }}>{index + 1}</span>;
        if (index === 0) rankIcon = <span style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}>🥇</span>;
        if (index === 1) rankIcon = <span style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}>🥈</span>;
        if (index === 2) rankIcon = <span style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}>🥉</span>;

        return (
          <div 
            key={speler.id} 
            onClick={() => { if (modus === 'bonus') setExpandedBonusId(isExpanded ? null : speler.id); }}
            style={{ 
              background: theme.bg, 
              color: theme.color, 
              borderRadius: '16px', 
              padding: '12px 16px', // Compacter gemaakt!
              border: isMij ? '3px solid #FFF' : '2px solid transparent',
              boxShadow: isMij ? '0 0 15px rgba(255,255,255,0.4)' : '0 6px 15px rgba(0,0,0,0.3)',
              cursor: modus === 'bonus' ? 'pointer' : 'default',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '1.5rem', width: '30px', textAlign: 'center', fontWeight: 900 }}>{rankIcon}</div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.5px' }}>{speler.naam}</div>
                
                {modus === 'matchen' ? (
                  <div style={{ fontSize: '0.75rem', marginTop: '2px', fontWeight: 800, opacity: 0.9 }}>
                    🎯 {speler.exact} &nbsp; 🟢 {speler.winnaarCorrect} &nbsp; ❌ {speler.fout}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', marginTop: '2px', fontWeight: 800, opacity: 0.9 }}>
                    Details bekijken {isExpanded ? '▲' : '▼'}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.4rem', lineHeight: 0.9 }}>
                  {modus === 'matchen' ? speler.totaal_score : speler.bonus_score}
                </div>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.8, marginTop: '2px' }}>Punten</div>
              </div>
            </div>

            {/* UITKLAPBARE BONUS DETAILS */}
            {modus === 'bonus' && isExpanded && (
              <div style={{ 
                marginTop: '12px', paddingTop: '12px', 
                borderTop: `1px dashed ${theme.color === '#FFF' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`, 
                fontSize: '0.8rem', fontWeight: 800 
              }}>
                {speler.bonus_breakdown && speler.bonus_breakdown.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {speler.bonus_breakdown.map((b: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
                        <span>• {b.label}</span>
                        <span style={{ fontWeight: 900 }}>+{b.pt} pt</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ opacity: 0.8, fontStyle: 'italic', textAlign: 'center' }}>Nog geen bonuspunten gescoord...</div>
                )}
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}
