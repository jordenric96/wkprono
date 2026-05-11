// src/components/RankingTab.tsx
import React, { useState } from 'react';

export default function RankingTab({ klassement, actieveSpeler, toggleBetaald }: any) {
  const [toonBonus, setToonBonus] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const isAdmin = actieveSpeler?.naam?.toLowerCase() === 'jorden ricour'.toLowerCase();

  const gesorteerd = [...klassement].sort((a, b) => {
    const scoreA = toonBonus ? a.totaal_score : a.prono_score;
    const scoreB = toonBonus ? b.totaal_score : b.prono_score;
    if (scoreB !== scoreA) return scoreB - scoreA;
    if (b.exact !== a.exact) return b.exact - a.exact; 
    return a.naam.localeCompare(b.naam);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* SCHAKELAAR */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.7)', borderRadius: '16px', padding: '6px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)', marginBottom: '5px' }}>
        <button 
          onClick={() => { setToonBonus(false); setExpandedId(null); }} 
          style={{ 
            flex: 1, padding: '10px 5px', borderRadius: '12px', border: 'none', 
            background: !toonBonus ? '#FFF' : 'transparent', 
            fontWeight: 900, color: !toonBonus ? 'var(--crayola)' : '#ADB5BD', 
            boxShadow: !toonBonus ? '0 4px 10px rgba(0,0,0,0.1)' : 'none', 
            cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>⚽ Matchen</span>
          <span style={{ fontSize: '0.55rem', opacity: 0.7 }}>(Tussenstand)</span>
        </button>
        <button 
          onClick={() => setToonBonus(true)} 
          style={{ 
            flex: 1, padding: '10px 5px', borderRadius: '12px', border: 'none', 
            background: toonBonus ? '#FFF' : 'transparent', 
            fontWeight: 900, color: toonBonus ? 'var(--magenta)' : '#ADB5BD', 
            boxShadow: toonBonus ? '0 4px 10px rgba(0,0,0,0.1)' : 'none', 
            cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>💎 Bonus</span>
          <span style={{ fontSize: '0.55rem', opacity: 0.7 }}>(Eindstand)</span>
        </button>
      </div>

      {/* COMPACTE LIJST */}
      {gesorteerd.map((speler, index) => {
        const isMij = speler.id === actieveSpeler.id;
        const isOpen = expandedId === speler.id;
        const score = toonBonus ? speler.totaal_score : speler.prono_score;
        
        let medaille = null;
        if (index === 0) medaille = "🥇";
        else if (index === 1) medaille = "🥈";
        else if (index === 2) medaille = "🥉";

        return (
          <div 
            key={speler.id} 
            onClick={() => toonBonus && setExpandedId(isOpen ? null : speler.id)}
            style={{ 
              background: isMij ? '#FFF' : 'rgba(255, 255, 255, 0.8)', 
              borderRadius: '18px', padding: '12px 14px', 
              border: isMij ? '2.5px solid var(--crayola)' : '1px solid #E9ECEF',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)', 
              display: 'flex', flexDirection: 'column', position: 'relative',
              cursor: toonBonus ? 'pointer' : 'default'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              
              {/* SUBTIELE POSITIE/MEDAILLE */}
              <div style={{ width: '32px', display: 'flex', justifyContent: 'center', fontSize: '1.6rem', position: 'relative' }}>
                {medaille ? medaille : <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ADB5BD', opacity: 0.6 }}>{index + 1}</span>}
              </div>

              {/* NAAM & STATS (Compact naast elkaar) */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#111827' }}>{speler.naam}</span>
                  {index === 0 && <span>👑</span>}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 800, color: '#495057' }}>
                    <span style={{ opacity: 0.8 }}>🎯</span> {speler.exact}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 800, color: '#495057' }}>
                    <span style={{ opacity: 0.8 }}>🟢</span> {speler.winnaarCorrect}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 800, color: '#495057' }}>
                    <span style={{ opacity: 0.8 }}>❌</span> {speler.fout}
                  </div>
                </div>
              </div>

              {/* SCORE RECHTS */}
              <div style={{ textAlign: 'right', minWidth: '60px' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.4rem', lineHeight: 0.9, color: index === 0 ? '#D4AF37' : (isMij ? 'var(--crayola)' : '#111827') }}>
                  {score}
                </div>
                <div style={{ fontSize: '0.5rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase' }}>Punten</div>
              </div>
            </div>

            {/* BONUS VERDELING (Indien bonus modus aanstaat) */}
            {toonBonus && (
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #EEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ background: '#E7F1FF', color: 'var(--crayola)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 900 }}>⚽ {speler.prono_score}</span>
                  <span style={{ background: '#FDF0FF', color: 'var(--magenta)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 900 }}>💎 {speler.bonus_score}</span>
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--crayola)', opacity: 0.8 }}>{isOpen ? 'SLUIT ▲' : 'DETAILS ▼'}</span>
              </div>
            )}

            {/* UITGEKLAPTE BONUS DETAILS */}
            {toonBonus && isOpen && (
              <div style={{ marginTop: '8px', padding: '10px', background: '#F8F9FA', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {speler.bonus_breakdown?.length > 0 ? speler.bonus_breakdown.map((b: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, color: '#495057' }}>
                    <span>{b.label}</span>
                    <span style={{ color: 'var(--magenta)' }}>+{b.pt}</span>
                  </div>
                )) : <div style={{fontSize:'0.75rem', color:'#ADB5BD', textAlign:'center'}}>Nog geen bonuspunten</div>}
              </div>
            )}

            {/* ADMIN BETAALKNOP (Onderaan, compact) */}
            {isAdmin && (
              <button 
                onClick={(e) => { e.stopPropagation(); toggleBetaald(speler.id, speler.betaald); }}
                style={{ 
                  marginTop: '10px', width: '100%', padding: '6px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: speler.betaald ? '#E8F5E9' : '#FCE4E4', 
                  color: speler.betaald ? '#2E7D32' : '#C62828',
                  fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase'
                }}
              >
                {speler.betaald ? 'BETAALD ✅' : 'NIET BETAALD ⏳'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
