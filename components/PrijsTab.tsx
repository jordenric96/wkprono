// src/components/PrijsTab.tsx
import React, { useMemo } from 'react';

export default function PrijsTab({ klassement, matchen, alleToernooiV }: any) {
  
  // 1. Bereken de Pot (ALLE deelnemers * €10)
  const totaalAantalSpelers = klassement.length;
  const totalePot = totaalAantalSpelers * 10;

  // 2. Definieer vaste prijzen voor Side-Quests
  const prijsBonusKoning = totaalAantalSpelers > 5 ? 20 : 0;
  const prijsCijferVreter = totaalAantalSpelers > 5 ? 20 : 0;
  
  const potVoorTop3 = totalePot - prijsBonusKoning - prijsCijferVreter;

  // 3. Bereken wie de winnaars zijn
  const winnaars = useMemo(() => {
    if (klassement.length === 0) return null;

    // Top 3 Algemeen
    const top3 = [...klassement].sort((a, b) => b.totaal_score - a.totaal_score).slice(0, 3);

    // Bonus Koning (Meeste bonuspunten)
    const bonusKoning = [...klassement].sort((a, b) => b.bonus_score - a.bonus_score)[0];

    // Cijfer Vreter (Dichtste bij som van Goals + Geel + Rood)
    let liveSom = 0;
    matchen.forEach((m: any) => {
      if (m.thuis_score !== null) {
        liveSom += (m.thuis_score + m.uit_score + (m.gele_kaarten || 0) + (m.rode_kaarten || 0));
      }
    });

    const cijferVreter = alleToernooiV.map((v: any) => {
      const voorspeldeSom = (v.totaal_goals || 0) + (v.totaal_gele_kaarten || 0) + (v.totaal_rode_kaarten || 0);
      return { naam: v.spelers?.naam, verschil: Math.abs(voorspeldeSom - liveSom) };
    }).sort((a: any, b: any) => a.verschil - b.verschil)[0];

    return {
      eerste: { speler: top3[0], bedrag: Math.max(0, Math.round(potVoorTop3 * 0.5)) },
      tweede: { speler: top3[1], bedrag: Math.max(0, Math.round(potVoorTop3 * 0.3)) },
      derde: { speler: top3[2], bedrag: Math.max(0, Math.round(potVoorTop3 * 0.2)) },
      bonus: { speler: bonusKoning, bedrag: prijsBonusKoning },
      cijfer: { speler: cijferVreter, bedrag: prijsCijferVreter }
    };
  }, [klassement, matchen, alleToernooiV, potVoorTop3]);

  if (!winnaars) return <div style={{textAlign:'center', padding:20, fontWeight:800}}>Laden...</div>;

  const PrizeCircle = ({ titel, spelerNaam, bedrag, sub, kleur, icon }: any) => (
    <div className="prize-card" style={{ borderLeft: `6px solid ${kleur}` }}>
      <div className="prize-circle" style={{ background: kleur }}>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      </div>
      <div style={{ flex: 1 }}>
        <div className="prize-titel">{titel}</div>
        <div className="prize-naam">{spelerNaam || 'Nog onbekend'}</div>
        <div className="prize-sub">{sub}</div>
      </div>
      <div className="prize-bedrag">€{bedrag}</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <style>{`
        .pot-header { background: #111827; border-radius: 16px; padding: 20px; text-align: center; color: #FFF; margin-bottom: 5px; box-shadow: 0 10px 20px rgba(0,0,0,0.2); border: 2px solid var(--aqua); }
        .prize-card { background: #FFF; border-radius: 14px; padding: 12px 15px; display: flex; align-items: center; gap: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); position: relative; }
        .prize-circle { width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #FFF; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .prize-titel { font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; line-height: 1; color: #6C757D; }
        .prize-naam { font-weight: 900; font-size: 1rem; color: #111827; }
        .prize-sub { font-size: 0.6rem; font-weight: 800; color: #ADB5BD; text-transform: uppercase; }
        .prize-bedrag { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; color: #40C057; }
      `}</style>

      <div className="pot-header">
        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--aqua)', textTransform: 'uppercase', letterSpacing: '2px' }}>Totale Prijzenpot</div>
        <div style={{ fontSize: '3.5rem', fontFamily: 'Bebas Neue', lineHeight: 1 }}>€{totalePot}</div>
        <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>Gebaseerd op {totaalAantalSpelers} deelnemers</div>
      </div>

      <PrizeCircle titel="🥇 1e Plaats" spelerNaam={winnaars.eerste.speler?.naam} bedrag={winnaars.eerste.bedrag} sub="Algemeen Klassement" kleur="#FFD700" icon="🏆" />
      <PrizeCircle titel="🥈 2e Plaats" spelerNaam={winnaars.tweede.speler?.naam} bedrag={winnaars.tweede.bedrag} sub="Algemeen Klassement" kleur="#C0C0C0" icon="🥈" />
      <PrizeCircle titel="🥉 3e Plaats" spelerNaam={winnaars.derde.speler?.naam} bedrag={winnaars.derde.bedrag} sub="Algemeen Klassement" kleur="#CD7F32" icon="🥉" />
      
      <div style={{ height: '1px', background: 'rgba(0,0,0,0.1)', margin: '5px 0' }} />

      <PrizeCircle titel="💎 Bonus Koning" spelerNaam={winnaars.bonus.speler?.naam} bedrag={winnaars.bonus.bedrag} sub="Meeste punten in Bonus-tab" kleur="var(--magenta)" icon="💎" />
      <PrizeCircle titel="🔢 Cijfer Vreter" spelerNaam={winnaars.cijfer.speler?.naam} bedrag={winnaars.cijfer.bedrag} sub="Dichtste bij som Goals+Kaarten" kleur="var(--crayola)" icon="📊" />

    </div>
  );
}