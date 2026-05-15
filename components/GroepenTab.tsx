// src/components/GroepenTab.tsx
import React from 'react';

// --- HARDE GROEPSINDELING WK 2026 ---
const GROEPEN: Record<string, string[]> = {
  'Groep A': ['Mexico', 'Zuid-Afrika', 'Zuid-Korea', 'Tsjechië'],
  'Groep B': ['Canada', 'Qatar', 'Zwitserland', 'Bosnië'],
  'Groep C': ['Brazilië', 'Marokko', 'Haïti', 'Schotland'],
  'Groep D': ['Verenigde Staten', 'Paraguay', 'Australië', 'Turkije'],
  'Groep E': ['Duitsland', 'Curaçao', 'Ivoorkust', 'Ecuador'],
  'Groep F': ['Nederland', 'Japan', 'Tunesië', 'Zweden'],
  'Groep G': ['België', 'Egypte', 'Iran', 'Nieuw-Zeeland'],
  'Groep H': ['Spanje', 'Kaapverdië', 'Saudi-Arabië', 'Uruguay'],
  'Groep I': ['Frankrijk', 'Senegal', 'Noorwegen', 'Irak'],
  'Groep J': ['Argentinië', 'Algerije', 'Oostenrijk', 'Jordanië'],
  'Groep K': ['Portugal', 'Oezbekistan', 'Colombia', 'Congo'],
  'Groep L': ['Engeland', 'Kroatië', 'Ghana', 'Panama']
};

// --- SLIMME VLAGGEN & KLEUREN GENERATOR (Zelfde als MatchenTab) ---
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

export default function GroepenTab({ alleMatchen }: { alleMatchen: any[] }) {

  // Functie om de stand van één specifieke groep te berekenen
  const berekenGroepsStand = (groepsNamen: string[]) => {
    let stand = groepsNamen.map(t => ({ teamNL: t, ges: 0, w: 0, g: 0, v: 0, dv: 0, dt: 0, pt: 0 }));

    // Filter alle matchen die in deze groep gespeeld zijn
    const groepMatchen = alleMatchen.filter((m: any) => 
      m.ronde === 'Groepsfase' && 
      m.thuis_score !== null && m.uit_score !== null &&
      groepsNamen.includes(parseTeam(m.thuisploeg).name) &&
      groepsNamen.includes(parseTeam(m.uitploeg).name)
    );

    // Punten en goals toekennen
    groepMatchen.forEach((m: any) => {
      const thuisNL = parseTeam(m.thuisploeg).name;
      const uitNL = parseTeam(m.uitploeg).name;
      const thuis = stand.find(s => s.teamNL === thuisNL);
      const uit = stand.find(s => s.teamNL === uitNL);

      if (thuis && uit) {
        thuis.ges += 1; uit.ges += 1;
        thuis.dv += Number(m.thuis_score); thuis.dt += Number(m.uit_score);
        uit.dv += Number(m.uit_score); uit.dt += Number(m.thuis_score);

        if (Number(m.thuis_score) > Number(m.uit_score)) { thuis.w += 1; thuis.pt += 3; uit.v += 1; }
        else if (Number(m.thuis_score) < Number(m.uit_score)) { uit.w += 1; uit.pt += 3; thuis.v += 1; }
        else { thuis.g += 1; uit.g += 1; thuis.pt += 1; uit.pt += 1; }
      }
    });

    // Sorteren op WK regels: Punten > Doelsaldo > Doelpunten Voor > Alfabetisch
    stand.sort((a, b) => {
      if (b.pt !== a.pt) return b.pt - a.pt;
      const dsA = a.dv - a.dt; const dsB = b.dv - b.dt;
      if (dsB !== dsA) return dsB - dsA;
      if (b.dv !== a.dv) return b.dv - a.dv;
      return a.teamNL.localeCompare(b.teamNL);
    });

    return stand;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      <style>{`
        .pouletable { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .pouletable th { text-align: center; padding: 8px 4px; color: #ADB5BD; font-weight: 900; border-bottom: 2px solid #E9ECEF; }
        .pouletable th:first-child { text-align: left; }
        .pouletable td { padding: 10px 4px; text-align: center; font-weight: 800; color: #495057; border-bottom: 1px solid #F8F9FA; vertical-align: middle; }
        .pouletable td:first-child { text-align: left; color: #111827; }
        .pouletable tr:last-child td { border-bottom: none; }
        .kwalificatie-row { background: rgba(64, 192, 87, 0.05); } /* Subtiel groen voor top 2 */
      `}</style>

      {Object.entries(GROEPEN).map(([groepsNaam, landenLijst]) => {
        const stand = berekenGroepsStand(landenLijst);

        return (
          <div key={groepsNaam} style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px', padding: '20px', border: '1px solid #E9ECEF', boxShadow: '0 8px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: 'var(--crayola)', letterSpacing: '1px', borderBottom: '2px dashed #E9ECEF', paddingBottom: '8px' }}>
              {groepsNaam}
            </h3>
            
            <table className="pouletable">
              <thead>
                <tr>
                  <th>Land</th>
                  <th title="Gespeeld">G</th>
                  <th title="Doelsaldo">DS</th>
                  <th title="Punten">PT</th>
                </tr>
              </thead>
              <tbody>
                {stand.map((s, index) => {
                  const teamInfo = parseTeam(s.teamNL);
                  const isTopTwee = index < 2; // De eerste twee gaan sowieso door

                  return (
                    <tr key={s.teamNL} className={isTopTwee ? 'kwalificatie-row' : ''}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 900, color: isTopTwee ? '#2B8A3E' : '#ADB5BD', minWidth: '15px' }}>{index + 1}.</span>
                        
                        {/* De Cirkel met Vlag */}
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: teamInfo.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                            {teamInfo.emoji}
                          </div>
                        </div>
                        
                        <span style={{ fontWeight: isTopTwee ? 900 : 800 }}>{teamInfo.name}</span>
                      </td>
                      <td>{s.ges}</td>
                      <td>{s.dv - s.dt > 0 ? `+${s.dv - s.dt}` : s.dv - s.dt}</td>
                      <td style={{ color: 'var(--magenta)', fontWeight: 900, fontSize: '1rem' }}>{s.pt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
