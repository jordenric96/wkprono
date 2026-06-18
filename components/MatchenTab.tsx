// src/components/MatchenTab.tsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

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

const parseTeam = (teamString: string) => {
  if (!teamString) return { name: '', emoji: '🏳️', gradient: 'linear-gradient(135deg, #DEE2E6, #ADB5BD)' };
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
    'england': 'Engeland', 'wales': 'Wales', 'scotland': 'Schotland',
    'usa': 'Verenigde Staten', 'united states': 'Verenigde Staten', 'verenigde staten': 'Verenigde Staten',
    'canada': 'Canada', 'mexico': 'Mexico', 'japan': 'Japan',
    'croatia': 'Kroatië', 'kroatië': 'Kroatië',
    'uruguay': 'Uruguay', 'senegal': 'Senegal', 'ghana': 'Ghana', 'nigeria': 'Nigeria', 'ecuador': 'Ecuador',
    'sweden': 'Zweden', 'zweden': 'Zweden',
    'denmark': 'Denemarken', 'denemarken': 'Denemarken',
    'poland': 'Polen', 'polen': 'Polen',
    'serbia': 'Servië', 'servië': 'Servië',
    'iran': 'Iran', 'ir iran': 'Iran', 'islamic republic of iran': 'Iran',
    'saudi arabia': 'Saudi-Arabië', 'saudi-arabië': 'Saudi-Arabië',
    'ukraine': 'Oekraïne', 'oekraïne': 'Oekraïne',
    'peru': 'Peru', 'panama': 'Panama',
    'egypt': 'Egypte', 'egypte': 'Egypte',
    'tunisia': 'Tunesië', 'tunesië': 'Tunesië',
    'new zealand': 'Nieuw-Zeeland', 'nieuw-zeeland': 'Nieuw-Zeeland',
    'qatar': 'Qatar', 'ireland': 'Ierland', 'ierland': 'Ierland',
    'turkey': 'Turkije', 'turkiye': 'Turkije', 'türkiye': 'Turkije', 'turkije': 'Turkije',
    'romania': 'Roemenië', 'roemenië': 'Roemenië',
    'hungary': 'Hongarije', 'hongarije': 'Hongarije',
    'norway': 'Noorwegen', 'noorwegen': 'Noorwegen',
    'iceland': 'IJsland', 'ijsland': 'IJsland',
    'slovakia': 'Slowakije', 'slowakije': 'Slowakije',
    'iraq': 'Irak', 'irak': 'Irak',
    'paraguay': 'Paraguay', 'venezuela': 'Venezuela', 'mali': 'Mali',
    'algeria': 'Algerije', 'algerije': 'Algerije',
    'zambia': 'Zambia', 'honduras': 'Honduras', 'el salvador': 'El Salvador',
    'ivory coast': 'Ivoorkust', 'cote d\'ivoire': 'Ivoorkust', 'côte d\'ivoire': 'Ivoorkust', 'cote divoire': 'Ivoorkust', 'cote d ivoire': 'Ivoorkust', 'core divoir': 'Ivoorkust', 'ivoorkust': 'Ivoorkust',
    'cameroon': 'Kameroen', 'kameroen': 'Kameroen',
    'chile': 'Chili', 'chili': 'Chili',
    'colombia': 'Colombia', 'costa rica': 'Costa Rica',
    'austria': 'Oostenrijk', 'oostenrijk': 'Oostenrijk',
    'australia': 'Australië', 'australië': 'Australië',
    'cabo verde': 'Kaapverdië', 'cape verde': 'Kaapverdië', 'kaapverdië': 'Kaapverdië',
    'haiti': 'Haïti', 'haïti': 'Haïti',
    'curacao': 'Curaçao', 'curaçao': 'Curaçao',
    'jordan': 'Jordanië', 'jordanië': 'Jordanië',
    'congo dr': 'Congo', 'dr congo': 'Congo', 'congo': 'Congo',
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

const formateerNaam = (volledigeNaam: string) => {
  if (!volledigeNaam) return 'Onbekend';
  const delen = volledigeNaam.trim().split(' ');
  const voornaam = delen[0];
  if (voornaam.toLowerCase() === 'kristof' && delen.length > 1) {
    return `${voornaam} ${delen[1].charAt(0)}.`;
  }
  return voornaam;
};

const cardThemes = [
  { bg: '#2B00FF', color: '#FFF' },
  { bg: '#7A00E6', color: '#FFF' },
  { bg: '#CCFF00', color: '#111827' },
  { bg: '#00E5FF', color: '#111827' },
  { bg: '#E30022', color: '#FFF' }
];

export default function MatchenTab({
  matchen, gefilterdeMatchen, nu, matchVoorspellingen, matchSaveStatus,
  alleMatchVoorspellingen, alleSpelers, expandedMatchId, setExpandedMatchId,
  handleScore, filterRonde, setFilterRonde, weergavePeriode, setWeergavePeriode
}: any) {
  
  const [geselecteerdTeamRaw, setGeselecteerdTeamRaw] = useState<string | null>(null);
  const hasScrolled = useRef<string | null>(null);

  const rondes = ['Alle', 'Nog in te vullen', 'Groepsfase', 'Ronde van 32', 'Achtste finale', 'Kwartfinale', 'Halve finale', 'Troostfinale', 'Finale'];

  useEffect(() => {
    if (!gefilterdeMatchen || gefilterdeMatchen.length === 0) return;
    if (hasScrolled.current === `${weergavePeriode}-${filterRonde}`) return;

    let targetMatch;
    if (weergavePeriode === 'Actueel') {
      targetMatch = [...gefilterdeMatchen].reverse().find(m => nu >= new Date(m.datum).getTime());
      if (!targetMatch) targetMatch = gefilterdeMatchen[0];
    } else {
      targetMatch = gefilterdeMatchen[gefilterdeMatchen.length - 1]; 
    }

    if (targetMatch) {
      hasScrolled.current = `${weergavePeriode}-${filterRonde}`; 
      const timer = setTimeout(() => {
        const element = document.getElementById(`match-${targetMatch.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300); 
      return () => clearTimeout(timer);
    }
  }, [filterRonde, gefilterdeMatchen, nu, weergavePeriode]); 

  const genereerGroepsStand = (rawNaam: string) => {
    const groepsMatchenVanDitTeam = matchen.filter((m: any) => 
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

    const alleGroepsMatchen = matchen.filter((m: any) => 
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
        
        .stand-table { width: 100%; border-collapse: collapse; font-size: 0.75rem; }
        .stand-table th { text-align: center; padding: 4px 2px; color: #ADB5BD; font-weight: 900; border-bottom: 2px solid #E9ECEF; }
        .stand-table th:first-child { text-align: left; }
        .stand-table td { padding: 6px 2px; text-align: center; font-weight: 900; color: #495057; border-bottom: 1px solid #F1F3F5; }
        .stand-table td:first-child { text-align: left; color: #111827; }
        .stand-table tr.highlight td { background: rgba(55, 114, 255, 0.08); font-weight: 900; color: #2B00FF; }

        @keyframes pulse-red {
          0% { text-shadow: 0 0 5px #E30022; }
          50% { text-shadow: 0 0 15px #E30022, 0 0 25px #E30022; }
          100% { text-shadow: 0 0 5px #E30022; }
        }
        .live-pulse { animation: pulse-red 2s infinite; }
      `}</style>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
        <button 
           onClick={() => { setWeergavePeriode('Actueel'); hasScrolled.current = null; }}
           style={{ flex: 1, padding: '12px', borderRadius: '16px', background: weergavePeriode === 'Actueel' ? 'var(--wk-blue)' : 'rgba(255,255,255,0.05)', color: weergavePeriode === 'Actueel' ? '#FFF' : '#ADB5BD', fontWeight: 900, border: weergavePeriode === 'Actueel' ? '2px solid var(--wk-blue)' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s' }}
        >
           🔥 ACTUEEL
        </button>
        <button 
           onClick={() => { setWeergavePeriode('Historie'); hasScrolled.current = null; }}
           style={{ flex: 1, padding: '12px', borderRadius: '16px', background: weergavePeriode === 'Historie' ? 'var(--wk-purple)' : 'rgba(255,255,255,0.05)', color: weergavePeriode === 'Historie' ? '#FFF' : '#ADB5BD', fontWeight: 900, border: weergavePeriode === 'Historie' ? '2px solid var(--wk-purple)' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s' }}
        >
           ⏪ HISTORIE
        </button>
      </div>

      <div className="hide-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '5px' }}>
        {rondes.map(r => (
          <button 
            key={r} onClick={() => setFilterRonde(r)}
            style={{
              padding: '8px 16px', borderRadius: '20px', whiteSpace: 'nowrap',
              fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', cursor: 'pointer', transition: '0.2s',
              background: filterRonde === r ? '#CCFF00' : '#1A1423',
              color: filterRonde === r ? '#111827' : '#ADB5BD',
              border: filterRonde === r ? '1px solid transparent' : '1px solid #333',
              boxShadow: filterRonde === r ? '0 4px 10px rgba(204, 255, 0, 0.3)' : 'none'
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {weergavePeriode === 'Actueel' && (
        <div style={{ background: 'rgba(255,255,255,0.05)', color: '#00E5FF', padding: '10px 15px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900, textAlign: 'center', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
          💡 Tip: Tik op de vlaggetjes van een land voor de actuele groepsstand!
        </div>
      )}

      {gefilterdeMatchen.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#ADB5BD', fontWeight: 900 }}>
           {weergavePeriode === 'Historie' ? 'Geen gespeelde matchen in de historie.' : 'Geen matchen gevonden in deze ronde.'}
        </div>
      ) : (
        gefilterdeMatchen.map((match: any, index: number) => {
          
          const matchTijd = new Date(match.datum).getTime();
          const isMatchGesloten = nu >= matchTijd;
          // De match is nu LIVE voor exact 140 minuten na start (2u20m)
          const isMatchLive = isMatchGesloten && nu < (matchTijd + (140 * 60 * 1000));
          
          const voorspelling = matchVoorspellingen[match.id] || { thuis: '', uit: '' };
          const saveStatus = matchSaveStatus[match.id] || 'idle';
          
          const matchDateObj = new Date(match.datum);
          const dateStr = matchDateObj.toLocaleDateString('nl-BE', { weekday: 'short', day: '2-digit', month: 'short' });
          const timeStr = matchDateObj.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });

          const thuisInfo = parseTeam(match.thuisploeg);
          const uitInfo = parseTeam(match.uitploeg);

          const theme = cardThemes[index % cardThemes.length];

          const nietIngevuldeSpelers = alleSpelers.filter((s: any) => {
            const v = alleMatchVoorspellingen.find((x: any) => x.match_id === match.id && x.speler_id === s.id);
            return !v || v.thuis_score === null || v.uit_score === null || v.thuis_score === '' || v.uit_score === '';
          });

          return (
            <div id={`match-${match.id}`} key={match.id} style={{ 
              background: theme.bg, color: theme.color, borderRadius: '20px', 
              boxShadow: isMatchLive ? '0 0 25px rgba(227, 0, 34, 0.6)' : '0 8px 20px rgba(0,0,0,0.3)', 
              position: 'relative', overflow: 'hidden', marginBottom: '10px',
              border: isMatchLive ? '2px solid #E30022' : 'none'
            }}>
              
              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', fontWeight: 900, opacity: 0.9, textTransform: 'uppercase' }}>
                <span>{dateStr} • {timeStr} • {match.ronde} {match.groep ? `(${match.groep})` : ''}</span>
                <span>
                  {saveStatus === 'saving' && '⏳'}
                  {saveStatus === 'saved' && '✅'}
                  {isMatchGesloten && !isMatchLive && '🔒'}
                  {isMatchLive && <span className="live-pulse" style={{ color: '#E30022', fontSize: '0.8rem' }}>🔴 LIVE</span>}
                </span>
              </div>

              <div style={{ padding: '12px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px' }}>
                
                <div 
                  onClick={() => setGeselecteerdTeamRaw(match.thuisploeg)}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: thuisInfo.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.3)', marginBottom: '4px', border: '2px solid #FFF' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                      {thuisInfo.emoji}
                    </div>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '0.8rem', textAlign: 'center', lineHeight: 1.1, textShadow: theme.color === '#FFF' ? '0 1px 3px rgba(0,0,0,0.4)' : 'none' }}>{thuisInfo.name}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input 
                    type="tel" value={voorspelling.thuis} disabled={isMatchGesloten}
                    onChange={(e) => handleScore(match.id, 'thuis', e.target.value)}
                    style={{ width: '40px', height: '40px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 900, fontFamily: 'Bebas Neue', borderRadius: '10px', border: 'none', background: 'rgba(0,0,0,0.2)', color: theme.color, outline: 'none' }}
                  />
                  <span style={{ fontWeight: 900, opacity: 0.8 }}>-</span>
                  <input 
                    type="tel" value={voorspelling.uit} disabled={isMatchGesloten}
                    onChange={(e) => handleScore(match.id, 'uit', e.target.value)}
                    style={{ width: '40px', height: '40px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 900, fontFamily: 'Bebas Neue', borderRadius: '10px', border: 'none', background: 'rgba(0,0,0,0.2)', color: theme.color, outline: 'none' }}
                  />
                </div>

                <div 
                  onClick={() => setGeselecteerdTeamRaw(match.uitploeg)}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: uitInfo.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.3)', marginBottom: '4px', border: '2px solid #FFF' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                      {uitInfo.emoji}
                    </div>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '0.8rem', textAlign: 'center', lineHeight: 1.1, textShadow: theme.color === '#FFF' ? '0 1px 3px rgba(0,0,0,0.4)' : 'none' }}>{uitInfo.name}</span>
                </div>
              </div>

              {isMatchGesloten && match.thuis_score !== null && (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 900, color: isMatchLive ? '#E30022' : theme.color, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {isMatchLive ? '🔴 TUSSENSTAND:' : 'EINDSTAND:'} {match.thuis_score} - {match.uit_score}
                  </div>
                  
                  { ((match.gele_kaarten !== null && match.gele_kaarten !== undefined) || match.thuis_geel !== undefined) && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#FFF', opacity: 0.9 }}>
                      {match.thuis_geel !== undefined ? (
                        <div style={{ display: 'flex', width: '80%', justifyContent: 'space-between' }}>
                          <div style={{ flex: 1, textAlign: 'right', paddingRight: '10px' }}>🟨 {match.thuis_geel || 0} &nbsp;&nbsp; 🟥 {match.thuis_rood || 0}</div>
                          <div style={{ opacity: 0.3 }}>|</div>
                          <div style={{ flex: 1, textAlign: 'left', paddingLeft: '10px' }}>🟨 {match.uit_geel || 0} &nbsp;&nbsp; 🟥 {match.uit_rood || 0}</div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '15px' }}>
                          <span title="Gele kaarten in deze match">🟨 Match Totaal: {match.gele_kaarten || 0}</span>
                          <span title="Rode kaarten in deze match">🟥 Match Totaal: {match.rode_kaarten || 0}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!isMatchGesloten ? (
                nietIngevuldeSpelers.length === 0 ? (
                  <div style={{ width: '100%', background: 'rgba(0,0,0,0.2)', color: theme.color, padding: '6px', fontSize: '0.75rem', fontWeight: 900, textAlign: 'center' }}>
                    🎉 Iedereen heeft ingevuld!
                  </div>
                ) : (
                  <div className="hide-scrollbar" style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.8, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Nog in te vullen:</span>
                    {nietIngevuldeSpelers.map((s: any) => (
                      <span key={s.id} style={{ background: 'rgba(0,0,0,0.3)', color: theme.color, padding: '4px 10px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 900, border: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
                        {formateerNaam(s.naam)}
                      </span>
                    ))}
                  </div>
                )
              ) : (
                <div className="hide-scrollbar" style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.1)', display: 'flex', gap: '6px', overflowX: 'auto' }}>
                  {alleSpelers.map((s: any) => {
                    const v = alleMatchVoorspellingen.find((x: any) => x.match_id === match.id && x.speler_id === s.id);
                    const heeftIngevuld = v && v.thuis_score !== null && v.uit_score !== null;
                    const spelerNaam = formateerNaam(s.naam);

                    let pillBg = 'rgba(0,0,0,0.2)';
                    let pillColor = theme.color;
                    let scoreTekst = heeftIngevuld ? `${v.thuis_score}-${v.uit_score}` : 'Geen';
                    let icoontje = heeftIngevuld ? '🤔' : '❌';
                    
                    if (match.thuis_score !== null && heeftIngevuld) {
                      const echt = match.thuis_score > match.uit_score ? 1 : match.thuis_score < match.uit_score ? 2 : 0;
                      const pred = v.thuis_score > v.uit_score ? 1 : v.thuis_score < v.uit_score ? 2 : 0;
                      if (v.thuis_score === match.thuis_score && v.uit_score === match.uit_score) { 
                        pillBg = '#CCFF00'; pillColor = '#111827'; icoontje = '🎯'; 
                      } else if (echt === pred) { 
                        pillBg = '#00E5FF'; pillColor = '#111827'; icoontje = '🟢'; 
                      } else { 
                        pillBg = '#E30022'; pillColor = '#FFF'; icoontje = '🔴'; 
                      }
                    }

                    return (
                      <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: pillBg, padding: '4px 10px', borderRadius: '10px', minWidth: '55px', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                        <span style={{ fontSize: '0.55rem', fontWeight: 900, color: pillColor, opacity: 0.8, textTransform: 'uppercase', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>
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
          );
        })
      )}

      {geselecteerdTeamRaw && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div onClick={() => setGeselecteerdTeamRaw(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#1A1423', width: '100%', maxWidth: '420px', maxHeight: '88vh', borderRadius: '24px', padding: '20px', boxShadow: '0 15px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', border: '2px solid #00E5FF', overflowY: 'auto', color: '#FFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {(() => {
                  const teamData = parseTeam(geselecteerdTeamRaw);
                  return (
                    <>
                      <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: teamData.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFF', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                        <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{teamData.emoji}</div>
                      </div>
                      <div>
                        <h2 style={{ margin: 0, fontFamily: 'Bebas Neue', fontSize: '2rem', color: '#00E5FF', lineHeight: 1 }}>{teamData.name}</h2>
                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', letterSpacing: '1px' }}>Team Dossier & Statistieken</div>
                      </div>
                    </>
                  );
                })()}
              </div>
              <button onClick={() => setGeselecteerdTeamRaw(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '0.9rem', fontWeight: 900, color: '#FFF', cursor: 'pointer' }}>✕</button>
            </div>
            {(() => {
              const groepData = genereerGroepsStand(geselecteerdTeamRaw);
              if (groepData) {
                return (
                  <div style={{ marginBottom: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '10px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#CCFF00', textTransform: 'uppercase', marginBottom: '6px' }}>📊 Stand {groepData.groepsNaamTonen}</div>
                    <table className="stand-table">
                      <thead><tr><th>Land</th><th title="Gespeeld">G</th><th title="Doelsaldo">DS</th><th title="Punten">PT</th></tr></thead>
                      <tbody>{groepData.stand.map((s, idx) => { const sInfo = parseTeam(s.teamRaw); const isHuidigTeam = s.teamRaw === geselecteerdTeamRaw; return (<tr key={s.teamRaw} className={isHuidigTeam ? 'highlight' : ''}><td style={{ color: '#FFF' }}><span style={{ marginRight: '4px', opacity: 0.6 }}>{idx + 1}.</span> {sInfo.emoji} <span style={{ fontWeight: isHuidigTeam ? 900 : 700 }}>{sInfo.name}</span></td><td style={{ color: '#ADB5BD' }}>{s.ges}</td><td style={{ color: '#ADB5BD' }}>{s.dv - s.dt > 0 ? `+${s.dv - s.dt}` : s.dv - s.dt}</td><td style={{ color: '#00E5FF' }}>{s.pt}</td></tr>); })}</tbody>
                    </table>
                  </div>
                );
              }
              return null;
            })()}
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', marginBottom: '6px' }}>⚽ Matchen overzicht</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {matchen.filter((m: any) => m.thuisploeg === geselecteerdTeamRaw || m.uitploeg === geselecteerdTeamRaw).map((m: any) => {
                const dossierMatchTijd = new Date(m.datum).getTime();
                const isDossierGespeeld = m.thuis_score !== null;
                // De match in het dossier is nu LIVE voor exact 140 minuten na start
                const isDossierLive = nu >= dossierMatchTijd && nu < (dossierMatchTijd + (140 * 60 * 1000));
                const isThuis = m.thuisploeg === geselecteerdTeamRaw;
                const tegenstanderRaw = isThuis ? m.uitploeg : m.thuisploeg;
                const tegenstanderInfo = parseTeam(tegenstanderRaw);
                let uitslagKleur = '#FFF'; let statusIcoon = '⏳';
                if (isDossierGespeeld) {
                  if ((isThuis && Number(m.thuis_score) > Number(m.uit_score)) || (!isThuis && Number(m.uit_score) > Number(m.thuis_score))) { uitslagKleur = '#CCFF00'; statusIcoon = '🟢'; } 
                  else if (Number(m.thuis_score) === Number(m.uit_score)) { uitslagKleur = '#00E5FF'; statusIcoon = '➖'; } 
                  else { uitslagKleur = '#E30022'; statusIcoon = '🔴'; } 
                }
                return (
                  <div key={m.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: isDossierLive ? '1px solid #E30022' : '1px solid rgba(255,255,255,0.1)' }}>
                    <div>
                      <div style={{ fontSize: '0.6rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', marginBottom: '2px' }}>{new Date(m.datum).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short' })} • {m.ronde}{isDossierLive && <span style={{color: '#E30022', marginLeft: '5px'}}>🔴 LIVE</span>}</div>
                      <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ fontSize: '0.65rem', color: '#6C757D' }}>vs</span> {tegenstanderInfo.name} <span style={{fontSize: '1rem'}}>{tegenstanderInfo.emoji}</span></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {isDossierGespeeld ? (<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: uitslagKleur }}>{isThuis ? `${m.thuis_score} - ${m.uit_score}` : `${m.uit_score} - ${m.thuis_score}`}</span><span style={{ fontSize: '0.7rem' }}>{statusIcoon}</span></div>) : (<div style={{ background: 'rgba(255,255,255,0.1)', color: '#ADB5BD', padding: '3px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>Te spelen</div>)}
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
