'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Speler {
  id: number;
  naam: string;
}

export default function Home() {
  const [naam, setNaam] = useState('');
  const [status, setStatus] = useState('');
  const [spelers, setSpelers] = useState<Speler[]>([]);

  // Functie om de lijst met spelers op te halen uit Supabase
  const haalSpelersOp = async () => {
    const { data, error } = await supabase
      .from('spelers')
      .select('id, naam')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fout bij ophalen spelers:', error);
    } else {
      setSpelers(data || []);
    }
  };

  // Laad de spelers zodra de pagina opstart
  useEffect(() => {
    haalSpelersOp();
  }, []);

  const schrijfIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naam) return;
    
    setStatus('Bezig met inschrijven...');

    try {
      const { error } = await supabase
        .from('spelers')
        .insert([{ naam: naam, totaal_score: 0 }]);

      if (error) {
        console.error('Supabase error:', error);
        setStatus('Oeps, er ging iets mis.');
      } else {
        setStatus('Gelukt! Je staat op de lijst.');
        setNaam('');
        haalSpelersOp(); // Ververs de lijst direct
      }
    } catch (err) {
      console.error('Systeemfout:', err);
      setStatus('Verbindingsfout.');
    }
  };

  return (
    <main style={{
      margin: 0, padding: '20px 0', minHeight: '100vh', display: 'flex', justifyContent: 'center',
      alignItems: 'center', fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(-45deg, #F3C98B, #DAA588, #C46D5E, #F56960)',
      backgroundSize: '400% 400%', animation: 'gradientBG 15s ease infinite',
      color: '#ffffff', textAlign: 'center'
    }}>
      <style>{`
        @keyframes gradientBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .glass-card {
          background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          padding: 30px; border-radius: 24px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3); width: 90%; max-width: 450px;
        }
        .input-field {
          width: 100%; padding: 15px; margin-top: 15px; border-radius: 12px; border: none; outline: none;
          font-size: 1rem; color: #333; background: white; box-sizing: border-box;
        }
        .submit-btn {
          width: 100%; padding: 15px; margin-top: 10px; border-radius: 12px; border: none;
          background-color: #9CF6F6; color: #1A3C40; font-weight: bold; font-size: 1rem; cursor: pointer;
        }
        .info-badge {
          background: rgba(0, 0, 0, 0.2); padding: 5px 15px; border-radius: 50px;
          display: inline-block; font-size: 0.9rem; margin-bottom: 20px;
        }
        .deelnemers-lijst {
          margin-top: 30px; text-align: left; background: rgba(255, 255, 255, 0.1);
          padding: 20px; border-radius: 15px; border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .deelnemer-item {
          padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex; justify-content: space-between;
        }
        .deelnemer-item:last-child { border-bottom: none; }
      `}</style>

      <div className="glass-card">
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 5px 0' }}>WK PRONO</h1>
        <div className="info-badge">Inzet: €10 per persoon</div>

        <form onSubmit={schrijfIn}>
          <input 
            type="text" placeholder="Wat is je naam?" className="input-field"
            value={naam} onChange={(e) => setNaam(e.target.value)} required
          />
          <button type="submit" className="submit-btn">Ik doe mee!</button>
        </form>

        <div style={{ marginTop: '10px', fontSize: '0.9rem', minHeight: '20px' }}>{status}</div>

        <div className="deelnemers-lijst">
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>
            Deelnemers ({spelers.length})
          </h3>
          {spelers.length === 0 ? (
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Nog geen deelnemers...</p>
          ) : (
            spelers.map((speler) => (
              <div key={speler.id} className="deelnemer-item">
                <span>{speler.naam}</span>
                <span style={{ opacity: 0.6 }}>✓ betaald</span>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}