// src/components/AntwoordenTab.tsx
import React, { useState } from 'react';

export default function AntwoordenTab({ nu, DEADLINE_DATE, alleToernooiV }: any) {
  const isGesloten = nu >= DEADLINE_DATE;
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!alleToernooiV || alleToernooiV.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.8)', borderRadius: '16px', border: '2px dashed var(--crayola)' }}>
        <div style={{ fontSize: '3rem', animation: 'bounce 2s infinite' }}>🕵️‍♂️</div>
        <p style={{ fontWeight: 900, color: '#111827', fontSize: '1.2rem', margin: '10px 0 0 0' }}>Spionnen vinden niets...</p>
        <p style={{ color: '#6C757D', fontSize: '0.8rem', fontWeight: 800, marginTop: '5px' }}>
          Nog absoluut niemand heeft zijn bonusvragen durven invullen!
        </p>
      </div>
    );
  }

  const gesorteerd = [...alleToernooiV].sort((a, b) => a.spelers?.naam.localeCompare(b.spelers?.naam));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <style>{`
        @keyframes pulse-red { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes bounce-ball { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .secret-badge { background: #FFE3E3; color: #E03131; padding: 4px 10px; border-radius: 8px; font-weight: 900; font-size: 0.7rem; border: 1px solid #FFA8A8; }
        .icon-box { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; font-size: 1.1rem; transition: 0.3s; }
        .icon-box.done { background: var(--crayola); color: white; transform: scale(1.05); box-shadow: 0 4px 8px rgba(55, 114, 255, 0.3); }
        .icon-box.waiting { background: #F1F3F5; color: #ADB5BD; filter: grayscale(100%); opacity: 0.5; }
      `}</style>

      {/* HEADER: AFHANKELIJK VAN DEADLINE */}
      {!isGesloten ? (
        <div style={{ background: 'rgba(255,255,255,0.9)', padding: '15px', borderRadius: '16px', border: '2px dashed #E03131', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ fontSize: '2.5rem', animation: 'pulse-red 2s infinite' }}>🚨</div>
          <div>
            <h3 style={{ margin: 0, fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: '#E03131', letterSpacing: '1px' }}>TOP SECRET DOSSIERS</h3>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6C757D', margin: '2px 0 0 0', lineHeight: 1.3 }}>
              Niemand mag elkaars tactiek kopiëren! Je ziet hier enkel wie zijn huiswerk al gemaakt heeft.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ background: 'linear-gradient(135deg, var(--crayola), var(--magenta))', padding: '15px', borderRadius: '16px', color: '#FFF', textAlign: 'center', boxShadow: '0 4px 15px rgba(240, 56, 255, 0.3)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '5px' }}>🔓</div>
          <h3 style={{ margin: 0, fontFamily: 'Bebas Neue', fontSize: '1.8rem', letterSpacing: '1px' }}>DE MASKERS VALLEN AF!</h3>
          <p style={{ fontSize: '0.8rem', fontWeight: 800, margin: '2px 0 0 0', opacity: 0.9 }}>
            De deadline is voorbij. Klik op een speler om zijn of haar pronostieken te keuren!
          </p>
        </div>
      )}

      {/* SPELERS LIJST */}
      {gesorteerd.map((v) => {
        const isOpen = expandedId === v.id;
        
        // Check welke vragen zijn ingevuld (met leuke icoontjes)
        const checks = [
          { label: 'Wereldkampioen', icon: '🏆', ok: !!v.winnaar },
          { label: 'Halve Finalisten', icon: '⚔️', ok: !!(v.halve_finalist_1 && v.halve_finalist_2 && v.halve_finalist_3 && v.halve_finalist_4) },
          { label: 'Meeste Goals', icon: '⚽', ok: !!v.topschutter },
          { label: 'Beste Verdediging', icon: '🛡️', ok: !!v.beste_keeper },
          { label: 'Eindstation België', icon: '📍', ok: !!v.eindstation_belgie },
          { label: 'Totaal Goals', icon: '🥅', ok: v.totaal_goals != null && v.totaal_goals > 0 },
          { label: 'Totaal Geel', icon: '🟨', ok: v.totaal_gele_kaarten != null && v.totaal_gele_kaarten > 0 },
          { label: 'Totaal Rood', icon: '🟥', ok: v.totaal_rode_kaarten != null && v.totaal_rode_kaarten > 0 }
        ];
        
        const score = checks.filter(c => c.ok).length;
        const klaar = score === 8;
        const percentage = (score / 8) * 100;

        // Speelse status tekst
        let statusTekst = "Ligt nog te slapen... 😴";
        if (score > 0 && score < 4) statusTekst = "Is eraan begonnen! 📝";
        if (score >= 4 && score < 8) statusTekst = "Tactiek aan het uittekenen... 🤔";
        if (score === 8) statusTekst = "Helemaal klaar voor de strijd! 🚀";

        return (
          <div key={v.id} style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', padding: '15px', border: klaar ? '2px solid #40C057' : '2px solid #E9ECEF', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', transition: '0.3s' }}>
            
            {/* VÓÓR DEADLINE WEERGAVE (Spionage) */}
            {!isGesloten ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#111827' }}>{v.spelers?.naam}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: klaar ? '#2B8A3E' : '#868E96', marginTop: '2px' }}>
                      {statusTekst}
                    </div>
                  </div>
                  <div className={klaar ? '' : 'secret-badge'} style={klaar ? { background: '#EBFBEE', color: '#2B8A3E', padding: '4px 10px', borderRadius: '8px', fontWeight: 900, fontSize: '0.7rem' } : {}}>
                    {klaar ? '✅ COMPLEET' : '🔒 CLASSIFIED'}
                  </div>
                </div>

                {/* Coole Progressie Balk met Voetbal */}
                <div style={{ background: '#F1F3F5', height: '12px', borderRadius: '10px', width: '100%', marginBottom: '15px', position: 'relative' }}>
                  <div style={{ background: klaar ? '#40C057' : 'var(--crayola)', height: '100%', borderRadius: '10px', width: `${percentage}%`, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                  {score > 0 && (
                    <div style={{ position: 'absolute', top: '-6px', left: `calc(${percentage}% - 12px)`, fontSize: '1rem', transition: 'left 1s', animation: klaar ? 'none' : 'bounce-ball 1s infinite' }}>
                      ⚽
                    </div>
                  )}
                </div>

                {/* Raster van icoontjes (Oplichtend of Grijs) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                  {checks.map((c, i) => (
                    <div key={i} className={`icon-box ${c.ok ? 'done' : 'waiting'}`} title={c.label}>
                      {c.ok ? c.icon : '❓'}
                    </div>
                  ))}
                </div>
              </div>
            ) : (

              /* NA DEADLINE WEERGAVE (Uitklapbaar) */
              <div onClick={() => setExpandedId(isOpen ? null : v.id)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: isOpen ? 'var(--crayola)' : '#F1F3F5', color: isOpen ? '#FFF' : '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', transition: '0.3s' }}>
                      {isOpen ? '👀' : '👤'}
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '1.2rem', color: isOpen ? 'var(--crayola)' : '#111827' }}>{v.spelers?.naam}</div>
                  </div>
                  <div style={{ background: '#F8F9FA', padding: '8px 12px', borderRadius: '12px', fontWeight: 900, fontSize: '0.8rem', color: '#495057' }}>
                    {isOpen ? 'SLUITEN ▴' : 'BEKIJK ▾'}
                  </div>
                </div>

                {/* Uitgeklapte Antwoorden in vrolijk format */}
                {isOpen && (
                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '2px dashed #E9ECEF', display: 'grid', gap: '10px' }}>
                    
                    {[
                      { l: 'Wereldkampioen', i: '🏆', val: v.winnaar },
                      { l: 'Halve Finalisten', i: '⚔️', val: [v.halve_finalist_1, v.halve_finalist_2, v.halve_finalist_3, v.halve_finalist_4].filter(Boolean).join(', ') },
                      { l: 'Meeste Goals', i: '⚽', val: v.topschutter },
                      { l: 'Beste Verdediging', i: '🛡️', val: v.beste_keeper },
                      { l: 'Eindstation België', i: '📍', val: v.eindstation_belgie },
                      { l: 'Totaal Goals Toernooi', i: '🥅', val: v.totaal_goals },
                      { l: 'Totaal Gele Kaarten', i: '🟨', val: v.totaal_gele_kaarten },
                      { l: 'Totaal Rode Kaarten', i: '🟥', val: v.totaal_rode_kaarten },
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', background: '#F8F9FA', padding: '10px 15px', borderRadius: '12px' }}>
                        <div style={{ width: '30px', fontSize: '1.2rem' }}>{item.i}</div>
                        <div style={{ flex: 1, fontSize: '0.75rem', fontWeight: 800, color: '#6C757D', textTransform: 'uppercase' }}>{item.l}</div>
                        <div style={{ fontWeight: 900, color: '#111827', fontSize: '0.9rem', textAlign: 'right' }}>{item.val || '—'}</div>
                      </div>
                    ))}
                    
                  </div>
                )}
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}
