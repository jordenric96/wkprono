// src/components/PrijsTab.tsx
import React, { useMemo } from 'react';

export default function PrijsTab({ 
  klassement, 
  matchen, 
  alleToernooiV 
}: { 
  klassement: any[], 
  matchen?: any[], 
  alleToernooiV?: any[] 
}) {
  const top5 = klassement.slice(0, 5);

  // --- NEVENKLASSEMENTEN TOP 5 BEREKENEN ---
  const top5Bonus = useMemo(() => {
    if (!klassement || klassement.length === 0) return [];
    // Sorteer dalend op bonus_score en pak de top 5
    return [...klassement].sort((a, b) => b.bonus_score - a.bonus_score).slice(0, 5);
  }, [klassement]);

  const top5Scherp = useMemo(() => {
    if (!klassement || klassement.length === 0) return [];
    // Sorteer dalend op aantal exacte uitslagen en pak de top 5
    return [...klassement].sort((a, b) => b.exact - a.exact).slice(0, 5);
  }, [klassement]);

  // --- DYNAMISCHE PRIJZENPOT BEREKENING (WATERDICHT) ---
  const aantalDeelnemers = klassement.filter(s => s.betaald === true).length;
  const totalePot = aantalDeelnemers * 10;
  
  const prijsBonusKoning = 20;
  const prijsScherpschutter = 20;
  
  const algemenePot = Math.max(0, totalePot - prijsBonusKoning - prijsScherpschutter);

  const prijs5 = Math.round(algemenePot * 0.05);
  const prijs4 = Math.round(algemenePot * 0.10);
  const prijs3 = Math.round(algemenePot * 0.15);
  const prijs2 = Math.round(algemenePot * 0.25);
  const prijs1 = algemenePot - prijs2 - prijs3 - prijs4 - prijs5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* 🏆 HOOFDPRIJZEN (ALGEMEEN KLASSEMENT) */}
      <div style={{ background: '#1A1423', borderRadius: '24px', padding: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', border: '2px solid var(--wk-purple)' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '3rem', color: '#FFF', margin: 0, lineHeight: 1, letterSpacing: '2px' }}>PRIJZENPOT</h2>
          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--wk-lime)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Totale inleg: €{totalePot} <span style={{color: '#6C757D'}}>({aantalDeelnemers}x betaald)</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 1E PLAATS */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)', borderRadius: '16px', padding: '15px', color: '#111827', boxShadow: '0 4px 15px rgba(253, 185, 49, 0.4)' }}>
            <div style={{ fontSize: '2rem', marginRight: '15px' }}>🥇</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.8 }}>1e Plaats (45%)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>
                {top5[0]?.naam ? top5[0].naam.split(' ')[0] : '...'}
              </div>
            </div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem' }}>€{prijs1 > 0 ? prijs1 : 0}</div>
          </div>

          {/* 2E PLAATS */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%)', borderRadius: '16px', padding: '15px', color: '#111827', boxShadow: '0 4px 15px rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '2rem', marginRight: '15px' }}>🥈</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.8 }}>2e Plaats (25%)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                {top5[1]?.naam ? top5[1].naam.split(' ')[0] : '...'}
              </div>
            </div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.2rem' }}>€{prijs2 > 0 ? prijs2 : 0}</div>
          </div>

          {/* 3E PLAATS */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)', borderRadius: '16px', padding: '15px', color: '#FFF', boxShadow: '0 4px 15px rgba(205, 127, 50, 0.4)' }}>
            <div style={{ fontSize: '2rem', marginRight: '15px' }}>🥉</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.9 }}>3e Plaats (15%)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                {top5[2]?.naam ? top5[2].naam.split(' ')[0] : '...'}
              </div>
            </div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.2rem' }}>€{prijs3 > 0 ? prijs3 : 0}</div>
          </div>

          {/* 4E & 5E PLAATS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'var(--wk-blue)', borderRadius: '12px', padding: '12px', textAlign: 'center', color: '#FFF', boxShadow: '0 4px 15px rgba(43,0,255,0.4)' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.8, textTransform: 'uppercase' }}>4e Plaats (10%)</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, margin: '4px 0' }}>{top5[3]?.naam ? top5[3].naam.split(' ')[0] : '...'}</div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: 'var(--wk-aqua)' }}>€{prijs4 > 0 ? prijs4 : 0}</div>
            </div>
            <div style={{ background: 'var(--wk-purple)', borderRadius: '12px', padding: '12px', textAlign: 'center', color: '#FFF', boxShadow: '0 4px 15px rgba(122,0,230,0.4)' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.8, textTransform: 'uppercase' }}>5e Plaats (5%)</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, margin: '4px 0' }}>{top5[4]?.naam ? top5[4].naam.split(' ')[0] : '...'}</div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: 'var(--wk-lime)' }}>€{prijs5 > 0 ? prijs5 : 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 💎 NEVENKLASSEMENTEN */}
      <div style={{ background: '#1A1423', borderRadius: '24px', padding: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', border: '2px solid var(--wk-aqua)' }}>
        <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: '#FFF', margin: '0 0 5px 0', textAlign: 'center', letterSpacing: '1px' }}>💎 NEVENKLASSEMENTEN</h3>
        
        {/* DISCLAIMER OVER GELIJKE STAND */}
        <div style={{ background: 'rgba(0, 229, 255, 0.05)', padding: '10px', borderRadius: '12px', border: '1px dashed rgba(0, 229, 255, 0.3)', marginBottom: '20px' }}>
          <p style={{ fontSize: '0.75rem', color: '#ADB5BD', textAlign: 'center', margin: 0, fontWeight: 700 }}>
            *Bij een <strong style={{color: '#FFF'}}>gelijke stand</strong> op de 1e plaats wordt de prijzenpot voor dat nevenklassement eerlijk verdeeld onder de winnaars.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* BONUS KONING */}
          <div style={{ background: 'rgba(227, 0, 34, 0.1)', border: '2px solid var(--wk-red)', borderRadius: '16px', padding: '15px', position: 'relative', overflow: 'hidden' }}>
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

            {/* TOP 5 LIJSTJE BONUS */}
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '12px', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#6C757D', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>Huidige Top 5</div>
              {top5Bonus.map((speler, index) => (
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
          <div style={{ background: 'rgba(204, 255, 0, 0.05)', border: '2px solid var(--wk-lime)', borderRadius: '16px', padding: '15px', position: 'relative', overflow: 'hidden' }}>
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

            {/* TOP 5 LIJSTJE SCHERPSCHUTTER */}
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '12px', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#6C757D', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>Huidige Top 5</div>
              {top5Scherp.map((speler, index) => (
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
