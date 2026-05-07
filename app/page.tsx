'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  // --- STATE VOOR INLOGGEN ---
  const [ontgrendelNaam, setOntgrendelNaam] = useState('');
  const [inschrijfNaam, setInschrijfNaam] = useState('');
  const [invoerCode, setInvoerCode] = useState('');
  const [status, setStatus] = useState('');
  const [spelers, setSpelers] = useState<any[]>([]);
  const [actieveSpeler, setActieveSpeler] = useState<any>(null);

  // --- STATE VOOR HET DASHBOARD ---
  const [actieveTab, setActieveTab] = useState('toernooi');
  
  // --- STATE VOOR TOERNOOI VOORSPELLINGEN ---
  const [voorspellingStatus, setVoorspellingStatus] = useState('');
  const [winnaar, setWinnaar] = useState('');
  const [topschutter, setTopschutter] = useState('');
  const [besteKeeper, setBesteKeeper] = useState('');
  const [eindstation, setEindstation] = useState('');
  const [totaalGoals, setTotaalGoals] = useState('');
  // Laatste 4 als aparte velden voor makkelijke invoer
  const [lv1, setLv1] = useState('');
  const [lv2, setLv2] = useState('');
  const [lv3, setLv3] = useState('');
  const [lv4, setLv4] = useState('');

  useEffect(() => {
    const opgeslagenId = localStorage.getItem('wk_speler_id');
    haalSpelersOp(opgeslagenId);
  }, []);

  // Als er een actieve speler is, haal zijn bestaande voorspellingen op
  useEffect(() => {
    if (actieveSpeler) {
      haalToernooiVoorspellingOp();
    }
  }, [actieveSpeler]);

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

  const haalToernooiVoorspellingOp = async () => {
    if (!actieveSpeler) return;
    const { data, error } = await supabase
      .from('toernooi_voorspellingen')
      .select('*')
      .eq('speler_id', actieveSpeler.id)
      .single();

    if (data) {
      setWinnaar(data.winnaar || '');
      setTopschutter(data.topschutter || '');
      setBesteKeeper(data.beste_keeper || '');
      setEindstation(data.eindstation_belgie || '');
      setTotaalGoals(data.totaal_goals_tornooi?.toString() || '');
      if (data.laatste_vier && data.laatste_vier.length === 4) {
        setLv1(data.laatste_vier[0]); setLv2(data.laatste_vier[1]);
        setLv3(data.laatste_vier[2]); setLv4(data.laatste_vier[3]);
      }
    }
  };

  const slaToernooiVoorspellingOp = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoorspellingStatus('Bezig met opslaan...');
    
    const laatsteVierArray = [lv1, lv2, lv3, lv4].filter(land => land.trim() !== '');
    
    const voorspellingData = {
      speler_id: actieveSpeler.id,
      winnaar: winnaar.trim(),
      topschutter: topschutter.trim(),
      beste_keeper: besteKeeper.trim(),
      eindstation_belgie: eindstation.trim(),
      totaal_goals_tornooi: parseInt(totaalGoals) || 0,
      laatste_vier: laatsteVierArray
    };

    // We controleren eerst of de speler al een rij heeft
    const { data: bestaand } = await supabase.from('toernooi_voorspellingen').select('id').eq('speler_id', actieveSpeler.id).single();

    let error;
    if (bestaand) {
      const { error: updateError } = await supabase.from('toernooi_voorspellingen').update(voorspellingData).eq('speler_id', actieveSpeler.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('toernooi_voorspellingen').insert([voorspellingData]);
      error = insertError;
    }

    if (error) {
      console.error(error);
      setVoorspellingStatus('❌ Fout bij opslaan.');
    } else {
      setVoorspellingStatus('✅ Voorspellingen succesvol opgeslagen!');
      setTimeout(() => setVoorspellingStatus(''), 3000); // Wis melding na 3 seconden
    }
  };

  const schrijfIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Bezig...');
    const { error } = await supabase.from('spelers').insert([{ naam: inschrijfNaam.trim(), totaal_score: 0 }]);
    if (error) setStatus('Naam bestaat al of er is een fout.');
    else { setStatus('Gelukt! Vraag Jorden om je code.'); setInschrijfNaam(''); haalSpelersOp(); }
  };

  const ontgrendel = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Verificatie...');
    const { data: speler, error } = await supabase.from('spelers').select('*').ilike('naam', ontgrendelNaam.trim()).single();
    
    if (error || !speler) { setStatus('Naam niet gevonden.'); return; }
    
    if (String(speler.code).trim() === String(invoerCode).trim()) {
      localStorage.setItem('wk_speler_id', speler.id.toString());
      setActieveSpeler(speler); setStatus(''); setInvoerCode(''); setOntgrendelNaam('');
    } else {
      setStatus('De code is onjuist.');
    }
  };

  return (
    <main className="main-container">
      <style>{`
        html, body { margin: 0; padding: 0; width: 100%; min-height: 100%; background: #C46D5E; overflow-x: hidden; }
        .main-container { margin: 0; padding: 15px 15px 80px 15px; min-height: 100vh; display: flex; flex-direction: column; align-items: center; font-family: 'Inter', -apple-system, sans-serif; background: linear-gradient(-45deg, #F3C98B, #DAA588, #C46D5E, #F56960); background-size: 400% 400%; animation: gradientBG 15s ease infinite; color: white; box-sizing: border-box; }
        @keyframes gradientBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        
        .glass-card { background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); padding: 35px 25px; border-radius: 32px; border: 1px solid rgba(255, 255, 255, 0.18); width: 100%; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); box-sizing: border-box; }
        
        .title { font-size: 2.8rem; font-weight: 900; margin: 0; letter-spacing: -1.5px; text-align: center; }
        .subtitle { font-size: 0.75rem; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 20px; color: rgba(255,255,255,0.6); text-align: center; }
        
        /* TABS */
        .tab-container { display: flex; background: rgba(0,0,0,0.2); border-radius: 16px; padding: 5px; margin-bottom: 25px; }
        .tab { flex: 1; text-align: center; padding: 12px 5px; font-size: 0.8rem; font-weight: 700; border-radius: 12px; cursor: pointer; transition: all 0.3s; opacity: 0.6; }
        .tab.active { background: #9CF6F6; color: #1A3C40; opacity: 1; }

        .input-group { text-align: left; margin-bottom: 15px; }
        .label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; margin-left: 12px; margin-bottom: 6px; display: block; opacity: 0.8; color: #9CF6F6; }
        .input-field { width: 100%; padding: 15px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.06); color: white; font-size: 1rem; outline: none; box-sizing: border-box; }
        .input-field:focus { border-color: #9CF6F6; background: rgba(255,255,255,0.1); }
        
        .btn-primary { width: 100%; padding: 18px; border-radius: 18px; border: none; background: #9CF6F6; color: #1A3C40; font-weight: 800; cursor: pointer; font-size: 0.95rem; box-shadow: 0 10px 20px -5px rgba(156, 246, 246, 0.35); }
        .btn-secondary { width: 100%; padding: 14px; margin-top: 15px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.25); background: transparent; color: white; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
        
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      `}</style>

      <div className="glass-card">
        <h1 className="title">WK'26</h1>
        <p className="subtitle">Pronostiek • Inzet €10</p>

        {actieveSpeler ? (
          <div>
            {/* TABS MENU */}
            <div className="tab-container">
              <div className={`tab ${actieveTab === 'matchen' ? 'active' : ''}`} onClick={() => setActieveTab('matchen')}>MATCHEN</div>
              <div className={`tab ${actieveTab === 'toernooi' ? 'active' : ''}`} onClick={() => setActieveTab('toernooi')}>TOERNOOI</div>
              <div className={`tab ${actieveTab === 'ranking' ? 'active' : ''}`} onClick={() => setActieveTab('ranking')}>RANKING</div>
            </div>

            {/* TAB INHOUD: TOERNOOI */}
            {actieveTab === 'toernooi' && (
              <form onSubmit={slaToernooiVoorspellingOp} style={{ animation: 'fadeIn 0.4s' }}>
                <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '20px', textAlign: 'center' }}>
                  Vul deze in vóór de start van de eerste wedstrijd.
                </p>

                <div className="input-group">
                  <label className="label">Eindwinnaar WK</label>
                  <input className="input-field" placeholder="Bv. Brazilië" value={winnaar} onChange={e => setWinnaar(e.target.value)} />
                </div>

                <div className="input-group">
                  <label className="label">Topschutter (Speler)</label>
                  <input className="input-field" placeholder="Bv. Kylian Mbappé" value={topschutter} onChange={e => setTopschutter(e.target.value)} />
                </div>

                <div className="input-group">
                  <label className="label">Beste Keeper</label>
                  <input className="input-field" placeholder="Bv. Thibaut Courtois" value={besteKeeper} onChange={e => setBesteKeeper(e.target.value)} />
                </div>

                <div className="input-group">
                  <label className="label">Eindstation Rode Duivels</label>
                  <select className="input-field" value={eindstation} onChange={e => setEindstation(e.target.value)}>
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
                  <label className="label">De Laatste Vier (Halve Finalisten)</label>
                  <div className="grid-2">
                    <input className="input-field" placeholder="Land 1" value={lv1} onChange={e => setLv1(e.target.value)} />
                    <input className="input-field" placeholder="Land 2" value={lv2} onChange={e => setLv2(e.target.value)} />
                    <input className="input-field" placeholder="Land 3" value={lv3} onChange={e => setLv3(e.target.value)} />
                    <input className="input-field" placeholder="Land 4" value={lv4} onChange={e => setLv4(e.target.value)} />
                  </div>
                </div>

                <div className="input-group">
                  <label className="label">Tie-breaker: Totaal aantal goals WK</label>
                  <input className="input-field" type="number" placeholder="Bv. 172" value={totaalGoals} onChange={e => setTotaalGoals(e.target.value)} />
                </div>

                {voorspellingStatus && (
                  <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {voorspellingStatus}
                  </div>
                )}

                <button className="btn-primary" type="submit">OPSLAAN</button>
                <button className="btn-secondary" type="button" onClick={() => { localStorage.removeItem('wk_speler_id'); setActieveSpeler(null); }}>Uitloggen</button>
              </form>
            )}

            {/* TIJDELIJKE MELDING VOOR ANDERE TABS */}
            {(actieveTab === 'matchen' || actieveTab === 'ranking') && (
              <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.7 }}>
                <h3>Komt Binnenkort</h3>
                <p style={{ fontSize: '0.9rem' }}>De kalender en de ranking worden hier klaargezet.</p>
                <button className="btn-secondary" onClick={() => { localStorage.removeItem('wk_speler_id'); setActieveSpeler(null); }}>Uitloggen</button>
              </div>
            )}

          </div>
        ) : (
          // --- LOGIN & INSCHRIJF SCHERM ---
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