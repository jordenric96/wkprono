// src/components/MatchenTab.tsx

export default function MatchenTab({
  gefilterdeMatchen, nu, matchVoorspellingen, matchSaveStatus, alleMatchVoorspellingen,
  actieveSpeler, alleSpelers, handleScore, toggleJoker, filterRonde, setFilterRonde,
  expandedMatchId, setExpandedMatchId
}: any) {

  // --- HULPFUNCTIE: COUNTDOWN ---
  const getMatchCountdown = (matchTime: string) => {
    const diff = new Date(matchTime).getTime() - nu;
    if (diff <= 0) return "🔒 GESLOTEN";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    const isUrgent = diff < (1000 * 60 * 60); // Minder dan 1 uur
    
    return (
      <span style={{ color: isUrgent ? '#FA5252' : 'inherit', fontWeight: 900 }}>
        ⏱️ {h > 0 ? `${h}u ` : ''}{m}m {h === 0 ? `${s}s` : ''}
      </span>
    );
  };

  // --- HULPFUNCTIE: VLAGGEN & KLEUREN GENERATOR ---
  const parseTeam = (teamString: string) => {
    if (!teamString || teamString.includes('TBD')) {
      return { name: teamString || 'TBD', emoji: '❓', gradient: 'linear-gradient(135deg, #e9ecef, #adb5bd)' };
    }

    // 1. Emoji scheiden van tekst
    const emojiMatch = teamString.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu);
    let emoji = emojiMatch ? emojiMatch.join('') : '';

    // 2. Naam netjes maken
    let name = teamString.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();

    // 3. Exacte Vlagkleuren (voor het randje rond de cirkel)
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
      'Zuid-Korea': 'linear-gradient(135deg, #FFF 40%, #CD2E3A 40%, #CD2E3A 60%, #0047A0 60%)',
      'Marokko': 'linear-gradient(135deg, #c1272d 45%, #006233 45%, #006233 55%, #c1272d 55%)'
    };

    // 4. Automatische emoji toevoegen als deze ontbreekt in de spreadsheet
    const defaultEmojis: any = {
      'België': '🇧🇪', 'Nederland': '🇳🇱', 'Frankrijk': '🇫🇷', 'Duitsland': '🇩🇪', 'Spanje': '🇪🇸',
      'Brazilië': '🇧🇷', 'Argentinië': '🇦🇷', 'Portugal': '🇵🇹', 'Italië': '🇮🇹', 'Engeland': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Mexico': '🇲🇽', 'USA': '🇺🇸', 'Verenigde Staten': '🇺🇸', 'Canada': '🇨🇦', 'Marokko': '🇲🇦', 'Zuid-Korea': '🇰🇷'
    };

    if (!emoji && defaultEmojis[name]) emoji = defaultEmojis[name];
    if (!emoji) emoji = '🏳️'; // Standaard witte vlag als fail-safe

    const gradient = colors[name] || 'linear-gradient(135deg, #3772FF, #70E4EF)'; // Standaard blauwe tint
    
    return { name, emoji, gradient };
  };

  return (
    <div>
      {/* FILTER KNOPPEN */}
      <div className="filter-scroll">
        <span className={`filter-chip ${filterRonde === 'Nog in te vullen' ? 'active' : ''}`} onClick={() => setFilterRonde('Nog in te vullen')}>✍️ INVULLEN</span>
        {['Alle', 'Groepsfase', 'Ronde van 32', 'Achtste finale', 'Kwartfinale', 'Halve finale', 'Troostfinale', 'Finale'].map((r: string) => (
          <span key={r} className={`filter-chip ${filterRonde === r ? 'active' : ''}`} onClick={() => setFilterRonde(r)}>{r}</span>
        ))}
      </div>

      {gefilterdeMatchen.length === 0 ? (
        <p style={{textAlign:'center', fontWeight:800, color:'#6C757D', margin:'40px 0'}}>Alle wedstrijden in deze selectie zijn ingevuld!</p>
      ) : (
        gefilterdeMatchen.map((m: any) => {
          const gestart = nu > new Date(m.datum).getTime();
          const v = matchVoorspellingen[m.id] || { thuis: '', uit: '', joker: false };
          const saveStatus = matchSaveStatus[m.id] || 'idle';
          const voorspellingenVoorMatch = alleMatchVoorspellingen.filter((av: any) => av.match_id === m.id);
          const heeftUitslag = m.thuis_score !== null && m.uit_score !== null;

          return (
            <div key={m.id} className={`match-card ${gestart ? 'locked' : ''}`} onClick={() => gestart && setExpandedMatchId(expandedMatchId === m.id ? null : m.id)}>
              
              {/* HEADER MET TIMER OF EINDSTAND */}
              <div className="match-header" style={{ background: heeftUitslag ? 'var(--magenta)' : 'var(--lime)', color: heeftUitslag ? 'white' : '#111827' }}>
                <span>
                   {heeftUitslag ? '🏆 EINDSTAND' : (gestart ? '🔒 GESLOTEN' : getMatchCountdown(m.datum))}
                </span>
                
                {!gestart && (
                  <span className={`save-indicator ${saveStatus}`}>
                    {saveStatus === 'saving' ? '⏳ Opslaan...' : saveStatus === 'saved' ? '✅ Opgeslagen' : ''}
                  </span>
                )}
                
                <button className={`joker-btn ${v.joker ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); if(!gestart) toggleJoker(m.id); }}>🌟</button>
              </div>

              {/* OFFICIËLE SCORE BOVENAAN ALS DEZE BEKEND IS */}
              {heeftUitslag && (
                <div style={{ textAlign: 'center', padding: '10px 0', background: 'rgba(240, 56, 255, 0.1)', borderBottom: '1px solid var(--magenta)' }}>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: 'var(--magenta)' }}>
                    {m.thuis_score} - {m.uit_score}
                  </span>
                </div>
              )}

              {/* VLAGGEN EN SCORE INVOER */}
              <div className="match-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 15px' }}>
                
                {/* THUISPLOEG */}
                {(() => {
                  const thuis = parseTeam(m.thuisploeg);
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '85px' }}>
                      {/* Buitenste gekleurde cirkel (de rand) */}
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: thuis.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                      }}>
                        {/* Binnenste witte cirkel */}
                        <div style={{
                          width: '48px', height: '48px', borderRadius: '50%',
                          background: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.6rem'
                        }}>
                          {thuis.emoji}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', textAlign: 'center', marginTop: '8px', lineHeight: 1.1, color: '#495057' }}>
                        {thuis.name}
                      </span>
                    </div>
                  );
                })()}

                {/* SCORE INVOER */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#ADB5BD', marginBottom: 5 }}>JOUW PRONO</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input className="score-invoer" type="tel" value={v.thuis} disabled={gestart} onClick={e => e.stopPropagation()} onChange={e => handleScore(m.id, 'thuis', e.target.value)} />
                    <span style={{ fontWeight: 900, color: '#ADB5BD' }}>-</span>
                    <input className="score-invoer" type="tel" value={v.uit} disabled={gestart} onClick={e => e.stopPropagation()} onChange={e => handleScore(m.id, 'uit', e.target.value)} />
                  </div>
                </div>

                {/* UITPLOEG */}
                {(() => {
                  const uit = parseTeam(m.uitploeg);
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '85px' }}>
                      {/* Buitenste gekleurde cirkel (de rand) */}
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: uit.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                      }}>
                        {/* Binnenste witte cirkel */}
                        <div style={{
                          width: '48px', height: '48px', borderRadius: '50%',
                          background: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.6rem'
                        }}>
                          {uit.emoji}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', textAlign: 'center', marginTop: '8px', lineHeight: 1.1, color: '#495057' }}>
                        {uit.name}
                      </span>
                    </div>
                  );
                })()}

              </div>

              {/* SPELERS DIE AL INGEVULD HEBBEN */}
              {!gestart && (
                <div className="filled-container" style={{ flexDirection: 'column', gap: 5, padding: '10px' }}>
                  <div className="filled-text" style={{ marginBottom: 3 }}>{voorspellingenVoorMatch.length} / {alleSpelers.length} spelers vulden dit al in:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                    {voorspellingenVoorMatch.map((av: any) => (
                      <span key={av.speler_id} style={{ 
                        fontSize: '0.6rem', padding: '3px 8px', background: 'var(--aqua)', 
                        borderRadius: '8px', fontWeight: 900, color: 'var(--crayola)' 
                      }}>
                        {av.spelers?.naam.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* UITSCHUIFMENU MET ALLE ANTWOORDEN BIJ GESTARTE MATCH */}
              {gestart && expandedMatchId !== m.id && <div className="click-to-expand">Klik om voorspellingen te zien 👁️</div>}

              {gestart && expandedMatchId === m.id && (
                <div className="predictions-dropdown">
                  <div className="pred-title">IEDEREENS VOORSPELLING</div>
                  {voorspellingenVoorMatch.map((av: any) => (
                    <div key={av.id} className="pred-row">
                      <span>{av.spelers?.naam} {av.gouden_bal ? '🌟' : ''}</span>
                      <span className="pred-score">{av.thuis_score} - {av.uit_score}</span>
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