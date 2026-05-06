'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [naam, setNaam] = useState('');
  const [status, setStatus] = useState('');

  const schrijfIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naam) return;
    
    setStatus('Bezig met inschrijven...');

    try {
      // We sturen de naam naar de 'spelers' tabel
      const { error } = await supabase
        .from('spelers')
        .insert([{ naam: naam, totaal_score: 0 }]);

      if (error) {
        console.error('Supabase error:', error);
        setStatus('Oeps, er ging iets mis met de database.');
      } else {
        setStatus('Gelukt! Je staat op de lijst voor WK 2026.');
        setNaam('');
      }
    } catch (err) {
      console.error('Systeemfout:', err);
      setStatus('Er is een verbindingsfout opgetreden.');
    }
  };

  return (
    <main style={{
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(-45deg, #F3C98B, #DAA588, #C46D5E, #F56960)',
      backgroundSize: '400% 400%',
      animation: 'gradientBG 15s ease infinite',
      color: '#ffffff',
      textAlign: 'center'
    }}>
      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          width: 90%;
          max-width: 400px;
          animation: fadeInUp 1s ease-out;
        }
        .input-field {
          width: 100%;
          padding: 15px;
          margin-top: 20px;
          border-radius: 12px;
          border: none;
          outline: none;
          font-size: 1rem;
          color: #333;
          background: white;
          box-sizing: border-box;
        }
        .submit-btn {
          width: 100%;
          padding: 15px;
          margin-top: 15px;
          border-radius: 12px;
          border: none;
          background-color: #9CF6F6;
          color: #1A3C40;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s, background-color 0.2s;
        }
        .submit-btn:hover {
          transform: translateY(-2px);
          background-color: #7de8e8;
        }
        .status-msg {
          margin-top: 20px;
          font-weight: 500;
          min-height: 24px;
        }
      `}</style>

      <div className="glass-card">
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 10px 0' }}>
          WK PRONO
        </h1>
        <p style={{ fontSize: '1rem', opacity: 0.9, letterSpacing: '1px' }}>
          COMING SOON • 2026
        </p>

        <form onSubmit={schrijfIn}>
          <input 
            type="text" 
            placeholder="Wat is je naam?" 
            className="input-field"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            required
          />
          <button type="submit" className="submit-btn">
            Houd mij op de hoogte
          </button>
        </form>

        <div className="status-msg">
          {status}
        </div>
      </div>
    </main>
  );
}