// src/components/MatchenTab.tsx

export default function MatchenTab({
  gefilterdeMatchen, nu, matchVoorspellingen, matchSaveStatus, alleMatchVoorspellingen,
  actieveSpeler, alleSpelers, handleScore, toggleJoker, expandedMatchId, setExpandedMatchId
}: any) {

  // --- HULPFUNCTIE: COUNTDOWN ---
  const getMatchCountdown = (matchTime: string) => {
    const diff = new Date(matchTime).getTime() - nu;
    if (diff <= 0) return "🔒 GESLOTEN";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const isUrgent = diff < (1000 * 60 * 60); // Minder dan 1 uur
    
    return (
      <span style={{ color: isUrgent ? '#FA5252' : 'inherit', fontWeight: 900 }}>
        ⏱️ {h > 0 ? `${h}u ` : ''}{m}m
      </span>
    );
  };

  // --- HULPFUNCTIE: VLAGGEN & KLEUREN GENERATOR ---
  const parseTeam = (teamString: string) => {
    if (!teamString || teamString.includes('TBD')) {
      return { name: teamString || 'TBD', emoji: '❓', gradient: 'linear-gradient(135deg, #e9ecef, #adb5bd)' };
    }

    // 1. Haal emoji uit de string (als die erin staat)
    const emojiMatch = teamString.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu);
    let emoji = emojiMatch ? emojiMatch.join('') : '';

    // 2. Naam netjes maken (zonder emoji)
    let name = teamString.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();

    // 3. Exacte Vlagkleuren voor de cirkel-rand
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
      'USA': 'linear-gradient(135deg, #B31942 33%, #FFF 33%, #FFF 66%, #0A3161 66%)',
      'Verenigde Staten': 'linear-gradient(135deg, #B31942 33%, #FFF 33%, #FFF 66%, #0A3161 66%)',
      'Canada': 'linear-gradient(135deg, #FF0000 30%, #FFF 30%, #FFF 70%, #FF0000 70%)',
      'South Korea': 'linear-gradient(135deg, #FFF 40%, #CD2E3A 40%, #CD2E3A 60%, #0047A0 60%)',
      'South Africa': 'linear-gradient(135deg, #007A4D 25%, #FFB612 25%, #FFB612 50%, #000 50%, #000 75%, #DE3831 75%)',
      'Czechia': 'linear-gradient(135deg, #11457E 33%, #D7141A 33%, #D7141A 66%, #FFF 66%)',
      'Marokko': 'linear-gradient(135deg, #c1272d 45%, #006233 45%, #006233 55%, #c1272d 55%)'
    };

    // 4. Standaard emoji toevoegen als deze in de sheet ontbrak
    const defaultEmojis: any = {
      'België': '🇧🇪', 'Nederland': '🇳🇱', 'Frankrijk': '🇫🇷', 'Duitsland': '🇩🇪', 'Spanje': '🇪🇸',
      'Brazilië': '🇧🇷', 'Argentinië': '🇦🇷', 'Portugal': '🇵🇹', 'Italië': '🇮🇹', 'Engeland': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Mexico': '🇲🇽', 'USA': '🇺🇸', 'Verenigde Staten': '🇺🇸', 'Canada': '🇨🇦', 'Marokko': '🇲🇦', 
      'South Korea': '🇰🇷', 'South Africa': '🇿🇦', 'Czechia': '🇨🇿'
    };

    if (!emoji && defaultEmojis[name]) emoji = defaultEmojis[name];
    if (!emoji) emoji = '🏳️'; // Fallback

    const gradient = colors[name] || 'linear-gradient(135deg, #3772FF, #70E4EF)'; // Blauwe standaard rand
    
    return { name, emoji, gradient };
  };

  return (
    <div>
      {/* FILTER MENU IS VOLLEDIG VERWIJDERD VOLGENS JOUW VRAAG */}

      {gefilterdeMatchen.length === 0 ? (
        <p style={{textAlign:'center', fontWeight:800, color:'#6C757D', margin:'40px 0'}}>Geen matchen gevonden.</p>
      ) : (
        gefilterdeMatchen.map((m: any) => {
          const gestart = nu > new Date(m.datum).getTime();
          const v = matchVoorspellingen[m.id] || { thuis: '', uit: '', joker: false };
          const saveStatus = matchSaveStatus[m.id] || 'idle';
          const voorspellingenVoorMatch = alleMatchVoorspellingen.filter((av: any) => av.match_id === m.id);
          const heeftUitslag = m.thuis_score !== null && m.uit_score !== null;

          return (
            <div 
              key={m.id} 
              style={{
                background: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '16px', 
                marginBottom: '15px', 
                border: gestart ? '3px solid #EF709D' : '3px solid #E9ECEF', 
                overflow: 'hidden',
                boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                cursor: gestart ? 'pointer' : 'default'
              }}
              onClick={() => gestart && setExpandedMatchId(expandedMatchId === m.id ? null : m.id)}
            >
              
              {/* HEADER: TIMER & JOKER KNOP */}
              <div style={{ 
                background: heeftUitslag ? '#F038FF' : '#E2EF70', 
                color: heeftUitslag ? 'white' : '#111827',
                padding: '12px 15px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <span style={{ fontSize: '0.8rem' }}>
                   {heeftUitslag ? '🏆 EINDSTAND' : (gestart ? '🔒 GESLOTEN' : getMatchCountdown(m.datum))}
                </span>
                
                {/* DUIDELIJKE JOKER KNOP */}
                <button 
                  onClick={(e) => { e.stopPropagation(); if(!gestart) toggleJoker(m.id); }}
                  disabled={gestart}
                  style={{
                    background: v.joker ? '#FFD700' : '#FFFFFF',
                    color: v.joker ? '#000' : '#111827',
                    border: v.joker ? '2px solid #E6C200' : '2px solid #DEE2E6',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    cursor: gestart ? 'not-allowed' : 'pointer',
                    boxShadow: v.joker ? '0 4px 10px rgba(255, 215, 0, 0.4)' : '0 2px 5px rgba(0,0,0,0.05)',
                    transition: '0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {v.joker ? '🌟 JOKER ACTIEF' : '⭐ GEBRUIK JOKER'}
                </button>
              </div>

              {/* EVENTUELE EINDSTAND BOVENAAN */}
              {heeftUitslag && (
                <div style={{ textAlign: 'center', padding: '10px 0', background: 'rgba(240, 56, 255, 0.1)', borderBottom: '1px solid #F038FF' }}>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#F038FF' }}>
                    {m.thuis_score} - {m.uit_score}
                  </span>
                </div>
              )}

              {/* BODY: VLAGGEN EN SCORES */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 10px' }}>
                
                {/* THUISPLOEG (CIRKEL + NAAM ONDERAAN) */}
                {(() => {
                  const thuis = parseTeam(m.thuisploeg);
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <div style={{
                        width: '60px', height: '60px', borderRadius: '50%',
                        background: thuis.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                      }}>
                        <div style={{
                          width: '52px', height: '52px', borderRadius: '50%',
                          background: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.8rem'
                        }}>
                          {thuis.emoji}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 900, textAlign: 'center', marginTop: '8px', color: '#111827' }}>
                        {thuis.name}
                      </span>
                    </div>
                  );
                })()}

                {/* SCORE INVOER */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 10px' }}>
                  <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#ADB5BD', marginBottom: '5px', letterSpacing: '1px' }}>JOUW PRONO</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="tel" 
                      value={v.thuis} 
                      disabled={gestart} 
                      onClick={e => e.stopPropagation()} 
                      onChange={e => handleScore(m.id, 'thuis', e.target.value)} 
                      style={{ 
                        width: '45px', height: '50px', fontSize: '1.5rem', textAlign: 'center', 
                        borderRadius: '12px', border: '2px solid #DEE2E6', outline: 'none', 
                        fontWeight: 900, fontFamily: 'Bebas Neue', background: gestart ? '#f1f3f5' : '#fff',
                        color: gestart ? '#adb5bd' : '#111827'
                      }} 
                    />
                    <span style={{ fontWeight: 900, color: '#ADB5BD' }}>-</span>
                    <input 
                      type="tel" 
                      value={v.uit} 
                      disabled={gestart} 
                      onClick={e => e.stopPropagation()} 
                      onChange={e => handleScore(m.id, 'uit', e.target.value)} 
                      style={{ 
                        width: '45px', height: '50px', fontSize: '1.5rem', textAlign: 'center', 
                        borderRadius: '12px', border: '2px solid #DEE2E6', outline: 'none', 
                        fontWeight: 900, fontFamily: 'Bebas Neue', background: gestart ? '#f1f3f5' : '#fff',
                        color: gestart ? '#adb5bd' : '#111827'
                      }} 
                    />
                  </div>
                  {/* SAVE INDICATOR ONDER DE SCORES */}
                  {!gestart && saveStatus !== 'idle' && (
                    <span style={{ fontSize: '0.6rem', fontWeight: 900, marginTop: '5px', color: saveStatus === 'saving' ? '#F038FF' : '#2ECC40' }}>
                      {saveStatus === 'saving' ? '⏳ Opslaan...' : '✅ Opgeslagen'}
                    </span>
                  )}
                </div>

                {/* UITPLOEG (CIRKEL + NAAM ONDERAAN) */}
                {(() => {
                  const uit = parseTeam(m.uitploeg);
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <div style={{
                        width: '60px', height: '60px', borderRadius: '50%',
                        background: uit.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                      }}>
                        <div style={{
                          width: '52px', height: '52px', borderRadius: '50%',
                          background: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.8rem'
                        }}>
                          {uit.emoji}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 900, textAlign: 'center', marginTop: '8px', color: '#111827' }}>
                        {uit.name}
                      </span>
                    </div>
                  );
                })()}

              </div>

              {/* WIE HEEFT ER AL INGEVULD? */}
              {!gestart && (
                <div style={{ background: '#F8F9FA', padding: '10px', borderTop: '1px dashed #DEE2E6', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ADB5BD' }}>{voorspellingenVoorMatch.length} / {alleSpelers.length} spelers vulden dit al in:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                    {voorspellingenVoorMatch.map((av: any) => (
                      <span key={av.speler_id} style={{ 
                        fontSize: '0.6rem', padding: '3px 8px', background: '#70E4EF', 
                        borderRadius: '8px', fontWeight: 900, color: '#3772FF' 
                      }}>
                        {av.spelers?.naam.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* UITSCHUIFMENU VOOR GESTARTE MATCHEN */}
              {gestart && expandedMatchId !== m.id && (
                <div style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: '#EF709D', paddingBottom: '10px', textTransform: 'uppercase' }}>
                  Klik om voorspellingen te zien 👁️
                </div>
              )}

              {gestart && expandedMatchId === m.id && (
                <div style={{ background: 'rgba(240, 244, 248, 0.9)', padding: '15px', borderTop: '2px solid #E9ECEF' }}>
                  <div style={{ fontWeight: 900, color: '#3772FF', fontSize: '0.75rem', marginBottom: '10px', borderBottom: '2px solid #DEE2E6', paddingBottom: '5px' }}>
                    IEDEREENS VOORSPELLING
                  </div>
                  {voorspellingenVoorMatch.map((av: any) => (
                    <div key={av.id} style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.85rem', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <span>{av.spelers?.naam} {av.gouden_bal ? '🌟' : ''}</span>
                      <span style={{ color: '#F038FF', fontFamily: 'Bebas Neue', fontSize: '1.2rem' }}>{av.thuis_score} - {av.uit_score}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          );
        })
      )}
    </div>
  );
}