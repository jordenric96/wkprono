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
      margin: 0, padding: '20px 20px 60px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(-45deg, #F3C98B, #DAA588, #C46D5E, #F56960)',
      backgroundSize: '400% 400%', animation: 'gradientBG 15s ease infinite', color: '#ffffff'
    }}>
      {/* We voegen de global reset direct toe in een style tag */}
      <style>{`
        /* VERWIJDER DE WITTE RANDEN VAN DE BROWSER */
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
          overflow-x: hidden; /* Voorkomt horizontaal scrollen */
        }

        @keyframes gradientBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        
        .install-note {
          background: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 10px 15px;
          font-size: 0.75rem; margin-bottom: 25px; border: 1px solid rgba(255,255,255,0.2);
          max-width: 450px; text-align: center; line-height: 1.4;
        }
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
          box-shadow: 0 4px 15px rgba(156, 246, 246, 0.3);
        }
        .btn-logout { 
          background: rgba(255,255,255,0.2); color: white; padding: 10px 20px; border-radius: 12px; 
          border: 1px solid rgba(255,255,255,0.3); cursor: pointer; margin-top: 20px; font-size: 0.8rem;
        }
        .deelnemer-chip {
          background: rgba(255, 255, 255, 0.1); padding: 8px 16px; border-radius: 50px;
          border: 1px solid rgba(255, 255, 255, 0.1); font-size: 0.85rem;
        }
        .active-chip { background: #9CF6F6; color: #1A3C40; }
      `}</style>

      {/* Installatie-instructie bovenaan */}
      <div className="install-note">
        <strong>📱 Tip: Gebruik dit als app</strong><br/>
        iPhone: Tik onderaan op <span style={{fontSize:'1.1rem'}}>⎋</span> en kies <strong>'Zet op beginscherm'</strong>.<br/>
        Android: Tik rechtsboven op de 3 puntjes en kies <strong>'App installeren'</strong>.
      </div>

      <div className="glass-card">
        <h1 style={{ fontSize: '2.8rem', fontWeight: '900', margin: '0 0 5px 0', letterSpacing: '-1px' }}>WK PRONO</h1>
        <div style={{ background: 'rgba(0,0,0,0.15)', padding: '6px 20px', borderRadius: '50px', display: 'inline-block', fontSize: '0.9rem', marginBottom: '30px' }}>
          Inzet: €10
        </div>

        {actieveSpeler ? (
          <div>
            <h2 style={{ color: '#9CF6F6', fontSize: '1.8rem' }}>Hoi, {actieveSpeler.naam}! 🏆</h2>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '20px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Je profiel is ontgrendeld. Binnenkort kun je hier je voorspellingen invullen.</p>
            </div>
            <button className="btn-logout" onClick={() => { localStorage.removeItem('wk_speler_id'); setActieveSpeler(null); }}>
              Ander profiel gebruiken
            </button>
          </div>
        ) : (
          <div>
            <form onSubmit={ontgrendel}>
              <h3 style={{ fontSize: '0.9rem', textAlign: 'left', margin: '0 0 5px 5px', opacity: 0.8 }}>AL OP DE LIJST?</h3>
              <input className="input-field" placeholder="Je naam" value={ontgrendelNaam} onChange={e => setOntgrendelNaam(e.target.value)} />
              <input className="input-field" type="password" placeholder="Geheime code" value={invoerCode} onChange={e => setInvoerCode(e.target.value)} />
              <button className="btn-main" type="submit">ONTGRENDELEN</button>
            </form>

            <div style={{ margin: '30px 0', display: 'flex', alignItems: 'center', opacity: 0.2 }}>
              <hr style={{ flex: 1 }} /><span style={{ padding: '0 10px', fontSize: '0.7rem' }}>OF</span><hr style={{ flex: 1 }} />
            </div>

            <form onSubmit={schrijfIn}>
              <h3 style={{ fontSize: '0.9rem', textAlign: 'left', margin: '0 0 5px 5px', opacity: 0.8 }}>NIEUWE DEELNEMER?</h3>
              <input className="input-field" placeholder="Voornaam + Achternaam" value={inschrijfNaam} onChange={e => setInschrijfNaam(e.target.value)} />
              <button className="btn-main" type="submit" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                IK DOE MEE
              </button>
            </form>
          </div>
        )}

        <p style={{ marginTop: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>{status}</p>
      </div>

      <div style={{ width: '100%', maxWidth: '450px', marginTop: '40px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '15px', textAlign: 'center', opacity: 0.8 }}>
          Deelnemers ({spelers.length})
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
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