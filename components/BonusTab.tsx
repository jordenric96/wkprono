import { Autocomplete } from './Shared';

export default function BonusTab({
  winnaar, setWinnaar, hf, setHf, meesteGoalsLand, setMeesteGoalsLand,
  besteVerdedigingLand, setBesteVerdedigingLand, eindstation, setEindstation,
  totaalGeel, setTotaalGeel, totaalRood, setTotaalRood,
  isGesloten, slaBonusOp, opslaanStatus, WK_LANDEN
}: any) {
  return (
    <div>
      <div className="input-group">
        <label className="input-label">Wereldkampioen?</label>
        <Autocomplete options={WK_LANDEN} value={winnaar} onChange={setWinnaar} placeholder="Typ een land..." disabled={isGesloten} />
      </div>

      <div className="input-group">
        <label className="input-label" style={{color:'var(--magenta)'}}>De 4 Halve Finalisten?</label>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <Autocomplete options={WK_LANDEN} value={hf[0]} onChange={(v: string) => { const n = [...hf]; n[0] = v; setHf(n); }} placeholder="Halve finalist 1..." disabled={isGesloten} />
          <Autocomplete options={WK_LANDEN} value={hf[1]} onChange={(v: string) => { const n = [...hf]; n[1] = v; setHf(n); }} placeholder="Halve finalist 2..." disabled={isGesloten} />
          <Autocomplete options={WK_LANDEN} value={hf[2]} onChange={(v: string) => { const n = [...hf]; n[2] = v; setHf(n); }} placeholder="Halve finalist 3..." disabled={isGesloten} />
          <Autocomplete options={WK_LANDEN} value={hf[3]} onChange={(v: string) => { const n = [...hf]; n[3] = v; setHf(n); }} placeholder="Halve finalist 4..." disabled={isGesloten} />
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">Land met meeste goals (totaal)?</label>
        <Autocomplete options={WK_LANDEN} value={meesteGoalsLand} onChange={setMeesteGoalsLand} placeholder="Typ een land..." disabled={isGesloten} />
      </div>
      <div className="input-group">
        <label className="input-label">Beste verdediging (minste tegengoals)?</label>
        <Autocomplete options={WK_LANDEN} value={besteVerdedigingLand} onChange={setBesteVerdedigingLand} placeholder="Typ een land..." disabled={isGesloten} />
      </div>
      <div className="input-group">
        <label className="input-label">Eindstation België?</label>
        <select className="full-input" value={eindstation} onChange={(e: any) => setEindstation(e.target.value)} disabled={isGesloten}>
          <option value="">Kies een ronde...</option>
          {['Groepsfase', 'Ronde van 32', 'Achtste finale', 'Kwartfinale', 'Halve finale', 'Troostfinale', 'Finale', 'Wereldkampioen'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      
      <div style={{display:'flex', gap:10}}>
        <div className="input-group" style={{flex:1}}>
          <label className="input-label">Totaal Geel?</label>
          <input className="full-input" type="number" value={totaalGeel} onChange={(e: any) => setTotaalGeel(e.target.value)} disabled={isGesloten} />
        </div>
        <div className="input-group" style={{flex:1}}>
          <label className="input-label">Totaal Rood?</label>
          <input className="full-input" type="number" value={totaalRood} onChange={(e: any) => setTotaalRood(e.target.value)} disabled={isGesloten} />
        </div>
      </div>

      {!isGesloten && <button className="btn-primary" onClick={slaBonusOp}>BONUS OPSLAAN</button>}
      <p style={{textAlign:'center', fontWeight:900, color:'var(--crayola)', marginTop: 10}}>{opslaanStatus}</p>
    </div>
  );
}