// src/components/AntwoordenTab.tsx
export default function AntwoordenTab({ nu, DEADLINE_DATE, alleToernooiV }: any) {
  if (nu < DEADLINE_DATE) {
    return (
      <div style={{textAlign:'center', padding:'40px 20px', background:'rgba(255,255,255,0.8)', borderRadius:16, border:'2px dashed #ADB5BD'}}>
        <div style={{fontSize:'3.5rem', marginBottom:15}}>🔒</div>
        <h3 style={{color:'#111827', margin:0, fontFamily:'Bebas Neue', fontSize:'2.5rem'}}>TOP SECRET</h3>
        <p style={{color:'#6C757D', fontSize:'0.85rem', fontWeight:800, marginTop:10}}>
          Om afkijken te voorkomen, blijven de antwoorden van je vrienden verborgen tot de allereerste WK-match is afgetrapt (11 Juni 2026).
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="antwoord-sectie">
        <div className="antwoord-header">🏆 Wereldkampioen</div>
        {alleToernooiV.map((v: any) => <div key={v.id} className="pred-row"><span>{v.spelers?.naam}</span> <span style={{color:'var(--magenta)'}}>{v.winnaar || '-'}</span></div>)}
      </div>

      <div className="antwoord-sectie">
        <div className="antwoord-header">⚔️ De 4 Halve Finalisten</div>
        {alleToernooiV.map((v: any) => (
          <div key={v.id} className="pred-row" style={{flexDirection:'column'}}>
            <span style={{color:'var(--crayola)', marginBottom:4}}>{v.spelers?.naam}</span> 
            <span style={{fontSize:'0.8rem', color:'var(--magenta)'}}>{[v.halve_finalist_1, v.halve_finalist_2, v.halve_finalist_3, v.halve_finalist_4].filter(Boolean).join(' • ') || '-'}</span>
          </div>
        ))}
      </div>

      <div className="antwoord-sectie">
        <div className="antwoord-header">⚽ Meeste Goals Voor</div>
        {alleToernooiV.map((v: any) => <div key={v.id} className="pred-row"><span>{v.spelers?.naam}</span> <span style={{color:'var(--magenta)'}}>{v.topschutter || '-'}</span></div>)}
      </div>

      <div className="antwoord-sectie">
        <div className="antwoord-header">🛡️ Beste Verdediging</div>
        {alleToernooiV.map((v: any) => <div key={v.id} className="pred-row"><span>{v.spelers?.naam}</span> <span style={{color:'var(--magenta)'}}>{v.beste_keeper || '-'}</span></div>)}
      </div>

      <div className="antwoord-sectie">
        <div className="antwoord-header">🍟 Eindstation België</div>
        {alleToernooiV.map((v: any) => <div key={v.id} className="pred-row"><span>{v.spelers?.naam}</span> <span style={{color:'var(--magenta)'}}>{v.eindstation_belgie || '-'}</span></div>)}
      </div>

      <div style={{display:'flex', gap:10}}>
        <div className="antwoord-sectie" style={{flex:1}}>
          <div className="antwoord-header" style={{color:'#EAB308'}}>🟨 Geel</div>
          {alleToernooiV.map((v: any) => <div key={v.id} className="pred-row"><span>{v.spelers?.naam}</span> <span style={{color:'var(--magenta)'}}>{v.totaal_gele_kaarten || '-'}</span></div>)}
        </div>
        <div className="antwoord-sectie" style={{flex:1}}>
          <div className="antwoord-header" style={{color:'#EF4444'}}>🟥 Rood</div>
          {alleToernooiV.map((v: any) => <div key={v.id} className="pred-row"><span>{v.spelers?.naam}</span> <span style={{color:'var(--magenta)'}}>{v.totaal_rode_kaarten || '-'}</span></div>)}
        </div>
      </div>
    </div>
  );
}