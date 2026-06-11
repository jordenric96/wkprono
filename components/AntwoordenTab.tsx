// src/components/AntwoordenTab.tsx
import React, { useState } from 'react';

export default function AntwoordenTab({ nu, DEADLINE_DATE, alleToernooiV = [] }: any) {
  const isGesloten = nu >= DEADLINE_DATE;
  const [openThema, setOpenTheme] = useState<string | null>('winnaar'); // Eerste staat standaard open

  if (!isGesloten) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', background: '#1A1423', borderRadius: '24px', border: '2px solid #E30022', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🔒</div>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#E30022', margin: '0 0 10px 0', letterSpacing: '1px' }}>NOG EVEN GEDULD</h2>
        <p style={{ color: '#ADB5BD', fontWeight: 800, fontSize: '0.9rem' }}>
          Om spieken te voorkomen blijven alle bonusantwoorden strikt geheim tot de deadline is verstreken.
        </p>
      </div>
    );
  }

  // --- HELPER FUNCTIES VOOR HET GROEPEREN ---
  
  // 1. Groepeer op antwoord (Bv: "Brazilië" -> ["Jorden", "Vince", ...])
  const groepeerOpAntwoord = (veld: string) => {
    const groepen: Record<string, string[]> = {};
    alleToernooiV.forEach(v => {
      const antwoord = v[veld] || 'Niets ingevuld';
      const naam = v.spelers?.naam?.split(' ')[0] || 'Onbekend';
      if (!groepen[antwoord]) groepen[antwoord] = [];
      groepen[antwoord].push(naam);
    });
    // Sorteer zodat het populairste antwoord bovenaan staat
    return Object.entries(groepen).sort((a, b) => b[1].length - a[1].length);
  };

  // 2. Groepeer speciaal voor Halve Finalisten (4 velden combineren)
  const groepeerHalveFinalisten = () => {
    const groepen: Record<string, string[]> = {};
    alleToernooiV.forEach(v => {
      const naam = v.spelers?.naam?.split(' ')[0] || 'Onbekend';
      // Haal dubbele landen van 1 speler eruit voor de zekerheid
      const gekozenLanden = Array.from(new Set([v.halve_finalist_1, v.halve_finalist_2, v.halve_finalist_3, v.halve_finalist_4].filter(Boolean)));
      
      gekozenLanden.forEach(land => {
        if (!groepen[land as string]) groepen[land as string] = [];
        groepen[land as string].push(naam);
      });
    });
    return Object.entries(groepen).sort((a, b) => b[1].length - a[1].length);
  };

  // 3. Sorteer getallen (Voor goals en kaarten)
  const sorteerCijfers = (veld: string) => {
    return [...alleToernooiV]
      .filter(v => v[veld] !== null && v[veld] !== undefined)
      .sort((a, b) => a[veld] - b[veld])
      .map(v => ({ naam: v.spelers?.naam?.split(' ')[0] || 'Onbekend', getal: v[veld] }));
  };

  // --- DATA KLAARZETTEN ---
  const themaz = [
    { id: 'winnaar', titel: '🏆 Wereldkampioen', kleur: '#CCFF00', data: groepeerOpAntwoord('winnaar') },
    { id: 'hf', titel: '🌍 Halve Finalisten', kleur: '#00E5FF', data: groepeerHalveFinalisten() },
    { id: 'topschutter', titel: '⚽ Topschutter', kleur: '#2B00FF', data: groepeerOpAntwoord('topschutter') },
    { id: 'keeper', titel: '🧤 Beste Doelman', kleur: '#7A00E6', data: groepeerOpAntwoord('beste_keeper') },
    { id: 'belgie', titel: '🇧🇪 Eindstation België', kleur: '#E30022', data: groepeerOpAntwoord('eindstation_belgie') }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {themaz.map((thema) => {
        const isOpen = openThema === thema.id;
        
        return (
          <div key={thema.id} style={{ 
            background: '#1A1423', 
            borderRadius: '16px', 
            overflow: 'hidden',
            border: isOpen ? `2px solid ${thema.kleur}` : '2px solid transparent',
            boxShadow: isOpen ? `0 4px 15px ${thema.kleur}30` : '0 4px 10px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease'
          }}>
            {/* ACCORDION HEADER */}
            <div 
              onClick={() => setOpenTheme(isOpen ? null : thema.id)}
              style={{ 
                padding: '16px 20px', 
                background: isOpen ? 'rgba(255,255,255,0.05)' : 'transparent',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <h3 style={{ margin: 0, fontFamily: 'Bebas Neue', fontSize: '1.6rem', color: isOpen ? thema.kleur : '#FFF', letterSpacing: '1px' }}>
                {thema.titel}
              </h3>
              <span style={{ color: isOpen ? thema.kleur : '#ADB5BD', fontWeight: 900 }}>
                {isOpen ? '▲' : '▼'}
              </span>
            </div>

            {/* ACCORDION INHOUD (Uitgeklapt) */}
            {isOpen && (
              <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {thema.data.map(([antwoord, namen]) => (
                  <div key={antwoord} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px', borderLeft: `4px solid ${thema.kleur}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#FFF' }}>{antwoord}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, color: thema.kleur, textTransform: 'uppercase' }}>
                        {namen.length}x gekozen
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {namen.map((naam: string, i: number) => (
                        <span key={i} style={{ background: 'rgba(255,255,255,0.1)', color: '#ADB5BD', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                          {naam}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* APARTE ACCORDION VOOR DE GETALLEN (DOELPUNTEN & KAARTEN) */}
      <div style={{ 
        background: '#1A1423', 
        borderRadius: '16px', 
        overflow: 'hidden',
        border: openThema === 'cijfers' ? '2px solid #FFF' : '2px solid transparent',
        boxShadow: openThema === 'cijfers' ? '0 4px 15px rgba(255,255,255,0.2)' : '0 4px 10px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease'
      }}>
        <div 
          onClick={() => setOpenTheme(openThema === 'cijfers' ? null : 'cijfers')}
          style={{ 
            padding: '16px 20px', 
            background: openThema === 'cijfers' ? 'rgba(255,255,255,0.05)' : 'transparent',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
          }}
        >
          <h3 style={{ margin: 0, fontFamily: 'Bebas Neue', fontSize: '1.6rem', color: '#FFF', letterSpacing: '1px' }}>
            🔢 Toernooicijfers
          </h3>
          <span style={{ color: '#ADB5BD', fontWeight: 900 }}>{openThema === 'cijfers' ? '▲' : '▼'}</span>
        </div>

        {openThema === 'cijfers' && (
          <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* TOTAAL GOALS */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#CCFF00', textTransform: 'uppercase', marginBottom: '8px' }}>Totaal Aantal Goals</div>
              <div className="hide-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
                {sorteerCijfers('totaal_goals').map((item, i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '10px', minWidth: '70px', textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.65rem', color: '#ADB5BD', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.naam}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFF' }}>{item.getal}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* GELE KAARTEN */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#00E5FF', textTransform: 'uppercase', marginBottom: '8px' }}>Totaal Gele Kaarten</div>
              <div className="hide-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
                {sorteerCijfers('totaal_gele_kaarten').map((item, i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '10px', minWidth: '70px', textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.65rem', color: '#ADB5BD', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.naam}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFF' }}>{item.getal}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RODE KAARTEN */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#E30022', textTransform: 'uppercase', marginBottom: '8px' }}>Totaal Rode Kaarten</div>
              <div className="hide-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
                {sorteerCijfers('totaal_rode_kaarten').map((item, i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '10px', minWidth: '70px', textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.65rem', color: '#ADB5BD', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.naam}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFF' }}>{item.getal}</div>
                  </div>
                ))}
              </div>
            </div>

            <style>{`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
              .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
          </div>
        )}
      </div>

    </div>
  );
}
