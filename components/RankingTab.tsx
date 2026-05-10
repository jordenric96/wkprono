// src/components/RankingTab.tsx

export default function RankingTab({ klassement, actieveSpeler, toggleBetaald }: any) {
  const isAdmin = actieveSpeler?.naam?.toLowerCase() === 'jorden ricour'.toLowerCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      <style>{`
        .rank-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 15px;
          border: 2px solid #E9ECEF;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          gap: 15px;
          position: relative;
          overflow: hidden;
        }

        .rank-card.rank-1 { border-color: #FFD700; background: linear-gradient(135deg, #FFFDF5, #FFF); box-shadow: 0 8px 20px rgba(255, 215, 0, 0.2); }
        .rank-card.rank-2 { border-color: #C0C0C0; background: linear-gradient(135deg, #F8F9FA, #FFF); box-shadow: 0 8px 20px rgba(192, 192, 192, 0.2); }
        .rank-card.rank-3 { border-color: #CD7F32; background: linear-gradient(135deg, #FFF9F5, #FFF); box-shadow: 0 8px 20px rgba(205, 127, 50, 0.2); }

        .rank-badge {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem;
          color: white;
          background: var(--crayola);
          flex-shrink: 0;
        }

        .rank-1 .rank-badge { background: linear-gradient(135deg, #FFD700, #F1BF00); color: #000; }
        .rank-2 .rank-badge { background: linear-gradient(135deg, #E9ECEF, #ADB5BD); color: #111827; }
        .rank-3 .rank-badge { background: linear-gradient(135deg, #E6A15C, #CD7F32); color: #FFF; }

        .rank-info { flex: 1; display: flex; flex-direction: column; }
        .rank-name { font-size: 1.1rem; font-weight: 900; color: #111827; margin-bottom: 6px; }
        
        .points-breakdown { display: flex; gap: 6px; margin-bottom: 8px; }
        .pt-tag { font-size: 0.6rem; font-weight: 900; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; }
        .pt-prono { background: rgba(55, 114, 255, 0.1); color: var(--crayola); border: 1px solid rgba(55, 114, 255, 0.2); }
        .pt-bonus { background: rgba(240, 56, 255, 0.1); color: var(--magenta); border: 1px solid rgba(240, 56, 255, 0.2); }

        .rank-stats { display: flex; gap: 6px; font-size: 0.6rem; font-weight: 800; color: #ADB5BD; text-transform: uppercase; }

        .rank-score-container { text-align: right; }
        .rank-score { font-family: 'Bebas Neue', sans-serif; font-size: 2.8rem; color: var(--magenta); line-height: 1; }
        .rank-score-label { font-size: 0.6rem; font-weight: 900; color: #ADB5BD; text-transform: uppercase; }

        .betaal-status { font-size: 0.6rem; font-weight: 900; padding: 4px 8px; border-radius: 8px; display: inline-block; margin-top: 10px; text-transform: uppercase; }
        .status-ok { background: #D3F9D8; color: #2B8A3E; }
        .status-wait { background: #FFE3E3; color: #E03131; }

        .admin-toggle-btn {
          margin-top: 10px; font-size: 0.6rem; font-weight: 900; padding: 6px 10px; border-radius: 8px; border: none; cursor: pointer; text-transform: uppercase;
        }
        .admin-toggle-btn.ok { background: #D3F9D8; color: #2B8A3E; }
        .admin-toggle-btn.wait { background: #FFE3E3; color: #E03131; }
      `}</style>

      {klassement.map((s: any, i: number) => {
        const podiumClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
        const isMij = s.id === actieveSpeler?.id;

        return (
          <div key={s.id} className={`rank-card ${podiumClass}`} style={{ border: isMij && i > 2 ? '2px solid var(--crayola)' : '' }}>
            
            <div className="rank-badge">{i + 1}</div>

            <div className="rank-info">
              <div className="rank-name">
                {s.naam} {isMij && <span style={{fontSize:'0.5rem', background:'var(--crayola)', color:'#FFF', padding:'2px 5px', borderRadius:'6px', marginLeft:5, verticalAlign:'middle'}}>JIJ</span>}
              </div>
              
              {/* PUNTEN ONDERSCHEID */}
              <div className="points-breakdown">
                <span className="pt-tag pt-prono">⚽ {s.prono_score || 0} Pronos</span>
                <span className="pt-tag pt-bonus">💎 {s.bonus_score || 0} Bonus</span>
              </div>

              <div className="rank-stats">
                <span>{s.exact} Exact</span>
                <span>•</span>
                <span>{s.winnaarCorrect} Win</span>
              </div>

              {/* BETALINGSSTATUS */}
              <div>
                {isAdmin ? (
                  <button onClick={() => toggleBetaald(s.id, s.betaald)} className={`admin-toggle-btn ${s.betaald ? 'ok' : 'wait'}`}>
                    {s.betaald ? '💰 Betaald' : '⏳ Betaling?'}
                  </button>
                ) : (
                  <span className={`betaal-status ${s.betaald ? 'status-ok' : 'status-wait'}`}>
                    {s.betaald ? '💰 Betaald' : '⏳ Inleg nodig'}
                  </span>
                )}
              </div>
            </div>

            <div className="rank-score-container">
              <div className="rank-score-label">Totaal</div>
              <div className="rank-score">{s.totaal_score}</div>
            </div>

          </div>
        );
      })}
    </div>
  );
}