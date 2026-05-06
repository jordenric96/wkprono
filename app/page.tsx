'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [ontgrendelNaam, setOntgrendelNaam] = useState('');
  const [inschrijfNaam, setInschrijfNaam] = useState('');
  const [invoerCode, setInvoerCode] = useState('');
  
  const [status, setStatus] = useState('');
  const [spelers, setSpelers] = useState<any[]>([]);
  const [actieveSpeler, setActieveSpeler] = useState<any>(null);

  useEffect(() => {
    const opgeslagenId = localStorage.getItem('wk_speler_id');
    haalSpelersOp(opgeslagenId);
  }, []);

  const haalSpelersOp = async (checkId?: string | null) => {
    const { data, error } = await supabase
      .from('spelers')
      .select('id, naam')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setSpelers(data);
      if (checkId) {
        const gevonden = data.find(s => s.id.toString() === checkId);
        if (gevonden) setActieveSpeler(gevonden);
      }
    }
  };

  const schrijfIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Bezig...');
    const { error } = await supabase
      .from('spelers')
      .insert([{ naam: inschrijfNaam.trim(), totaal_score: 0 }]);
    
    if (error) setStatus('Fout bij inschrijven.');
    else {
      setStatus('Gelukt! Vraag Jorden om je code.');
      setInschrijfNaam('');
      haalSpelersOp();
    }
  };

  const ontgrendel = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Verificatie...');
    const { data, error } = await supabase
      .from('spelers')
      .select('*')
      .ilike('naam', ontgrendelNaam.trim())
      .eq('code', invoerCode.trim())
      .single();

    if (error || !data) setStatus('Inloggegevens onjuist.');
    else {
      localStorage.setItem('wk_speler_id', data.id.toString());
      setActieveSpeler(data);
      setStatus('');
      setInvoerCode('');
      setOntgrendelNaam('');
    }
  };

  return (
    <main className="main-container">
      <style>{`
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #C46D5E; /* Fallback */
        }

        .main-container {
          margin: 0; padding: 40px 20px; min-height: 100vh; display: flex; flexDirection: column; alignItems: center;
          font-family: 'Inter', -apple-system, system-ui, sans-serif;
          background: linear-gradient(-45deg, #F3C98B, #DAA588, #C46D5E, #F56960);
          background-size: 400% 400%; animation: gradientBG 15s ease infinite;
          color: white; box-sizing: border-box;
        }

        @keyframes gradientBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

        .install-guide {
          background: rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 12px 20px;
          font-size: 0.7rem; margin-bottom: 30px; border: 1px solid rgba(255,255,255,0.1);
          max-width: 400px; text-align: center; color: rgba(255,255,255,0.8); letter-spacing: 0.3px;
        }

        .glass-card { 
          background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);
          padding: 40px; border-radius: 32px; border: 1px solid rgba(255, 255, 255, 0.15); 
          width: 100%; max-width: 420px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); text-align: center;
        }

        .title { font-size: 3rem; fontWeight: 900; margin: 0; letter-spacing: -2px; line-height: 1; }
        .subtitle { font-size: 0.8rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px; color: rgba(255,255,255,0.7); }

        .input-group { text-align: left; margin-bottom: 15px; }
        .label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-left: 12px; margin-bottom: 6px; display: block; opacity: 0.8; }
        
        .input-field { 
          width: 100%; padding: 16px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); 
          background: rgba(255,255,255,0.05); color: white; font-size: 1rem; outline: none; box-sizing: border-box;
          transition: all 0.3s ease;
        }
        .input-field::placeholder { color: rgba(255,255,255,0.4); }
        .input-field:focus { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.3); }

        .btn-primary { 
          width: 100%; padding: 18px; margin-top: 10px; border-radius: 18px; border: none; 
          background: #9CF6F6; color: #1A3C40; font-weight: 800; cursor: pointer; font-size: 0.95rem;
          box-shadow: 0 10px 20px -5px rgba(156, 246, 246, 0.4); transition: all 0.2s;
        }
        .btn-primary:active { transform: translateY(2px); box-shadow: 0 5px 10px -5px rgba(156, 246, 246, 0.4); }

        .btn-secondary { 
          width: 100%; padding: 14px; margin-top: 10px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2);
          background: transparent; color: white; font-weight: 600; cursor: pointer; font-size: 0.85rem;
        }

        .status-text { margin-top: 20px; font-size: 0.8rem; font-weight: 600; color: #9CF6F6; min-height: 1.2rem; }

        .chip-container { display: flex; flex-wrap: wrap; gap: 8px; justifyContent: center; margin-top: 50px; max-width: 450px; }
        .chip {
          background: rgba(255, 255, 255, 0.06); padding: 8px 18px; border-radius: 50px;
          border: 1px solid rgba(255, 255, 255, 0.08); font-size: 0.8rem; font-weight: 500; letter-spacing: 0.2px;
        }
        .chip-active { background: #9CF6F6; color: #1A3C40; border: none; font-weight: 700; }
      `}</style>

      <div className="install-guide">
        <strong>WEB APP INSTALLATIE</strong><br/>
        iOS: <span style={{fontSize:'1rem'}}>⎋</span> 'Zet op beginscherm' • Android: 'App installeren'
      </div>

      <div className="glass-card">
        <h1 className="title">WK'26</h1>
        <p className="subtitle">Pronostiek • Inzet €10</p>

        {actieveSpeler ? (
          <div style={{ padding: '20px 0' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Gefeliciteerd,</p>
            <h2 style={{ color: '#9CF6F6', fontSize: '2.2rem', margin: 0, letterSpacing: '-1px' }}>{actieveSpeler.naam}</h2>
            <div style={{ marginTop: '30px', padding: '20px', borderRadius: '24px', background: 'rgba(255,255,255,0.05)', fontSize: '0.9rem', opacity: 0.8 }}>
              Je account is gekoppeld. Zodra de wedstrijden live gaan, kun je hier je scores invoeren.
            </div>
            <button className="btn-secondary" style={{marginTop:'40px'}} onClick={() => { localStorage.removeItem('wk_speler_id'); setActieveSpeler(null); }}>
              Ander profiel
            </button>
          </div>
        ) : (
          <div>
            <form onSubmit={ontgrendel}>
              <div className="input-group">
                <label className="label">Ontgrendelen</label>
                <input className="input-field" placeholder="Je naam" value={ontgrendelNaam} onChange={e => setOntgrendelNaam(e.target.value)} />
                <input className="input-field" style={{marginTop:'8px'}} type="password" placeholder="Geheime code" value={invoerCode} onChange={e => setInvoerCode(e.target.value)} />
              </div>
              <button className="btn-primary" type="submit">LOGIN</button>
            </form>

            <div style={{ margin: '35px 0', display: 'flex', alignItems: 'center', opacity: 0.2 }}>
              <hr style={{ flex: 1, border: 'none', height: '1px', background: 'white' }} />
              <span style={{ padding: '0 15px', fontSize: '0.6rem', fontWeight: 900 }}>OF</span>
              <hr style={{ flex: 1, border: 'none', height: '1px', background: 'white' }} />
            </div>

            <form onSubmit={schrijfIn}>
              <div className="input-group">
                <label className="label">Nieuwe Deelnemer</label>
                <input className="input-field" placeholder="Voornaam + Achternaam" value={inschrijfNaam} onChange={e => setInschrijfNaam(e.target.value)} />
              </div>
              <button className="btn-secondary" type="submit">INSCHRIJVEN</button>
            </form>
          </div>
        )}

        <div className="status-text">{status}</div>
      </div>

      <div className="chip-container">
        {spelers.map(s => (
          <div key={s.id} className={`chip ${actieveSpeler?.id === s.id ? 'chip-active' : ''}`}>
            {s.naam} {actieveSpeler?.id === s.id && '⭐'}
          </div>
        ))}
      </div>
    </main>
  );
}