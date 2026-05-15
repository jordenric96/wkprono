// src/components/MatchenTab.tsx
import React, { useState } from 'react';

// --- HULPFUNCTIE: VLAGGEN & KLEUREN GENERATOR ---
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
    'Serbia': 'Servië', 'Iran': 'Iran', 'Saudi Arabia': 'Saudi-Arabië', 'Ukraine': 'Oekraïne', 'Peru': 'Peru', 
    'Panama': 'Panama', 'Egypt': 'Egypte', 'Tunisia': 'Tunesië', 'New Zealand': 'Nieuw-Zeeland', 'Qatar': 'Qatar', 
    'Ireland': 'Ierland', 'Turkey': 'Turkije', 'Romania': 'Roemenië', 'Hungary': 'Hongarije', 'Norway': 'Noorwegen', 
    'Iceland': 'IJsland', 'Slovakia': 'Slowakije', 'Iraq': 'Irak', 'Paraguay': 'Paraguay', 'Venezuela': 'Venezuela', 
    'Mali': 'Mali', 'Algeria': 'Algerije', 'Zambia': 'Zambia', 'Honduras': 'Honduras', 'El Salvador': 'El Salvador', 
    'Ivory Coast': 'Ivoorkust', 'Cameroon': 'Kameroen', 'Chile': 'Chili', 'Colombia': 'Colombia', 
    'Costa Rica': 'Costa Rica', 'Austria': 'Oostenrijk', 'Australia': 'Australië', 'Cabo Verde': 'Kaapverdië', 
    'Haiti': 'Haïti', 'Curacao': 'Curaçao', 'Jordan': 'Jordanië', 'Congo DR': 'Congo', 'Uzbekistan': 'Oezbekistan'
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
    'Kroatië': 'linear-gradient(135deg, #FF0000 33%, #FFF 33%, #FFF 66%, #0000FF 66%)',
    'Zuid-Korea': 'linear-gradient(135deg, #FFF 40%, #CD2E3A 40%, #CD2E3A 60%, #0047A0 60%)',
    'Zuid-Afrika': 'linear-gradient(135deg, #007A4D 25%, #FFB612 25%, #FFB612 50%, #000 50%, #000 75%, #DE3831 75%)',
    'Tsjechië': 'linear-gradient(135deg, #11457E 33%, #D7141A 33%, #D7141A 66%, #FFF 66%)',
    'Bosnië': 'linear-gradient(135deg, #002395 40%, #FECB00 40%, #FECB00 60%, #FFFFFF 60%)'
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
    'Bosnië': '🇧🇦'
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
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
              
              {/* MATCH HEADER */}
              <div style={{ background: '#F8F9FA', padding: '8px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E9ECEF', fontSize: '0.7rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase' }}>
                <span>{dateStr} • {timeStr} • {match.ronde}</span>
                {saveStatus === 'saving' && <span style={{ color: 'var(--crayola)' }}>Opslaan... ⏳</span>}
                {saveStatus === 'saved' && <span style={{ color: '#40C057' }}>Opgeslagen ✅</span>}
                {isMatchGesloten && <span style={{ color: '#FA5252' }}>🔒 GESLOTEN</span>}
              </div>

              {/* MATCH BODY */}
              <div style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px' }}>
                
                {/* THUISPLOEG (Klikbaar, nu met mooie gradient bollen) */}
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

                {/* SCORES INVULLEN */}
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

                {/* UITPLOEG (Klikbaar, nu met mooie gradient bollen) */}
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

              {/* Uitslag & Spionage */}
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

      {/* TEAM DOSSIER POP-UP - NU GEMACENTREERD EN ALTIJD ZICHTBAAR */}
      {geselecteerdTeam && (
        <div 
          onClick={() => setGeselecteerdTeam(null)} 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, // Neemt altijd 100% van het scherm in
            background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)', 
            zIndex: 99999, // Extreem hoge z-index zodat hij BOVEN de blauwe navbar staat
            display: 'flex', alignItems: 'center', justifyContent: 'center', // Nu perfect in het midden (center)
            padding: '20px', // Beetje marge aan de zijkanten op gsm
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{
              background: '#FFF', width: '100%', maxWidth: '400px', maxHeight: '80vh',
              borderRadius: '24px', // Volledig afgerond rondom
              padding: '25px 20px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              display: 'flex', flexDirection: 'column',
              animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Mooi pop-effect
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
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', letterSpacing: '1px' }}>Team Dossier en Uitslagen</div>
                      </div>
                    </>
                  );
                })()}
              </div>
              <button onClick={() => setGeselecteerdTeam(null)} style={{ background: '#F1F3F5', border: 'none', width: '35px', height: '35px', borderRadius: '50%', fontSize: '1rem', fontWeight: 900, color: '#495057', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Matchen Historiek */}
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
                    <div key={m.id} style={{ background: '#F8F9FA', padding: '12px 15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E9ECEF' }}>
                      
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
                          <div style={{ background: 'var(--crayola)', color: '#FFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>
                            Te spelen
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.7rem', color: '#ADB5BD', fontWeight: 800 }}>
                (Tip: Zorg dat je filter bovenaan op &quot;Alle&quot; staat om de volledige historiek te zien).
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
