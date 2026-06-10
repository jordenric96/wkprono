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

  // --- NEVENKLASSEMENTEN ---
  const bonusKoning = useMemo(() => {
    if (!klassement || klassement.length === 0) return null;
    return [...klassement].sort((a, b) => b.bonus_score - a.bonus_score)[0];
  }, [klassement]);

  const scherpschutter = useMemo(() => {
    if (!klassement || klassement.length === 0) return null;
    return [...klassement].sort((a, b) => b.exact - a.exact)[0];
  }, [klassement]);

  // --- DYNAMISCHE PRIJZENPOT BEREKENING (WATERDICHT) ---
  
  // 1. TEL ENKEL DE SPELERS DIE ECHT BETAALD HEBBEN!
  const aantalDeelnemers = klassement.filter(s => s.betaald === true).length;
  const totalePot = aantalDeelnemers * 10;
  
  // Vaste prijzen voor de nevenklassementen
  const prijsBonusKoning = 20;
  const prijsScherpschutter = 20;
  
  // 2. Wat overblijft is voor het algemeen klassement
  const algemenePot = Math.max(0, totalePot - prijsBonusKoning - prijsScherpschutter);

  // 3. Percentages toepassen en afrondingsfouten voorkomen
  // We berekenen 2 t/m 5 en geven de absolute rest aan de 1e plaats. 
  // Zo betaal je nooit een euro te veel uit eigen zak door afrondingen.
  const prijs5 = Math.round(algemenePot * 0.05);
  const prijs4 = Math.round(algemenePot * 0.10);
  const prijs3 = Math.round(algemenePot * 0.15);
  const prijs2 = Math.round(algemenePot * 0.25);
  const prijs1 = algemenePot - prijs2 - prijs3 - prijs4 - prijs5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 🏆 HOOFDPRIJZEN (ALGEMEEN KLASSEMENT) */}
      <div style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '24px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '2px solid #E9ECEF' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#111827', margin: 0, lineHeight: 1 }}>PRIJZENPOT</h2>
          <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--crayola)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Totale inleg: €{totalePot} ({aantalDeelnemers}x betaald)
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 1E PLAATS */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)', borderRadius: '16px', padding: '15px', color: '#FFF', boxShadow: '0 4px 15px rgba(253, 185, 49, 0.4)' }}>
            <div style={{ fontSize: '2rem', marginRight: '15px' }}>🥇</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.9 }}>1e Plaats (45%)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {top5[0]?.naam ? top5[0].naam.split(' ')[0] : '...'}
              </div>
            </div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>€{prijs1 > 0 ? prijs1 : 0}</div>
          </div>

          {/* 2E PLAATS */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%)', borderRadius: '16px', padding: '15px', color: '#111827', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', marginRight: '15px' }}>🥈</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: '#6C757D' }}>2e Plaats (25%)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>
                {top5[1]?.naam ? top5[1].naam.split(' ')[0] : '...'}
              </div>
            </div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: '#495057' }}>€{prijs2 > 0 ? prijs2 : 0}</div>
          </div>

          {/* 3E PLAATS */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)', borderRadius: '16px', padding: '15px', color: '#FFF', boxShadow: '0 4px 15px rgba(205, 127, 50, 0.4)' }}>
            <div style={{ fontSize: '2rem', marginRight: '15px' }}>🥉</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.9 }}>3e Plaats (15%)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {top5[2]?.naam ? top5[2].naam.split(' ')[0] : '...'}
              </div>
            </div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>€{prijs3 > 0 ? prijs3 : 0}</div>
          </div>

          {/* 4E & 5E PLAATS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: '#F8F9FA', borderRadius: '12px', padding: '12px', border: '1px solid #E9ECEF', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase' }}>4e Plaats (10%)</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#495057', margin: '4px 0' }}>{top5[3]?.naam ? top5[3].naam.split(' ')[0] : '...'}</div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: 'var(--crayola)' }}>€{prijs4 > 0 ? prijs4 : 0}</div>
            </div>
            <div style={{ background: '#F8F9FA', borderRadius: '12px', padding: '12px', border: '1px solid #E9ECEF', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase' }}>5e Plaats (5%)</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#495057', margin: '4px 0' }}>{top5[4]?.naam ? top5[4].naam.split(' ')[0] : '...'}</div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: '#40C057' }}>€{prijs5 > 0 ? prijs5 : 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 💎 NEVENKLASSEMENTEN */}
      <div style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '24px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '2px solid #E9ECEF' }}>
        <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#111827', margin: '0 0 15px 0', textAlign: 'center' }}>💎 NEVENKLASSEMENTEN</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* BONUS KONING */}
          <div style={{ border: '2px solid var(--magenta)', borderRadius: '16px', padding: '15px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '4rem', opacity: 0.1 }}>👑</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--magenta)', textTransform: 'uppercase' }}>Bonus Koning</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#111827' }}>
                  {bonusKoning && bonusKoning.bonus_score > 0 ? bonusKoning.naam.split(' ')[0] : 'Nog niet beslist'}
                </div>
                {bonusKoning && bonusKoning.bonus_score > 0 && (
                  <div style={{ fontSize: '0.7rem', color: '#6C757D', fontWeight: 800 }}>{bonusKoning.bonus_score} bonuspunten</div>
                )}
              </div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: 'var(--magenta)' }}>€{totalePot >= 40 ? prijsBonusKoning : 0}</div>
            </div>
          </div>

          {/* SCHERPSCHUTTER */}
          <div style={{ border: '2px solid #40C057', borderRadius: '16px', padding: '15px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '4rem', opacity: 0.1 }}>🎯</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#40C057', textTransform: 'uppercase' }}>Scherpschutter</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#111827' }}>
                  {scherpschutter && scherpschutter.exact > 0 ? scherpschutter.naam.split(' ')[0] : 'Nog niet beslist'}
                </div>
                {scherpschutter && scherpschutter.exact > 0 && (
                  <div style={{ fontSize: '0.7rem', color: '#6C757D', fontWeight: 800 }}>{scherpschutter.exact} exacte matchen</div>
                )}
              </div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: '#40C057' }}>€{totalePot >= 40 ? prijsScherpschutter : 0}</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
