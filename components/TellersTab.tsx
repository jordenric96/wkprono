// src/components/TellersTab.tsx
import React, { useMemo } from 'react';

// De lijst van ALLE 48 landen, zodat we in het begin iedereen op 0 kunnen zetten
const ALLE_LANDEN = [
  'Mexico', 'Zuid-Afrika', 'Zuid-Korea', 'Tsjechië', 'Canada', 'Qatar', 'Zwitserland', 'Bosnië',
  'Brazilië', 'Marokko', 'Haïti', 'Schotland', 'Verenigde Staten', 'Paraguay', 'Australië', 'Turkije',
  'Duitsland', 'Curaçao', 'Ivoorkust', 'Ecuador', 'Nederland', 'Japan', 'Tunesië', 'Zweden',
  'België', 'Egypte', 'Iran', 'Nieuw-Zeeland', 'Spanje', 'Kaapverdië', 'Saudi-Arabië', 'Uruguay',
  'Frankrijk', 'Senegal', 'Noorwegen', 'Irak', 'Argentinië', 'Algerije', 'Oostenrijk', 'Jordanië',
  'Portugal', 'Oezbekistan', 'Colombia', 'Congo', 'Engeland', 'Kroatië', 'Ghana', 'Panama'
];

// Onze vertrouwde vlaggen & kleuren generator
const parseTeam = (teamString: string) => {
  if (!teamString) return { name: '', emoji: '🏳️', gradient: 'linear-gradient(135deg, #DEE2E6, #ADB5BD)' };
  let cleanString = teamString.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{E0060}-\u{E007F}\u{1F1E6}-\u{1F1FF}]/gu, '').trim();
  let searchKey = cleanString.toLowerCase();

  const vertalingen: Record<string, string> = {
    'brazil': 'Brazilië', 'brazilië': 'Brazilië', 'morocco': 'Marokko', 'marokko': 'Marokko',
    'switzerland': 'Zwitserland', 'zwitserland': 'Zwitserland', 'bosnia and herzegovina': 'Bosnië', 'bosnia & herzegovina': 'Bosnië', 'bosnia': 'Bosnië', 'bosnië': 'Bosnië',
    'south korea': 'Zuid-Korea', 'zuid-korea': 'Zuid-Korea', 'south africa': 'Zuid-Afrika', 'zuid-afrika': 'Zuid-Afrika',
    'czechia': 'Tsjechië', 'czech republic': 'Tsjechië', 'tsjechië': 'Tsjechië', 'germany': 'Duitsland', 'duitsland': 'Duitsland',
    'spain': 'Spanje', 'spanje': 'Spanje', 'france': 'Frankrijk', 'frankrijk': 'Frankrijk',
    'netherlands': 'Nederland', 'nederland': 'Nederland', 'belgium': 'België', 'belgië': 'België',
    'italy': 'Italië', 'italië': 'Italië', 'argentina': 'Argentinië', 'argentinië': 'Argentinië',
    'england': 'Engeland', 'wales': 'Wales', 'scotland': 'Schotland',
    'usa': 'Verenigde Staten', 'united states': 'Verenigde Staten', 'verenigde staten': 'Verenigde Staten',
    'canada': 'Canada', 'mexico': 'Mexico', 'japan': 'Japan', 'croatia': 'Kroatië', 'kroatië': 'Kroatië',
    'uruguay': 'Uruguay', 'senegal': 'Senegal', 'ghana': 'Ghana', 'nigeria': 'Nigeria', 'ecuador': 'Ecuador',
    'sweden': 'Zweden', 'zweden': 'Zweden', 'denmark': 'Denemarken', 'denemarken': 'Denemarken',
    'poland': 'Polen', 'polen': 'Polen', 'serbia': 'Servië', 'servië': 'Servië',
    'iran': 'Iran', 'ir iran': 'Iran', 'islamic republic of iran': 'Iran', 'saudi arabia': 'Saudi-Arabië', 'saudi-arabië': 'Saudi-Arabië',
    'ukraine': 'Oekraïne', 'oekraïne': 'Oekraïne', 'peru': 'Peru', 'panama': 'Panama', 'egypt': 'Egypte', 'egypte': 'Egypte',
    'tunisia': 'Tunesië', 'tunesië': 'Tunesië', 'new zealand': 'Nieuw-Zeeland', 'nieuw-zeeland': 'Nieuw-Zeeland',
    'qatar': 'Qatar', 'ireland': 'Ierland', 'ierland': 'Ierland',
    'turkey': 'Turkije', 'turkiye': 'Turkije', 'türkiye': 'Turkije', 'turkije': 'Turkije',
    'romania': 'Roemenië', 'roemenië': 'Roemenië', 'hungary': 'Hongarije', 'hongarije': 'Hongarije',
    'norway': 'Noorwegen', 'noorwegen': 'Noorwegen', 'iceland': 'IJsland', 'ijsland': 'IJsland',
    'slovakia': 'Slowakije', 'slowakije': 'Slowakije', 'iraq': 'Irak', 'irak': 'Irak',
    'paraguay': 'Paraguay', 'venezuela': 'Venezuela', 'mali': 'Mali', 'algeria': 'Algerije', 'algerije': 'Algerije',
    'zambia': 'Zambia', 'honduras': 'Honduras', 'el salvador': 'El Salvador',
    'ivory coast': 'Ivoorkust', 'cote d\'ivoire': 'Ivoorkust', 'côte d\'ivoire': 'Ivoorkust', 'cote divoire': 'Ivoorkust', 'cote d ivoire': 'Ivoorkust', 'core divoir': 'Ivoorkust', 'ivoorkust': 'Ivoorkust',
    'cameroon': 'Kameroen', 'kameroen': 'Kameroen', 'chile': 'Chili', 'chili': 'Chili',
    'colombia': 'Colombia', 'costa rica': 'Costa Rica', 'austria': 'Oostenrijk', 'oostenrijk': 'Oostenrijk',
    'australia': 'Australië', 'australië': 'Australië', 'cabo verde': 'Kaapverdië', 'cape verde': 'Kaapverdië', 'kaapverdië': 'Kaapverdië',
    'haiti': 'Haïti', 'haïti': 'Haïti', 'curacao': 'Curaçao', 'curaçao': 'Curaçao',
    'jordan': 'Jordanië', 'jordanië': 'Jordanië', 'congo dr': 'Congo', 'dr congo': 'Congo', 'congo': 'Congo',
    'uzbekistan': 'Oezbekistan', 'oezbekistan': 'Oezbekistan'
  };

  let nameNL = vertalingen[searchKey] || cleanString;
  const searchFinalKey = nameNL.toLowerCase();

  const colors: Record<string, string> = {
    'belgië': 'linear-gradient(135deg, #000 33%, #FFD700 33%, #FFD700 66%, #ED2939 66%)',
    'nederland': 'linear-gradient(135deg, #AE1C28 33%, #FFF 33%, #FFF 66%, #21468B 66%)',
    'frankrijk': 'linear-gradient(135deg, #002395 33%, #FFF 33%, #FFF 66%, #ED2939 66%)',
    'duitsland': 'linear-gradient(135deg, #000 33%, #FF0000 33%, #FF0000 66%, #FFCC00 66%)',
    'spanje': 'linear-gradient(135deg, #AA151B 33%, #F1BF00 33%, #F1BF00 66%, #AA151B 66%)',
    'brazilië': 'linear-gradient(135deg, #009c3b 33%, #ffdf00 33%, #ffdf00 66%, #002776 66%)',
    'argentinië': 'linear-gradient(135deg, #75AADB 33%, #FFF 33%, #FFF 66%, #75AADB 66%)',
    'portugal': 'linear-gradient(135deg, #006600 50%, #FF0000 50%)',
    'engeland': 'linear-gradient(135deg, #FFF 40%, #CE1124 40%, #CE1124 60%, #FFF 60%)',
    'italië': 'linear-gradient(135deg, #009246 33%, #FFF 33%, #FFF 66%, #CE2B37 66%)',
    'mexico': 'linear-gradient(135deg, #006847 33%, #FFF 33%, #FFF 66%, #CE1126 66%)',
    'verenigde staten': 'linear-gradient(135deg, #B31942 33%, #FFF 33%, #FFF 66%, #0A3161 66%)',
    'canada': 'linear-gradient(135deg, #FF0000 30%, #FFF 30%, #FFF 70%, #FF0000 70%)',
    'marokko': 'linear-gradient(135deg, #c1272d 45%, #006233 45%, #006233 55%, #c1272d 55%)',
    'chili': 'linear-gradient(135deg, #0039A6 33%, #FFF 33%, #FFF 66%, #D52B1E 66%)',
    'kameroen': 'linear-gradient(135deg, #007A5E 33%, #CE1126 33%, #CE1126 66%, #FCD116 66%)',
    'colombia': 'linear-gradient(135deg, #FCD116 50%, #003893 50%, #003893 75%, #CE1126 75%)',
    'costa rica': 'linear-gradient(135deg, #002B7F 20%, #FFF 20%, #FFF 40%, #CE1126 40%, #CE1126 60%, #FFF 60%, #FFF 80%, #002B7F 80%)',
    'zwitserland': 'linear-gradient(135deg, #FF0000 40%, #FFF 40%, #FFF 60%, #FF0000 60%)',
    'ivoorkust': 'linear-gradient(135deg, #FF8200 33%, #FFF 33%, #FFF 66%, #009A44 66%)',
    'oostenrijk': 'linear-gradient(135deg, #ED2939 33%, #FFF 33%, #FFF 66%, #ED2939 66%)',
    'australië': 'linear-gradient(135deg, #012169 40%, #FFF 40%, #FFF 50%, #E4002B 50%)',
    'japan': 'linear-gradient(135deg, #FFF 40%, #BC002D 40%, #BC002D 60%, #FFF 60%)',
    'zuid-korea': 'linear-gradient(135deg, #FFF 40%, #CD2E3A 40%, #CD2E3A 60%, #0047A0 60%)',
    'kroatië': 'linear-gradient(135deg, #FF0000 33%, #FFF 33%, #FFF 66%, #0000FF 66%)',
    'uruguay': 'linear-gradient(135deg, #0038A8 40%, #FFF 40%, #FFF 60%, #0038A8 60%)',
    'senegal': 'linear-gradient(135deg, #00853F 33%, #FDEF42 33%, #FDEF42 66%, #E31B23 66%)',
    'ghana': 'linear-gradient(135deg, #CE1126 33%, #FCD116 33%, #FCD116 66%, #006B3F 66%)',
    'nigeria': 'linear-gradient(135deg, #008751 33%, #FFF 33%, #FFF 66%, #008751 66%)',
    'ecuador': 'linear-gradient(135deg, #FFD100 50%, #003893 50%, #003893 75%, #CE1126 75%)',
    'zweden': 'linear-gradient(135deg, #004B87 40%, #FFCD00 40%, #FFCD00 60%, #004B87 60%)',
    'denemarken': 'linear-gradient(135deg, #C60C30 40%, #FFF 40%, #FFF 60%, #C60C30 60%)',
    'schotland': 'linear-gradient(135deg, #005EB8 40%, #FFF 40%, #FFF 60%, #005EB8 60%)',
    'polen': 'linear-gradient(135deg, #FFF 50%, #DC143C 50%)',
    'servië': 'linear-gradient(135deg, #C6363C 33%, #0C4076 33%, #0C4076 66%, #FFF 66%)',
    'iran': 'linear-gradient(135deg, #239F40 33%, #FFF 33%, #FFF 66%, #DA0000 66%)',
    'saudi-arabië': 'linear-gradient(135deg, #006C35 80%, #FFF 80%)',
    'wales': 'linear-gradient(135deg, #FFF 50%, #00AB39 50%)',
    'oekraïne': 'linear-gradient(135deg, #0057B7 50%, #FFD700 50%)',
    'peru': 'linear-gradient(135deg, #D91023 33%, #FFF 33%, #FFF 66%, #D91023 66%)',
    'panama': 'linear-gradient(135deg, #FFF 25%, #C2113A 25%, #C2113A 50%, #00225D 50%, #00225D 75%, #FFF 75%)',
    'egypte': 'linear-gradient(135deg, #CE1126 33%, #FFF 33%, #FFF 66%, #000 66%)',
    'tunesië': 'linear-gradient(135deg, #E70013 40%, #FFF 40%, #FFF 60%, #E70013 60%)',
    'nieuw-zeeland': 'linear-gradient(135deg, #00247D 40%, #FFF 40%, #FFF 50%, #CC142B 50%)',
    'qatar': 'linear-gradient(135deg, #FFF 30%, #8A1538 30%)',
    'ierland': 'linear-gradient(135deg, #169B62 33%, #FFF 33%, #FFF 66%, #FF883E 66%)',
    'turkije': 'linear-gradient(135deg, #E30A17 80%, #FFF 80%)',
    'zuid-afrika': 'linear-gradient(135deg, #007A4D 25%, #FFB612 25%, #FFB612 50%, #000 50%, #000 75%, #DE3831 75%)',
    'tsjechië': 'linear-gradient(135deg, #11457E 33%, #D7141A 33%, #D7141A 66%, #FFF 66%)',
    'roemenië': 'linear-gradient(135deg, #002B7F 33%, #FCD116 33%, #FCD116 66%, #CE1126 66%)',
    'hongarije': 'linear-gradient(135deg, #CE2939 33%, #FFF 33%, #FFF 66%, #477050 66%)',
    'noorwegen': 'linear-gradient(135deg, #006AA7 40%, #FECC00 40%, #FECC00 60%, #006AA7 60%)',
    'ijsland': 'linear-gradient(135deg, #02529C 40%, #FFF 40%, #FFF 45%, #DC1E35 45%, #DC1E35 55%, #FFF 55%, #FFF 60%, #02529C 60%)',
    'slowakije': 'linear-gradient(135deg, #FFF 33%, #0B4EA2 33%, #0B4EA2 66%, #EE1C25 66%)',
    'irak': 'linear-gradient(135deg, #239F40 33%, #FFF 33%, #FFF 66%, #DA0000 66%)',
    'paraguay': 'linear-gradient(135deg, #D52B1E 33%, #FFF 33%, #FFF 66%, #0038A8 66%)',
    'venezuela': 'linear-gradient(135deg, #FCE300 50%, #0038A8 50%, #0038A8 75%, #CE1126 75%)',
    'mali': 'linear-gradient(135deg, #14B53A 33%, #FCD116 33%, #FCD116 66%, #CE1126 66%)',
    'algerije': 'linear-gradient(135deg, #006233 50%, #FFF 50%)',
    'zambia': 'linear-gradient(135deg, #198A00 33%, #FF0000 33%, #FF0000 66%, #000 66%)',
    'honduras': 'linear-gradient(135deg, #005293 40%, #FFF 40%, #FFF 60%, #D21034 60%)',
    'el salvador': 'linear-gradient(135deg, #001489 20%, #FFF 20%, #FFF 40%, #CE1126 40%, #CE1126 60%, #FFF 60%, #FFF 80%, #001489 80%)',
    'bosnië': 'linear-gradient(135deg, #002395 40%, #FECB00 40%, #FECB00 60%, #FFFFFF 60%)',
    'kaapverdië': 'linear-gradient(135deg, #003893 40%, #FFF 40%, #FFF 45%, #CE1126 45%, #CE1126 55%, #FFF 55%, #FFF 60%, #003893 60%)',
    'haïti': 'linear-gradient(135deg, #00209F 50%, #D21034 50%)',
    'curaçao': 'linear-gradient(135deg, #002B7F 65%, #F9E814 65%, #F9E814 80%, #002B7F 80%)',
    'jordanië': 'linear-gradient(135deg, #CE1126 25%, #000 25%, #000 50%, #FFF 50%, #FFF 75%, #007A3D 75%)',
    'congo': 'linear-gradient(135deg, #007FFF 35%, #F7D116 35%, #F7D116 42%, #CE1021 42%, #CE1021 58%, #F7D116 58%, #F7D116 65%, #007FFF 65%)',
    'oezbekistan': 'linear-gradient(135deg, #0099B5 30%, #CE1126 30%, #CE1126 35%, #FFF 35%, #FFF 65%, #CE1126 65%, #CE1126 70%, #1EB53A 70%)'
  };

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
  let gradient = colors[searchFinalKey] || 'linear-gradient(135deg, #DEE2E6, #ADB5BD)';
  
  return { name: nameNL, emoji, gradient };
};

