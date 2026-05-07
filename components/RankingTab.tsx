// src/components/RankingTab.tsx
export default function RankingTab({ klassement }: any) {
  return (
    <div>
      {klassement.map((s: any, i: number) => {
        const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
        return (
          <div key={s.id} className={`ranking-item ${rankClass}`}>
            <div className="rank-badge">{i+1}</div>
            <div className="ranking-main">
              <span className="ranking-naam">{s.naam} {s.jokerIngezet ? <span style={{fontSize:'1rem'}}>🌑</span> : <span style={{fontSize:'1rem'}}>🌟</span>}</span>
              <div className="ranking-stats">
                ✅ {s.exact} exact • 🏆 {s.winnaarCorrect} win • ❌ {s.fout} fout
              </div>
            </div>
            <span className="ranking-score">{s.totaal_score}</span>
          </div>
        );
      })}
    </div>
  );
}