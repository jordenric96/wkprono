// src/components/MatchenTab.tsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// --- HARDE GROEPSINDELING ---
const WK_GROEPEN: Record<string, string> = {
  'mexico': 'Groep A', 'zuid-afrika': 'Groep A', 'zuid-korea': 'Groep A', 'tsjechië': 'Groep A',
  'canada': 'Groep B', 'qatar': 'Groep B', 'zwitserland': 'Groep B', 'bosnië': 'Groep B',
  'brazilië': 'Groep C', 'marokko': 'Groep C', 'haïti': 'Groep C', 'schotland': 'Groep C',
  'verenigde staten': 'Groep D', 'paraguay': 'Groep D', 'australië': 'Groep D', 'turkije': 'Groep D',
  'duitsland': 'Groep E', 'curaçao': 'Groep E', 'ivoorkust': 'Groep E', 'ecuador': 'Groep E',
  'nederland': 'Groep F', 'japan': 'Groep F', 'tunesië': 'Groep F', 'zweden': 'Groep F',
  'belgië': 'Groep G', 'egypte': 'Groep G', 'iran': 'Groep G', 'nieuw-zeeland': 'Groep G',
  'spanje': 'Groep H', 'kaapverdië': 'Groep H', 'saudi-arabië': 'Groep H', 'uruguay': 'Groep H',
  'frankrijk': 'Groep I', 'senegal': 'Groep I', 'noorwegen': 'Groep I', 'irak': 'Groep I',
  'argentinië': 'Groep J', 'algerije': 'Groep J', 'oostenrijk': 'Groep J', 'jordanië': 'Groep J',
  'portugal': 'Groep K', 'oezbekistan': 'Groep K', 'colombia': 'Groep K', 'congo': 'Groep K',
  'engeland': 'Groep L', 'kroatië': 'Groep L', 'ghana': 'Groep L', 'panama': 'Groep L'
};

// --- SLIMME VLAGGEN & KLEUREN GENERATOR ---
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

