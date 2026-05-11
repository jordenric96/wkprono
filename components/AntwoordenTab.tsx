// src/components/AntwoordenTab.tsx
import React, { useState } from 'react';

export default function AntwoordenTab({ nu, DEADLINE_DATE, alleToernooiV }: any) {
  const isGesloten = nu >= DEADLINE_DATE;
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!alleToernooiV || alleToernooiV.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.8)', borderRadius: '16px', border: '2px dashed #ADB5BD' }}>
        <p style={{ fontWeight: 900, color: '#111827', fontSize: '1.2rem', margin: 0 }}>Nog akelig stil...</p>
        <p style={{ color: '#6C757D', fontSize: '0.8rem', fontWeight: 800, marginTop: '5px' }}>
          Nog niemand heeft zijn bonusvragen opgeslagen.
        </p>
      </div>
    );
  }

  // Sorteer alfabetisch op naam
  const gesorteerd = [...alleToernooiV].sort((a, b) => a.spelers?.naam.localeCompare(b.spelers?.naam));

  // --- WEERGAVE 1: VÓÓR DE DEADLINE (Voortgang, geen antwoorden) ---
  if (!isGesloten) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div style={{ background: 'rgba(255,255,255,0.9)', padding: '15px', borderRadius: '16px', borderLeft: '4px solid var(--crayola)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: 'var(--crayola)', letterSpacing: '1px' }}>🔒 ANTWOORDEN GEHEIM</h3>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6C757D', margin: '5px 0 0 0', lineHeight: 1.4 }}>
            De deadline is nog niet verstreken! Om spieken te voorkomen, zie je hier voorlopig enkel <b>wie wat al heeft ingevuld</b>. De échte antwoorden ontgrendelen automatisch zodra het toernooi start.
          </p>
        </div>

        {gesorteerd.map((v) => {
          // Controleer welke velden zijn ingevuld
          const checks = [
            { label: 'Wereldkampioen', ok: !!v.winnaar },
            { label: 'Halve Finalisten', ok: !!(v.halve_finalist_1 && v.halve_finalist_2 && v.halve_finalist_3 && v.halve_finalist_4) },
            { label: 'Meeste Goals', ok: !!v.topschutter },
            { label: 'Beste Verdediging', ok: !!v.beste_keeper },
            { label: 'Eindstation België', ok: !!v.eindstation_belgie },
            { label: 'Totaal Goals', ok: v.totaal_goals != null && v.totaal_goals > 0 },
            { label: 'Totaal Geel', ok: v.totaal_gele_kaarten != null && v.totaal_gele_kaarten > 0 },
            { label: 'Totaal Rood', ok: v.totaal_rode_kaarten != null && v.totaal_rode_kaarten > 0 }
          ];
          
          const score = checks.filter(c => c.ok).length;
          const klaar = score === 8;

          return (
            <div key={v.id} style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', padding: '15px', border: klaar ? '2px solid #40C057' : '2px solid #E9ECEF', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px dashed #E9ECEF', paddingBottom: '10px' }}>
                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#111827' }}>{v.spelers?.naam}</div>
                <div style={{ background: klaar ? '#EBFBEE' : '#FFF4E6', color: klaar ? '#2B8A3E' : '#E03131', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 900 }}>
                  {score}/8 INGEVULD
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {checks.map((c, i) => (
                  <div key={i} style={{ fontSize: '0.7rem', fontWeight: 800, color: c.ok ? '#111827' : '#ADB5BD', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.9rem' }}>{c.ok ? '✅' : '⏳'}</span> 
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.label}</span>
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>
    );
  }

  // --- WEERGAVE 2: NA DE DEADLINE (Antwoorden onthuld) ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      <div style={{ textAlign: 'center', fontWeight: 900, color: '#FFF', background: 'var(--crayola)', padding: '10px', borderRadius: '12px', marginBottom: '10px', boxShadow: '0 4px 10px rgba(55, 114, 255, 0.3)' }}>
        🔓 ALLE ANTWOORDEN ZIJN ONTHULD!
      </div>

      {gesorteerd.map((v) => {
        const isOpen = expandedId === v.id;
        
        return (
          <div key={v.id} style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', border: '2px solid #E9ECEF', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            
            {/* Klikbare Header */}
            <div 
              onClick={() => setExpandedId(isOpen ? null : v.id)} 
              style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 900, cursor: 'pointer', background: isOpen ? '#F8F9FA' : 'transparent', color: isOpen ? 'var(--crayola)' : '#111827', transition: 'background 0.2s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>👤</span>
                <span>{v.spelers?.naam}</span>
              </div>
              <span style={{ transition: 'transform 0.3s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </div>

            {/* Uitklapbare Details */}
            {isOpen && (
              <div style={{ padding: '15px', borderTop: '2px solid #E9ECEF', fontSize: '0.8rem', display: 'grid', gap: '12px', background: '#FFF' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E9ECEF', paddingBottom: '5px' }}>
                  <span style={{ color: '#6C757D', fontWeight: 800 }}>🏆 Wereldkampioen:</span>
                  <span style={{ fontWeight: 900, color: 'var(--crayola)' }}>{v.winnaar || 'Niet ingevuld'}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E9ECEF', paddingBottom: '5px' }}>
                  <span style={{ color: '#6C757D', fontWeight: 800 }}>⚔️ Halve Finalisten:</span>
                  <span style={{ fontWeight: 900, textAlign: 'right' }}>
                    {[v.halve_finalist_1, v.halve_finalist_2, v.halve_finalist_3, v.halve_finalist_4].filter(Boolean).join(', ') || 'Niet ingevuld'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E9ECEF', paddingBottom: '5px' }}>
                  <span style={{ color: '#6C757D', fontWeight: 800 }}>⚽ Meeste Goals:</span>
                  <span style={{ fontWeight: 900 }}>{v.topschutter || 'Niet ingevuld'}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E9ECEF', paddingBottom: '5px' }}>
                  <span style={{ color: '#6C757D', fontWeight: 800 }}>🛡️ Beste Verdediging:</span>
                  <span style={{ fontWeight: 900 }}>{v.beste_keeper || 'Niet ingevuld'}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E9ECEF', paddingBottom: '5px' }}>
                  <span style={{ color: '#6C757D', fontWeight: 800 }}>📍 Eindstation België:</span>
                  <span style={{ fontWeight: 900 }}>{v.eindstation_belgie || 'Niet ingevuld'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E9ECEF', paddingBottom: '5px' }}>
                  <span style={{ color: '#6C757D', fontWeight: 800 }}>Totaal Goals Toernooi:</span>
                  <span style={{ fontWeight: 900 }}>{v.totaal_goals || '?'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E9ECEF', paddingBottom: '5px' }}>
                  <span style={{ color: '#6C757D', fontWeight: 800 }}>Totaal Gele Kaarten:</span>
                  <span style={{ fontWeight: 900 }}>{v.totaal_gele_kaarten || '?'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6C757D', fontWeight: 800 }}>Totaal Rode Kaarten:</span>
                  <span style={{ fontWeight: 900 }}>{v.totaal_rode_kaarten || '?'}</span>
                </div>

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
