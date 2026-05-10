// src/components/TellersTab.tsx
import React from 'react';

// --- MEGA DATABASE MET VERTAALMACHINE EN VLAGGEN ---
const parseTeam = (teamString: string) => {
  if (!teamString || teamString.includes('TBD') || teamString.includes('Nog geen data')) {
    return { name: teamString || 'TBD', emoji: '❓', gradient: 'linear-gradient(135deg, #DEE2E6, #ADB5BD)' };
  }

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
  const gradient = colors[name] || 'linear-gradient(135deg, #DEE2E6, #ADB5BD)';
  
  return { name, emoji, gradient };
};

// --- HET COMPONENT ZELF ---
export default function TellersTab({ tellersData }: any) {
  const { totaleGoals, totaleGeleKaarten, totaleRodeKaarten, meestScorendTeam, minstTegenTeam } = tellersData;

  // Haal de vlaggetjes en kleuren op voor de top teams (index 0 is de naam, index 1 is het aantal goals)
  const topScorer = parseTeam(meestScorendTeam[0]);
  const bestDefense = parseTeam(minstTegenTeam[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      <style>{`
        .teller-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 20px;
          border: 2px solid #E9ECEF;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .teller-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.6rem;
          margin: 0 0 5px 0;
          line-height: 1;
        }
        
        .teller-sub {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.8);
          font-weight: 800;
          margin: 0 0 15px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .teller-big-number {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 4.5rem;
          line-height: 1;
          margin: 0;
          text-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        /* Specifieke Team Styling */
        .team-flag-circle {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
          margin: 0 auto 10px auto;
        }

        .team-flag-inner {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }
      `}</style>

      {/* TOTAAL GOALS - GROTE KAART BovenAAN */}
      <div className="teller-card" style={{ background: 'linear-gradient(135deg, #70E4EF, #3772FF)', borderColor: '#3772FF', color: '#FFF' }}>
        <h3 className="teller-title">⚽ Totaal Doelpunten</h3>
        <p className="teller-sub">In Het Huidige Toernooi</p>
        <div className="teller-big-number">{totaleGoals}</div>
      </div>

      {/* TEAM STATISTIEKEN (Meest scorend & Sterkste verdediging) */}
      <div style={{ display: 'flex', gap: '15px' }}>
        
        {/* Meest Scorend */}
        <div className="teller-card" style={{ flex: 1 }}>
          <h3 className="teller-title" style={{ color: '#40C057', fontSize: '1.4rem' }}>Gouden Schoen</h3>
          <p style={{ fontSize: '0.65rem', color: '#6C757D', fontWeight: 800, margin: '0 0 15px 0' }}>Meeste Doelpunten Voor</p>
          
          <div className="team-flag-circle" style={{ background: topScorer.gradient }}>
            <div className="team-flag-inner">{topScorer.emoji}</div>
          </div>
          
          <div style={{ fontWeight: 900, color: '#111827', fontSize: '1.1rem', textTransform: 'uppercase' }}>
            {topScorer.name !== 'Nog geen data' ? topScorer.name : '?'}
          </div>
          <div style={{ color: '#40C057', fontWeight: 900, fontSize: '1.5rem', fontFamily: 'Bebas Neue' }}>
            {meestScorendTeam[1]} GOALS
          </div>
        </div>

        {/* Sterkste Defensie */}
        <div className="teller-card" style={{ flex: 1 }}>
          <h3 className="teller-title" style={{ color: '#228BE6', fontSize: '1.4rem' }}>De Muur</h3>
          <p style={{ fontSize: '0.65rem', color: '#6C757D', fontWeight: 800, margin: '0 0 15px 0' }}>Minste Doelpunten Tegen</p>
          
          <div className="team-flag-circle" style={{ background: bestDefense.gradient }}>
            <div className="team-flag-inner">{bestDefense.emoji}</div>
          </div>
          
          <div style={{ fontWeight: 900, color: '#111827', fontSize: '1.1rem', textTransform: 'uppercase' }}>
            {bestDefense.name !== 'Nog geen data' ? bestDefense.name : '?'}
          </div>
          <div style={{ color: '#228BE6', fontWeight: 900, fontSize: '1.5rem', fontFamily: 'Bebas Neue' }}>
            {minstTegenTeam[1]} TEGEN
          </div>
        </div>

      </div>

      {/* RODE & GELE KAARTEN */}
      <div style={{ display: 'flex', gap: '15px' }}>
        
        <div className="teller-card" style={{ flex: 1, background: '#FCD116', borderColor: '#F1BF00', padding: '15px' }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', color: '#111827', marginBottom: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '16px', background: '#FFD700', borderRadius: '2px', border: '1px solid rgba(0,0,0,0.2)' }} />
            TOTAAL GEEL
          </div>
          <div style={{ fontSize: '3rem', fontFamily: 'Bebas Neue', color: '#111827', lineHeight: 1 }}>
            {totaleGeleKaarten}
          </div>
        </div>

        <div className="teller-card" style={{ flex: 1, background: '#FA5252', borderColor: '#C92A2A', padding: '15px' }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', color: '#FFF', marginBottom: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '16px', background: '#C92A2A', borderRadius: '2px', border: '1px solid rgba(0,0,0,0.2)' }} />
            TOTAAL ROOD
          </div>
          <div style={{ fontSize: '3rem', fontFamily: 'Bebas Neue', color: '#FFF', lineHeight: 1 }}>
            {totaleRodeKaarten}
          </div>
        </div>

      </div>

    </div>
  );
}