export default function MatchenTab({
  gefilterdeMatchen, nu, matchVoorspellingen, matchSaveStatus,
  alleMatchVoorspellingen, alleSpelers, expandedMatchId, setExpandedMatchId,
  handleScore, filterRonde, setFilterRonde
}: any) {
  
  const [geselecteerdTeamRaw, setGeselecteerdTeamRaw] = useState<string | null>(null);

  const rondes = ['Alle', 'Nog in te vullen', 'Groepsfase', 'Ronde van 32', 'Achtste finale', 'Kwartfinale', 'Halve finale', 'Troostfinale', 'Finale'];

  // --- AUTO-SCROLL NAAR LAATST GESPEELDE MATCH ---
  useEffect(() => {
    const laatstGespeeldeMatch = [...gefilterdeMatchen].reverse().find(m => nu >= new Date(m.datum).getTime());
    if (laatstGespeeldeMatch) {
      setTimeout(() => {
        const element = document.getElementById(`match-${laatstGespeeldeMatch.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500); 
    }
  }, [filterRonde]);

  // --- GROEPSSTAND BEREKENEN ---
  const genereerGroepsStand = (rawNaam: string) => {
    const groepsMatchenVanDitTeam = gefilterdeMatchen.filter((m: any) => 
      m.ronde === 'Groepsfase' && (m.thuisploeg === rawNaam || m.uitploeg === rawNaam)
    );
    if (groepsMatchenVanDitTeam.length === 0) return null;

    const teamsInDeGroep = new Set<string>();
    teamsInDeGroep.add(rawNaam);
    groepsMatchenVanDitTeam.forEach((m: any) => {
      teamsInDeGroep.add(m.thuisploeg);
      teamsInDeGroep.add(m.uitploeg);
    });
    const groepsNamenArray = Array.from(teamsInDeGroep);

    const alleGroepsMatchen = gefilterdeMatchen.filter((m: any) => 
      m.ronde === 'Groepsfase' && 
      groepsNamenArray.includes(m.thuisploeg) && 
      groepsNamenArray.includes(m.uitploeg)
    );

    let stand = groepsNamenArray.map(t => ({ teamRaw: t, ges: 0, w: 0, g: 0, v: 0, dv: 0, dt: 0, pt: 0 }));

    alleGroepsMatchen.filter((m: any) => m.thuis_score !== null && m.uit_score !== null).forEach((m: any) => {
      const thuis = stand.find(s => s.teamRaw === m.thuisploeg);
      const uit = stand.find(s => s.teamRaw === m.uitploeg);
      if (thuis && uit) {
        thuis.ges += 1; uit.ges += 1;
        thuis.dv += Number(m.thuis_score); thuis.dt += Number(m.uit_score);
        uit.dv += Number(m.uit_score); uit.dt += Number(m.thuis_score);

        if (Number(m.thuis_score) > Number(m.uit_score)) { thuis.w += 1; thuis.pt += 3; uit.v += 1; }
        else if (Number(m.thuis_score) < Number(m.uit_score)) { uit.w += 1; uit.pt += 3; thuis.v += 1; }
        else { thuis.g += 1; uit.g += 1; thuis.pt += 1; uit.pt += 1; }
      }
    });

    stand.sort((a, b) => {
      if (b.pt !== a.pt) return b.pt - a.pt;
      const dsA = a.dv - a.dt; const dsB = b.dv - b.dt;
      if (dsB !== dsA) return dsB - dsA;
      if (b.dv !== a.dv) return b.dv - a.dv;
      return a.teamRaw.localeCompare(b.teamRaw);
    });

    const groepsNaamTonen = groepsMatchenVanDitTeam[0].groep || 'Groepsfase';
    return { groepsNaamTonen, stand };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .stand-table { width: 100%; border-collapse: collapse; font-size: 0.75rem; }
        .stand-table th { text-align: center; padding: 4px 2px; color: #ADB5BD; font-weight: 900; border-bottom: 2px solid #E9ECEF; }
        .stand-table th:first-child { text-align: left; }
        .stand-table td { padding: 6px 2px; text-align: center; font-weight: 900; color: #495057; border-bottom: 1px solid #F1F3F5; }
        .stand-table td:first-child { text-align: left; color: #111827; }
        .stand-table tr.highlight td { background: rgba(55, 114, 255, 0.08); font-weight: 900; color: var(--crayola); }
      `}</style>

      {/* FILTER KNOPPEN */}
      <div className="hide-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '5px' }}>
        {rondes.map(r => (
          <button 
            key={r} onClick={() => setFilterRonde(r)}
            style={{
              padding: '8px 16px', borderRadius: '20px', border: 'none', whiteSpace: 'nowrap',
              fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', cursor: 'pointer', transition: '0.2s',
              background: filterRonde === r ? 'var(--crayola)' : 'rgba(255,255,255,0.7)',
              color: filterRonde === r ? '#FFF' : '#6C757D',
              boxShadow: filterRonde === r ? '0 4px 10px rgba(55, 114, 255, 0.3)' : 'none'
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* INSTRUCTIE TIP */}
      <div style={{ background: '#E7F1FF', color: 'var(--crayola)', padding: '10px 15px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900, textAlign: 'center', boxShadow: '0 2px 10px rgba(55, 114, 255, 0.1)' }}>
        💡 Tip: Tik op de vlaggetjes van een land voor ploegstatistieken en het live groepsklassement!
      </div>

      {/* LIJST MET MATCHEN */}
      {!gefilterdeMatchen || gefilterdeMatchen.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#ADB5BD', fontWeight: 900 }}>Geen matchen gevonden in deze ronde.</div>
      ) : (
        gefilterdeMatchen.map((match: any) => {
          const isMatchGesloten = nu >= new Date(match.datum).getTime();
          const voorspelling = matchVoorspellingen[match.id] || { thuis: '', uit: '' };
          const saveStatus = matchSaveStatus[match.id] || 'idle';
          
          const matchDateObj = new Date(match.datum);
          const dateStr = matchDateObj.toLocaleDateString('nl-BE', { weekday: 'short', day: '2-digit', month: 'short' });
          const timeStr = matchDateObj.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });

          const thuisInfo = parseTeam(match.thuisploeg);
          const uitInfo = parseTeam(match.uitploeg);

          const TOERNOOI_AANDACHT_START = new Date('2026-05-01').getTime();
          const matchTijd = matchDateObj.getTime();
          let progress = ((nu - TOERNOOI_AANDACHT_START) / (matchTijd - TOERNOOI_AANDACHT_START)) * 100;
          if (progress > 100) progress = 100; 
          if (progress < 0) progress = 0; 

          // --- LOGICA WIE INGEVULD HEEFT ---
          const ingevuldeSpelers: any[] = [];
          const nietIngevuldeSpelers: any[] = [];

          alleSpelers.forEach((s: any) => {
            const v = alleMatchVoorspellingen.find((x: any) => x.match_id === match.id && x.speler_id === s.id);
            if (v && v.thuis_score !== null && v.uit_score !== null) ingevuldeSpelers.push({ speler: s, voorspelling: v });
            else nietIngevuldeSpelers.push(s);
          });

          return (
            <div id={`match-${match.id}`} key={match.id} style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', border: isMatchGesloten ? '2px solid #E9ECEF' : '2px solid var(--crayola)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
              
              {/* MATCH HEADER & TIMELINE */}
              <div style={{ background: isMatchGesloten ? '#F8F9FA' : '#FFFDF5', padding: '10px 15px', display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid #E9ECEF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase' }}>
                  <span>{dateStr} • {timeStr} • {match.ronde} {match.groep ? `(${match.groep})` : ''}</span>
                  {saveStatus === 'saving' && <span style={{ color: 'var(--crayola)' }}>Opslaan... ⏳</span>}
                  {saveStatus === 'saved' && <span style={{ color: '#40C057' }}>Opgeslagen ✅</span>}
                  {isMatchGesloten && <span style={{ color: '#FA5252' }}>🔒 BEZIG / GESPEELD</span>}
                </div>

                <div style={{ width: '100%', height: '4px', background: '#E9ECEF', borderRadius: '2px', position: 'relative', marginTop: '4px' }}>
                  <div style={{ position: 'absolute', left: `calc(${progress}% - 8px)`, top: '-8px', fontSize: '14px', transition: 'left 1s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 2 }}>
                    ⚽
                  </div>
                  <div style={{ position: 'absolute', right: '-4px', top: '-6px', fontSize: '12px', opacity: isMatchGesloten ? 0.4 : 1 }}>
                    🥅
                  </div>
                  <div style={{ width: `${progress}%`, height: '100%', background: isMatchGesloten ? '#40C057' : 'var(--crayola)', borderRadius: '2px', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                </div>
              </div>

              {/* MATCH BODY */}
              <div style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px' }}>
                
                <div 
                  onClick={() => setGeselecteerdTeamRaw(match.thuisploeg)}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: thuisInfo.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: '6px', border: '2px solid #FFF' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                      {thuisInfo.emoji}
                    </div>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '0.8rem', color: '#111827', textAlign: 'center', lineHeight: 1.1 }}>{thuisInfo.name}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input 
                    type="tel" value={voorspelling.thuis} disabled={isMatchGesloten}
                    onChange={(e) => handleScore(match.id, 'thuis', e.target.value)}
                    style={{ width: '45px', height: '45px', textAlign: 'center', fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Bebas Neue', borderRadius: '12px', border: '2px solid #E9ECEF', background: isMatchGesloten ? '#F1F3F5' : '#FFF', color: '#111827', outline: 'none' }}
                  />
                  <span style={{ fontWeight: 900, color: '#ADB5BD' }}>-</span>
                  <input 
                    type="tel" value={voorspelling.uit} disabled={isMatchGesloten}
                    onChange={(e) => handleScore(match.id, 'uit', e.target.value)}
                    style={{ width: '45px', height: '45px', textAlign: 'center', fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Bebas Neue', borderRadius: '12px', border: '2px solid #E9ECEF', background: isMatchGesloten ? '#F1F3F5' : '#FFF', color: '#111827', outline: 'none' }}
                  />
                </div>

                <div 
                  onClick={() => setGeselecteerdTeamRaw(match.uitploeg)}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: uitInfo.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: '6px', border: '2px solid #FFF' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                      {uitInfo.emoji}
                    </div>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '0.8rem', color: '#111827', textAlign: 'center', lineHeight: 1.1 }}>{uitInfo.name}</span>
                </div>
              </div>

              {/* EVENTUELE EINDSTAND */}
              {isMatchGesloten && match.thuis_score !== null && (
                <div style={{ background: '#FFFDF5', borderTop: '1px dashed #E9ECEF', padding: '8px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 900, color: '#D4AF37' }}>
                  EINDSTAND: {match.thuis_score} - {match.uit_score}
                </div>
              )}

              {/* DEELNEMERS STATUS / PRONOSTIEKEN ONDERAAN (COMPACT, ZONDER TITELS) */}
              <div style={{ padding: '10px 15px', background: isMatchGesloten ? '#F8F9FA' : '#FFF', borderTop: '1px solid #E9ECEF' }}>
                
                {/* VÓÓR DE MATCH (Samen in 1 wolk, groen eerst dan rood) */}
                {!isMatchGesloten ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {ingevuldeSpelers.map((item: any) => (
                      <div key={item.speler.id} style={{ background: '#40C057', color: '#FFF', padding: '3px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 900, boxShadow: '0 2px 4px rgba(64, 192, 87, 0.2)' }}>
                        {item.speler.naam.split(' ')[0]}
                      </div>
                    ))}
                    {nietIngevuldeSpelers.map((s: any) => (
                      <div key={s.id} style={{ background: '#FA5252', color: '#FFF', padding: '3px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 900, boxShadow: '0 2px 4px rgba(250, 82, 82, 0.2)' }}>
                        {s.naam.split(' ')[0]}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* TIJDENS / NA DE MATCH (GEDETAILLEERDE SCORES) */
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {alleSpelers.map((s: any) => {
                      const v = alleMatchVoorspellingen.find((x: any) => x.match_id === match.id && x.speler_id === s.id);
                      const heeftIngevuld = v && v.thuis_score !== null && v.uit_score !== null;
                      const spelerNaam = s.naam.split(' ')[0];

                      let pillBg = '#F1F3F5';
                      let pillColor = '#495057';
                      let scoreTekst = heeftIngevuld ? `${v.thuis_score}-${v.uit_score}` : 'Geen';
                      let icoontje = heeftIngevuld ? '🤔' : '❌';
                      
                      if (match.thuis_score !== null && heeftIngevuld) {
                        const echt = match.thuis_score > match.uit_score ? 1 : match.thuis_score < match.uit_score ? 2 : 0;
                        const pred = v.thuis_score > v.uit_score ? 1 : v.thuis_score < v.uit_score ? 2 : 0;
                        if (v.thuis_score === match.thuis_score && v.uit_score === match.uit_score) { 
                          pillBg = '#E8F5E9'; pillColor = '#2E7D32'; icoontje = '🎯'; 
                        } else if (echt === pred) { 
                          pillBg = '#E3F2FD'; pillColor = '#1565C0'; icoontje = '🟢'; 
                        } else { 
                          pillBg = '#FFEBEE'; pillColor = '#C62828'; icoontje = '🔴'; 
                        }
                      } else if (match.thuis_score === null && heeftIngevuld) {
                         pillBg = '#FFF'; pillColor = 'var(--crayola)'; 
                      }

                      return (
                        <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: pillBg, border: `1px solid ${pillColor}40`, padding: '4px 8px', borderRadius: '10px', flex: '1 1 auto', minWidth: '45px', maxWidth: '75px' }}>
                          <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>
                            {spelerNaam}
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 900, color: pillColor, whiteSpace: 'nowrap', display: 'flex', gap: '2px', alignItems: 'center' }}>
                            {scoreTekst} <span style={{fontSize: '0.6rem'}}>{icoontje}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          );
        })
      )}

      {/* TEAM DOSSIER POP-UP */}
      {geselecteerdTeamRaw && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div 
          onClick={() => setGeselecteerdTeamRaw(null)} 
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(6px)', zIndex: 999999, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{
              background: '#FFF', width: '100%', maxWidth: '420px', maxHeight: '88vh',
              borderRadius: '24px', padding: '20px', boxShadow: '0 15px 50px rgba(0,0,0,0.3)',
              display: 'flex', flexDirection: 'column', animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {(() => {
                  const teamData = parseTeam(geselecteerdTeamRaw);
                  return (
                    <>
                      <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: teamData.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFF', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                        <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                          {teamData.emoji}
                        </div>
                      </div>
                      <div>
                        <h2 style={{ margin: 0, fontFamily: 'Bebas Neue', fontSize: '2rem', color: 'var(--crayola)', lineHeight: 1 }}>{teamData.name}</h2>
                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', letterSpacing: '1px' }}>Team Dossier & Statistieken</div>
                      </div>
                    </>
                  );
                })()}
              </div>
              <button onClick={() => setGeselecteerdTeamRaw(null)} style={{ background: '#F1F3F5', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '0.9rem', fontWeight: 900, color: '#495057', cursor: 'pointer' }}>✕</button>
            </div>

            {(() => {
              const groepData = genereerGroepsStand(geselecteerdTeamRaw);
              if (groepData) {
                return (
                  <div style={{ marginBottom: '15px', background: '#F8F9FA', borderRadius: '12px', border: '1px solid #E9ECEF', padding: '10px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--magenta)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      📊 Stand {groepData.groepsNaamTonen}
                    </div>
                    <table className="stand-table">
                      <thead>
                        <tr>
                          <th>Land</th>
                          <th title="Gespeeld">G</th>
                          <th title="Doelsaldo">DS</th>
                          <th title="Punten">PT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groepData.stand.map((s, idx) => {
                          const sInfo = parseTeam(s.teamRaw);
                          const isHuidigTeam = s.teamRaw === geselecteerdTeamRaw;
                          return (
                            <tr key={s.teamRaw} className={isHuidigTeam ? 'highlight' : ''}>
                              <td>
                                <span style={{ marginRight: '4px', opacity: 0.6 }}>{idx + 1}.</span> 
                                {sInfo.emoji} <span style={{ fontWeight: isHuidigTeam ? 900 : 800 }}>{sInfo.name}</span>
                              </td>
                              <td>{s.ges}</td>
                              <td>{s.dv - s.dt > 0 ? `+${s.dv - s.dt}` : s.dv - s.dt}</td>
                              <td style={{ color: 'var(--crayola)' }}>{s.pt}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              }
              return null;
            })()}

            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', marginBottom: '6px' }}>
              ⚽ Matchen overzicht
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {gefilterdeMatchen
                .filter((m: any) => m.thuisploeg === geselecteerdTeamRaw || m.uitploeg === geselecteerdTeamRaw)
                .map((m: any) => {
                  const isGespeeld = m.thuis_score !== null;
                  const isThuis = m.thuisploeg === geselecteerdTeamRaw;
                  const tegenstanderRaw = isThuis ? m.uitploeg : m.thuisploeg;
                  const tegenstanderInfo = parseTeam(tegenstanderRaw);
                  
                  let uitslagKleur = '#111827';
                  let statusIcoon = '⏳';
                  if (isGespeeld) {
                    if ((isThuis && Number(m.thuis_score) > Number(m.uit_score)) || (!isThuis && Number(m.uit_score) > Number(m.thuis_score))) { uitslagKleur = '#40C057'; statusIcoon = '🟢'; } 
                    else if (Number(m.thuis_score) === Number(m.uit_score)) { uitslagKleur = '#228BE6'; statusIcoon = '➖'; } 
                    else { uitslagKleur = '#FA5252'; statusIcoon = '🔴'; } 
                  }

                  return (
                    <div key={m.id} style={{ background: '#FFF', padding: '10px 12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E9ECEF' }}>
                      <div>
                        <div style={{ fontSize: '0.6rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', marginBottom: '2px' }}>
                          {new Date(m.datum).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short' })} • {m.ronde}
                        </div>
                        <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ fontSize: '0.65rem', color: '#6C757D' }}>vs</span> {tegenstanderInfo.name} <span style={{fontSize: '1rem'}}>{tegenstanderInfo.emoji}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        {isGespeeld ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: uitslagKleur }}>
                              {isThuis ? `${m.thuis_score} - ${m.uit_score}` : `${m.uit_score} - ${m.thuis_score}`}
                            </span>
                            <span style={{ fontSize: '0.7rem' }}>{statusIcoon}</span>
                          </div>
                        ) : (
                          <div style={{ background: '#F1F3F5', color: '#6C757D', padding: '3px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>
                            Te spelen
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