export default function TellersTab({ matchen }: { matchen: any[] }) {
  // --- BEREKENINGEN ---
  const stats = useMemo(() => {
    let totaleGoals = 0, totaleGeel = 0, totaleRood = 0;
    
    // We starten met alle 48 landen op 0
    const goalsVoor: Record<string, number> = {};
    const goalsTegen: Record<string, number> = {};
    
    ALLE_LANDEN.forEach(land => {
      const naam = parseTeam(land).name;
      goalsVoor[naam] = 0;
      goalsTegen[naam] = 0;
    });

    matchen.forEach(m => {
      if (m.thuis_score !== null && m.uit_score !== null) {
        totaleGoals += (m.thuis_score + m.uit_score);
        totaleGeel += (m.gele_kaarten || 0);
        totaleRood += (m.rode_kaarten || 0);
        
        const thuisNL = parseTeam(m.thuisploeg).name;
        const uitNL = parseTeam(m.uitploeg).name;

        // Omdat we via parseTeam zoeken, pakken we foute databasenamen eruit
        if (goalsVoor[thuisNL] !== undefined) goalsVoor[thuisNL] += m.thuis_score;
        if (goalsVoor[uitNL] !== undefined) goalsVoor[uitNL] += m.uit_score;
        if (goalsTegen[thuisNL] !== undefined) goalsTegen[thuisNL] += m.uit_score;
        if (goalsTegen[uitNL] !== undefined) goalsTegen[uitNL] += m.thuis_score;
      }
    });

    // Bereken wie bovenaan staat (Ex-aequo toegestaan!)
    const maxGoals = Math.max(...Object.values(goalsVoor));
    const minTegen = Math.min(...Object.values(goalsTegen));

    const topScorers = Object.keys(goalsVoor).filter(t => goalsVoor[t] === maxGoals);
    const besteDefensies = Object.keys(goalsTegen).filter(t => goalsTegen[t] === minTegen);

    return { totaleGoals, totaleGeel, totaleRood, topScorers, maxGoals, besteDefensies, minTegen };
  }, [matchen]);

  // --- DYNAMISCHE GROOTTE BEREKENEN ---
  // Hoeveel bollen we hebben bepaalt hoe groot ze zijn (Van 48 naar 1)
  const calculateSize = (amount: number) => {
    if (amount >= 30) return { bubble: 26, emoji: 12 }; // In het begin piepklein
    if (amount >= 15) return { bubble: 35, emoji: 18 };
    if (amount >= 8)  return { bubble: 45, emoji: 24 };
    if (amount >= 4)  return { bubble: 60, emoji: 30 };
    if (amount > 1)   return { bubble: 75, emoji: 40 };
    return { bubble: 110, emoji: 55 }; // Eén ultieme winnaar: Gigantisch!
  };

  const attackSize = calculateSize(stats.topScorers.length);
  const defenseSize = calculateSize(stats.besteDefensies.length);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. GLOBALE STATS */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1, background: '#FFFDF5', borderRadius: '20px', padding: '15px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '2px solid #E9ECEF' }}>
          <div style={{ fontSize: '2rem' }}>⚽</div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#111827', lineHeight: 1 }}>{stats.totaleGoals}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase' }}>Goals Toernooi</div>
        </div>
        <div style={{ flex: 1, background: '#FFFDF5', borderRadius: '20px', padding: '15px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '2px solid #E9ECEF' }}>
          <div style={{ fontSize: '2rem' }}>🟨</div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#111827', lineHeight: 1 }}>{stats.totaleGeel}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase' }}>Gele Kaarten</div>
        </div>
        <div style={{ flex: 1, background: '#FFFDF5', borderRadius: '20px', padding: '15px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '2px solid #E9ECEF' }}>
          <div style={{ fontSize: '2rem' }}>🟥</div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#111827', lineHeight: 1 }}>{stats.totaleRood}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase' }}>Rode Kaarten</div>
        </div>
      </div>

      {/* 2. RACE VOOR BESTE AANVAL */}
      <div style={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '20px', padding: '20px', border: '1px solid #E9ECEF', boxShadow: '0 8px 20px rgba(0,0,0,0.03)' }}>
        <h3 style={{ margin: '0 0 5px 0', fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: 'var(--crayola)' }}>Beste Aanval 🔥</h3>
        <p style={{ margin: '0 0 15px 0', fontSize: '0.8rem', fontWeight: 800, color: '#6C757D' }}>
          Landen met de meeste goals voor: <strong style={{ color: '#111827' }}>{stats.maxGoals}</strong>
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {stats.topScorers.map(land => {
            const team = parseTeam(land);
            return (
              <div 
                key={land} 
                title={team.name}
                style={{
                  width: `${attackSize.bubble}px`, height: `${attackSize.bubble}px`, 
                  borderRadius: '50%', background: team.gradient, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: '2px solid #FFF',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                <div style={{ 
                  width: '80%', height: '80%', borderRadius: '50%', background: '#fff', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: `${attackSize.emoji}px` 
                }}>
                  {team.emoji}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. RACE VOOR BESTE VERDEDIGING */}
      <div style={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '20px', padding: '20px', border: '1px solid #E9ECEF', boxShadow: '0 8px 20px rgba(0,0,0,0.03)' }}>
        <h3 style={{ margin: '0 0 5px 0', fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#40C057' }}>De Muur 🧱</h3>
        <p style={{ margin: '0 0 15px 0', fontSize: '0.8rem', fontWeight: 800, color: '#6C757D' }}>
          Landen met de minste tegengoals: <strong style={{ color: '#111827' }}>{stats.minTegen}</strong>
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {stats.besteDefensies.map(land => {
            const team = parseTeam(land);
            return (
              <div 
                key={land} 
                title={team.name}
                style={{
                  width: `${defenseSize.bubble}px`, height: `${defenseSize.bubble}px`, 
                  borderRadius: '50%', background: team.gradient, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: '2px solid #FFF',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                <div style={{ 
                  width: '80%', height: '80%', borderRadius: '50%', background: '#fff', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: `${defenseSize.emoji}px` 
                }}>
                  {team.emoji}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
