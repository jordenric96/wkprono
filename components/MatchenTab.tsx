// src/components/MatchenTab.tsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';

// --- VOLLEDIGE VLAGGEN & KLEUREN GENERATOR ---
const parseTeam = (teamString: string) => {
  if (!teamString) return { name: '', emoji: '🏳️', gradient: 'linear-gradient(135deg, #DEE2E6, #ADB5BD)' };

  let rawName = teamString.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{E0060}-\u{E007F}\u{1F1E6}-\u{1F1FF}]/gu, '').trim();

  const vertalingen: any = {
    'Brazil': 'Brazilië', 'Morocco': 'Marokko', 'Switzerland': 'Zwitserland', 'Bosnia and Herzegovina': 'Bosnië',
    'Bosnia & Herzegovina': 'Bosnië', 'Bosnia': 'Bosnië', 'South Korea': 'Zuid-Korea', 'South Africa': 'Zuid-Afrika',
    'Czechia': 'Tsjechië', 'Czech Republic': 'Tsjechië', 'Germany': 'Duitsland', 'Spain': 'Spanje', 
    'France': 'Frankrijk', 'Netherlands': 'Nederland', 'Belgium': 'België', 'Italy': 'Italië', 
    'Argentina': 'Argentinië', 'England': 'Engeland', 'Wales': 'Wales', 'Scotland': 'Schotland', 
    'USA': 'Verenigde Staten', 'United States': 'Verenigde Staten', 'Canada': 'Canada', 'Mexico': 'Mexico', 
    'Japan': 'Japan', 'Croatia': 'Kroatië', 'Uruguay': 'Uruguay', 'Senegal': 'Senegal', 'Ghana': 'Ghana', 
    'Nigeria': 'Nigeria', 'Ecuador': 'Ecuador', 'Sweden': 'Zweden', 'Denmark': 'Denemarken', 'Poland': 'Polen', 
    'Serbia': 'Servië', 'Iran': 'Iran', 'IR Iran': 'Iran', 'Islamic Republic of Iran': 'Iran', 
    'Saudi Arabia': 'Saudi-Arabië', 'Ukraine': 'Oekraïne', 'Peru': 'Peru', 'Panama': 'Panama', 
    'Egypt': 'Egypte', 'Tunisia': 'Tunesië', 'New Zealand': 'Nieuw-Zeeland', 'Qatar': 'Qatar', 
    'Ireland': 'Ierland', 'Turkey': 'Turkije', 'Turkiye': 'Turkije', 'Türkiye': 'Turkije',
    'Romania': 'Roemenië', 'Hungary': 'Hongarije', 'Norway': 'Noorwegen', 'Iceland': 'IJsland', 
    'Slovakia': 'Slowakije', 'Iraq': 'Irak', 'Paraguay': 'Paraguay', 'Venezuela': 'Venezuela', 
    'Mali': 'Mali', 'Algeria': 'Algerije', 'Zambia': 'Zambia', 'Honduras': 'Honduras', 
    'El Salvador': 'El Salvador', 'Ivory Coast': 'Ivoorkust', 'Cote d\'Ivoire': 'Ivoorkust', 
    "Côte d'Ivoire": 'Ivoorkust', "Cote dIvoire": 'Ivoorkust', 'Cameroon': 'Kameroen', 
    'Chile': 'Chili', 'Colombia': 'Colombia', 'Costa Rica': 'Costa Rica', 'Austria': 'Oostenrijk', 
    'Australia': 'Australië', 'Cabo Verde': 'Kaapverdië', 'Cape Verde': 'Kaapverdië', 
    'Haiti': 'Haïti', 'Curacao': 'Curaçao', 'Curaçao': 'Curaçao', 'Jordan': 'Jordanië', 
    'Congo DR': 'Congo', 'DR Congo': 'Congo', 'Uzbekistan': 'Oezbekistan'
  };

  let name = vertalingen[rawName] || rawName;

  const colors: any = {
    'België': 'linear-gradient(135deg, #000 33%, #FFD700 33%, #FFD700 66%, #ED2939 66%)',
    'Nederland': 'linear-gradient(135deg, #AE1C28 33%, #FFF 33%, #FFF 66%, #21468B 66%)',
    'Frankrijk': 'linear-gradient(135deg, #002395 33%, #FFF 33%, #FFF 66%, #ED2939 66%)',
    'Duitsland': 'linear-gradient(135deg, #000 33%, #FF0000 33%, #FF0000 66%, #FFCC00 66%)',
    'Spanje': 'linear-gradient(135deg, #AA151B 33%, #F1BF00 33%, #F1BF00 66%, #AA151B 66%)',
    'Brazilië': 'linear-gradient(135deg, #009c3b 33%, #ffdf00 33%, #ffdf00 66%, #002776 66%)',
    'Argentinië': 'linear-gradient(135deg, #75AADB 33%, #FFF 33%, #FFF 66%, #75AADB 66%)',
    'Portugal': 'linear-gradient(135deg, #006600 50%, #FF0000 50%)',
    'Engeland': 'linear-gradient(135deg, #FFF 40%, #CE1124 40%, #CE1124 60%, #FFF 60%)',
    'Italië': 'linear-gradient(135deg, #009246 33%, #FFF 33%, #FFF 66%, #CE2B37 66%)',
    'Mexico': 'linear-gradient(135deg, #006847 33%, #FFF 33%, #FFF 66%, #CE1126 66%)',
    'Verenigde Staten': 'linear-gradient(135deg, #B31942 33%, #FFF 33%, #FFF 66%, #0A3161 66%)',
    'Canada': 'linear-gradient(135deg, #FF0000 30%, #FFF 30%, #FFF 70%, #FF0000 70%)',
    'Marokko': 'linear-gradient(135deg, #c1272d 45%, #006233 45%, #006233 55%, #c1272d 55%)',
    'Chili': 'linear-gradient(135deg, #0039A6 33%, #FFF 33%, #FFF 66%, #D52B1E 66%)',
    'Kameroen': 'linear-gradient(135deg, #007A5E 33%, #CE1126 33%, #CE1126 66%, #FCD116 66%)',
    'Colombia': 'linear-gradient(135deg, #FCD116 50%, #003893 50%, #003893 75%, #CE1126 75%)',
    'Costa Rica': 'linear-gradient(135deg, #002B7F 20%, #FFF 20%, #FFF 40%, #CE1126 40%, #CE1126 60%, #FFF 60%, #FFF 80%, #002B7F 80%)',
    'Zwitserland': 'linear-gradient(135deg, #FF0000 40%, #FFF 40%, #FFF 60%, #FF0000 60%)',
    'Ivoorkust': 'linear-gradient(135deg, #FF8200 33%, #FFF 33%, #FFF 66%, #009A44 66%)',
    'Oostenrijk': 'linear-gradient(135deg, #ED2939 33%, #FFF 33%, #FFF 66%, #ED2939 66%)',
    'Australië': 'linear-gradient(135deg, #012169 40%, #FFF 40%, #FFF 50%, #E4002B 50%)',
    'Japan': 'linear-gradient(135deg, #FFF 40%, #BC002D 40%, #BC002D 60%, #FFF 60%)',
    'Zuid-Korea': 'linear-gradient(135deg, #FFF 40%, #CD2E3A 40%, #CD2E3A 60%, #0047A0 60%)',
    'Kroatië': 'linear-gradient(135deg, #FF0000 33%, #FFF 33%, #FFF 66%, #0000FF 66%)',
    'Uruguay': 'linear-gradient(135deg, #0038A8 40%, #FFF 40%, #FFF 60%, #0038A8 60%)',
    'Senegal': 'linear-gradient(135deg, #00853F 33%, #FDEF42 33%, #FDEF42 66%, #E31B23 66%)',
    'Ghana': 'linear-gradient(135deg, #CE1126 33%, #FCD116 33%, #FCD116 66%, #006B3F 66%)',
    'Nigeria': 'linear-gradient(135deg, #008751 33%, #FFF 33%, #FFF 66%, #008751 66%)',
    'Ecuador': 'linear-gradient(135deg, #FFD100 50%, #003893 50%, #003893 75%, #CE1126 75%)',
    'Zweden': 'linear-gradient(135deg, #004B87 40%, #FFCD00 40%, #FFCD00 60%, #004B87 60%)',
    'Denemarken': 'linear-gradient(135deg, #C60C30 40%, #FFF 40%, #FFF 60%, #C60C30 60%)',
    'Schotland': 'linear-gradient(135deg, #005EB8 40%, #FFF 40%, #FFF 60%, #005EB8 60%)',
    'Polen': 'linear-gradient(135deg, #FFF 50%, #DC143C 50%)',
    'Servië': 'linear-gradient(135deg, #C6363C 33%, #0C4076 33%, #0C4076 66%, #FFF 66%)',
    'Iran': 'linear-gradient(135deg, #239F40 33%, #FFF 33%, #FFF 66%, #DA0000 66%)',
    'Saudi-Arabië': 'linear-gradient(135deg, #006C35 80%, #FFF 80%)',
    'Wales': 'linear-gradient(135deg, #FFF 50%, #00AB39 50%)',
    'Oekraïne': 'linear-gradient(135deg, #0057B7 50%, #FFD700 50%)',
    'Peru': 'linear-gradient(135deg, #D91023 33%, #FFF 33%, #FFF 66%, #D91023 66%)',
    'Panama': 'linear-gradient(135deg, #FFF 25%, #C2113A 25%, #C2113A 50%, #00225D 50%, #00225D 75%, #FFF 75%)',
    'Egypte': 'linear-gradient(135deg, #CE1126 33%, #FFF 33%, #FFF 66%, #000 66%)',
    'Tunesië': 'linear-gradient(135deg, #E70013 40%, #FFF 40%, #FFF 60%, #E70013 60%)',
    'Nieuw-Zeeland': 'linear-gradient(135deg, #00247D 40%, #FFF 40%, #FFF 50%, #CC142B 50%)',
    'Qatar': 'linear-gradient(135deg, #FFF 30%, #8A1538 30%)',
    'Ierland': 'linear-gradient(135deg, #169B62 33%, #FFF 33%, #FFF 66%, #FF883E 66%)',
    'Turkije': 'linear-gradient(135deg, #E30A17 80%, #FFF 80%)',
    'Zuid-Afrika': 'linear-gradient(135deg, #007A4D 25%, #FFB612 25%, #FFB612 50%, #000 50%, #000 75%, #DE3831 75%)',
    'Tsjechië': 'linear-gradient(135deg, #11457E 33%, #D7141A 33%, #D7141A 66%, #FFF 66%)',
    'Roemenië': 'linear-gradient(135deg, #002B7F 33%, #FCD116 33%, #FCD116 66%, #CE1126 66%)',
    'Hongarije': 'linear-gradient(135deg, #CE2939 33%, #FFF 33%, #FFF 66%, #477050 66%)',
    'Noorwegen': 'linear-gradient(135deg, #006AA7 40%, #FECC00 40%, #FECC00 60%, #006AA7 60%)',
    'IJsland': 'linear-gradient(135deg, #02529C 40%, #FFF 40%, #FFF 45%, #DC1E35 45%, #DC1E35 55%, #FFF 55%, #FFF 60%, #02529C 60%)',
    'Slowakije': 'linear-gradient(135deg, #FFF 33%, #0B4EA2 33%, #0B4EA2 66%, #EE1C25 66%)',
    'Irak': 'linear-gradient(135deg, #239F40 33%, #FFF 33%, #FFF 66%, #DA0000 66%)',
    'Paraguay': 'linear-gradient(135deg, #D52B1E 33%, #FFF 33%, #FFF 66%, #0038A8 66%)',
    'Venezuela': 'linear-gradient(135deg, #FCE300 50%, #0038A8 50%, #0038A8 75%, #CE1126 75%)',
    'Mali': 'linear-gradient(135deg, #14B53A 33%, #FCD116 33%, #FCD116 66%, #CE1126 66%)',
    'Algerije': 'linear-gradient(135deg, #006233 50%, #FFF 50%)',
    'Zambia': 'linear-gradient(135deg, #198A00 33%, #FF0000 33%, #FF0000 66%, #000 66%)',
    'Honduras': 'linear-gradient(135deg, #005293 40%, #FFF 40%, #FFF 60%, #D21034 60%)',
    'El Salvador': 'linear-gradient(135deg, #001489 20%, #FFF 20%, #FFF 40%, #CE1126 40%, #CE1126 60%, #FFF 60%, #FFF 80%, #001489 80%)',
    'Bosnië': 'linear-gradient(135deg, #002395 40%, #FECB00 40%, #FECB00 60%, #FFFFFF 60%)',
    'Kaapverdië': 'linear-gradient(135deg, #003893 40%, #FFF 40%, #FFF 45%, #CE1126 45%, #CE1126 55%, #FFF 55%, #FFF 60%, #003893 60%)',
    'Haïti': 'linear-gradient(135deg, #00209F 50%, #D21034 50%)',
    'Curaçao': 'linear-gradient(135deg, #002B7F 65%, #F9E814 65%, #F9E814 80%, #002B7F 80%)',
    'Jordanië': 'linear-gradient(135deg, #CE1126 25%, #000 25%, #000 50%, #FFF 50%, #FFF 75%, #007A3D 75%)',
    'Congo': 'linear-gradient(135deg, #007FFF 35%, #F7D116 35%, #F7D116 42%, #CE1021 42%, #CE1021 58%, #F7D116 58%, #F7D116 65%, #007FFF 65%)',
    'Oezbekistan': 'linear-gradient(135deg, #0099B5 30%, #CE1126 30%, #CE1126 35%, #FFF 35%, #FFF 65%, #CE1126 65%, #CE1126 70%, #1EB53A 70%)'
  };

  const defaultEmojis: any = {
    'België': '🇧🇪', 'Nederland': '🇳🇱', 'Frankrijk': '🇫🇷', 'Duitsland': '🇩🇪', 'Spanje': '🇪🇸',
    'Brazilië': '🇧🇷', 'Argentinië': '🇦🇷', 'Portugal': '🇵🇹', 'Italië': '🇮🇹', 'Engeland': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Mexico': '🇲🇽', 'Verenigde Staten': '🇺🇸', 'Canada': '🇨🇦', 'Marokko': '🇲🇦',
    'Chili': '🇨🇱', 'Kameroen': '🇨🇲', 'Colombia': '🇨🇴', 'Costa Rica': '🇨🇷', 'Zwitserland': '🇨🇭',
    'Ivoorkust': '🇨🇮', 'Oostenrijk': '🇦🇹', 'Australië': '🇦🇺', 'Japan': '🇯🇵', 'Zuid-Korea': '🇰🇷',
    'Kroatië': '🇭🇷', 'Uruguay': '🇺🇾', 'Senegal': '🇸🇳', 'Ghana': '🇬🇭', 'Nigeria': '🇳🇬', 
    'Ecuador': '🇪🇨', 'Zweden': '🇸🇪', 'Denemarken': '🇩🇰', 'Schotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Polen': '🇵🇱', 
    'Servië': '🇷🇸', 'Iran': '🇮🇷', 'Saudi-Arabië': '🇸🇦', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'Oekraïne': '🇺🇦', 
    'Peru': '🇵🇪', 'Panama': '🇵🇦', 'Egypte': '🇪🇬', 'Tunesië': '🇹🇳', 'Nieuw-Zeeland': '🇳🇿', 
    'Qatar': '🇶🇦', 'Ierland': '🇮🇪', 'Turkije': '🇹🇷', 'Zuid-Afrika': '🇿🇦', 'Tsjechië': '🇨🇿', 
    'Roemenië': '🇷🇴', 'Hongarije': '🇭🇺', 'Noorwegen': '🇳🇴', 'IJsland': '🇮🇸', 'Slowakije': '🇸🇰', 
    'Irak': '🇮🇶', 'Paraguay': '🇵🇾', 'Venezuela': '🇻🇪', 'Mali': '🇲🇱', 'Algerije': '🇩🇿', 
    'Zambia': '🇿🇲', 'Honduras': '🇭🇳', 'El Salvador': '🇸🇻', 'Bosnië': '🇧🇦',
    'Kaapverdië': '🇨🇻', 'Haïti': '🇭🇹', 'Curaçao': '🇨🇼', 'Jordanië': '🇯🇴', 
    'Congo': '🇨🇩', 'Oezbekistan': '🇺🇿'
  };

  let emoji = defaultEmojis[name] || '🏳️';
  let gradient = colors[name] || 'linear-gradient(135deg, #DEE2E6, #ADB5BD)';
  
  return { name, emoji, gradient };
};

