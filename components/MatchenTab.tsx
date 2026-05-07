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
          const voorspellingenVoorMatch = alleMatchVoorspellingen.filter((av: any) => av.match_id === m.id);

          return (
            <div key={m.id} className={`match-card ${saveStatus === 'saved' ? 'is-saved' : ''} ${gestart ? 'locked' : ''}`} onClick={() => gestart && setExpandedMatchId(expandedMatchId === m.id ? null : m.id)}>
              <div className="match-header">
                <span>{m.ronde} • {new Date(m.datum).toLocaleDateString('nl-BE', {day:'2-digit', month:'short'})} {new Date(m.datum).toLocaleTimeString('nl-BE', {hour:'2-digit', minute:'2-digit'})}</span>
                {!gestart && (
                  <span className={`save-indicator ${saveStatus}`}>
                    {saveStatus === 'saving' ? '⏳ Opslaan...' : saveStatus === 'saved' ? '✅ Opgeslagen' : ''}
                  </span>
                )}
                <button className={`joker-btn ${v.joker ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); if(!gestart) toggleJoker(m.id); }}>🌟</button>
              </div>
              <div className="match-body" style={{paddingBottom: (gestart && expandedMatchId !== m.id) ? '10px' : '15px'}}>
                <span className="team-naam">{m.thuisploeg}</span>
                <input className="score-invoer" type="tel" value={v.thuis} disabled={gestart} onClick={e => e.stopPropagation()} onChange={e => handleScore(m.id, 'thuis', e.target.value)} />
                <span style={{margin:'0 10px', fontWeight:900, color:'#ADB5BD'}}>-</span>
                <input className="score-invoer" type="tel" value={v.uit} disabled={gestart} onClick={e => e.stopPropagation()} onChange={e => handleScore(m.id, 'uit', e.target.value)} />
                <span className="team-naam">{m.uitploeg}</span>
              </div>

              {!gestart && (
                <div className="filled-container">
                  <div className="filled-avatars">
                    {voorspellingenVoorMatch.map((av: any) => (
                      <div key={av.speler_id} className="filled-avatar" title={av.spelers?.naam}>{av.spelers?.naam?.charAt(0).toUpperCase()}</div>
                    ))}
                  </div>
                  <span className="filled-text">{voorspellingenVoorMatch.length} / {alleSpelers.length} ingevuld</span>
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