'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [naam, setNaam] = useState('');
  const [invoerCode, setInvoerCode] = useState('');
  const [status, setStatus] = useState('');
  const [spelers, setSpelers] = useState<any[]>([]);
  const [actieveSpeler, setActieveSpeler] = useState<any>(null);

  useEffect(() => {
    // Check of er al een actieve speler is opgeslagen op dit toestel
    const opgeslagenId = localStorage.getItem('wk_speler_id');
    haalSpelersOp(opgeslagenId);
  }, []);

  const haalSpelersOp = async (checkId?: string | null) => {
    const { data, error } = await supabase
      .from('spelers')
      .select('id, naam, code')
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
    const { error } = await supabase.from('spelers').insert([{ naam: naam.trim(), totaal_score: 0 }]);
    if (error) setStatus('Naam bestaat al of fout.');
    else {
      setStatus('Gelukt! Vraag Jorden om je geheime code.');
      setNaam('');
      haalSpelersOp();
    }
  };

  const ontgrendel = async (e: React.FormEvent) => {
    e.preventDefault();
    const speler = spelers.find(s => s.naam.toLowerCase() === naam.toLowerCase().trim());
    
    if (speler && speler.code === invoerCode) {
      localStorage.setItem('wk_speler_id', speler.id.toString());
      setActieveSpeler(speler);
      setStatus('Profiel ontgrendeld!');
    } else {
      setStatus('Naam of code is onjuist.');
    }
  };

  return (
    <main style={{
      margin: 0, padding: '20px 0', minHeight: '100vh', display: 'flex', justifyContent: 'center',
      alignItems: 'center', fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(-45deg, #F3C98B, #DAA588, #C46D5E, #F56960)',
      backgroundSize: '400% 400%', animation: 'gradientBG 15s ease infinite', color: '#ffffff'
    }}>
      <style>{`
        @keyframes gradientBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .glass-card { background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(12px); padding: 30px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.3); width: 90%; max-width: 450px; text-align: center; }
        .input-field { width: 100%; padding: 12px; margin-top: 10px; border-radius: 10px; border: none; color: #333; }
        .btn { width: 100%; padding: 12px; margin-top: 10px; border-radius: 10px; border: none; font-weight: bold; cursor: pointer; }
        .btn-main { background: #9CF6F6; color: #1A3C40; }
        .btn-sec { background: rgba(255,255,255,0.2); color: white; margin-top: 20px; }
      `}</style>

      <div className="glass-card">
        <h1>WK PRONO 2026</h1>

        {actieveSpeler ? (
          <div>
            <h2 style={{ color: '#9CF6F6' }}>Welkom, {actieveSpeler.naam}!</h2>
            <p>Je kunt nu je scores invullen.</p>
            <button className="btn btn-sec" onClick={() => { localStorage.removeItem('wk_speler_id'); setActieveSpeler(null); }}>Uitloggen</button>
          </div>
        ) : (
          <div>
            <form onSubmit={ontgrendel} style={{ marginBottom: '30px' }}>
              <p style={{ fontSize: '0.9rem' }}>Al op de lijst? Ontgrendel je profiel:</p>
              <input className="input-field" placeholder="Je naam" value={naam} onChange={e => setNaam(e.target.value)} />
              <input className="input-field" type="password" placeholder="Je geheime code" value={invoerCode} onChange={e => setInvoerCode(e.target.value)} />
              <button className="btn btn-main" type="submit">Ontgrendelen</button>
            </form>

            <hr style={{ opacity: 0.2 }} />

            <form onSubmit={schrijfIn} style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '0.9rem' }}>Nog niet op de lijst?</p>
              <input className="input-field" placeholder="Nieuwe naam" value={naam} onChange={e => setNaam(e.target.value)} />
              <button className="btn btn-sec" type="submit">Inschrijven</button>
            </form>
          </div>
        )}

        <p style={{ marginTop: '15px', fontSize: '0.8rem' }}>{status}</p>

        <div style={{ marginTop: '30px', textAlign: 'left', background: 'rgba(0,0,0,0.1)', padding: '15px', borderRadius: '15px' }}>
          <h3 style={{ fontSize: '0.9rem', margin: '0 0 10px 0' }}>Deelnemers ({spelers.length})</h3>
          {spelers.map(s => (
            <div key={s.id} style={{ fontSize: '0.8rem', padding: '4px 0', opacity: actieveSpeler?.id === s.id ? 1 : 0.6 }}>
              {s.naam} {actieveSpeler?.id === s.id && ' ⭐'}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}