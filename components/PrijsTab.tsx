// src/components/PrijsTab.tsx
import React, { useMemo } from 'react';

export default function PrijsTab({ 
  klassement = [], 
  matchen = [], 
  alleToernooiV = [] 
}: any) {

  // --- HOOFDPRIJZEN (EXACT DEZELFDE SORTERING ALS DE ZUIVERE TUSSENSTAND) ---
  const top5 = useMemo(() => {
    if (!klassement || klassement.length === 0) return [];
    return [...klassement].sort((a: any, b: any) => {
      if (b.prono_score !== a.prono_score) return b.prono_score - a.prono_score;
      if (b.exact !== a.exact) return b.exact - a.exact;
      if (b.winnaarCorrect !== a.winnaarCorrect) return b.winnaarCorrect - a.winnaarCorrect;
      return (a.naam || '').localeCompare(b.naam || '');
    }).slice(0, 5);
  }, [klassement]);

  // --- NEVENKLASSEMENTEN TOP 5 ---
  const top5Bonus = useMemo(() => {
    if (!klassement || klassement.length === 0) return [];
    return [...klassement].sort((a: any, b: any) => {
      if (b.bonus_score !== a.bonus_score) return b.bonus_score - a.bonus_score;
      return (a.naam || '').localeCompare(b.naam || '');
    }).slice(0, 5);
  }, [klassement]);

  const top5Scherp = useMemo(() => {
    if (!klassement || klassement.length === 0) return [];
    return [...klassement].sort((a: any, b: any) => {
      if (b.exact !== a.exact) return b.exact - a.exact;
      return (a.naam || '').localeCompare(b.naam || '');
    }).slice(0, 5);
  }, [klassement]);

  // --- DYNAMISCHE PRIJZENPOT BEREKENING ---
  const aantalDeelnemers = klassement.filter((s: any) => s.betaald === true).length;
  const totalePot = aantalDeelnemers * 10;
  
  const prijsBonusKoning = 20;
  const prijsScherpschutter = 20;
  
  const algemenePot = Math.max(0, totalePot - prijsBonusKoning - prijsScherpschutter);

  const prijs5 = Math.round(algemenePot * 0.05);
  const prijs4 = Math.round(algemenePot * 0.10);
  const prijs3 = Math.round(algemenePot * 0.15);
  const prijs2 = Math.round(algemenePot * 0.25);
  const prijs1 = algemenePot - prijs2 - prijs3 - prijs4 - prijs5;

  // De 5 WK Kleuren
  const colors = ['#2B00FF', '#7A00E6', '#CCFF00', '#00E5FF', '#E30022'];
  const prijzen = [prijs1, prijs2, prijs3, prijs4, prijs5];
  const percentages = ['45%', '25%', '15%', '10%', '5%'];
  const icons = ['🥇', '🥈', '🥉', '4.', '5.'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* 🏆 HOOFDPRIJZEN */}
      <div style={{ background: '#1A1423', borderRadius: '24px', padding: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', border: '2px solid rgba(255,255,255,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '3rem', color: '#FFF', margin: 0, lineHeight: 1, letterSpacing: '2px' }}>PRIJZENPOT</h2>
          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--wk-lime)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Totale inleg: €{totalePot} <span style={{color: '#6C757D'}}>({aantalDeelnemers}x betaald)</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[0, 1, 2, 3, 4].map((index) => {
            const speler = top5[index];
            const color = colors[index];
            const prijs = prijzen[index];
            const percent = percentages[index];
            const icon = icons[index];

            return (
              <div key={index} style={{
                background: '#090514', borderRadius: '16px', padding: '12px 16px', display: 'flex', alignItems: 'center',
                border: `2px solid ${color}`, boxShadow: `0 4px 15px ${color}30` 
              }}>
                <div style={{ fontSize: index < 3 ? '1.8rem' : '1.4rem', width: '35px', textAlign: 'center', fontWeight: 900, color: '#FFF', opacity: index < 3 ? 1 : 0.6 }}>
                  {icon}
                </div>
                <div style={{ flex: 1, paddingLeft: '10px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: '#ADB5BD' }}>{index + 1}e Plaats ({percent})</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFF', letterSpacing: '0.5px' }}>
                    {speler?.naam ? speler.naam.split(' ')[0] : '...'}
                  </div>
                </div>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: color, lineHeight: 1 }}>
                  €{prijs > 0 ? prijs : 0}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 💎 NEVENKLASSEMENTEN */}
      <div style={{ background: '#1A1423', borderRadius: '24px', padding: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', border: '2px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: '#FFF', margin: '0 0 5px 0', textAlign: 'center', letterSpacing: '1px' }}>💎 NEVENKLASSEMENTEN</h3>
        
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '10px', borderRadius: '12px', border: '1px dashed rgba(255, 255, 255, 0.2)', marginBottom: '20px' }}>
          <p style={{ fontSize: '0.75rem', color: '#ADB5BD', textAlign: 'center', margin: 0, fontWeight: 700 }}>
            *Bij een <strong style={{color: '#FFF'}}>gelijke stand</strong> op de 1e plaats wordt de prijzenpot voor dat nevenklassement eerlijk verdeeld onder de winnaars.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* BONUS KONING */}
          <div style={{ background: '#090514', border: '2px solid var(--wk-red)', borderRadius: '16px', padding: '15px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 15px rgba(227, 0, 34, 0.2)' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '4rem', opacity: 0.1 }}>👑</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1, marginBottom: '15px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--wk-red)', textTransform: 'uppercase' }}>Bonus Koning</div>
                <div style={{ fontSize: '0.75rem', color: '#ADB5BD', fontWeight: 700, marginTop: '4px', maxWidth: '85%' }}>
                  De speler met de beste glazen bol. Gekroond door de <strong>meeste bonuspunten</strong>.
                </div>
              </div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.2rem', color: 'var(--wk-red)', lineHeight: 1 }}>€{totalePot >= 40 ? prijsBonusKoning : 0}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#6C757D', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>Huidige Top 5</div>
              {top5Bonus.map((speler: any, index: number) => (
                <div key={speler.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: index !== 4 ? '1px solid rgba(255,255,255,0.05)' : 'none', padding: '5px 0' }}>
                  <span style={{ color: index === 0 ? '#FFF' : '#ADB5BD', fontWeight: index === 0 ? 900 : 700 }}>
                    {index + 1}. {speler.naam.split(' ')[0]}
                  </span>
                  <span style={{ color: 'var(--wk-red)', fontWeight: 900 }}>{speler.bonus_score} pt</span>
                </div>
              ))}
            </div>
          </div>

          {/* SCHERPSCHUTTER */}
          <div style={{ background: '#090514', border: '2px solid var(--wk-lime)', borderRadius: '16px', padding: '15px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 15px rgba(204, 255, 0, 0.2)' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '4rem', opacity: 0.1 }}>🎯</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1, marginBottom: '15px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--wk-lime)', textTransform: 'uppercase' }}>Scherpschutter</div>
                <div style={{ fontSize: '0.75rem', color: '#ADB5BD', fontWeight: 700, marginTop: '4px', maxWidth: '85%' }}>
                  De voetbalkenner. Winnaar is degene met de <strong>meeste exacte scores</strong> correct.
                </div>
              </div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.2rem', color: 'var(--wk-lime)', lineHeight: 1 }}>€{totalePot >= 40 ? prijsScherpschutter : 0}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#6C757D', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>Huidige Top 5</div>
              {top5Scherp.map((speler: any, index: number) => (
                <div key={speler.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: index !== 4 ? '1px solid rgba(255,255,255,0.05)' : 'none', padding: '5px 0' }}>
                  <span style={{ color: index === 0 ? '#FFF' : '#ADB5BD', fontWeight: index === 0 ? 900 : 700 }}>
                    {index + 1}. {speler.naam.split(' ')[0]}
                  </span>
                  <span style={{ color: 'var(--wk-lime)', fontWeight: 900 }}>{speler.exact} matchen</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
