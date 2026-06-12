// src/components/TellersTab.tsx
import React, { useMemo } from 'react';

const getEmoji = (teamName: string) => {
  if (!teamName) return '🏳️';
  const cleanName = teamName.toLowerCase().trim();
  const emojis: Record<string, string> = {
    'belgië': '🇧🇪', 'nederland': '🇳🇱', 'frankrijk': '🇫🇷', 'duitsland': '🇩🇪', 'spanje': '🇪🇸',
    'brazilië': '🇧🇷', 'argentinië': '🇦🇷', 'portugal': '🇵🇹', 'italië': '🇮🇹', 'engeland': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'mexico': '🇲🇽', 'verenigde staten': '🇺🇸', 'canada': '🇨🇦', 'marokko': '🇲🇦', 'kroatië': '🇭🇷',
    'japan': '🇯🇵', 'senegal': '🇸🇳', 'zwitserland': '🇨🇭', 'uruguay': '🇺🇾', 'colombia': '🇨🇴',
    'zuid-afrika': '🇿🇦', 'tsjechië': '🇨🇿', 'zuid-korea': '🇰🇷', 'bosnië': '🇧🇦'
  };
  return emojis[cleanName] || '🏳️';
};

export default function TellersTab({ matchen = [] }: any) {
  
  const stats = useMemo(() => {
    let totaleGoals = 0;
    let totaleGeel = 0;
    let totaleRood = 0;

    const teamGoalsVoor: Record<string, number> = {};
    const teamGoalsTegen: Record<string, number> = {};
    const teamGespeeld: Record<string, number> = {};

    matchen.forEach((m: any) => {
      // Vangt lege strings én null waarden correct op
      if (m.thuis_score !== null && m.thuis_score !== '' && m.uit_score !== null && m.uit_score !== '') {
        const thuisScore = Number(m.thuis_score);
        const uitScore = Number(m.uit_score);

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

    const topAanval = Object.entries(teamGoalsVoor)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const topVerdediging = Object.entries(teamGoalsTegen)
      .filter(([team]) => teamGespeeld[team] > 0)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3);

    return { 
      totaleGoals, totaleGeel, totaleRood, topAanval, topVerdediging, 
      matchenGespeeld: Object.keys(teamGespeeld).length > 0 
    };
  }, [matchen]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        
        <div style={{ background: '#1A1423', borderRadius: '16px', padding: '15px 10px', textAlign: 'center', border: '2px solid #CCFF00', boxShadow: '0 4px 15px rgba(204, 255, 0, 0.2)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '5px' }}>⚽</div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#CCFF00', lineHeight: 1 }}>{stats.totaleGoals}</div>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', marginTop: '4px' }}>Goals</div>
        </div>

        <div style={{ background: '#1A1423', borderRadius: '16px', padding: '15px 10px', textAlign: 'center', border: '2px solid #00E5FF', boxShadow: '0 4px 15px rgba(0, 229, 255, 0.2)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '5px' }}>🟨</div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#00E5FF', lineHeight: 1 }}>{stats.totaleGeel}</div>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', marginTop: '4px' }}>Gele Kaarten</div>
        </div>

        <div style={{ background: '#1A1423', borderRadius: '16px', padding: '15px 10px', textAlign: 'center', border: '2px solid #E30022', boxShadow: '0 4px 15px rgba(227, 0, 34, 0.2)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '5px' }}>🟥</div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#E30022', lineHeight: 1 }}>{stats.totaleRood}</div>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', marginTop: '4px' }}>Rode Kaarten</div>
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
            ⚔️ MEEST SCORENDE TEAMS
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.topAanval.map(([team, goals], index) => (
              <div key={team} style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '12px 15px', borderRadius: '12px', borderLeft: index === 0 ? '4px solid #2B00FF' : 'none' }}>
                <span style={{ fontSize: '1.2rem', marginRight: '15px', opacity: index === 0 ? 1 : 0.6 }}>{index + 1}.</span>
                <span style={{ fontSize: '1.4rem', marginRight: '10px' }}>{getEmoji(team)}</span>
                <span style={{ flex: 1, fontWeight: 900, color: '#FFF', fontSize: '1.1rem' }}>{team}</span>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#2B00FF' }}>{goals}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.matchenGespeeld && (
        <div style={{ background: '#1A1423', borderRadius: '16px', padding: '20px', border: '2px solid #7A00E6', boxShadow: '0 4px 15px rgba(122, 0, 230, 0.2)' }}>
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#7A00E6', margin: '0 0 15px 0', textAlign: 'center', letterSpacing: '1px' }}>
            🛡️ BESTE VERDEDIGING
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.topVerdediging.map(([team, goalsTegen], index) => (
              <div key={team} style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '12px 15px', borderRadius: '12px', borderLeft: index === 0 ? '4px solid #7A00E6' : 'none' }}>
                <span style={{ fontSize: '1.2rem', marginRight: '15px', opacity: index === 0 ? 1 : 0.6 }}>{index + 1}.</span>
                <span style={{ fontSize: '1.4rem', marginRight: '10px' }}>{getEmoji(team)}</span>
                <span style={{ flex: 1, fontWeight: 900, color: '#FFF', fontSize: '1.1rem' }}>{team}</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#7A00E6', lineHeight: 1 }}>{goalsTegen}</span>
                  <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase' }}>Tegen</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
