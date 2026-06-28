// src/components/TellersTab.tsx
import React, { useMemo, useState } from 'react';

const parseTeam = (teamString: string) => {
  if (!teamString) return { name: '', emoji: '🏳️' };
  let cleanString = teamString.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{E0060}-\u{E007F}\u{1F1E6}-\u{1F1FF}]/gu, '').trim();
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
    'england': 'Engeland', 'wales': 'Wales', 'scotland': 'Schotland', 'schotland': 'Schotland',
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
  const searchFinalKey = nameNL.toLowerCase();

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
    'roemenië': '🇷🇴', 'hongarije': '🇭🇺', 'noorwegen': '🇳🇴', 'ijsland': '🇮🇸', 'slowakije': '🇸🇰', 
    'irak': '🇮🇶', 'paraguay': '🇵🇾', 'venezuela': '🇻🇪', 'mali': '🇲🇱', 'algerije': '🇩🇿', 
    'zambia': '🇿🇲', 'honduras': '🇭🇳', 'el salvador': '🇸🇻', 'bosnië': '🇧🇦',
    'kaapverdië': '🇨🇻', 'haïti': '🇭🇹', 'curaçao': '🇨🇼', 'jordanië': '🇯🇴', 
    'congo': '🇨🇩', 'oezbekistan': '🇺🇿'
  };

  let emoji = defaultEmojis[searchFinalKey] || '🏳️';
  
  return { name: nameNL, emoji };
};

