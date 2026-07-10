// src/components/AntwoordenTab.tsx
import React from 'react';

const normalize = (s: string) => s ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : '';

export default function AntwoordenTab({ nu, DEADLINE_DATE, alleToernooiV, matchen }: any) {
  
  const defaultEmojis: Record<string, string> = {
    'belgië': '🇧🇪', 'nederland': '🇳🇱', 'frankrijk': '🇫🇷', 'duitsland': '🇩🇪', 'spanje': '🇪🇸',
    'brazilië': '🇧🇷', 'argentinië': '🇦🇷', 'portugal': '🇵🇹', 'italië': '🇮🇹', 'engeland': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'mexico': '🇲🇽', 'verenigde staten': '🇺🇸', 'canada': '🇨🇦', 'marokko': '🇲🇦',
    'chili': '🇨🇱', 'kameroen': '🇨🇲', 'colombia': '🇨🇴', 'costa rica': '🇨🇷', 'zwitserland': '🇨🇭',
    'ivoorkust': '🇨🇮', 'oostenrijk': '🇦🇹', 'australië': '🇦🇺', 'japan': '🇯🇵', 'zuid-korea': '🇰🇷',
    'kroatië': '🇭🇷', 'uruguay': '🇺🇾', 'senegal': '🇸🇳', 'ghana': '🇬🇭', 'nigeria': '🇳🇬', 
    'ecuador': '🇪🇨', 'zweden': '🇸🇪', 'denemarken': '🇩🇰', 'schotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'polen': '🇵🇱', 
    'servië': '🇷🇸', 'iran': '🇮🇷', 'saudi-arabië': '🇸🇦', 'wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'oekraïne': '🇺🇦', 
    'peru': '🇵🇪', 'panama': '🇵🇦', 'egypte': '🇪🇬', 'tunesië': '🇹🇳', 'nieuw-zeeland': '🇳🇿', 
    'qatar': '🇶🇦', 'ierland': '🇮🇪', 'turkije': '🇹🇷', 'zuid-afrika': '🇿🇦', 'tsjechië': '🇨🇿', 
    'roemenië': '🇷🇴', 'hongarije': '🇭🇺', 'noorwegen': '🇳🇴', 'ijsland': '🇮🇸', 'slowakije': '🇸🇰'
  };

  const krijgEmoji = (land: string) => {
    if (!land) return '🏳️';
    const zoekSleutel = land.trim().toLowerCase();
    return defaultEmojis[zoekSleutel] || '🏳️';
  };

  // Functie die live in de matchen-tabel kijkt om te zien of een land definitief naar huis is
  const checkStatus = (land: string) => {
    const key = normalize(land);
    let outForTitle = false;
    let reachedSemi = false;
    let outBeforeSemi = false;

    if (matchen && matchen.length > 0) {
       const hasKnockoutsStarted = matchen.some((m: any) => m.ronde !== 'Groepsfase' && m.thuis_score !== null);
       const teamsInKnockout = new Set();
       
       matchen.forEach((m: any) => {
          if (m.ronde !== 'Groepsfase') {
             if (m.thuisploeg) teamsInKnockout.add(normalize(m.thuisploeg));
             if (m.uitploeg) teamsInKnockout.add(normalize(m.uitploeg));
          }
          if (m.ronde === 'Halve finale' || m.ronde === 'Troostfinale' || m.ronde === 'Finale') {
             if (normalize(m.thuisploeg) === key) reachedSemi = true;
             if (normalize(m.uitploeg) === key) reachedSemi = true;
          }
       });

       // Ligt eruit in de groepsfase (zit niet in de knock-outs)
       if (hasKnockoutsStarted && !teamsInKnockout.has(key)) {
          outForTitle = true;
          outBeforeSemi = true;
       }

       // Ligt eruit door een verloren knock-out match
       matchen.forEach((m: any) => {
          if (m.ronde !== 'Groepsfase' && m.thuis_score !== null) {
             const tScore = Number(m.thuis_score) + Number(m.extra_goals_thuis || 0);
             const uScore = Number(m.uit_score) + Number(m.extra_goals_uit || 0);
             let loser = null;
             
             if (tScore > uScore) loser = m.uitploeg;
             else if (uScore > tScore) loser = m.thuisploeg;
             else {
                loser = m.winnaar_na_penaltys === m.thuisploeg ? m.uitploeg : m.thuisploeg;
             }

             if (loser && normalize(loser) === key) {
                outForTitle = true;
                if (m.ronde === 'Ronde van 32' || m.ronde === 'Achtste finale' || m.ronde === 'Kwartfinale') {
                   outBeforeSemi = true;
                }
             }
          }
       });
    }

    return { outForTitle, reachedSemi, outBeforeSemi };
  };

  const groepeerData = (veld: string) => {
    const groepen: Record<string, string[]> = {};
    alleToernooiV.forEach((v: any) => {
      let val = v[veld];
      if (!val) return;
      val = val.trim();
      const cleanVal = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
      if (!groepen[cleanVal]) groepen[cleanVal] = [];
      const voornaam = v.spelers?.naam?.split(' ')[0] || 'Onbekend';
      groepen[cleanVal].push(voornaam);
    });
    return Object.entries(groepen).sort((a, b) => b[1].length - a[1].length);
  };

  const groepeerHalveFinalisten = () => {
    const groepen: Record<string, string[]> = {};
    alleToernooiV.forEach((v: any) => {
      const voornaam = v.spelers?.naam?.split(' ')[0] || 'Onbekend';
      [v.halve_finalist_1, v.halve_finalist_2, v.halve_finalist_3, v.halve_finalist_4].forEach(hf => {
        if (!hf) return;
        const cleanVal = hf.trim().charAt(0).toUpperCase() + hf.trim().slice(1).toLowerCase();
        if (!groepen[cleanVal]) groepen[cleanVal] = [];
        groepen[cleanVal].push(voornaam);
      });
    });
    return Object.entries(groepen).sort((a, b) => b[1].length - a[1].length);
  };

  const renderKampen = (data: [string, string[]][], primaryColor: string, type: 'winnaar' | 'halve' | 'andere' | 'belgie') => {
    if (data.length === 0) return <div style={{ color: '#ADB5BD', fontSize: '0.8rem', fontStyle: 'italic' }}>Nog geen data beschikbaar.</div>;
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
        {data.map(([land, spelers], index) => {
          
          const { outForTitle, reachedSemi, outBeforeSemi } = checkStatus(land);
          let isDead = false;
          let isSuccess = false;
          let badge = null;

          if (type === 'winnaar') {
             isDead = outForTitle;
             if (isDead) badge = <div style={{ background: 'var(--wk-red)', color: '#FFF', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '6px', fontWeight: 900, textTransform: 'uppercase', marginTop: '5px', display: 'inline-block' }}>❌ Uitgeschakeld</div>;
          } else if (type === 'halve') {
             isDead = outBeforeSemi;
             isSuccess = reachedSemi;
             if (isDead) badge = <div style={{ background: 'var(--wk-red)', color: '#FFF', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '6px', fontWeight: 900, textTransform: 'uppercase', marginTop: '5px', display: 'inline-block' }}>❌ Uitgeschakeld</div>;
             if (isSuccess) badge = <div style={{ background: 'var(--wk-lime)', color: '#111827', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '6px', fontWeight: 900, textTransform: 'uppercase', marginTop: '5px', display: 'inline-block' }}>✅ Gehaald</div>;
          } else if (type === 'andere') {
             if (outForTitle) badge = <div style={{ background: 'rgba(255,255,255,0.1)', color: '#ADB5BD', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '6px', fontWeight: 900, textTransform: 'uppercase', marginTop: '5px', display: 'inline-block' }}>💀 Toernooi Verlaten</div>;
          }

          return (
            <div key={index} style={{ 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '16px', 
              border: isSuccess ? `2px solid var(--wk-lime)` : `1px solid rgba(255,255,255,0.1)`, 
              borderTop: `4px solid ${isDead ? '#333' : isSuccess ? 'var(--wk-lime)' : primaryColor}`, 
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
              opacity: isDead ? 0.5 : 1, filter: isDead ? 'grayscale(100%)' : 'none',
              transition: '0.3s'
            }}>
              <div style={{ padding: '12px 10px', background: 'rgba(0,0,0,0.2)', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: isDead ? '#ADB5BD' : '#FFF', textTransform: 'uppercase' }}>
                  <span style={{ marginRight: '6px' }}>{krijgEmoji(land)}</span>
                  <span style={{ textDecoration: isDead ? 'line-through' : 'none' }}>{land}</span>
                </div>
                {badge}
                {!isDead && !isSuccess && <div style={{ fontSize: '0.6rem', color: primaryColor, fontWeight: 900, marginTop: badge ? '4px' : '2px' }}>{spelers.length} {spelers.length === 1 ? 'STEM' : 'STEMMEN'}</div>}
              </div>
              <div style={{ padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                {spelers.map((speler, i) => (
                  <span key={i} style={{ background: 'rgba(255,255,255,0.1)', color: '#FFF', fontSize: '0.65rem', fontWeight: 800, padding: '4px 8px', borderRadius: '8px' }}>
                    {speler}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCijferLijn = (veld: string, color: string, eenheid: string) => {
    const sorted = alleToernooiV
      .filter((v: any) => v[veld] !== null && v[veld] !== undefined)
      .map((v: any) => ({ naam: v.spelers?.naam?.split(' ')[0] || '?', val: Number(v[veld]) }))
      .sort((a: any, b: any) => a.val - b.val);

    if (sorted.length === 0) return null;

    return (
      <div className="hide-scroll" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
        {sorted.map((s: any, i: number) => (
          <div key={i} style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${color}`, borderRadius: '12px', padding: '12px 15px', minWidth: '70px', textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: color, fontFamily: 'Bebas Neue', lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: '0.55rem', color: '#ADB5BD', fontWeight: 900, textTransform: 'uppercase', marginTop: '4px' }}>{s.naam}</div>
          </div>
        ))}
      </div>
    );
  };

  if (nu < DEADLINE_DATE) {
    return (
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px 20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🕵️‍♂️</div>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: 'var(--wk-lime)', margin: '0 0 10px 0', letterSpacing: '1px' }}>ANTWOORDEN VERBORGEN</h2>
        <p style={{ color: '#ADB5BD', fontSize: '0.9rem', fontWeight: 800, lineHeight: 1.5 }}>
          Geen spionage toegestaan! De antwoorden van de andere spelers blijven strikt geheim tot de aftrap van de allereerste match.
        </p>
      </div>
    );
  }

  const kampWereldkampioen = groepeerData('winnaar');
  const kampHalveFinalisten = groepeerHalveFinalisten();
  const kampAanval = groepeerData('topschutter');
  const kampVerdediging = groepeerData('beste_keeper');
  const kampBelgie = groepeerData('eindstation_belgie');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .sectie-titel { 
          font-family: 'Bebas Neue', sans-serif; 
          font-size: 2rem; 
          margin: 0 0 10px 0; 
          letter-spacing: 1px; 
          display: flex; 
          align-items: center; 
          gap: 10px; 
        }
      `}</style>

      <div style={{ background: '#1A1423', borderRadius: '16px', padding: '15px', borderLeft: '4px solid var(--wk-lime)' }}>
         <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: 'var(--wk-lime)', textTransform: 'uppercase', fontWeight: 900 }}>⚔️ De Survival Race</h3>
         <div style={{ fontSize: '0.75rem', color: '#ADB5BD', fontWeight: 800 }}>Vallen de teams in jouw kamp uit de boot? Dan verdwijnt je land uit de race. Check hier wie er nog overblijft!</div>
      </div>

      {/* WERELDKAMPIOEN */}
      <div>
        <h2 className="sectie-titel" style={{ color: '#FFD700' }}><span>👑</span> WERELDKAMPIOEN <span style={{fontSize: '1rem', color: '#ADB5BD'}}>(5 PT)</span></h2>
        {renderKampen(kampWereldkampioen, '#FFD700', 'winnaar')}
      </div>

      {/* HALVE FINALISTEN */}
      <div>
        <h2 className="sectie-titel" style={{ color: 'var(--wk-aqua)' }}><span>🚀</span> HALVE FINALISTEN <span style={{fontSize: '1rem', color: '#ADB5BD'}}>(3 PT)</span></h2>
        {renderKampen(kampHalveFinalisten, 'var(--wk-aqua)', 'halve')}
      </div>

      {/* AANVAL & VERDEDIGING */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 className="sectie-titel" style={{ color: 'var(--wk-lime)' }}><span>⚽</span> BESTE AANVAL <span style={{fontSize: '1rem', color: '#ADB5BD'}}>(3 PT)</span></h2>
          {renderKampen(kampAanval, 'var(--wk-lime)', 'andere')}
        </div>
        <div>
          <h2 className="sectie-titel" style={{ color: 'var(--wk-purple)' }}><span>🛡️</span> BESTE VERDEDIGING <span style={{fontSize: '1rem', color: '#ADB5BD'}}>(3 PT)</span></h2>
          {renderKampen(kampVerdediging, 'var(--wk-purple)', 'andere')}
        </div>
      </div>

      {/* EINDSTATION BELGIË */}
      <div>
        <h2 className="sectie-titel" style={{ color: 'var(--wk-orange)' }}><span>🍟</span> EINDSTATION BELGIË <span style={{fontSize: '1rem', color: '#ADB5BD'}}>(3 PT)</span></h2>
        {renderKampen(kampBelgie, 'var(--wk-orange)', 'belgie')}
      </div>

      {/* DE CIJFERS (Mini Klassementjes) */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px', marginTop: '10px' }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2.2rem', color: '#FFF', margin: '0 0 20px 0', textAlign: 'center', letterSpacing: '1px' }}>🔢 DE CIJFER RACE <span style={{fontSize: '1.2rem', color: '#ADB5BD'}}>(5 PT)</span></h2>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--wk-lime)', textTransform: 'uppercase', marginBottom: '8px' }}>Totaal Aantal Goals:</div>
          {renderCijferLijn('totaal_goals', 'var(--wk-lime)', 'Goals')}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--wk-aqua)', textTransform: 'uppercase', marginBottom: '8px' }}>Totaal Gele Kaarten:</div>
          {renderCijferLijn('totaal_gele_kaarten', 'var(--wk-aqua)', 'Geel')}
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--wk-red)', textTransform: 'uppercase', marginBottom: '8px' }}>Totaal Rode Kaarten:</div>
          {renderCijferLijn('totaal_rode_kaarten', 'var(--wk-red)', 'Rood')}
        </div>
      </div>

    </div>
  );
}
