// src/components/PrijsTab.tsx
import React, { useMemo } from 'react';

export default function PrijsTab({ klassement }: any) {
  
  // 1. Bereken de Pot (ALLE deelnemers * €10)
  const totaalAantalSpelers = klassement.length;
  const totalePot = totaalAantalSpelers * 10;

  // 2. Definieer vaste prijzen voor Side-Quests
  const prijsBonusKoning = totaalAantalSpelers > 5 ? 20 : 0;
  const prijsScherpschutter = totaalAantalSpelers > 5 ? 20 : 0; // Vervangt de Cijfer Vreter
  
  const potVoorTop3 = totalePot - prijsBonusKoning - prijsScherpschutter;

  // 3. Bereken wie de winnaars zijn en haal de Top 3 lijstjes op
  const winnaars = useMemo(() => {
    if (klassement.length === 0) return null;

    // Top 3 Algemeen (Voor de grote pot)
    const top3Algemeen = [...klassement].sort((a, b) => b.totaal_score - a.totaal_score);

    // Top 3 Bonus Koning (Meeste bonuspunten)
    const top3Bonus = [...klassement].sort((a, b) => b.bonus_score - a.bonus_score).slice(0, 3);

    // Top 3 Scherpschutter (Meeste EXACTE pronostieken)
    const top3Exact = [...klassement].sort((a, b) => b.exact - a.exact).slice(0, 3);

    return {
      eerste: { speler: top3Algemeen[0], bedrag: Math.max(0, Math.round(potVoorTop3 * 0.5)) },
      tweede: { speler: top3Algemeen[1], bedrag: Math.max(0, Math.round(potVoorTop3 * 0.3)) },
      derde: { speler: top3Algemeen[2], bedrag: Math.max(0, Math.round(potVoorTop3 * 0.2)) },
      bonusTop3: top3Bonus,
      exactTop3: top3Exact,
      bedragBonus: prijsBonusKoning,
      bedragExact: prijsScherpschutter
    };
  }, [klassement, potVoorTop3]);

  if (!winnaars) return <div style={{textAlign:'center', padding:20, fontWeight:800}}>Laden...</div>;

  // Vernieuwd PrizeCard component (ondersteunt nu de Top 3 lijst weergave!)
  const PrizeCard = ({ titel, winnaarNaam, bedrag, sub, kleur, icon, top3Lijst, scoreLabel }: any) => (
    <div className="prize-card" style={{ borderLeft: `6px solid ${kleur}` }}>
      
      {/* Hoofd info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div className="prize-circle" style={{ background: kleur }}>
          <span style={{ fontSize: '1.2rem' }}>{icon}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div className="prize-titel">{titel}</div>
          <div className="prize-naam">{winnaarNaam || 'Nog onbekend'}</div>
          <div className="prize-sub">{sub}</div>
        </div>
        <div className="prize-bedrag">€{bedrag}</div>
      </div>

      {/* TOP 3 LIJST (Alleen zichtbaar als er een lijst is meegegeven) */}
      {top3Lijst && top3Lijst.length > 0 && (
        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #DEE2E6' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ADB5BD', marginBottom: '6px', letterSpacing: '1px' }}>HUIDIGE TOP 3:</div>
          {top3Lijst.map((sp: any, idx: number) => (
            <div key={sp.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, color: idx === 0 ? kleur : '#6C757D', padding: '3px 0' }}>
              <span>{idx + 1}. {sp.naam}</span>
              <span>{scoreLabel === 'exact' ? `${sp.exact} exact` : `${sp.bonus_score} pt`}</span>
            </div>
          ))}
        </div>
      )}
      
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <style>{`
        .pot-header { background: #111827; border-radius: 16px; padding: 20px; text-align: center; color: #FFF; margin-bottom: 5px; box-shadow: 0 10px 20px rgba(0,0,0,0.2); border: 2px solid var(--aqua); }
        .prize-card { background: #FFF; border-radius: 14px; padding: 15px; display: flex; flex-direction: column; box-shadow: 0 4px 10px rgba(0,0,0,0.05); position: relative; }
        .prize-circle { width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #FFF; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .prize-titel { font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; line-height: 1; color: #6C757D; }
        .prize-naam { font-weight: 900; font-size: 1.1rem; color: #111827; margin-top: 2px; }
        .prize-sub { font-size: 0.65rem; font-weight: 800; color: #ADB5BD; text-transform: uppercase; margin-top: 2px; }
        .prize-bedrag { font-family: 'Bebas Neue', sans-serif; font-size: 2.2rem; color: #40C057; }
      `}</style>

      <div className="pot-header">
        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--aqua)', textTransform: 'uppercase', letterSpacing: '2px' }}>Totale Prijzenpot</div>
        <div style={{ fontSize: '3.5rem', fontFamily: 'Bebas Neue', lineHeight: 1 }}>€{totalePot}</div>
        <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>Gebaseerd op {totaalAantalSpelers} deelnemers</div>
      </div>

      <PrizeCard titel="🥇 1e Plaats" winnaarNaam={winnaars.eerste.speler?.naam} bedrag={winnaars.eerste.bedrag} sub="Algemeen Klassement" kleur="#FFD700" icon="🏆" />
      <PrizeCard titel="🥈 2e Plaats" winnaarNaam={winnaars.tweede.speler?.naam} bedrag={winnaars.tweede.bedrag} sub="Algemeen Klassement" kleur="#C0C0C0" icon="🥈" />
      <PrizeCard titel="🥉 3e Plaats" winnaarNaam={winnaars.derde.speler?.naam} bedrag={winnaars.derde.bedrag} sub="Algemeen Klassement" kleur="#CD7F32" icon="🥉" />
      
      <div style={{ height: '1px', background: 'rgba(0,0,0,0.1)', margin: '5px 0' }} />

      {/* De extra prijzen MET de Top 3 weergave */}
      <PrizeCard 
        titel="💎 Bonus Koning" 
        winnaarNaam={winnaars.bonusTop3[0]?.naam} 
        bedrag={winnaars.bedragBonus} 
        sub="Meeste punten in Bonus-tab" 
        kleur="var(--magenta)" 
        icon="💎" 
        top3Lijst={winnaars.bonusTop3} 
        scoreLabel="bonus"
      />

      <PrizeCard 
        titel="🎯 Scherpschutter" 
        winnaarNaam={winnaars.exactTop3[0]?.naam} 
        bedrag={winnaars.bedragExact} 
        sub="Meeste exacte pronostieken" 
        kleur="var(--crayola)" 
        icon="🎯" 
        top3Lijst={winnaars.exactTop3} 
        scoreLabel="exact"
      />

    </div>
  );
}