const normalizeString = (str: string) => {
  if (!str) return '';
  const cleanName = parseTeam(str).name;
  return cleanName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

const formatGemiddelde = (waarde: number, aantalMatchen: number) => {
  if (waarde === 0 || aantalMatchen === 0) return '0.0 /m';
  const gem = waarde / aantalMatchen;
  
  if (gem < 0.4) {
    const perMatch = Math.round(aantalMatchen / waarde);
    return `1 per ${perMatch}m`;
  }
  
  return `${gem.toFixed(1)} /m`;
};

const formateerNaam = (volledigeNaam: string) => {
  if (!volledigeNaam) return 'Onbekend';
  const delen = volledigeNaam.trim().split(' ');
  const voornaam = delen[0];
  if (voornaam.toLowerCase() === 'kristof' && delen.length > 1) {
    return `${voornaam} ${delen[1].charAt(0)}.`;
  }
  return voornaam;
};

export default function TellersTab({ matchen = [], alleToernooiV = [] }: any) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const stats = useMemo(() => {
    let totaleGoals = 0;
    let totaleGeel = 0;
    let totaleRood = 0;
    let gespeeldeMatchenCount = 0;

    const teamGoalsVoor: Record<string, number> = {};
    const teamGoalsTegen: Record<string, number> = {};
    const teamGespeeld: Record<string, number> = {};

    matchen.forEach((m: any) => {
      if (m.thuis_score !== null && m.thuis_score !== '' && m.uit_score !== null && m.uit_score !== '') {
        gespeeldeMatchenCount++;
        
        const thuisScore = Number(m.thuis_score) + Number(m.extra_goals_thuis || 0);
        const uitScore = Number(m.uit_score) + Number(m.extra_goals_uit || 0);

        totaleGoals += (thuisScore + uitScore);
        totaleGeel += Number(m.gele_kaarten || 0);
        totaleRood += Number(m.rode_kaarten || 0);

        teamGoalsVoor[m.thuisploeg] = (teamGoalsVoor[m.thuisploeg] || 0) + thuisScore;
        teamGoalsVoor[m.uitploeg] = (teamGoalsVoor[m.uitploeg] || 0) + uitScore;

        teamGoalsTegen[m.thuisploeg] = (teamGoalsTegen[m.thuisploeg] || 0) + uitScore;
        teamGoalsTegen[m.uitploeg] = (teamGoalsTegen[m.uitploeg] || 0) + thuisScore;

        teamGespeeld[m.thuisploeg] = (teamGespeeld[m.thuisploeg] || 0) + 1;
        teamGespeeld[m.uitploeg] = (teamGespeeld[m.uitploeg] || 0) + 1;
      }
    });

    const totaleMatchenToernooi = matchen.length > 0 ? matchen.length : 104;

    const topAanval = Object.entries(teamGoalsVoor)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); 

    const topVerdediging = Object.entries(teamGoalsTegen)
      .filter(([team]) => teamGespeeld[team] > 0)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 5); 

    return { 
      totaleGoals, totaleGeel, totaleRood, 
      gespeeldeMatchenCount, totaleMatchenToernooi,
      topAanval, topVerdediging, 
      matchenGespeeld: Object.keys(teamGespeeld).length > 0 
    };
  }, [matchen]);

  const actueelGemiddeldeGoals = formatGemiddelde(stats.totaleGoals, stats.gespeeldeMatchenCount);
  const actueelGemiddeldeGeel = formatGemiddelde(stats.totaleGeel, stats.gespeeldeMatchenCount);
  const actueelGemiddeldeRood = formatGemiddelde(stats.totaleRood, stats.gespeeldeMatchenCount);

  const renderTimeline = (title: string, emoji: string, themeHex: string, actualValue: number, field: string) => {
    const validPreds = alleToernooiV
      .filter((v: any) => v[field] !== null && v[field] !== undefined)
      .map((v: any) => ({
        id: v.speler_id || Math.random(),
        naam: formateerNaam(v.spelers?.naam),
        value: Number(v[field]),
        diff: Math.abs(Number(v[field]) - actualValue)
      }))
      .sort((a: any, b: any) => a.value - b.value);

    if (validPreds.length === 0) {
      return <div style={{ textAlign: 'center', color: '#ADB5BD', fontSize: '0.8rem', padding: '20px' }}>Nog geen voorspellingen ingevuld...</div>;
    }

    const actueelGemiddelde = stats.gespeeldeMatchenCount > 0 
        ? formatGemiddelde(actualValue, stats.gespeeldeMatchenCount)
        : '0.0 /m';

    let markerInserted = false;
    const combinedList: any[] = [];

    validPreds.forEach((pred: any) => {
      if (!markerInserted && actualValue < pred.value) {
        combinedList.push({ type: 'marker', value: actualValue });
        markerInserted = true;
      }
      combinedList.push({ type: 'player', ...pred });
    });

    if (!markerInserted) {
      combinedList.push({ type: 'marker', value: actualValue });
    }

    let hasPassedMarker = false;

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {combinedList.map((item, index) => {
          if (item.type === 'marker') hasPassedMarker = true;

          const isPassed = item.type === 'player' && item.value < actualValue;
          const isMarker = item.type === 'marker';
          const isFirst = index === 0;
          const isLast = index === combinedList.length - 1;

          const darkColor = 'rgba(255,255,255,0.15)';
          const brightColor = themeHex;

          const topLineColor = (hasPassedMarker && !isMarker) ? brightColor : darkColor;
          const bottomLineColor = hasPassedMarker ? brightColor : darkColor;

          const spelerGemiddelde = formatGemiddelde(item.value, stats.totaleMatchenToernooi);

          return (
            <div key={index} style={{ display: 'flex', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px', flexShrink: 0 }}>
                <div style={{ width: '4px', flex: 1, background: topLineColor, opacity: isFirst ? 0 : 1 }} />
                
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30px', margin: '4px 0' }}>
                  {isMarker ? (
                     <div style={{ fontSize: '1.8rem', zIndex: 2, filter: `drop-shadow(0 0 10px ${themeHex})` }}>{emoji}</div>
                  ) : (
                     <div style={{ 
                         width: '14px', height: '14px', borderRadius: '50%', 
                         background: isPassed ? '#1A1423' : themeHex, 
                         border: `3px solid ${isPassed ? darkColor : themeHex}`,
                         zIndex: 2,
                         boxShadow: isPassed ? 'none' : `0 0 10px ${themeHex}`
                     }} />
                  )}
                </div>
                
                <div style={{ width: '4px', flex: 1, background: bottomLineColor, opacity: isLast ? 0 : 1 }} />
              </div>

              <div style={{ flex: 1, padding: '4px 0', paddingLeft: '10px', display: 'flex', alignItems: 'center' }}>
                {isMarker ? (
                   <div style={{ 
                       background: `linear-gradient(90deg, ${themeHex} 0%, transparent 100%)`, 
                       color: '#000', padding: '6px 12px', borderRadius: '8px', 
                       display: 'flex', flexDirection: 'column', borderLeft: `4px solid #FFF`,
                       boxShadow: `0 4px 15px ${themeHex}40`
                   }}>
                     <span style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>
                       HUIDIGE STAND: {actualValue}
                     </span>
                     {stats.gespeeldeMatchenCount > 0 && (
                       <span style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.8, marginTop: '2px' }}>
                         ≈ {actueelGemiddelde}
                       </span>
                     )}
                   </div>
                ) : (
                   <div style={{ 
                       width: '100%',
                       background: isPassed ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.05)', 
                       borderRadius: '12px', padding: '10px 15px', display: 'flex', 
                       justifyContent: 'space-between', alignItems: 'center', 
                       border: `1px solid ${isPassed ? 'transparent' : `${themeHex}40`}`, 
                       opacity: isPassed ? 0.4 : 1, 
                       transition: 'all 0.3s'
                   }}>
                      <div>
                         <div style={{ fontWeight: 900, color: isPassed ? '#ADB5BD' : '#FFF', fontSize: '1.1rem', textDecoration: isPassed ? 'line-through' : 'none' }}>
                           {item.naam}
                         </div>
                         <div style={{ fontSize: '0.7rem', color: isPassed ? '#6C757D' : themeHex, fontWeight: 800, marginTop: '2px', display: 'flex', gap: '8px' }}>
                            <span>{item.diff === 0 ? 'Spot on! 🔥' : `Afstand: ${item.diff}`}</span>
                            <span style={{ opacity: 0.5 }}>|</span>
                            <span style={{ color: '#ADB5BD' }}>Gok: {spelerGemiddelde}</span>
                         </div>
                      </div>
                      <div style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: isPassed ? '#6C757D' : themeHex }}>
                         {item.value}
                      </div>
                   </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    );
  };

  const getHeaderStyle = (section: string, themeHex: string) => {
    const isOpen = openSection === section;
    return {
      background: isOpen ? themeHex : '#1A1423',
      color: isOpen ? '#000' : '#FFF',
      borderRadius: isOpen ? '16px 16px 0 0' : '16px',
      padding: '15px 20px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      border: `2px solid ${isOpen ? themeHex : `${themeHex}40`}`,
      cursor: 'pointer',
      boxShadow: isOpen ? `0 4px 15px ${themeHex}30` : 'none',
      transition: 'all 0.2s',
      position: 'relative' as any,
      zIndex: 2
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* TOTALE GOALS */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div onClick={() => setOpenSection(openSection === 'goals' ? null : 'goals')} style={getHeaderStyle('goals', '#CCFF00')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '2rem' }}>⚽</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', lineHeight: 1, color: openSection === 'goals' ? '#000' : '#CCFF00' }}>
                    {stats.totaleGoals}
                  </span>
                  {stats.gespeeldeMatchenCount > 0 && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, opacity: openSection === 'goals' ? 0.8 : 0.6, color: openSection === 'goals' ? '#000' : '#FFF' }}>
                      (≈ {actueelGemiddeldeGoals})
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', opacity: openSection === 'goals' ? 0.8 : 0.6 }}>
                  Totale Goals
                </div>
              </div>
            </div>
            <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>{openSection === 'goals' ? '▲' : '▼'}</div>
          </div>
          {openSection === 'goals' && (
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '0 0 16px 16px', marginTop: '-10px', paddingTop: '20px', paddingBottom: '10px', paddingLeft: '10px', paddingRight: '15px', border: '1px solid rgba(204, 255, 0, 0.2)', borderTop: 'none' }}>
              {renderTimeline('Totale Goals', '⚽', '#CCFF00', stats.totaleGoals, 'totaal_goals')}
            </div>
          )}
        </div>

        {/* GELE KAARTEN */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div onClick={() => setOpenSection(openSection === 'geel' ? null : 'geel')} style={getHeaderStyle('geel', '#00E5FF')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '2rem' }}>🟨</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', lineHeight: 1, color: openSection === 'geel' ? '#000' : '#00E5FF' }}>
                    {stats.totaleGeel}
                  </span>
                  {stats.gespeeldeMatchenCount > 0 && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, opacity: openSection === 'geel' ? 0.8 : 0.6, color: openSection === 'geel' ? '#000' : '#FFF' }}>
                      (≈ {actueelGemiddeldeGeel})
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', opacity: openSection === 'geel' ? 0.8 : 0.6 }}>
                  Gele Kaarten
                </div>
              </div>
            </div>
            <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>{openSection === 'geel' ? '▲' : '▼'}</div>
          </div>
          {openSection === 'geel' && (
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '0 0 16px 16px', marginTop: '-10px', paddingTop: '20px', paddingBottom: '10px', paddingLeft: '10px', paddingRight: '15px', border: '1px solid rgba(0, 229, 255, 0.2)', borderTop: 'none' }}>
              {renderTimeline('Gele Kaarten', '🟨', '#00E5FF', stats.totaleGeel, 'totaal_gele_kaarten')}
            </div>
          )}
        </div>

        {/* RODE KAARTEN */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div onClick={() => setOpenSection(openSection === 'rood' ? null : 'rood')} style={getHeaderStyle('rood', '#E30022')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '2rem' }}>🟥</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', lineHeight: 1, color: openSection === 'rood' ? '#000' : '#E30022' }}>
                    {stats.totaleRood}
                  </span>
                  {stats.gespeeldeMatchenCount > 0 && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, opacity: openSection === 'rood' ? 0.8 : 0.6, color: openSection === 'rood' ? '#000' : '#FFF' }}>
                      (≈ {actueelGemiddeldeRood})
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', opacity: openSection === 'rood' ? 0.8 : 0.6 }}>
                  Rode Kaarten
                </div>
              </div>
            </div>
            <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>{openSection === 'rood' ? '▲' : '▼'}</div>
          </div>
          {openSection === 'rood' && (
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '0 0 16px 16px', marginTop: '-10px', paddingTop: '20px', paddingBottom: '10px', paddingLeft: '10px', paddingRight: '15px', border: '1px solid rgba(227, 0, 34, 0.2)', borderTop: 'none' }}>
              {renderTimeline('Rode Kaarten', '🟥', '#E30022', stats.totaleRood, 'totaal_rode_kaarten')}
            </div>
          )}
        </div>
      </div>

      {!stats.matchenGespeeld && (
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', textAlign: 'center', color: '#ADB5BD', fontWeight: 900, fontSize: '0.85rem' }}>
          ⏳ De toernooistatistieken worden zichtbaar zodra de eerste wedstrijd is afgelopen.
        </div>
      )}

      {stats.matchenGespeeld && (
        <div style={{ background: '#1A1423', borderRadius: '16px', padding: '20px', border: '2px solid #2B00FF', boxShadow: '0 4px 15px rgba(43, 0, 255, 0.2)' }}>
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#2B00FF', margin: '0 0 15px 0', textAlign: 'center', letterSpacing: '1px' }}>
            ⚔️ MEEST SCORENDE TEAMS (TOP 5)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.topAanval.map(([teamRaw, goals], index) => {
              const team = parseTeam(teamRaw);
              const teamNorm = normalizeString(teamRaw);
              const gokkers = alleToernooiV.filter((v: any) => normalizeString(v.topschutter) === teamNorm);

              return (
                <div key={teamRaw} style={{ display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.3)', padding: '12px 15px', borderRadius: '12px', borderLeft: index === 0 ? '4px solid #2B00FF' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem', marginRight: '15px', opacity: index === 0 ? 1 : 0.6 }}>{index + 1}.</span>
                    <span style={{ fontSize: '1.4rem', marginRight: '10px' }}>{team.emoji}</span>
                    <span style={{ flex: 1, fontWeight: 900, color: '#FFF', fontSize: '1.1rem' }}>{team.name}</span>
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#2B00FF' }}>{goals}</span>
                  </div>
                  {gokkers.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px', paddingLeft: '45px' }}>
                      {gokkers.map((g: any) => (
                        <span key={g.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #2B00FF', color: '#FFF', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '8px', fontWeight: 900 }}>
                          {formateerNaam(g.spelers?.naam)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {stats.matchenGespeeld && (
        <div style={{ background: '#1A1423', borderRadius: '16px', padding: '20px', border: '2px solid #7A00E6', boxShadow: '0 4px 15px rgba(122, 0, 230, 0.2)' }}>
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#7A00E6', margin: '0 0 15px 0', textAlign: 'center', letterSpacing: '1px' }}>
            🛡️ BESTE VERDEDIGING (TOP 5)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.topVerdediging.map(([teamRaw, goalsTegen], index) => {
              const team = parseTeam(teamRaw);
              const teamNorm = normalizeString(teamRaw);
              const gokkers = alleToernooiV.filter((v: any) => normalizeString(v.beste_keeper) === teamNorm);

              return (
                <div key={teamRaw} style={{ display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.3)', padding: '12px 15px', borderRadius: '12px', borderLeft: index === 0 ? '4px solid #7A00E6' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem', marginRight: '15px', opacity: index === 0 ? 1 : 0.6 }}>{index + 1}.</span>
                    <span style={{ fontSize: '1.4rem', marginRight: '10px' }}>{team.emoji}</span>
                    <span style={{ flex: 1, fontWeight: 900, color: '#FFF', fontSize: '1.1rem' }}>{team.name}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#7A00E6', lineHeight: 1 }}>{goalsTegen}</span>
                      <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase' }}>Tegen</span>
                    </div>
                  </div>
                  {gokkers.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px', paddingLeft: '45px' }}>
                      {gokkers.map((g: any) => (
                        <span key={g.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #7A00E6', color: '#FFF', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '8px', fontWeight: 900 }}>
                          {formateerNaam(g.spelers?.naam)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  );
}
