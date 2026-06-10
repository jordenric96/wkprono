// src/components/RankingTab.tsx
import React, { useState } from 'react';

// De WK kleuren voor de afwisselende kaarten
const cardThemes = [
  { bg: 'var(--wk-blue)', color: '#FFF' },
  { bg: 'var(--wk-purple)', color: '#FFF' },
  { bg: 'var(--wk-aqua)', color: '#111827' }, // Cyaan heeft donkere tekst nodig voor leesbaarheid
  { bg: 'var(--wk-red)', color: '#FFF' }
];

export default function RankingTab({ klassement, actieveSpeler }: any) {
  const [modus, setModus] = useState('matchen'); // 'matchen' of 'bonus'

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      {/* HIGH CONTRAST MENU KNOPPEN */}
      <div style={{ display: 'flex', background: '#1A1423', borderRadius: '16px', padding: '6px', border: '2px solid #333', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
        <button
          onClick={() => setModus('matchen')}
          style={{
            flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer',
            background: modus === 'matchen' ? 'var(--wk-lime)' : 'transparent',
            color: modus === 'matchen' ? '#111827' : '#6C757D',
            transition: 'all 0.3s',
            boxShadow: modus === 'matchen' ? '0 0 15px rgba(204, 255, 0, 0.4)' : 'none'
          }}
        >
          ⚽ MATCHEN <br/><span style={{fontSize:'0.7em', fontWeight:700, opacity: 0.8}}>(Tussenstand)</span>
        </button>
        <button
          onClick={() => setModus('bonus')}
          style={{
            flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer',
            background: modus === 'bonus' ? 'var(--wk-lime)' : 'transparent',
            color: modus === 'bonus' ? '#111827' : '#6C757D',
            transition: 'all 0.3s',
            boxShadow: modus === 'bonus' ? '0 0 15px rgba(204, 255, 0, 0.4)' : 'none'
          }}
        >
          💎 BONUS <br/><span style={{fontSize:'0.7em', fontWeight:700, opacity: 0.8}}>(Eindstand)</span>
        </button>
      </div>

      {/* KLASSEMENT LIJST (Witte kaders zijn weg!) */}
      {gesorteerd.map((speler, index) => {
        const isMij = speler.id === actieveSpeler?.id;
        const theme = cardThemes[index % cardThemes.length]; // Roteer door de 4 WK kleuren
        
        let rankIcon = <span style={{ opacity: 0.6 }}>{index + 1}</span>;
        if (index === 0) rankIcon = <span style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}>🥇</span>;
        if (index === 1) rankIcon = <span style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}>🥈</span>;
        if (index === 2) rankIcon = <span style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}>🥉</span>;

        return (
          <div key={speler.id} style={{ 
            background: theme.bg, 
            color: theme.color, 
            borderRadius: '20px', 
            padding: '18px 20px', 
            display: 'flex', alignItems: 'center', gap: '15px',
            border: isMij ? '3px solid #FFF' : '2px solid transparent',
            boxShadow: isMij ? '0 0 20px rgba(255,255,255,0.5)' : '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '1.8rem', width: '35px', textAlign: 'center', fontWeight: 900 }}>{rankIcon}</div>
            
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '0.5px' }}>{speler.naam}</div>
              
              {modus === 'matchen' ? (
                <div style={{ fontSize: '0.8rem', marginTop: '6px', fontWeight: 800, opacity: 0.9 }}>
                  🎯 {speler.exact} &nbsp; 🟢 {speler.winnaarCorrect} &nbsp; ❌ {speler.fout}
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', marginTop: '6px', fontWeight: 800, opacity: 0.9 }}>
                  Verdiensten uit bonusvragen
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '3rem', lineHeight: 0.9 }}>
                {modus === 'matchen' ? speler.totaal_score : speler.bonus_score}
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.8, marginTop: '4px' }}>Punten</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
