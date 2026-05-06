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
    const opgeslagenId = localStorage.getItem('wk_speler_id');
    haalSpelersOp(opgeslagenId);
  }, []);

  const haalSpelersOp = async (checkId?: string | null) => {
    const { data, error } = await supabase
      .from('spelers')
      .select('id, naam, betaald')
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
    setStatus('Bezig met inschrijven...');
    const { error } = await supabase.from('spelers').insert([{ naam: naam.trim(), totaal_score: 0 }]);
    if (error) setStatus('Naam bestaat al of databasefout.');
    else {
      setStatus('Gelukt! Vraag Jorden om je geheime code.');
      setNaam('');
      haalSpelersOp();
    }
  };

  const ontgrendel = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Controleren...');

    // We zoeken direct in Supabase naar de combinatie van naam EN code
    // We gebruiken .ilike voor de naam zodat hoofdletters niet uitmaken
    const { data, error } = await supabase
      .from('spelers')
      .select('*')
      .ilike('naam', naam.trim())
      .eq('code', invoerCode.trim())
      .single();

    if (error || !data) {
      console.error(error);
      setStatus('Combinatie van naam en code niet gevonden.');
    } else {
      localStorage.setItem('wk_speler_id', data.id.toString());
      setActieveSpeler(data);
      setStatus('Profiel ontgrendeld!');
      setInvoerCode('');
      setNaam('');
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
        .input-field { width: 100%; padding: 12px; margin-top: 10px; border-radius: 10px; border: none; color: #333; font-size: 1rem; }
        .btn { width: 100%; padding: 12px; margin-top: 10px; border-radius: 10px; border: none; font-weight: bold; cursor: pointer; font-size: 1rem; }
        .btn-main { background: #9CF6F6; color: #1A3C40; }
        .btn-sec { background: rgba(255,255,255,0.2); color: white; margin-top: 20px; }
      `}</style>

      <div className="glass-card">
        <h1 style={{ marginBottom: '5px' }}>WK PRONO 2026</h1>
        <p style={{ fontSize: '0.9rem', marginBottom: '20px', opacity: 0.8 }}>Inzet: €10</p>

        {actieveSpeler ? (
          <div>
            <h2 style={{ color: '#9CF6F6', margin: '0 0 10px 0' }}>Welkom, {actieveSpeler.naam}!</h2>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
              <p style={{ margin: 0 }}>Je bent nu ingelogd op dit toestel.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>Binnenkort kun je hier je scores invullen.</p>
            </div>
            <button className="btn btn-sec" onClick={() => { localStorage.removeItem('wk_speler_id'); setActieveSpeler(null); }}>Uitloggen</button>
          </div>
        ) : (
          <div>
            <form onSubmit={ontgrendel} style={{ marginBottom: '30px' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Ontgrendel je profiel:</p>
              <input className="input-field" placeholder="Je naam" value={naam} onChange={e => setNaam(e.target.value)} />
              <input className="input-field" type="text" placeholder="Je geheime code" value={invoerCode} onChange={e => setInvoerCode(e.target.value)} />
              <button className="btn btn-main" type="submit">Nu Ontgrendelen</button>
            </form>

            <hr style={{ opacity: 0.2, margin: '20px 0' }} />

            <form onSubmit={schrijfIn}>
              <p style={{ fontSize: '0.9rem' }}>Nog niet op de lijst?</p>
              <input className="input-field" placeholder="Nieuwe naam invullen" value={naam} onChange={e => setNaam(e.target.value)} />
              <button className="btn btn-sec" type="submit" style={{ marginTop: '10px' }}>Inschrijven</button>
            </form>
          </div>
        )}

        <div style={{ marginTop: '15px', fontSize: '0.8rem', fontWeight: 'bold', color: status.includes('Gelukt') ? '#9CF6F6' : '#fff' }}>
          {status}
        </div>

        <div style={{ marginTop: '30px', textAlign: 'left', background: 'rgba(0,0,0,0.1)', padding: '15px', borderRadius: '15px' }}>
          <h3 style={{ fontSize: '0.9rem', margin: '0 0 10px 0' }}>Deelnemers ({spelers.length})</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {spelers.map(s => (
              <span key={s.id} style={{ 
                fontSize: '0.75rem', 
                background: actieveSpeler?.id === s.id ? '#9CF6F6' : 'rgba(255,255,255,0.1)', 
                color: actieveSpeler?.id === s.id ? '#1A3C40' : 'white',
                padding: '4px 10px', 
                borderRadius: '50px' 
              }}>
                {s.naam} {actieveSpeler?.id === s.id && '⭐'}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}