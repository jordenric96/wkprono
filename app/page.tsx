'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { WK_LANDEN } from '../lib/data';

const DEADLINE_DATE = new Date('2026-06-11T21:00:00+02:00').getTime();

export default function Home() {
  const [actieveSpeler, setActieveSpeler] = useState<any>(null);
  const [ontgrendelNaam, setOntgrendelNaam] = useState('');
  const [invoerCode, setInvoerCode] = useState('');
  const [status, setStatus] = useState('');
  
  const [actieveTab, setActieveTab] = useState('matchen');
  const [filterRonde, setFilterRonde] = useState('Alle');

  const [matchen, setMatchen] = useState<any[]>([]);
  const [matchVoorspellingen, setMatchVoorspellingen] = useState<Record<number, any>>({});
  const [opslaanStatus, setOpslaanStatus] = useState('');
  
  const [winnaar, setWinnaar] = useState('');
  const [meesteGoalsLand, setMeesteGoalsLand] = useState('');
  const [besteVerdedigingLand, setBesteVerdedigingLand] = useState('');
  const [eindstation, setEindstation] = useState('');

  const [klassement, setKlassement] = useState<any[]>([]);

  useEffect(() => {
    const opgeslagenId = localStorage.getItem('wk_speler_id');
    haalSpelersOp(opgeslagenId);
  }, []);

  useEffect(() => {
    if (actieveSpeler) {
      haalMatchenOp();
      haalToernooiVoorspellingOp();
      if (actieveTab === 'ranking') haalKlassementOp();
    }
  }, [actieveSpeler, actieveTab]);

  const haalSpelersOp = async (checkId?: string | null) => {
    const { data } = await supabase.from('spelers').select('*');
    if (data && checkId) {
      const gevonden = data.find(s => s.id.toString() === checkId);
      if (gevonden) setActieveSpeler(gevonden);
    }
  };

  const haalMatchenOp = async () => {
    const { data } = await supabase.from('matchen').select('*').order('id', { ascending: true });
    if (data) setMatchen(data);

    const { data: vData } = await supabase.from('match_voorspellingen').select('*').eq('speler_id', actieveSpeler.id);
    if (vData) {
      const obj: any = {};
      vData.forEach(v => {
        obj[v.match_id] = { thuis: v.thuis_score, uit: v.uit_score, joker: v.gouden_bal };
      });
      setMatchVoorspellingen(obj);
    }
  };

  const haalToernooiVoorspellingOp = async () => {
    const { data } = await supabase.from('toernooi_voorspellingen').select('*').eq('speler_id', actieveSpeler.id).single();
    if (data) {
      setWinnaar(data.winnaar || '');
      setMeesteGoalsLand(data.topschutter || ''); // We hergebruiken deze kolommen even
      setBesteVerdedigingLand(data.beste_keeper || '');
      setEindstation(data.eindstation_belgie || '');
    }
  };

  const haalKlassementOp = async () => {
    // Haal alle data op om live scores te berekenen
    const { data: alleSpelers } = await supabase.from('spelers').select('*');
    const { data: alleMatchen } = await supabase.from('matchen').select('*');
    const { data: alleVoorspellingen } = await supabase.from('match_voorspellingen').select('*');

    if (alleSpelers && alleMatchen && alleVoorspellingen) {
      const stats = alleSpelers.map(s => {
        let punten = 0;
        let exact = 0;
        let winnaarCorrect = 0;
        let fout = 0;
        let jokerIngezet = false;

        const spelerV = alleVoorspellingen.filter(v => v.speler_id === s.id);
        
        spelerV.forEach(v => {
          if (v.gouden_bal) jokerIngezet = true;
          const m = alleMatchen.find(m => m.id === v.match_id);
          if (m && m.thuis_score !== null) {
            const factor = v.gouden_bal ? 2 : 1;
            const echtResultaat = m.thuis_score > m.uit_score ? 1 : m.thuis_score < m.uit_score ? 2 : 0;
            const voorspeldResultaat = v.thuis_score > v.uit_score ? 1 : v.thuis_score < v.uit_score ? 2 : 0;

            if (v.thuis_score === m.thuis_score && v.uit_score === m.uit_score) {
              punten += (5 * factor);
              exact++;
            } else if (echtResultaat === voorspeldResultaat) {
              punten += (3 * factor);
              winnaarCorrect++;
            } else {
              fout++;
            }
          }
        });

        return { ...s, totaal_score: punten, exact, winnaarCorrect, fout, jokerIngezet };
      });

      setKlassement(stats.sort((a, b) => b.totaal_score - a.totaal_score));
    }
  };

  const handleScore = (mId: number, veld: 'thuis'|'uit', waarde: string) => {
    setMatchVoorspellingen(prev => ({
      ...prev,
      [mId]: { ...prev[mId], [veld]: waarde }
    }));
  };

  const toggleJoker = (mId: number) => {
    setMatchVoorspellingen(prev => {
      const isNuJoker = prev[mId]?.joker;
      const nieuw: any = { ...prev };
      // Reset alle andere jokers (er mag er maar 1 zijn)
      Object.keys(nieuw).forEach(k => nieuw[Number(k)].joker = false);
      nieuw[mId] = { ...prev[mId], joker: !isNuJoker };
      return nieuw;
    });
  };

  const slaAllesOp = async () => {
    setOpslaanStatus('Bezig... ⚽');
    const updates = Object.keys(matchVoorspellingen).map(mId => ({
      speler_id: actieveSpeler.id,
      match_id: Number(mId),
      thuis_score: parseInt(matchVoorspellingen[Number(mId)].thuis),
      uit_score: parseInt(matchVoorspellingen[Number(mId)].uit),
      gouden_bal: matchVoorspellingen[Number(mId)].joker || false
    })).filter(u => !isNaN(u.thuis_score));

    await supabase.from('match_voorspellingen').upsert(updates, { onConflict: 'speler_id, match_id' });
    
    await supabase.from('toernooi_voorspellingen').upsert({
      speler_id: actieveSpeler.id,
      winnaar,
      topschutter: meesteGoalsLand,
      beste_keeper: besteVerdedigingLand,
      eindstation_belgie: eindstation
    }, { onConflict: 'speler_id' });

    setOpslaanStatus('Alles opgeslagen! 🌟');
    setTimeout(() => setOpslaanStatus(''), 3000);
  };

  const gefilterdeMatchen = useMemo(() => {
    if (filterRonde === 'Alle') return matchen;
    return matchen.filter(m => m.ronde === filterRonde);
  }, [matchen, filterRonde]);

  return (
    <main className="main-container">
      <style>{`
        .main-container { padding: 20px; font-family: 'Nunito', sans-serif; max-width: 600px; margin: auto; }
        .title { text-align: center; font-family: 'Bebas Neue'; font-size: 4rem; color: white; text-shadow: 3px 3px 0 var(--magenta); margin: 0; }
        .glass-card { background: white; border-radius: 25px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .tab-menu { display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 10px; }
        .tab-btn { padding: 10px 20px; border-radius: 15px; border: none; background: #eee; font-weight: 800; cursor: pointer; white-space: nowrap; }
        .tab-btn.active { background: #3772FF; color: white; }
        
        .match-card { background: #f9f9f9; border-radius: 15px; padding: 15px; margin-bottom: 10px; border: 2px solid #eee; }
        .match-info { font-size: 0.7rem; font-weight: 800; color: #999; display: flex; justify-content: space-between; margin-bottom: 10px; }
        .match-row { display: flex; align-items: center; justify-content: space-between; }
        .team-name { flex: 1; font-weight: 900; font-size: 0.9rem; text-align: center; }
        .score-input { width: 40px; height: 40px; text-align: center; font-size: 1.2rem; font-weight: 900; border-radius: 10px; border: 2px solid #ddd; }
        
        /* JOKER CONTRAST */
        .joker-btn { 
          width: 40px; height: 40px; border-radius: 50%; border: 3px solid #ddd; 
          background: white; font-size: 1.2rem; cursor: pointer; transition: 0.3s;
          display: flex; align-items: center; justify-content: center;
        }
        .joker-btn.active { background: #FFD700; border-color: #FFA500; transform: scale(1.1); box-shadow: 0 0 15px rgba(255, 215, 0, 0.5); }
        
        .ranking-card { border-bottom: 1px solid #eee; padding: 15px 0; display: flex; align-items: center; gap: 15px; }
        .ranking-pos { font-family: 'Bebas Neue'; font-size: 1.5rem; color: #3772FF; width: 30px; }
        .ranking-main { flex: 1; }
        .ranking-name { font-weight: 900; text-transform: uppercase; display: flex; align-items: center; gap: 5px; }
        .ranking-stats { font-size: 0.7rem; color: #666; font-weight: 700; margin-top: 3px; }
        .ranking-score { font-family: 'Bebas Neue'; font-size: 2rem; color: #F038FF; }

        .filter-scroll { display: flex; gap: 8px; margin-bottom: 15px; overflow-x: auto; padding-bottom: 5px; }
        .filter-chip { padding: 6px 12px; border-radius: 20px; background: #f0f0f0; font-size: 0.7rem; font-weight: 800; cursor: pointer; border: 2px solid transparent; }
        .filter-chip.active { border-color: #3772FF; color: #3772FF; background: #eef2ff; }
        
        .input-group { margin-bottom: 15px; }
        .input-label { display: block; font-size: 0.75rem; font-weight: 900; margin-bottom: 5px; color: #555; }
        .full-input { width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #ddd; font-weight: 700; }
        .btn-save { width: 100%; padding: 15px; border-radius: 15px; background: #F038FF; color: white; border: none; font-weight: 900; font-size: 1.1rem; cursor: pointer; margin-top: 20px; }
      `}</style>

      <h1 className="title">WK 2026</h1>

      <div className="glass-card">
        {actieveSpeler ? (
          <>
            <div className="tab-menu">
              <button className={`tab-btn ${actieveTab === 'matchen' ? 'active' : ''}`} onClick={() => setActieveTab('matchen')}>MATCHEN</button>
              <button className={`tab-btn ${actieveTab === 'bonus' ? 'active' : ''}`} onClick={() => setActieveTab('bonus')}>BONUS</button>
              <button className={`tab-btn ${actieveTab === 'ranking' ? 'active' : ''}`} onClick={() => setActieveTab('ranking')}>RANKING</button>
            </div>

            {actieveTab === 'matchen' && (
              <div>
                <div className="filter-scroll">
                  {['Alle', 'Groepsfase', 'Ronde van 32', 'Achtste finale', 'Kwartfinale', 'Finale'].map(r => (
                    <span key={r} className={`filter-chip ${filterRonde === r ? 'active' : ''}`} onClick={() => setFilterRonde(r)}>{r}</span>
                  ))}
                </div>
                {gefilterdeMatchen.map(m => (
                  <div key={m.id} className="match-card">
                    <div className="match-info">
                      <span>{m.ronde} • {new Date(m.datum).toLocaleDateString('nl-BE', {day:'2-digit', month:'short'})}</span>
                      <button className={`joker-btn ${matchVoorspellingen[m.id]?.joker ? 'active' : ''}`} onClick={() => toggleJoker(m.id)}>🌟</button>
                    </div>
                    <div className="match-row">
                      <span className="team-name">{m.thuisploeg}</span>
                      <input className="score-input" type="tel" value={matchVoorspellingen[m.id]?.thuis || ''} onChange={e => handleScore(m.id, 'thuis', e.target.value)} />
                      <span style={{fontWeight:900}}> - </span>
                      <input className="score-input" type="tel" value={matchVoorspellingen[m.id]?.uit || ''} onChange={e => handleScore(m.id, 'uit', e.target.value)} />
                      <span className="team-name">{m.uitploeg}</span>
                    </div>
                  </div>
                ))}
                <button className="btn-save" onClick={slaAllesOp}>OPSLAAN</button>
                <p style={{textAlign:'center', fontWeight:800, color:'#3772FF'}}>{opslaanStatus}</p>
              </div>
            )}

            {actieveTab === 'bonus' && (
              <div>
                <div className="input-group">
                  <label className="input-label">WELK LAND WORDT WERELDKAMPIOEN?</label>
                  <select className="full-input" value={winnaar} onChange={e => setWinnaar(e.target.value)}>
                    <option value="">Kies een land...</option>
                    {WK_LANDEN.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">WELK LAND SCOORT DE MEESTE GOALS (TOTAAL)?</label>
                  <select className="full-input" value={meesteGoalsLand} onChange={e => setMeesteGoalsLand(e.target.value)}>
                    <option value="">Kies een land...</option>
                    {WK_LANDEN.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">BESTE VERDEDIGING (MINSTE TEGENGOALS)?</label>
                  <select className="full-input" value={besteVerdedigingLand} onChange={e => setBesteVerdedigingLand(e.target.value)}>
                    <option value="">Kies een land...</option>
                    {WK_LANDEN.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">EINDSTATION BELGIË?</label>
                  <select className="full-input" value={eindstation} onChange={e => setEindstation(e.target.value)}>
                    <option value="">Kies een ronde...</option>
                    {['Groepsfase', 'Ronde van 32', 'Achtste finale', 'Kwartfinale', 'Halve finale', 'Finale', 'Winnaar'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <button className="btn-save" onClick={slaAllesOp}>BONUS OPSLAAN</button>
              </div>
            )}

            {actieveTab === 'ranking' && (
              <div>
                {klassement.map((s, i) => (
                  <div key={s.id} className="ranking-card">
                    <span className="ranking-pos">#{i+1}</span>
                    <div className="ranking-main">
                      <span className="ranking-name">{s.naam} {s.jokerIngezet ? '🌟' : '🌑'}</span>
                      <div className="ranking-stats">
                        ✅ {s.exact} exact • 🏆 {s.winnaarCorrect} winnaar • ❌ {s.fout} fout
                      </div>
                    </div>
                    <span className="ranking-score">{s.totaal_score}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={e => {
            e.preventDefault();
            const s = klassement.find(x => x.naam.toLowerCase() === ontgrendelNaam.toLowerCase());
            if (s) { setActieveSpeler(s); localStorage.setItem('wk_speler_id', s.id); }
            else setStatus('Naam niet gevonden...');
          }}>
            <input className="full-input" placeholder="Je Naam" value={ontgrendelNaam} onChange={e => setOntgrendelNaam(e.target.value)} />
            <button className="btn-save" style={{marginTop:10}}>INLOGGEN</button>
            <p style={{color:'red', textAlign:'center'}}>{status}</p>
          </form>
        )}
      </div>
    </main>
  );
}