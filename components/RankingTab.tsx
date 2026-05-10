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
          transition: transform 0.2s;
        }

        /* Podium styling voor de Top 3 */
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
          z-index: 2;
        }

        .rank-1 .rank-badge { background: linear-gradient(135deg, #FFD700, #F1BF00); color: #000; box-shadow: 0 4px 10px rgba(255, 215, 0, 0.4); text-shadow: 0 1px 2px rgba(255,255,255,0.8); }
        .rank-2 .rank-badge { background: linear-gradient(135deg, #E9ECEF, #ADB5BD); color: #111827; box-shadow: 0 4px 10px rgba(173, 181, 189, 0.4); }
        .rank-3 .rank-badge { background: linear-gradient(135deg, #E6A15C, #CD7F32); color: #FFF; box-shadow: 0 4px 10px rgba(205, 127, 50, 0.4); }

        .rank-info { flex: 1; display: flex; flex-direction: column; z-index: 2; }
        
        .rank-name { font-size: 1.1rem; font-weight: 900; color: #111827; margin-bottom: 4px; display: flex; alignItems: center; gap: 6px; }
        
        .rank-stats { display: flex; gap: 8px; font-size: 0.65rem; font-weight: 800; color: #6C757D; text-transform: uppercase; letter-spacing: 0.5px; flex-wrap: wrap; }
        .stat-badge { background: #F8F9FA; padding: 3px 6px; border-radius: 6px; border: 1px solid #DEE2E6; }

        .rank-score-container { text-align: right; z-index: 2; }
        .rank-score { font-family: 'Bebas Neue', sans-serif; font-size: 2.8rem; color: var(--magenta); line-height: 1; }
        .rank-score-label { font-size: 0.6rem; font-weight: 900; color: #ADB5BD; text-transform: uppercase; letter-spacing: 1px; }

        /* Betaal labels */
        .betaal-status { font-size: 0.65rem; font-weight: 900; padding: 4px 8px; border-radius: 8px; display: inline-block; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .status-ok { background: #D3F9D8; color: #2B8A3E; }
        .status-wait { background: #FFE3E3; color: #E03131; }

        /* Admin button override */
        .admin-toggle-btn {
          margin-top: 8px; font-size: 0.65rem; font-weight: 900; padding: 6px 10px; border-radius: 8px; border: none; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; transition: 0.2s;
        }
        .admin-toggle-btn.ok { background: #D3F9D8; color: #2B8A3E; border: 1px solid #B2F2BB; }
        .admin-toggle-btn.wait { background: #FFE3E3; color: #E03131; border: 1px solid #FFC9C9; }
        
        .joker-indicator { position: absolute; top: 10px; right: 10px; font-size: 1.2rem; opacity: 0.8; }
      `}</style>

      {klassement.map((s: any, i: number) => {
        // Bepaal de class voor de top 3 styling
        const podiumClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
        // Is dit de actieve speler die ingelogd is? Dan geven we zijn kaartje een lichte blauwe gloed
        const isMij = s.id === actieveSpeler?.id;

        return (
          <div key={s.id} className={`rank-card ${podiumClass}`} style={{ border: isMij && i > 2 ? '2px solid var(--crayola)' : '' }}>
            
            {/* Achtergrond gloed voor actieve speler */}
            {isMij && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(90deg, rgba(55,114,255,0.05), transparent)', zIndex: 1 }} />}

            {/* JOKER INDICATOR (Subtiel rechtsboven) */}
            {s.jokerIngezet ? (
               <div className="joker-indicator" title="Joker is ingezet, maar nog geen punten verdiend">🌑</div>
            ) : (
               <div className="joker-indicator" title="Joker is nog beschikbaar">🌟</div>
            )}

            {/* MEDAILLE / NUMMER */}
            <div className="rank-badge">{i + 1}</div>

            {/* INFORMATIE */}
            <div className="rank-info">
              <div className="rank-name">
                {s.naam} {isMij && <span style={{fontSize:'0.6rem', background:'var(--crayola)', color:'#FFF', padding:'2px 6px', borderRadius:'10px', verticalAlign:'middle'}}>JIJ</span>}
              </div>
              
              <div className="rank-stats">
                <span className="stat-badge">✅ {s.exact} Exact</span>
                <span className="stat-badge">🏆 {s.winnaarCorrect} Win</span>
                <span className="stat-badge">❌ {s.fout} Fout</span>
              </div>

              {/* BETALINGSSTATUS */}
              <div>
                {isAdmin ? (
                  <button 
                    onClick={() => toggleBetaald(s.id, s.betaald)} 
                    className={`admin-toggle-btn ${s.betaald ? 'ok' : 'wait'}`}
                  >
                    {s.betaald ? '💰 Betaald (Klik = Annuleren)' : '⏳ Niet betaald (Klik = OK)'}
                  </button>
                ) : (
                  <span className={`betaal-status ${s.betaald ? 'status-ok' : 'status-wait'}`}>
                    {s.betaald ? '💰 Inleg Betaald' : '⏳ Wacht op betaling'}
                  </span>
                )}
              </div>
            </div>

            {/* SCORE */}
            <div className="rank-score-container">
              <div className="rank-score-label">Punten</div>
              <div className="rank-score">{s.totaal_score}</div>
            </div>

          </div>
        );
      })}

      {klassement.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6C757D', fontWeight: 900 }}>
          Nog geen klassement beschikbaar...
        </div>
      )}

    </div>
  );
}