export default function MatchenTab({
  gefilterdeMatchen, nu, matchVoorspellingen, matchSaveStatus,
  alleMatchVoorspellingen, alleSpelers, expandedMatchId, setExpandedMatchId,
  handleScore, filterRonde, setFilterRonde
}: any) {
  
  const [geselecteerdTeam, setGeselecteerdTeam] = useState<string | null>(null);

  const rondes = ['Alle', 'Nog in te vullen', 'Groepsfase', 'Ronde van 32', 'Achtste finale', 'Kwartfinale', 'Halve finale', 'Troostfinale', 'Finale'];

  // --- GROEPSSTAND BEREKENEN ---
  const genereerGroepsStand = (teamNaam: string) => {
    // Zoek in alle matchen de groep van dit team
    const matchMetTeam = gefilterdeMatchen.find((m: any) => m.thuisploeg === teamNaam || m.uitploeg === teamNaam);
    if (!matchMetTeam || !matchMetTeam.groep) return null;

    const groepsNaam = matchMetTeam.groep;
    const alleGroepMatchen = gefilterdeMatchen.filter((m: any) => m.groep === groepsNaam);
    
    // Haal alle unieke teams op die in deze groep zitten
    const teamsInGroep = Array.from(new Set(alleGroepMatchen.flatMap((m: any) => [m.thuisploeg, m.uitploeg])));
    
    // Basis klassement object aanmaken
    let stand = teamsInGroep.map((team: any) => ({ team, ges: 0, w: 0, g: 0, v: 0, dv: 0, dt: 0, pt: 0 }));

    // Verwerk enkel gespeelde matchen
    const gespeeldeMatchen = alleGroepMatchen.filter((m: any) => m.thuis_score !== null && m.uit_score !== null);
    
    gespeeldeMatchen.forEach((m: any) => {
      const thuis = stand.find(s => s.team === m.thuisploeg);
      const uit = stand.find(s => s.team === m.uitploeg);
      if (thuis && uit) {
        thuis.ges += 1; uit.ges += 1;
        thuis.dv += m.thuis_score; thuis.dt += m.uit_score;
        uit.dv += m.uit_score; uit.dt += m.thuis_score;

        if (m.thuis_score > m.uit_score) { thuis.w += 1; thuis.pt += 3; uit.v += 1; }
        else if (m.thuis_score < m.uit_score) { uit.w += 1; uit.pt += 3; thuis.v += 1; }
        else { thuis.g += 1; uit.g += 1; thuis.pt += 1; uit.pt += 1; }
      }
    });

    // Sorteren op: Punten > Doelsaldo > Doelpunten voor > Alfabetisch
    stand.sort((a, b) => {
      if (b.pt !== a.pt) return b.pt - a.pt;
      const dsA = a.dv - a.dt; const dsB = b.dv - b.dt;
      if (dsB !== dsA) return dsB - dsA;
      if (b.dv !== a.dv) return b.dv - a.dv;
      return a.team.localeCompare(b.team);
    });

    return { groepsNaam, stand };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .stand-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
        .stand-table th { text-align: center; padding: 6px 4px; color: #ADB5BD; font-weight: 900; border-bottom: 2px solid #E9ECEF; }
        .stand-table th:first-child { text-align: left; }
        .stand-table td { padding: 8px 4px; text-align: center; font-weight: 900; color: #495057; border-bottom: 1px solid #F1F3F5; }
        .stand-table td:first-child { text-align: left; color: #111827; }
        .stand-table tr.highlight td { background: rgba(55, 114, 255, 0.05); }
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

      {/* LIJST MET MATCHEN */}
      {!gefilterdeMatchen || gefilterdeMatchen.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#ADB5BD', fontWeight: 900 }}>Geen matchen gevonden in deze ronde.</div>
      ) : (
        gefilterdeMatchen.map((match: any) => {
          const isMatchGesloten = nu >= new Date(match.datum).getTime();
          const voorspelling = matchVoorspellingen[match.id] || { thuis: '', uit: '' };
          const saveStatus = matchSaveStatus[match.id] || 'idle';
          const isExpanded = expandedMatchId === match.id;
          
          const matchDate = new Date(match.datum);
          const dateStr = matchDate.toLocaleDateString('nl-BE', { weekday: 'short', day: '2-digit', month: 'short' });
          const timeStr = matchDate.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });

          const thuisInfo = parseTeam(match.thuisploeg);
          const uitInfo = parseTeam(match.uitploeg);

          return (
            <div key={match.id} style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', border: '2px solid #E9ECEF', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
              
              <div style={{ background: '#F8F9FA', padding: '8px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E9ECEF', fontSize: '0.7rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase' }}>
                <span>{dateStr} • {timeStr} • {match.ronde} {match.groep ? `(${match.groep})` : ''}</span>
                {saveStatus === 'saving' && <span style={{ color: 'var(--crayola)' }}>Opslaan... ⏳</span>}
                {saveStatus === 'saved' && <span style={{ color: '#40C057' }}>Opgeslagen ✅</span>}
                {isMatchGesloten && <span style={{ color: '#FA5252' }}>🔒 GESLOTEN</span>}
              </div>

              <div style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px' }}>
                
                <div 
                  onClick={() => setGeselecteerdTeam(match.thuisploeg)}
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
                  onClick={() => setGeselecteerdTeam(match.uitploeg)}
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

              {isMatchGesloten && (
                <div style={{ borderTop: '1px dashed #E9ECEF' }}>
                  {match.thuis_score !== null && (
                    <div style={{ background: '#FFFDF5', padding: '8px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 900, color: '#D4AF37' }}>
                      EINDSTAND: {match.thuis_score} - {match.uit_score}
                    </div>
                  )}
                  <div 
                    onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                    style={{ padding: '10px', textAlign: 'center', background: isExpanded ? '#FDF0FF' : 'transparent', color: 'var(--magenta)', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer', transition: '0.2s' }}
                  >
                    {isExpanded ? '▲ SLUIT VOORSPELLINGEN' : '👁️ KLIK OM VOORSPELLINGEN TE ZIEN'}
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '15px', background: '#F8F9FA', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {alleSpelers.map((s: any) => {
                        const v = alleMatchVoorspellingen.find((x: any) => x.match_id === match.id && x.speler_id === s.id);
                        const heeftIngevuld = v && v.thuis_score !== null && v.uit_score !== null;
                        
                        let statusColor = '#495057';
                        let isExact = false;
                        if (match.thuis_score !== null && heeftIngevuld) {
                          const echt = match.thuis_score > match.uit_score ? 1 : match.thuis_score < match.uit_score ? 2 : 0;
                          const pred = v.thuis_score > v.uit_score ? 1 : v.thuis_score < v.uit_score ? 2 : 0;
                          if (v.thuis_score === match.thuis_score && v.uit_score === match.uit_score) { statusColor = '#40C057'; isExact = true; } 
                          else if (echt === pred) statusColor = '#228BE6'; 
                          else statusColor = '#FA5252'; 
                        }

                        return (
                          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#FFF', borderRadius: '8px', border: '1px solid #E9ECEF' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '1rem' }}>👤</span>
                              <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#111827' }}>{s.naam}</span>
                            </div>
                            <div style={{ fontWeight: 900, fontSize: '1.1rem', color: statusColor, display: 'flex', alignItems: 'center', gap: '5px' }}>
                              {heeftIngevuld ? `${v.thuis_score} - ${v.uit_score}` : <span style={{ fontSize: '0.7rem', color: '#ADB5BD' }}>Niets ingevuld</span>}
                              {isExact && <span style={{ fontSize: '0.8rem' }}>🎯</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* TEAM DOSSIER POP-UP MET KLASSEMENT */}
      {geselecteerdTeam && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div 
          onClick={() => setGeselecteerdTeam(null)} 
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)', 
            zIndex: 999999, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{
              background: '#FFF', width: '100%', maxWidth: '400px', maxHeight: '85vh',
              borderRadius: '24px', padding: '25px 20px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              display: 'flex', flexDirection: 'column',
              animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              overflowY: 'auto'
            }}
          >
            {/* Header Pop-up */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {(() => {
                  const teamData = parseTeam(geselecteerdTeam);
                  return (
                    <>
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: teamData.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFF', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                          {teamData.emoji}
                        </div>
                      </div>
                      <div>
                        <h2 style={{ margin: 0, fontFamily: 'Bebas Neue', fontSize: '2.2rem', color: 'var(--crayola)', lineHeight: 1 }}>{teamData.name}</h2>
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', letterSpacing: '1px' }}>Team Dossier & Statistieken</div>
                      </div>
                    </>
                  );
                })()}
              </div>
              <button onClick={() => setGeselecteerdTeam(null)} style={{ background: '#F1F3F5', border: 'none', width: '35px', height: '35px', borderRadius: '50%', fontSize: '1rem', fontWeight: 900, color: '#495057', cursor: 'pointer' }}>✕</button>
            </div>

            {/* LIVE KLASSEMENT VAN DE GROEP */}
            {(() => {
              const groepData = genereerGroepsStand(geselecteerdTeam);
              if (groepData) {
                return (
                  <div style={{ marginBottom: '20px', background: '#F8F9FA', borderRadius: '16px', border: '1px solid #E9ECEF', padding: '12px', overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--magenta)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      📊 Stand {groepData.groepsNaam}
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
                          const sInfo = parseTeam(s.team);
                          return (
                            <tr key={s.team} className={s.team === geselecteerdTeam ? 'highlight' : ''}>
                              <td>
                                <span style={{ marginRight: '5px' }}>{idx + 1}.</span> 
                                {sInfo.emoji} <span style={{ fontWeight: s.team === geselecteerdTeam ? 900 : 800 }}>{sInfo.name}</span>
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

            {/* MATCHEN HISTORIEK */}
            <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', marginBottom: '8px' }}>
              ⚽ Gespeelde & Geplande Matchen
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {gefilterdeMatchen
                .filter((m: any) => m.thuisploeg === geselecteerdTeam || m.uitploeg === geselecteerdTeam)
                .map((m: any) => {
                  const isGespeeld = m.thuis_score !== null;
                  const isThuis = m.thuisploeg === geselecteerdTeam;
                  const tegenstander = isThuis ? m.uitploeg : m.thuisploeg;
                  const tegenstanderInfo = parseTeam(tegenstander);
                  
                  let uitslagKleur = '#111827';
                  let statusIcoon = '⏳';
                  if (isGespeeld) {
                    if ((isThuis && m.thuis_score > m.uit_score) || (!isThuis && m.uit_score > m.thuis_score)) { uitslagKleur = '#40C057'; statusIcoon = '🟢'; } 
                    else if (m.thuis_score === m.uit_score) { uitslagKleur = '#228BE6'; statusIcoon = '➖'; } 
                    else { uitslagKleur = '#FA5252'; statusIcoon = '🔴'; } 
                  }

                  return (
                    <div key={m.id} style={{ background: '#FFF', padding: '12px 15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E9ECEF' }}>
                      <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', marginBottom: '2px' }}>
                          {new Date(m.datum).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short' })} • {m.ronde}
                        </div>
                        <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#6C757D' }}>vs</span> {tegenstanderInfo.name} <span style={{fontSize: '1.2rem'}}>{tegenstanderInfo.emoji}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        {isGespeeld ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: uitslagKleur }}>
                              {isThuis ? `${m.thuis_score} - ${m.uit_score}` : `${m.uit_score} - ${m.thuis_score}`}
                            </span>
                            <span style={{ fontSize: '0.8rem' }}>{statusIcoon}</span>
                          </div>
                        ) : (
                          <div style={{ background: '#F1F3F5', color: '#6C757D', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>
                            Te spelen
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.7rem', color: '#ADB5BD', fontWeight: 800 }}>
                (Tip: Zorg dat je filter bovenaan op "Alle" staat voor de volledige historiek).
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
