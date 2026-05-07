'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WK_LANDEN, TOP_SPELERS, TOP_KEEPERS } from '../lib/data';

// DEADLINE: 11 Juni 2026 om 21:00
const DEADLINE_DATE = new Date('2026-06-11T21:00:00+02:00').getTime();

export default function Home() {
  const [ontgrendelNaam, setOntgrendelNaam] = useState('');
  const [inschrijfNaam, setInschrijfNaam] = useState('');
  const [invoerCode, setInvoerCode] = useState('');
  const [status, setStatus] = useState('');
  const [spelers, setSpelers] = useState<any[]>([]);
  const [actieveSpeler, setActieveSpeler] = useState<any>(null);
  const [actieveTab, setActieveTab] = useState('toernooi');
  
  // TOERNOOI STATE (Eigen formulier)
  const [voorspellingStatus, setVoorspellingStatus] = useState('');
  const [winnaar, setWinnaar] = useState('');
  const [topschutter, setTopschutter] = useState('');
  const [besteKeeper, setBesteKeeper] = useState('');
  const [eindstation, setEindstation] = useState('');
  const [totaalGoals, setTotaalGoals] = useState('');
  const [geelKaarten, setGeelKaarten] = useState('');
  const [roodKaarten, setRoodKaarten] = useState('');
  const [lv1, setLv1] = useState('');
  const [lv2, setLv2] = useState('');
  const [lv3, setLv3] = useState('');
  const [lv4, setLv4] = useState('');

  // COUNTDOWN STATE
  const [tijdOver, setTijdOver] = useState({ dagen: 0, uren: 0, minuten: 0, seconden: 0 });
  const [isGesloten, setIsGesloten] = useState(false);

  // RANKING & OVERZICHT STATE
  const [klassement, setKlassement] = useState<any[]>([]);
  const [alleVoorspellingen, setAlleVoorspellingen] = useState<any[]>([]);

  useEffect(() => {
    const opgeslagenId = localStorage.getItem('wk_speler_id');
    haalSpelersOp(opgeslagenId);

    const klokInterval = setInterval(() => {
      const nu = new Date().getTime();
      const verschil = DEADLINE_DATE - nu;

      if (verschil <= 0) {
        setIsGesloten(true);
        clearInterval(klokInterval);
      } else {
        setTijdOver({
          dagen: Math.floor(verschil / (1000 * 60 * 60 * 24)),
          uren: Math.floor((verschil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minuten: Math.floor((verschil % (1000 * 60 * 60)) / (1000 * 60)),
          seconden: Math.floor((verschil % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(klokInterval);
  }, []);

  useEffect(() => {
    if (actieveSpeler) {
      if (actieveTab === 'toernooi') haalToernooiVoorspellingOp();
      if (actieveTab === 'ranking') haalKlassementOp();
      if (actieveTab === 'antwoorden') haalAlleVoorspellingenOp();
    }
  }, [actieveSpeler, actieveTab]);

  const haalSpelersOp = async (checkId?: string | null) => {
    const { data, error } = await supabase.from('spelers').select('id, naam').order('created_at', { ascending: true });
    if (!error && data) {
      setSpelers(data);
      if (checkId) {
        const gevonden = data.find(s => s.id.toString() === checkId);
        if (gevonden) setActieveSpeler(gevonden);
      }
    }
  };

  const haalKlassementOp = async () => {
    const { data, error } = await supabase.from('spelers').select('id, naam, totaal_score').order('totaal_score', { ascending: false });
    if (!error && data) setKlassement(data);
  };

  const haalAlleVoorspellingenOp = async () => {
    if (spelers.length === 0) await haalSpelersOp();
    const { data, error } = await supabase.from('toernooi_voorspellingen').select('*');
    if (!error && data) setAlleVoorspellingen(data);
  };

  const haalToernooiVoorspellingOp = async () => {
    if (!actieveSpeler) return;
    const { data } = await supabase.from('toernooi_voorspellingen').select('*').eq('speler_id', actieveSpeler.id).single();
    if (data) {
      setWinnaar(data.winnaar || ''); setTopschutter(data.topschutter || '');
      setBesteKeeper(data.beste_keeper || ''); setEindstation(data.eindstation_belgie || '');
      setTotaalGoals(data.totaal_goals_tornooi?.toString() || '');
      setGeelKaarten(data.totaal_gele_kaarten?.toString() || '');
      setRoodKaarten(data.totaal_rode_kaarten?.toString() || '');
      if (data.laatste_vier && data.laatste_vier.length === 4) {
        setLv1(data.laatste_vier[0]); setLv2(data.laatste_vier[1]);
        setLv3(data.laatste_vier[2]); setLv4(data.laatste_vier[3]);
      }
    }
  };

  const slaToernooiVoorspellingOp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGesloten) return;

    setVoorspellingStatus('Bezig met opslaan...');
    const laatsteVierArray = [lv1, lv2, lv3, lv4].filter(land => land.trim() !== '');
    const voorspellingData = {
      speler_id: actieveSpeler.id, 
      winnaar: winnaar.trim(), 
      topschutter: topschutter.trim(),
      beste_keeper: besteKeeper.trim(), 
      eindstation_belgie: eindstation.trim(),
      totaal_goals_tornooi: parseInt(totaalGoals) || 0, 
      totaal_gele_kaarten: parseInt(geelKaarten) || 0,
      totaal_rode_kaarten: parseInt(roodKaarten) || 0,
      laatste_vier: laatsteVierArray
    };

    const { data: bestaand } = await supabase.from('toernooi_voorspellingen').select('id').eq('speler_id', actieveSpeler.id).single();
    let error;
    if (bestaand) {
      const { error: updateError } = await supabase.from('toernooi_voorspellingen').update(voorspellingData).eq('speler_id', actieveSpeler.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('toernooi_voorspellingen').insert([voorspellingData]);
      error = insertError;
    }

    if (error) setVoorspellingStatus('❌ Fout bij opslaan.');
    else {
      setVoorspellingStatus('✅ Succesvol opgeslagen!');
      setTimeout(() => setVoorspellingStatus(''), 3000);
    }
  };

  const schrijfIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Bezig...');
    const { error } = await supabase.from('spelers').insert([{ naam: inschrijfNaam.trim(), totaal_score: 0 }]);
    if (error) setStatus('Naam bestaat al of er is een fout.');
    else { setStatus('Gelukt! Vraag de beheerder om je code.'); setInschrijfNaam(''); haalSpelersOp(); }
  };

  const ontgrendel = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Verificatie...');
    const { data: speler, error } = await supabase.from('spelers').select('*').ilike('naam', ontgrendelNaam.trim()).single();
    if (error || !speler) { setStatus('Naam niet gevonden.'); return; }
    if (String(speler.code).trim() === String(invoerCode).trim()) {
      localStorage.setItem('wk_speler_id', speler.id.toString());
      setActieveSpeler(speler); setStatus(''); setInvoerCode(''); setOntgrendelNaam('');
    } else setStatus('De code is onjuist.');
  };

  const VeiligAntwoord = ({ toon, waarde }: { toon: boolean, waarde: string }) => {
    if (toon) return <span className="antw-text">{waarde}</span>;
    return <span className="antw-text blurred-waarde">█████████</span>;
  };

  const CATEGORIEEN = [
    { key: 'winnaar', label: 'Eindwinnaar WK', stand: 'Nog niet bekend' },
    { key: 'topschutter', label: 'Topschutter', stand: 'Momenteel: 0 goals' },
    { key: 'beste_keeper', label: 'Beste Keeper', stand: 'Nog niet bekend' },
    { key: 'eindstation_belgie', label: 'Eindstation Rode Duivels', stand: 'Groepsfase bezig' },
    { key: 'laatste_vier', label: 'De Laatste Vier', stand: 'Nog niet bekend' },
    { key: 'totaal_goals_tornooi', label: 'Totaal Doelpunten', stand: 'Momenteel: 0 goals' },
    { key: 'totaal_gele_kaarten', label: 'Totaal Gele Kaarten', stand: 'Momenteel: 0 kaarten' },
    { key: 'totaal_rode_kaarten', label: 'Totaal Rode Kaarten', stand: 'Momenteel: 0 kaarten' },
  ];

  return (
    <main className="main-container">
      <style>{`
        html, body { margin: 0; padding: 0; width: 100%; min-height: 100%; background: #C46D5E; overflow-x: hidden; }
        .main-container { margin: 0; padding: 15px 15px 80px 15px; min-height: 100vh; display: flex; flex-direction: column; align-items: center; font-family: 'Inter', -apple-system, sans-serif; background: linear-gradient(-45deg, #F3C98B, #DAA588, #C46D5E, #F56960); background-size: 400% 400%; animation: gradientBG 15s ease infinite; color: white; box-sizing: border-box; }
        @keyframes gradientBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .glass-card { background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); padding: 30px 20px; border-radius: 32px; border: 1px solid rgba(255, 255, 255, 0.18); width: 100%; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); box-sizing: border-box; }
        .title { font-size: 2.8rem; font-weight: 900; margin: 0; letter-spacing: -1.5px; text-align: center; }
        .subtitle { font-size: 0.75rem; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 20px; color: rgba(255,255,255,0.6); text-align: center; }
        
        .countdown-banner { background: rgba(0,0,0,0.25); border-radius: 16px; padding: 15px 10px; margin-bottom: 25px; text-align: center; border: 1px solid rgba(156, 246, 246, 0.2); }
        .countdown-title { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 2px; color: #9CF6F6; margin-bottom: 10px; font-weight: 800; }
        .tijd-grid { display: flex; justify-content: center; gap: 6px; width: 100%; }
        .tijd-box { background: rgba(255,255,255,0.1); padding: 8px 4px; border-radius: 12px; text-align: center; flex: 1; max-width: 70px; }
        .tijd-cijfer { font-size: 1.2rem; font-weight: 900; line-height: 1; margin-bottom: 3px; font-variant-numeric: tabular-nums; }
        .tijd-label { font-size: 0.5rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
        .gesloten-banner { background: rgba(245, 105, 96, 0.3); border: 1px solid #F56960; color: white; padding: 15px; border-radius: 16px; text-align: center; font-weight: 800; margin-bottom: 25px; letter-spacing: 1px; text-transform: uppercase; }

        .tab-container { display: flex; background: rgba(0,0,0,0.2); border-radius: 16px; padding: 5px; margin-bottom: 25px; }
        .tab { flex: 1; text-align: center; padding: 12px 2px; font-size: 0.65rem; font-weight: 800; border-radius: 12px; cursor: pointer; transition: all 0.3s; opacity: 0.6; white-space: nowrap; letter-spacing: 0.5px; }
        .tab.active { background: #9CF6F6; color: #1A3C40; opacity: 1; }
        
        .input-group { text-align: left; margin-bottom: 15px; }
        .label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; margin-left: 12px; margin-bottom: 6px; display: block; opacity: 0.8; color: #9CF6F6; }
        .input-field { width: 100%; padding: 15px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.06); color: white; font-size: 1rem; outline: none; box-sizing: border-box; -webkit-appearance: none; }
        .input-field:focus { border-color: #9CF6F6; background: rgba(255,255,255,0.1); }
        .input-field:disabled { opacity: 0.5; cursor: not-allowed; }
        .input-field option { background: #C46D5E; color: white; }
        .btn-primary { width: 100%; padding: 18px; border-radius: 18px; border: none; background: #9CF6F6; color: #1A3C40; font-weight: 800; cursor: pointer; font-size: 0.95rem; box-shadow: 0 10px 20px -5px rgba(156, 246, 246, 0.35); }
        .btn-primary:disabled { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); box-shadow: none; cursor: not-allowed; }
        .btn-secondary { width: 100%; padding: 14px; margin-top: 15px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.25); background: transparent; color: white; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        /* AANGEPAST: COMPACT KLASSEMENT CSS */
        .ranking-item { background: rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.1); transition: all 0.2s; }
        .ranking-item.is-me { border-color: #9CF6F6; background: rgba(156, 246, 246, 0.1); }
        .ranking-hoofd { display: flex; align-items: center; margin-bottom: 4px; }
        .ranking-pos { width: 28px; font-size: 1.1rem; font-weight: 900; opacity: 0.8; text-align: left; }
        .pos-1 { color: #FFD700; opacity: 1; text-shadow: 0 0 10px rgba(255,215,0,0.5); }
        .pos-2 { color: #C0C0C0; opacity: 1; }
        .pos-3 { color: #CD7F32; opacity: 1; }
        .ranking-naam { flex: 1; font-size: 0.95rem; font-weight: 800; margin: 0; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ranking-totaal { font-size: 1.2rem; font-weight: 900; color: #9CF6F6; text-align: right; min-width: 40px; }
        
        .ranking-sub { display: flex; justify-content: space-between; align-items: center; font-size: 0.65rem; color: rgba(255,255,255,0.7); }
        .ranking-punten { display: flex; gap: 8px; }
        .ranking-punten span { font-weight: 700; color: #9CF6F6; margin-left: 3px; }
        .ranking-stats { display: flex; gap: 6px; }
        .stat-mini { display: flex; align-items: center; gap: 3px; background: rgba(0,0,0,0.2); padding: 3px 6px; border-radius: 6px; }
        .stat-mini span { font-weight: 800; color: white; }

        /* ANTWOORDEN CSS */
        .cat-card { background: rgba(255,255,255,0.08); border-radius: 16px; padding: 0; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; }
        .cat-header { background: rgba(0,0,0,0.2); padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .cat-titel { font-size: 1rem; font-weight: 800; color: #9CF6F6; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px; }
        .cat-stand { font-size: 0.75rem; color: rgba(255,255,255,0.7); font-weight: 600; display: inline-block; background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 50px; }
        .cat-lijst { padding: 10px 15px; }
        .cat-speler-rij { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .cat-speler-rij:last-child { border-bottom: none; }
        .antw-naam { font-size: 0.85rem; font-weight: 600; opacity: 0.9; }
        .antw-text { font-size: 0.85rem; font-weight: 800; text-align: right; max-width: 60%; word-break: break-word; }
        .blurred-waarde { filter: blur(4px); opacity: 0.5; user-select: none; letter-spacing: 2px; }
        .eigen-antw .antw-naam { color: #9CF6F6; font-weight: 800; }
        .eigen-antw .antw-text { color: #9CF6F6; }
      `}</style>

      <datalist id="top-spelers">{TOP_SPELERS.map(speler => <option key={speler} value={speler} />)}</datalist>
      <datalist id="top-keepers">{TOP_KEEPERS.map(keeper => <option key={keeper} value={keeper} />)}</datalist>

      <div className="glass-card">
        <h1 className="title">WK'26</h1>
        <p className="subtitle">Pronostiek • Inzet €10</p>

        {actieveSpeler ? (
          <div>
            <div className="tab-container">
              <div className={`tab ${actieveTab === 'matchen' ? 'active' : ''}`} onClick={() => setActieveTab('matchen')}>MATCHEN</div>
              <div className={`tab ${actieveTab === 'toernooi' ? 'active' : ''}`} onClick={() => setActieveTab('toernooi')}>TOERNOOI</div>
              <div className={`tab ${actieveTab === 'antwoorden' ? 'active' : ''}`} onClick={() => setActieveTab('antwoorden')}>ANTWOORDEN</div>
              <div className={`tab ${actieveTab === 'ranking' ? 'active' : ''}`} onClick={() => setActieveTab('ranking')}>RANKING</div>
            </div>

            {actieveTab === 'toernooi' && (
              <form onSubmit={slaToernooiVoorspellingOp} style={{ animation: 'fadeIn 0.4s' }}>
                {isGesloten ? (
                  <div className="gesloten-banner">⛔ Inzendingen Gesloten</div>
                ) : (
                  <div className="countdown-banner">
                    <div className="countdown-title">Sluiting over:</div>
                    <div className="tijd-grid">
                      <div className="tijd-box"><div className="tijd-cijfer">{tijdOver.dagen}</div><div className="tijd-label">Dagen</div></div>
                      <div className="tijd-box"><div className="tijd-cijfer">{tijdOver.uren}</div><div className="tijd-label">Uren</div></div>
                      <div className="tijd-box"><div className="tijd-cijfer">{tijdOver.minuten}</div><div className="tijd-label">Min</div></div>
                      <div className="tijd-box"><div className="tijd-cijfer">{tijdOver.seconden}</div><div className="tijd-label">Sec</div></div>
                    </div>
                  </div>
                )}

                <div className="input-group"><label className="label">Eindwinnaar WK</label><select className="input-field" value={winnaar} onChange={e => setWinnaar(e.target.value)} required disabled={isGesloten}><option value="" disabled>Kies een land...</option>{WK_LANDEN.map(land => <option key={land} value={land}>{land}</option>)}</select></div>
                <div className="input-group"><label className="label">Topschutter</label><input className="input-field" list="top-spelers" placeholder="Begin te typen..." value={topschutter} onChange={e => setTopschutter(e.target.value)} required disabled={isGesloten} /></div>
                <div className="input-group"><label className="label">Beste Keeper</label><input className="input-field" list="top-keepers" placeholder="Begin te typen..." value={besteKeeper} onChange={e => setBesteKeeper(e.target.value)} required disabled={isGesloten} /></div>
                
                <div className="input-group">
                  <label className="label">Eindstation Rode Duivels</label>
                  <select className="input-field" value={eindstation} onChange={e => setEindstation(e.target.value)} required disabled={isGesloten}>
                    <option value="" disabled>Kies een ronde...</option>
                    <option value="Groepsfase">Groepsfase</option>
                    <option value="1/16e Finale">1/16e Finale</option>
                    <option value="1/8e Finale">1/8e Finale</option>
                    <option value="Kwartfinale">Kwartfinale</option>
                    <option value="Halve Finale">Halve Finale</option>
                    <option value="Verliezend Finalist">Verliezend Finalist</option>
                    <option value="Wereldkampioen">Wereldkampioen</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="label">De Laatste Vier</label>
                  <div className="grid-2">
                    <select className="input-field" value={lv1} onChange={e => setLv1(e.target.value)} required disabled={isGesloten}><option value="" disabled>Land 1</option>{WK_LANDEN.map(land => <option key={land} value={land}>{land}</option>)}</select>
                    <select className="input-field" value={lv2} onChange={e => setLv2(e.target.value)} required disabled={isGesloten}><option value="" disabled>Land 2</option>{WK_LANDEN.map(land => <option key={land} value={land}>{land}</option>)}</select>
                    <select className="input-field" value={lv3} onChange={e => setLv3(e.target.value)} required disabled={isGesloten}><option value="" disabled>Land 3</option>{WK_LANDEN.map(land => <option key={land} value={land}>{land}</option>)}</select>
                    <select className="input-field" value={lv4} onChange={e => setLv4(e.target.value)} required disabled={isGesloten}><option value="" disabled>Land 4</option>{WK_LANDEN.map(land => <option key={land} value={land}>{land}</option>)}</select>
                  </div>
                </div>

                <div className="input-group"><label className="label">Tie-breaker: Totaal goals WK</label><input className="input-field" type="number" placeholder="Bv. 172" value={totaalGoals} onChange={e => setTotaalGoals(e.target.value)} required disabled={isGesloten} /></div>
                <div className="grid-2">
                  <div className="input-group"><label className="label">Gele Kaarten</label><input className="input-field" type="number" placeholder="Bv. 220" value={geelKaarten} onChange={e => setGeelKaarten(e.target.value)} required disabled={isGesloten} /></div>
                  <div className="input-group"><label className="label">Rode Kaarten</label><input className="input-field" type="number" placeholder="Bv. 12" value={roodKaarten} onChange={e => setRoodKaarten(e.target.value)} required disabled={isGesloten} /></div>
                </div>

                {voorspellingStatus && <div style={{ textAlign: 'center', margin: '15px 0', fontSize: '0.9rem', fontWeight: 'bold' }}>{voorspellingStatus}</div>}
                {!isGesloten && <button className="btn-primary" type="submit">OPSLAAN</button>}
                <button className="btn-secondary" type="button" onClick={() => { localStorage.removeItem('wk_speler_id'); setActieveSpeler(null); }}>Uitloggen</button>
              </form>
            )}

            {actieveTab === 'antwoorden' && (
              <div style={{ animation: 'fadeIn 0.4s' }}>
                <p style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.8, marginBottom: '20px', lineHeight: '1.4' }}>Bekijk hier per vraag wat iedereen gegokt heeft.<br/><strong style={{color: '#9CF6F6'}}>Anderen zijn geblurred tot de start!</strong></p>
                {CATEGORIEEN.map((cat, idx) => (
                  <div key={idx} className="cat-card">
                    <div className="cat-header">
                      <h3 className="cat-titel">{cat.label}</h3>
                      <div className="cat-stand">{cat.stand}</div>
                    </div>
                    <div className="cat-lijst">
                      {spelers.map(speler => {
                        const v = alleVoorspellingen.find(x => x.speler_id === speler.id);
                        const isMijzelf = speler.id === actieveSpeler.id;
                        const toonData = isGesloten || isMijzelf;
                        let getoondeWaarde = "Nog niets ingevuld...";
                        if (v) {
                          if (cat.key === 'laatste_vier') getoondeWaarde = v[cat.key]?.join(', ') || '-';
                          else getoondeWaarde = v[cat.key] || '-';
                        }
                        return (
                          <div key={speler.id} className={`cat-speler-rij ${isMijzelf ? 'eigen-antw' : ''}`}>
                            <span className="antw-naam">{speler.naam}</span>
                            {v ? <VeiligAntwoord toon={toonData} waarde={getoondeWaarde.toString()} /> : <span style={{ fontSize: '0.75rem', fontStyle: 'italic', opacity: 0.4 }}>Wachtend...</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AANGEPAST: COMPACT RANKING */}
            {actieveTab === 'ranking' && (
              <div style={{ animation: 'fadeIn 0.4s' }}>
                <p style={{ textAlign: 'center', fontSize: '0.75rem', opacity: 0.8, margin: '0 0 15px 0' }}>Inclusief live updates voor je bonusvragen!</p>
                {klassement.length === 0 ? (
                  <p style={{ textAlign: 'center', opacity: 0.5 }}>Laden...</p>
                ) : (
                  klassement.map((speler, index) => {
                    const isMijzelf = speler.id === actieveSpeler.id;
                    const positieKlasse = index === 0 ? 'pos-1' : index === 1 ? 'pos-2' : index === 2 ? 'pos-3' : '';
                    
                    return (
                      <div key={speler.id} className={`ranking-item ${isMijzelf ? 'is-me' : ''}`}>
                        
                        <div className="ranking-hoofd">
                          <div className={`ranking-pos ${positieKlasse}`}>{index + 1}</div>
                          <h3 className="ranking-naam">{speler.naam}</h3>
                          <div className="ranking-totaal">{speler.totaal_score || 0}</div>
                        </div>
                        
                        <div className="ranking-sub">
                          <div className="ranking-punten" title="Punten uit Matchen & Bonus">
                            <div>⚽ <span>0</span></div>
                            <div>🏆 <span>0</span></div>
                          </div>
                          <div className="ranking-stats">
                            <div className="stat-mini" title="Exacte score">🎯 <span>0</span></div>
                            <div className="stat-mini" title="Juiste ploeg">✅ <span>0</span></div>
                            <div className="stat-mini" title="Helemaal fout">❌ <span>0</span></div>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
                <button className="btn-secondary" style={{ marginTop: '20px' }} onClick={() => { localStorage.removeItem('wk_speler_id'); setActieveSpeler(null); }}>Uitloggen</button>
              </div>
            )}

            {actieveTab === 'matchen' && (
              <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.7 }}>
                <h3>Komt Binnenkort</h3>
                <p style={{ fontSize: '0.9rem' }}>De kalender met wedstrijden wordt hier klaargezet.</p>
                <button className="btn-secondary" onClick={() => { localStorage.removeItem('wk_speler_id'); setActieveSpeler(null); }}>Uitloggen</button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <form onSubmit={ontgrendel}>
              <div className="input-group">
                <label className="label">Ontgrendelen</label>
                <input className="input-field" placeholder="Je naam" value={ontgrendelNaam} onChange={e => setOntgrendelNaam(e.target.value)} />
                <input className="input-field" style={{marginTop:'10px'}} type="text" placeholder="Geheime code" value={invoerCode} onChange={e => setInvoerCode(e.target.value)} />
              </div>
              <button className="btn-primary" type="submit">LOGIN</button>
            </form>
            <div style={{ margin: '30px 0', display: 'flex', alignItems: 'center', opacity: 0.18 }}><hr style={{ flex: 1, border: 'none', height: '1px', background: 'white' }} /><span style={{ padding: '0 15px', fontSize: '0.6rem', fontWeight: 900 }}>OF</span><hr style={{ flex: 1, border: 'none', height: '1px', background: 'white' }} /></div>
            <form onSubmit={schrijfIn}>
              <div className="input-group">
                <label className="label">Nieuwe Deelnemer</label>
                <input className="input-field" placeholder="Naam + Achternaam" value={inschrijfNaam} onChange={e => setInschrijfNaam(e.target.value)} />
              </div>
              <button className="btn-secondary" type="submit">INSCHRIJVEN</button>
            </form>
            <div style={{ marginTop: '20px', fontSize: '0.8rem', fontWeight: '700', color: '#9CF6F6', textAlign: 'center' }}>{status}</div>
          </div>
        )}
      </div>
    </main>
  );
}