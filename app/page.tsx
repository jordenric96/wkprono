'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  // Gescheiden statussen voor de twee formulieren
  const [ontgrendelNaam, setOntgrendelNaam] = useState('');
  const [inschrijfNaam, setInschrijfNaam] = useState('');
  const [invoerCode, setInvoerCode] = useState('');
  
  const [status, setStatus] = useState('');
  const [spelers, setSpelers] = useState<any[]>([]);
  const [actieveSpeler, setActieveSpeler] = useState<any>(null);

  // Haal de lijst op bij het laden
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
    setStatus('Bezig met inschrijven...');
    const { error } = await supabase
      .from('spelers')
      .insert([{ naam: inschrijfNaam.trim(), totaal_score: 0 }]);
    
    if (error) {
      setStatus('Naam bestaat al of er is een fout.');
    } else {
      setStatus('Gelukt! Vraag Jorden om je code.');
      setInschrijfNaam('');
      haalSpelersOp();
    }
  };

  const ontgrendel = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Controleren...');

    const { data, error } = await supabase
      .from('spelers')
      .select('*')
      .ilike('naam', ontgrendelNaam.trim())
      .eq('code', invoerCode.trim())
      .single();

    if (error || !data) {
      setStatus('Combinatie niet gevonden.');
    } else {
      localStorage.setItem('wk_speler_id', data.id.toString());
      setActieveSpeler(data);
      setStatus('Welkom terug!');
      setInvoerCode('');
      setOntgrendelNaam('');
    }
  };

  return (
    <main style={{
      margin: 0, padding: '40px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(-45deg, #F3C98B, #DAA588, #C46D5E, #F56960)',
      backgroundSize: '400% 400%', animation: 'gradientBG 15s ease infinite', color: '#ffffff'
    }}>
      <style>{`
        @keyframes gradientBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .glass-card { 
          background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
          padding: 35px; border-radius: 30px; border: 1px solid rgba(255, 255, 255, 0.2); 
          width: 100%; max-width: 450px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); text-align: center;
        }
        .input-field { 
          width: 100%; padding: 14px; margin-top: 12px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.3); 
          background: rgba(255,255,255,0.9); color: #333; font-size: 1rem; outline: none; box-sizing: border-box;
        }
        .btn-main { 
          width: 100%; padding: 15px; margin-top: 15px; border-radius: 15px; border: none; 
          background: #9CF6F6; color: #1A3C40; font-weight: 800; cursor: pointer; font-size: 1rem;
          box-shadow: 0 4px 15px rgba(156, 246, 246, 0.3); transition: transform 0.2s;
        }
        .btn-main:active { transform: scale(0.98); }
        .btn-logout { 
          background: rgba(255,255,255,0.2); color: white; padding: 10px 20px; border-radius: 12px; 
          border: 1px solid rgba(255,255,255,0.3); cursor: pointer; margin-top: 20px;
        }
        .deelnemer-chip {
          background: rgba(255, 255, 255, 0.1); padding: 8px 16px; border-radius: 50px;
          border: 1px solid rgba(255, 255, 255, 0.1); font-size: 0.85rem; font-weight: 500;
        }
        .active-chip { background: #9CF6F6; color: #1A3C40; border: none; }
      `}</style>

      <div className="glass-card">
        <h1 style={{ fontSize: '2.8rem', fontWeight: '900', margin: '0 0 5px 0', letterSpacing: '-1px' }}>WK PRONO</h1>
        <div style={{ background: 'rgba(0,0,0,0.15)', padding: '6px 20px', borderRadius: '50px', display: 'inline-block', fontSize: '0.9rem', marginBottom: '30px', fontWeight: '600' }}>
          Inzet: €10
        </div>

        {actieveSpeler ? (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <h2 style={{ color: '#9CF6F6', fontSize: '1.8rem' }}>Welkom, {actieveSpeler.naam}! 🏆</h2>
            <p style={{ opacity: 0.9, marginBottom: '20px' }}>Je bent klaar voor de start.</p>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '20px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Binnenkort kun je hier je scores invullen.</p>
            </div>
            <button className="btn-logout" onClick={() => { localStorage.removeItem('wk_speler_id'); setActieveSpeler(null); }}>
              Log uit
            </button>
          </div>
        ) : (
          <div>
            <form onSubmit={ontgrendel}>
              <h3 style={{ fontSize: '1rem', textAlign: 'left', margin: '0 0 5px 5px' }}>Ontgrendel je profiel</h3>
              <input className="input-field" placeholder="Je naam" value={ontgrendelNaam} onChange={e => setOntgrendelNaam(e.target.value)} />
              <input className="input-field" type="password" placeholder="Geheime code" value={invoerCode} onChange={e => setInvoerCode(e.target.value)} />
              <button className="btn-main" type="submit">Nu Ontgrendelen</button>
            </form>

            <div style={{ margin: '35px 0', display: 'flex', alignItems: 'center', opacity: 0.3 }}>
              <hr style={{ flex: 1 }} /><span style={{ padding: '0 10px', fontSize: '0.8rem' }}>OF</span><hr style={{ flex: 1 }} />
            </div>

            <form onSubmit={schrijfIn}>
              <h3 style={{ fontSize: '1rem', textAlign: 'left', margin: '0 0 5px 5px' }}>Nieuwe deelnemer</h3>
              <input className="input-field" placeholder="Typ je naam..." value={inschrijfNaam} onChange={e => setInschrijfNaam(e.target.value)} />
              <button className="btn-main" type="submit" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', boxShadow: 'none' }}>
                Schrijf mij in
              </button>
            </form>
          </div>
        )}

        <p style={{ marginTop: '20px', fontSize: '0.85rem', fontWeight: 'bold', color: status.includes('Gelukt') ? '#9CF6F6' : '#fff' }}>
          {status}
        </p>
      </div>

      {/* Deelnemerslijst buiten de kaart voor meer ruimte */}
      <div style={{ width: '100%', maxWidth: '450px', marginTop: '40px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', textAlign: 'center' }}>
          Deelnemers <span style={{ opacity: 0.6, fontWeight: 'normal' }}>({spelers.length})</span>
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {spelers.length === 0 && <p style={{ opacity: 0.5 }}>Nog geen spelers...</p>}
          {spelers.map(s => (
            <div key={s.id} className={`deelnemer-chip ${actieveSpeler?.id === s.id ? 'active-chip' : ''}`}>
              {s.naam} {actieveSpeler?.id === s.id && '⭐'}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}