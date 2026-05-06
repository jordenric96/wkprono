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
    
    if (error) setStatus('Naam bestaat al of er is een fout.');
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
          margin: 0; padding: 0;
          width: 100%; min-height: 100%;
          background: #C46D5E;
          overflow-x: hidden;
        }

        .main-container {
          margin: 0; padding: 15px 15px 80px 15px; 
          min-height: 100vh; display: flex; flex-direction: column; align-items: center;
          font-family: 'Inter', -apple-system, system-ui, sans-serif;
          background: linear-gradient(-45deg, #F3C98B, #DAA588, #C46D5E, #F56960);
          background-size: 400% 400%; animation: gradientBG 15s ease infinite;
          color: white; box-sizing: border-box;
        }

        @keyframes gradientBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

        .install-guide {
          background: rgba(255, 255, 255, 0.08); border-radius: 18px; padding: 12px 18px;
          font-size: 0.68rem; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.15);
          width: 100%; max-width: 420px; text-align: center; color: rgba(255,255,255,0.85);
          line-height: 1.5; box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .glass-card { 
          background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);
          padding: 35px 25px; border-radius: 32px; border: 1px solid rgba(255, 255, 255, 0.18); 
          width: 100%; max-width: 420px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); 
          text-align: center; box-sizing: border-box;
        }

        .payment-box {
          background: rgba(255, 255, 255, 0.07); border-radius: 20px; padding: 20px;
          margin-top: 25px; border: 1px solid rgba(156, 246, 246, 0.2); text-align: left;
        }

        .title { font-size: 2.8rem; font-weight: 900; margin: 0; letter-spacing: -1.5px; }
        .subtitle { font-size: 0.75rem; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 30px; color: rgba(255,255,255,0.6); }

        .input-group { text-align: left; margin-bottom: 12px; }
        .label { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; margin-left: 12px; margin-bottom: 5px; display: block; opacity: 0.7; }
        
        .input-field { 
          width: 100%; padding: 15px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); 
          background: rgba(255,255,255,0.06); color: white; font-size: 1rem; outline: none; box-sizing: border-box;
        }

        .btn-primary { 
          width: 100%; padding: 18px; margin-top: 5px; border-radius: 18px; border: none; 
          background: #9CF6F6; color: #1A3C40; font-weight: 800; cursor: pointer; font-size: 0.95rem;
          box-shadow: 0 10px 20px -5px rgba(156, 246, 246, 0.35);
        }

        .btn-secondary { 
          width: 100%; padding: 14px; margin-top: 10px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.25);
          background: transparent; color: white; font-weight: 600; font-size: 0.85rem;
        }

        .chip-container { 
          display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; 
          margin-top: 40px; width: 100%; max-width: 420px; 
        }
        .chip {
          background: rgba(255, 255, 255, 0.06); padding: 7px 16px; border-radius: 50px;
          border: 1px solid rgba(255, 255, 255, 0.1); font-size: 0.78rem; white-space: nowrap;
        }
        .chip-active { background: #9CF6F6; color: #1A3C40; border: none; font-weight: 700; }

        @media (min-width: 480px) {
          .glass-card { padding: 45px; }
          .title { font-size: 3.2rem; }
        }
      `}</style>

      {/* Verfijnde Installatie-instructie */}
      <div className="install-guide">
        <strong style={{color: '#9CF6F6', letterSpacing: '1px'}}>INSTALLEER ALS APP</strong><br/>
        <div style={{marginTop: '4px'}}>
          iPhone: Tik op <span style={{fontSize:'1rem'}}>⎋</span> en kies <strong>'Zet op beginscherm'</strong><br/>
          Android: Tik op <span style={{fontSize:'1rem'}}>⋮</span> en kies <strong>'Toevoegen aan startscherm'</strong>
        </div>
      </div>

      <div className="glass-card">
        <h1 className="title">WK'26</h1>
        <p className="subtitle">Pronostiek • Inzet €10</p>

        {actieveSpeler ? (
          <div style={{ padding: '10px 0' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '5px', opacity: 0.85 }}>Welkom,</p>
            <h2 style={{ color: '#9CF6F6', fontSize: '2.2rem', margin: 0, letterSpacing: '-0.5px' }}>{actieveSpeler.naam}</h2>
            
            <div className="payment-box">
              <p style={{ margin: '0 0 12px 0', fontSize: '0.7rem', fontWeight: 800, color: '#9CF6F6', textTransform: 'uppercase', letterSpacing: '1px' }}>💳 Betaalgegevens</p>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem' }}>Stort <strong>€10</strong> naar:</p>
              <p style={{ margin: '0 0 15px 0', fontSize: '1rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.25)', padding: '10px', borderLeft: '3px solid #9CF6F6', borderRadius: '4px' }}>BE85 0018 2075 8506</p>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9, lineHeight: '1.4' }}>Mededeling: <br/><strong>WK prono + {actieveSpeler.naam}</strong></p>
            </div>

            <button className="btn-secondary" style={{marginTop:'35px'}} onClick={() => { localStorage.removeItem('wk_speler_id'); setActieveSpeler(null); }}>
              Ander profiel
            </button>
          </div>
        ) : (
          <div>
            <form onSubmit={ontgrendel}>
              <div className="input-group">
                <label className="label">Ontgrendelen</label>
                <input className="input-field" placeholder="Je naam" value={ontgrendelNaam} onChange={e => setOntgrendelNaam(e.target.value)} />
                <input className="input-field" style={{marginTop:'10px'}} type="password" placeholder="Geheime code" value={invoerCode} onChange={e => setInvoerCode(e.target.value)} />
              </div>
              <button className="btn-primary" type="submit">LOGIN</button>
            </form>

            <div style={{ margin: '30px 0', display: 'flex', alignItems: 'center', opacity: 0.18 }}>
              <hr style={{ flex: 1, border: 'none', height: '1px', background: 'white' }} />
              <span style={{ padding: '0 15px', fontSize: '0.6rem', fontWeight: 900 }}>OF</span>
              <hr style={{ flex: 1, border: 'none', height: '1px', background: 'white' }} />
            </div>

            <form onSubmit={schrijfIn}>
              <div className="input-group">
                <label className="label">Nieuwe Deelnemer</label>
                <input className="input-field" placeholder="Naam + Achternaam" value={inschrijfNaam} onChange={e => setInschrijfNaam(e.target.value)} />
              </div>
              <button className="btn-secondary" type="submit">INSCHRIJVEN</button>
            </form>
          </div>
        )}

        <div style={{ marginTop: '20px', fontSize: '0.8rem', fontWeight: '700', color: '#9CF6F6' }}>{status}</div>
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