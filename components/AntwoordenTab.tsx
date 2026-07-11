// src/components/AntwoordenTab.tsx
import React from 'react';

// De hyper-intelligente normalisatiefunctie die ALLES begrijpt (Emojis, Engels, Caps)
const normalizeString = (teamString: string) => {
  if (!teamString) return '';
  let cleanString = teamString.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{E0060}-\u{E007F}\u{1F1E6}-\u{1F1FF}\uFE0F]/gu, '').trim();
  let searchKey = cleanString.toLowerCase();

  const vertalingen: Record<string, string> = {
    'brazil': 'Brazilië', 'brazilië': 'Brazilië',
    'morocco': 'Marokko', 'marokko': 'Marokko',
    'switzerland': 'Zwitserland', 'zwitserland': 'Zwitserland',
    'bosnia and herzegovina': 'Bosnië', 'bosnia & herzegovina': 'Bosnië', 'bosnia': 'Bosnië', 'bosnië': 'Bosnië',
    'south korea': 'Zuid-Korea', 'zuid-korea': 'Zuid-Korea',
    'south africa': 'Zuid-Afrika', 'zuid-afrika': 'Zuid-Afrika',
    'czechia': 'Tsjechië', 'czech republic': 'Tsjechië', 'tsjechië': 'Tsjechië',
    'germany': 'Duitsland', 'duitsland': 'Duitsland',
    'spain': 'Spanje', 'spanje': 'Spanje',
    'france': 'Frankrijk', 'frankrijk': 'Frankrijk',
    'netherlands': 'Nederland', 'nederland': 'Nederland',
    'belgium': 'België', 'belgië': 'België',
    'italy': 'Italië', 'italië': 'Italië',
    'argentina': 'Argentinië', 'argentinië': 'Argentinië',
    'england': 'Engeland', 'wales': 'Wales', 'scotland': 'Schotland',
    'usa': 'Verenigde Staten', 'united states': 'Verenigde Staten', 'verenigde staten': 'Verenigde Staten',
    'canada': 'Canada', 'mexico': 'Mexico', 'japan': 'Japan',
    'croatia': 'Kroatië', 'kroatië': 'Kroatië',
    'uruguay': 'Uruguay', 'senegal': 'Senegal', 'ghana': 'Ghana', 'nigeria': 'Nigeria', 'ecuador': 'Ecuador',
    'sweden': 'Zweden', 'zweden': 'Zweden',
    'denmark': 'Denemarken', 'denemarken': 'Denemarken',
    'polen': 'Polen', 'poland': 'Polen',
    'servië': 'Servië', 'serbia': 'Servië',
    'iran': 'Iran', 'saudi-arabië': 'Saudi-Arabië', 'saudi arabia': 'Saudi-Arabië',
    'oekraïne': 'Oekraïne', 'ukraine': 'Oekraïne',
    'peru': 'Peru', 'panama': 'Panama',
    'egypt': 'Egypte', 'egypte': 'Egypte',
    'tunisia': 'Tunesië', 'tunesië': 'Tunesië',
    'nieuw-zeeland': 'Nieuw-Zeeland', 'new zealand': 'Nieuw-Zeeland',
    'qatar': 'Qatar', 'ierland': 'Ierland', 'ireland': 'Ierland',
    'turkije': 'Turkije', 'turkey': 'Turkije', 'turkiye': 'Turkije', 'türkiye': 'Turkije',
    'roemenië': 'Roemenië', 'romania': 'Roemenië',
    'hongarije': 'Hongarije', 'hungary': 'Hongarije',
    'noorwegen': 'Noorwegen', 'norway': 'Noorwegen',
    'ijsland': 'IJsland', 'iceland': 'IJsland',
    'slowakije': 'Slowakije', 'slovakia': 'Slowakije',
    'irak': 'Irak', 'iraq': 'Irak',
    'paraguay': 'Paraguay', 'venezuela': 'Venezuela',
    'mali': 'Mali', 'algerije': 'Algerije', 'algeria': 'Algerije',
    'zambia': 'Zambia', 'honduras': 'Honduras', 'el salvador': 'El Salvador',
    'kaapverdië': 'Kaapverdië', 'cabo verde': 'Kaapverdië', 'cape verde': 'Kaapverdië',
    'haïti': 'Haïti', 'haiti': 'Haïti',
    'curaçao': 'Curaçao', 'curacao': 'Curaçao',
    'jordanië': 'Jordanië', 'jordan': 'Jordanië',
    'congo': 'Congo', 'congo dr': 'Congo', 'dr congo': 'Congo',
    'oezbekistan': 'Oezbekistan', 'uzbekistan': 'Oezbekistan',
    'ivoorkust': 'Ivoorkust', "cote d'ivoire": 'Ivoorkust', "côte d'ivoire": 'Ivoorkust', 'cote divoire': 'Ivoorkust',
    'kameroen': 'Kameroen', 'cameroon': 'Kameroen',
    'chili': 'Chili', 'chile': 'Chili',
    'colombia': 'Colombia', 'costa rica': 'Costa Rica',
    'oostenrijk': 'Oostenrijk', 'austria': 'Oostenrijk',
    'australië': 'Australië', 'australia': 'Australië'
  };

  let nameNL = vertalingen[searchKey] || cleanString;
  return nameNL.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

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
    const zoekSleutel = normalizeString(land);
    return defaultEmojis[zoekSleutel] || '🏳️';
  };

  // 1. DATA BEREKENEN: Topschutters & Beste Verdediging
  const teamGoalsVoor: Record<string, number> = {};
  const teamGoalsTegen: Record<string, number> = {};
  
  if (matchen) {
    matchen.forEach((match: any) => {
      if (match.thuis_score !== null && match.uit_score !== null) {
        const tScore = Number(match.thuis_score) + Number(match.extra_goals_thuis || 0);
        const uScore = Number(match.uit_score) + Number(match.extra_goals_uit || 0);
        const tTeam = normalizeString(match.thuisploeg);
        const uTeam = normalizeString(match.uitploeg);
        
        if (tTeam) {
          teamGoalsVoor[tTeam] = (teamGoalsVoor[tTeam] || 0) + tScore;
          teamGoalsTegen[tTeam] = (teamGoalsTegen[tTeam] || 0) + uScore;
        }
        if (uTeam) {
          teamGoalsVoor[uTeam] = (teamGoalsVoor[uTeam] || 0) + uScore;
          teamGoalsTegen[uTeam] = (teamGoalsTegen[uTeam] || 0) + tScore;
        }
      }
    });
  }

  const maxGoals = Object.values(teamGoalsVoor).length > 0 ? Math.max(...Object.values(teamGoalsVoor)) : -1;
  const topScorers = Object.keys(teamGoalsVoor).filter(t => teamGoalsVoor[t] === maxGoals && maxGoals > 0);

  const minTegen = Object.values(teamGoalsTegen).length > 0 ? Math.min(...Object.values(teamGoalsTegen)) : -1;
  const bestDefenses = Object.keys(teamGoalsTegen).filter(t => teamGoalsTegen[t] === minTegen && minTegen >= 0);

  // 2. DATA BEREKENEN: Eindstation België
  let echtEindstationBelgie = "";
  let belgieIsUitgeschakeld = false;
  let teamsInKnockoutVoorBelgie = new Set<string>();
  let knockoutsHebbenPloegen = false;

  if (matchen && matchen.length > 0) {
    matchen.forEach((match: any) => {
      if (match.ronde !== 'Groepsfase') {
        if (match.thuisploeg && match.thuisploeg !== '?') { teamsInKnockoutVoorBelgie.add(normalizeString(match.thuisploeg)); knockoutsHebbenPloegen = true; }
        if (match.uitploeg && match.uitploeg !== '?') { teamsInKnockoutVoorBelgie.add(normalizeString(match.uitploeg)); knockoutsHebbenPloegen = true; }
      }
    });

    if (knockoutsHebbenPloegen && !teamsInKnockoutVoorBelgie.has('belgie') && !teamsInKnockoutVoorBelgie.has('belgië')) {
       echtEindstationBelgie = 'Groepsfase';
       belgieIsUitgeschakeld = true;
    }

    matchen.forEach((match: any) => {
      if (match.ronde !== 'Groepsfase' && match.thuis_score !== null && match.uit_score !== null) {
        const isThuisBelgie = normalizeString(match.thuisploeg) === 'belgie' || normalizeString(match.thuisploeg) === 'belgië';
        const isUitBelgie = normalizeString(match.uitploeg) === 'belgie' || normalizeString(match.uitploeg) === 'belgië';
        
        if (isThuisBelgie || isUitBelgie) {
           const tScore = Number(match.thuis_score) + Number(match.extra_goals_thuis || 0);
           const uScore = Number(match.uit_score) + Number(match.extra_goals_uit || 0);
           let belgieWon = false;
           
           if (isThuisBelgie && tScore > uScore) belgieWon = true;
           else if (isUitBelgie && uScore > tScore) belgieWon = true;
           else if (tScore === uScore && match.winnaar_na_penaltys) {
               const penaltyWinner = normalizeString(match.winnaar_na_penaltys);
               if (penaltyWinner === 'belgie' || penaltyWinner === 'belgië') belgieWon = true;
           }
           
           if (!belgieWon) {
              echtEindstationBelgie = match.ronde;
              belgieIsUitgeschakeld = true;
           } else if (belgieWon && match.ronde.toLowerCase().includes('finale') && !match.ronde.toLowerCase().includes('kwart') && !match.ronde.toLowerCase().includes('halve') && !match.ronde.toLowerCase().includes('troost')) {
              echtEindstationBelgie = 'Wereldkampioen';
              belgieIsUitgeschakeld = true;
           }
        }
      }
    });
  }

  // 3. HOOFDLOGICA: Is een ploeg uitgeschakeld of nog in leven?
  const checkStatus = (land: string) => {
    const key = normalizeString(land);
    let outForTitle = false;
    let reachedSemi = false;

    if (matchen && matchen.length > 0) {
       const hasKnockoutsStarted = matchen.some((m: any) => m.ronde !== 'Groepsfase' && m.thuis_score !== null);
       const teamsInKnockout = new Set();
       
       matchen.forEach((m: any) => {
          if (m.ronde !== 'Groepsfase') {
             if (m.thuisploeg && m.thuisploeg !== '?') teamsInKnockout.add(normalizeString(m.thuisploeg));
             if (m.uitploeg && m.uitploeg !== '?') teamsInKnockout.add(normalizeString(m.uitploeg));
          }
          
          const rondeLower = m.ronde.toLowerCase();
          if (rondeLower.includes('halve') || rondeLower.includes('troost') || rondeLower.includes('finale')) {
             if (m.thuisploeg && normalizeString(m.thuisploeg) === key) reachedSemi = true;
             if (m.uitploeg && normalizeString(m.uitploeg) === key) reachedSemi = true;
          }
       });

       // 1. Is het toernooi al in de knock-outs, maar dit land niet?
       if (hasKnockoutsStarted && key && !teamsInKnockout.has(key)) {
          outForTitle = true;
       }

       // 2. Heeft dit land een besliste wedstrijd verloren in de knock-outs?
       matchen.forEach((m: any) => {
          if (m.ronde !== 'Groepsfase' && m.thuis_score !== null && m.uit_score !== null) {
             const tScore = Number(m.thuis_score) + Number(m.extra_goals_thuis || 0);
             const uScore = Number(m.uit_score) + Number(m.extra_goals_uit || 0);
             let loser = null;
             
             if (tScore > uScore) loser = m.uitploeg;
             else if (uScore > tScore) loser = m.thuisploeg;
             else if (m.winnaar_na_penaltys) {
                // Als het gelijk is, check wie er de penalties NIET won
                loser = normalizeString(m.winnaar_na_penaltys) === normalizeString(m.thuisploeg) ? m.uitploeg : m.thuisploeg;
             }

             if (loser && normalizeString(loser) === key) {
                outForTitle = true;
             }
          }
       });
    }

    // De absolute gouden regel: Je bent pas uitgeschakeld voor de Halve finale 
    // als je dood bent én nooit de halve finale hebt gehaald.
    const outBeforeSemi = outForTitle && !reachedSemi;

    return { outForTitle, reachedSemi, outBeforeSemi };
  };

  const groepeerData = (veld: string) => {
    const groepen: Record<string, string[]> = {};
    alleToernooiV.forEach((v: any) => {
      let val = v[veld];
      if (!val) return;
      
      // We gebruiken string cleaning ZONDER de emoji te wissen voor de display naam
      let displayNaam = val.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{E0060}-\u{E007F}\u{1F1E6}-\u{1F1FF}\uFE0F]/gu, '').trim();
      displayNaam = displayNaam.charAt(0).toUpperCase() + displayNaam.slice(1).toLowerCase();
      
      if (!groepen[displayNaam]) groepen[displayNaam] = [];
      const voornaam = v.spelers?.naam?.split(' ')[0] || 'Onbekend';
      groepen[displayNaam].push(voornaam);
    });
    return Object.entries(groepen).sort((a, b) => b[1].length - a[1].length);
  };

  const groepeerHalveFinalisten = () => {
    const groepen: Record<string, string[]> = {};
    alleToernooiV.forEach((v: any) => {
      const voornaam = v.spelers?.naam?.split(' ')[0] || 'Onbekend';
      [v.halve_finalist_1, v.halve_finalist_2, v.halve_finalist_3, v.halve_finalist_4].forEach(hf => {
        if (!hf) return;
        let displayNaam = hf.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{E0060}-\u{E007F}\u{1F1E6}-\u{1F1FF}\uFE0F]/gu, '').trim();
        displayNaam = displayNaam.charAt(0).toUpperCase() + displayNaam.slice(1).toLowerCase();
        
        if (!groepen[displayNaam]) groepen[displayNaam] = [];
        groepen[displayNaam].push(voornaam);
      });
    });
    return Object.entries(groepen).sort((a, b) => b[1].length - a[1].length);
  };

  const renderKampen = (data: [string, string[]][], primaryColor: string, type: 'winnaar' | 'halve' | 'aanval' | 'verdediging' | 'belgie') => {
    if (data.length === 0) return <div style={{ color: '#ADB5BD', fontSize: '0.8rem', fontStyle: 'italic' }}>Nog geen data beschikbaar.</div>;
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
        {data.map(([land, spelers], index) => {
          
          const { outForTitle, reachedSemi, outBeforeSemi } = checkStatus(land);
          const normalizedLand = normalizeString(land);
          let isDead = false;
          let isSuccess = false;
          let badge = null;

          if (type === 'winnaar') {
             isDead = outForTitle;
             if (isDead) badge = <div style={{ background: 'var(--wk-red)', color: '#FFF', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '6px', fontWeight: 900, textTransform: 'uppercase', marginTop: '5px', display: 'inline-block' }}>❌ Uitgeschakeld</div>;
          } else if (type === 'halve') {
             isDead = outBeforeSemi;
             isSuccess = reachedSemi;
             if (isSuccess) badge = <div style={{ background: 'var(--wk-lime)', color: '#111827', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '6px', fontWeight: 900, textTransform: 'uppercase', marginTop: '5px', display: 'inline-block' }}>✅ Gehaald</div>;
             else if (isDead) badge = <div style={{ background: 'var(--wk-red)', color: '#FFF', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '6px', fontWeight: 900, textTransform: 'uppercase', marginTop: '5px', display: 'inline-block' }}>❌ Uitgeschakeld</div>;
          } else if (type === 'aanval') {
             const isKoploper = topScorers.includes(normalizedLand);
             isDead = outForTitle && !isKoploper;
             
             if (isDead) {
                badge = <div style={{ background: 'rgba(255,255,255,0.1)', color: '#ADB5BD', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '6px', fontWeight: 900, textTransform: 'uppercase', marginTop: '5px', display: 'inline-block' }}>💀 Toernooi Verlaten</div>;
             } else if (outForTitle && isKoploper) {
                badge = <div style={{ background: 'rgba(204, 255, 0, 0.15)', color: 'var(--wk-lime)', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '6px', fontWeight: 900, textTransform: 'uppercase', marginTop: '5px', display: 'inline-block', border: '1px solid var(--wk-lime)' }}>⚠️ Koploper (Uit)</div>;
             }
          } else if (type === 'verdediging') {
             const isKoploper = bestDefenses.includes(normalizedLand);
             isDead = outForTitle && !isKoploper;
             
             if (isDead) {
                badge = <div style={{ background: 'rgba(255,255,255,0.1)', color: '#ADB5BD', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '6px', fontWeight: 900, textTransform: 'uppercase', marginTop: '5px', display: 'inline-block' }}>💀 Toernooi Verlaten</div>;
             } else if (outForTitle && isKoploper) {
                badge = <div style={{ background: 'rgba(122, 0, 230, 0.15)', color: 'var(--wk-purple)', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '6px', fontWeight: 900, textTransform: 'uppercase', marginTop: '5px', display: 'inline-block', border: '1px solid var(--wk-purple)' }}>⚠️ Koploper (Uit)</div>;
             }
          } else if (type === 'belgie') {
              const normOptie = normalizeString(land);
              const normEcht = normalizeString(echtEindstationBelgie);
              
              if (belgieIsUitgeschakeld) {
                  if (normOptie === normEcht || normOptie.includes(normEcht) || normEcht.includes(normOptie) || (normOptie === 'winnaar' && normEcht === 'wereldkampioen') || (normOptie === 'wereldkampioen' && normEcht === 'winnaar')) {
                      isSuccess = true;
                      badge = <div style={{ background: 'var(--wk-lime)', color: '#111827', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '6px', fontWeight: 900, textTransform: 'uppercase', marginTop: '5px', display: 'inline-block' }}>✅ Correct</div>;
                  } else {
                      isDead = true;
                      badge = <div style={{ background: 'var(--wk-red)', color: '#FFF', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '6px', fontWeight: 900, textTransform: 'uppercase', marginTop: '5px', display: 'inline-block' }}>❌ Fout</div>;
                  }
              } else {
                  if (knockoutsHebbenPloegen) {
                       if (normOptie === 'groepsfase') {
                            isDead = true;
                            badge = <div style={{ background: 'var(--wk-red)', color: '#FFF', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '6px', fontWeight: 900, textTransform: 'uppercase', marginTop: '5px', display: 'inline-block' }}>❌ Fout</div>;
                       }
                  }
              }
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
          {renderKampen(kampAanval, 'var(--wk-lime)', 'aanval')}
        </div>
        <div>
          <h2 className="sectie-titel" style={{ color: 'var(--wk-purple)' }}><span>🛡️</span> BESTE VERDEDIGING <span style={{fontSize: '1rem', color: '#ADB5BD'}}>(3 PT)</span></h2>
          {renderKampen(kampVerdediging, 'var(--wk-purple)', 'verdediging')}
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
