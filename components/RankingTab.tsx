// src/components/RankingTab.tsx
import React, { useState } from 'react';

// Hardcoded Hex-kleuren zodat het Neon áltijd werkt, ongeacht CSS-scoping
const cardThemes = [
  { bg: '#2B00FF', color: '#FFF' },    // Blauw
  { bg: '#7A00E6', color: '#FFF' },    // Paars
  { bg: '#CCFF00', color: '#111827' }, // Neon Lime Groen
  { bg: '#00E5FF', color: '#111827' }, // Cyaan
  { bg: '#E30022', color: '#FFF' }     // Rood
];

export default function RankingTab({ klassement, actieveSpeler, toggleBetaald, isJorden }: any) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      
      {/* HIGH CONTRAST MENU KNOPPEN */}
      <div style={{ display: 'flex', background: '#090514', borderRadius: '16px', padding: '6px', border: '2px solid #00E5FF', boxShadow: '0 10px 20px rgba(0,0,0,0.5)', marginBottom: '8px' }}>
        <button
          onClick={() => { setModus('matchen'); setExpandedBonusId(null); }}
          style={{
            flex: 1, padding: '8px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer',
            background: modus === 'matchen' ? '#CCFF00' : 'transparent',
            color: modus === 'matchen' ? '#111827' : '#ADB5BD',
            transition: 'all 0.3s',
            boxShadow: modus === 'matchen' ? '0 0 15px rgba(204, 255, 0, 0.4)' : 'none'
          }}
        >
          ⚽ MATCHEN <br/><span style={{fontSize:'0.6rem', fontWeight:700, opacity: 0.8}}>(Tussenstand)</span>
        </button>
        <button
          onClick={() => setModus('bonus')}
          style={{
            flex: 1, padding: '8px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer',
            background: modus === 'bonus' ? '#CCFF00' : 'transparent',
            color: modus === 'bonus' ? '#111827' : '#ADB5BD',
            transition: 'all 0.3s',
            boxShadow: modus === 'bonus' ? '0 0 15px rgba(204, 255, 0, 0.4)' : 'none'
          }}
        >
          💎 BONUS <br/><span style={{fontSize:'0.6rem', fontWeight:700, opacity: 0.8}}>(Eindstand)</span>
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
              borderRadius: '14px', 
              padding: '10px 14px',
              border: isMij ? '2px solid #FFF' : '1px solid transparent',
              boxShadow: isMij ? '0 0 15px rgba(255,255,255,0.4)' : '0 4px 10px rgba(0,0,0,0.3)',
              cursor: modus === 'bonus' ? 'pointer' : 'default',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '1.3rem', width: '30px', textAlign: 'center', fontWeight: 900 }}>{rankIcon}</div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: '1.05rem', letterSpacing: '0.5px' }}>{speler.naam}</div>
                
                {modus === 'matchen' ? (
                  <div style={{ fontSize: '0.7rem', marginTop: '2px', fontWeight: 800, opacity: 0.9 }}>
                    🎯 {speler.exact} &nbsp; 🟢 {speler.winnaarCorrect} &nbsp; ❌ {speler.fout}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.7rem', marginTop: '2px', fontWeight: 800, opacity: 0.9 }}>
                    Bekijk details {isExpanded ? '▲' : '▼'}
                  </div>
                )}
              </div>

              {/* ADMIN CONTROLS EN SCORES */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                
                {/* GEHEIME KNOP VOOR JORDEN OM BETALINGEN GOED TE KEUREN */}
                {isJorden && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBetaald(speler.id, speler.betaald); }}
                    style={{
                      background: speler.betaald ? 'transparent' : '#E30022',
                      border: speler.betaald ? '1px solid rgba(255,255,255,0.3)' : 'none',
                      color: '#FFF',
                      padding: '4px 8px', borderRadius: '6px', fontSize: '0.55rem', fontWeight: 900, cursor: 'pointer',
                      boxShadow: speler.betaald ? 'none' : '0 2px 5px rgba(0,0,0,0.3)'
                    }}
                  >
                    {speler.betaald ? '✅ OK' : '💰 BETALEN'}
                  </button>
                )}

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.2rem', lineHeight: 0.9 }}>
                    {modus === 'matchen' ? speler.totaal_score : speler.bonus_score}
                  </div>
                  <div style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.8, marginTop: '2px' }}>Punten</div>
                </div>
              </div>
            </div>

            {/* UITKLAPBARE BONUS DETAILS */}
            {modus === 'bonus' && isExpanded && (
              <div style={{ 
                marginTop: '10px', paddingTop: '10px', 
                borderTop: `1px dashed ${theme.color === '#FFF' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`, 
                fontSize: '0.75rem', fontWeight: 800 
              }}>
                {speler.bonus_breakdown && speler.bonus_breakdown.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {speler.bonus_breakdown.map((b: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
                        <span>• {b.label}</span>
                        <span style={{ fontWeight: 900 }}>+{b.pt} pt</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ opacity: 0.8, fontStyle: 'italic', textAlign: 'center' }}>Nog geen extra punten gescoord...</div>
                )}
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}
