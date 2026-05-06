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

    const { error } = await supabase
      .from('spelers')
      .insert([{ naam: naam }]);

    if (error) {
      console.error(error);
      setStatus('Oeps, er ging iets mis.');
    } else {
      setStatus('Gelukt! Je staat op de lijst.');
      setNaam('');
    }
  };

  return (
    <main style={{
      margin: 0, padding: 0, minHeight: '100vh', display: 'flex', justifyContent: 'center',
      alignItems: 'center', fontFamily: 'sans-serif',
      background: 'linear-gradient(-45deg, #F3C98B, #DAA588, #C46D5E, #F56960)',
      backgroundSize: '400% 400%',
      color: '#ffffff', textAlign: 'center'
    }}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.2)', 
        backdropFilter: 'blur(10px)',
        padding: '40px', 
        borderRadius: '20px',
        width: '90%',
        maxWidth: '400px',
        border: '1px solid rgba(255,255,255,0.3)'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>WK Prono 2026</h1>
        <p style={{ marginBottom: '30px', opacity: 0.9 }}>Website in opbouw</p>
        
        <form onSubmit={schrijfIn} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="Typ hier je naam..." 
            style={{ 
              padding: '15px', 
              borderRadius: '10px', 
              border: 'none', 
              fontSize: '1rem',
              color: '#333',
              backgroundColor: 'white'
            }}
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            required
          />
          <button type="submit" style={{ 
            padding: '15px', 
            borderRadius: '10px', 
            border: 'none', 
            backgroundColor: '#9CF6F6', 
            color: '#333', 
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Schrijf mij in
          </button>
        </form>
        
        <div style={{ marginTop: '20px', fontWeight: 'bold' }}>{status}</div>
      </div>
    </main>
  );
}