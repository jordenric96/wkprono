// src/components/MatchenTab.tsx
export default function MatchenTab({
  gefilterdeMatchen, nu, matchVoorspellingen, matchSaveStatus, alleMatchVoorspellingen,
  actieveSpeler, alleSpelers, handleScore, toggleJoker, slaMatchOp, filterRonde, setFilterRonde,
  expandedMatchId, setExpandedMatchId
}: any) {
  return (
    <div>
      <div className="filter-scroll">
        <span className={`filter-chip urgent ${filterRonde === 'Nog in te vullen' ? 'active' : ''}`} onClick={() => setFilterRonde('Nog in te vullen')}>Nog in te vullen ✍️</span>
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
          
          // Zoek alle voorspellingen voor deze specifieke match
          const voorspellingenVoorMatch = alleMatchVoorspellingen.filter((av: any) => av.match_id === m.id);
          
          // Heeft deze match al een officiële uitslag in de spreadsheet?
          const heeftUitslag = m.thuis_score !== null && m.uit_score !== null;

          return (
            <div key={m.id} 
              className={`match-card ${saveStatus === 'saved' ? 'is-saved' : ''} ${gestart ? 'locked' : ''}`} 
              onClick={() => gestart && setExpandedMatchId(expandedMatchId === m.id ? null : m.id)}
            >
              {/* MATCH HEADER */}
              <div className="match-header" style={{ background: heeftUitslag ? 'var(--magenta)' : 'var(--lime)', color: heeftUitslag ? 'white' : '#111827' }}>
                <span style={{fontWeight: 900}}>
                   {heeftUitslag ? '🏆 UITSLAG BEKEND' : `${m.ronde} • ${new Date(m.datum).toLocaleDateString('nl-BE', {day:'2-digit', month:'short'})}`}
                </span>
                
                {!gestart && (
                  <span className={`save-indicator ${saveStatus}`}>
                    {saveStatus === 'saving' ? '⏳ Opslaan...' : saveStatus === 'saved' ? '✅ Opgeslagen' : ''}
                  </span>
                )}
                
                <button className={`joker-btn ${v.joker ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); if(!gestart) toggleJoker(m.id); }}>🌟</button>
              </div>

              {/* OFFICIËLE SCORE (Indien ingevuld in spreadsheet) */}
              {heeftUitslag && (
                <div style={{ textAlign: 'center', padding: '10px 0', background: 'rgba(240, 56, 255, 0.1)', borderBottom: '1px solid var(--magenta)' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--magenta)', display: 'block' }}>EINDSTAND</span>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: '2.2rem', color: 'var(--magenta)' }}>
                    {m.thuis_score} - {m.uit_score}
                  </span>
                </div>
              )}

              {/* INPUTS VOOR VOORSPELLING */}
              <div className="match-body" style={{paddingBottom: (gestart && expandedMatchId !== m.id) ? '10px' : '15px'}}>
                <span className="team-naam">{m.thuisploeg}</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#ADB5BD', marginBottom: 2 }}>JOUW POKER</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input className="score-invoer" type="tel" value={v.thuis} disabled={gestart} onClick={e => e.stopPropagation()} onChange={e => handleScore(m.id, 'thuis', e.target.value)} />
                    <span style={{margin:'0 10px', fontWeight:900, color:'#ADB5BD'}}>-</span>
                    <input className="score-invoer" type="tel" value={v.uit} disabled={gestart} onClick={e => e.stopPropagation()} onChange={e => handleScore(m.id, 'uit', e.target.value)} />
                  </div>
                </div>
                <span className="team-naam">{m.uitploeg}</span>
              </div>

              {/* WIE HEEFT AL INGEVULD? (Namen ipv alleen bolletjes) */}
              {!gestart && (
                <div className="filled-container" style={{ flexDirection: 'column', gap: 5, padding: '10px' }}>
                  <div className="filled-text" style={{ marginBottom: 3 }}>{voorspellingenVoorMatch.length} / {alleSpelers.length} spelers vulden dit al in:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                    {voorspellingenVoorMatch.map((av: any) => (
                      <span key={av.speler_id} style={{ 
                        fontSize: '0.6rem', 
                        padding: '3px 8px', 
                        background: 'var(--aqua)', 
                        borderRadius: '8px', 
                        fontWeight: 900, 
                        color: 'var(--crayola)' 
                      }}>
                        {av.spelers?.naam.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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