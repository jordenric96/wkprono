// src/components/MatchenTab.tsx
import React from 'react';
import { parseTeam } from '../lib/helpers';

export default function MatchenTab({
  gefilterdeMatchen, nu, matchVoorspellingen, matchSaveStatus, alleMatchVoorspellingen,
  alleSpelers, expandedMatchId, setExpandedMatchId, toggleJoker, handleScore
}: any) {

  const formatMatchDate = (dateString: string) => {
    const d = new Date(dateString);
    const dag = d.toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'short' });
    const tijd = d.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
    return `${dag} • ${tijd}`.toUpperCase();
  };

  const getMatchCountdown = (matchTime: string) => {
    const diff = new Date(matchTime).getTime() - nu;
    if (diff <= 0) return "🔒 GESLOTEN";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const isUrgent = diff < (1000 * 60 * 60); 
    return (
      <span style={{ color: isUrgent ? '#FA5252' : 'inherit', fontWeight: 900 }}>
        ⏱️ {h > 0 ? `${h}u ` : ''}{m}m
      </span>
    );
  };

  if (gefilterdeMatchen.length === 0) {
    return <p style={{textAlign:'center', fontWeight:800, color:'#6C757D', margin:'40px 0'}}>Geen matchen gevonden.</p>;
  }

  return (
    <div>
      {gefilterdeMatchen.map((m: any) => {
        const gestart = nu > new Date(m.datum).getTime();
        const v = matchVoorspellingen[m.id] || { thuis: '', uit: '', joker: false };
        const save = matchSaveStatus[m.id] || 'idle';
        const pVoorMatch = alleMatchVoorspellingen.filter((av: any) => av.match_id === m.id);
        const heeftUitslag = m.thuis_score !== null;
        const thuisInfo = parseTeam(m.thuisploeg);
        const uitInfo = parseTeam(m.uitploeg);

        return (
          <div 
            key={m.id} 
            style={{
              background: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', marginBottom: '15px', 
              border: gestart ? '3px solid #EF709D' : '3px solid #E9ECEF', overflow: 'hidden',
              boxShadow: '0 10px 20px rgba(0,0,0,0.05)', cursor: gestart ? 'pointer' : 'default'
            }}
            onClick={() => gestart && setExpandedMatchId(expandedMatchId === m.id ? null : m.id)}
          >
            {/* Header van de match */}
            <div style={{ background: heeftUitslag ? '#F038FF' : '#E2EF70', color: heeftUitslag ? 'white' : '#111827', padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.7, letterSpacing: '0.5px' }}>
                  📅 {formatMatchDate(m.datum)}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 900 }}>
                  {heeftUitslag ? '🏆 EINDSTAND' : (gestart ? '🔒 GESLOTEN' : getMatchCountdown(m.datum))}
                </span>
              </div>

              <button onClick={(e) => { e.stopPropagation(); if(!gestart) toggleJoker(m.id); }} disabled={gestart}
                style={{
                  background: v.joker ? '#FFD700' : '#FFFFFF', color: v.joker ? '#000' : '#111827', border: v.joker ? '2px solid #E6C200' : '2px solid #DEE2E6',
                  borderRadius: '20px', padding: '6px 12px', fontSize: '0.7rem', fontWeight: 900, cursor: gestart ? 'not-allowed' : 'pointer',
                  boxShadow: v.joker ? '0 4px 10px rgba(255, 215, 0, 0.4)' : '0 2px 5px rgba(0,0,0,0.05)', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                {v.joker ? '🌟 JOKER ACTIEF' : '⭐ GEBRUIK JOKER'}
              </button>
            </div>

            {/* Eventuele officiële uitslag */}
            {heeftUitslag && (
              <div style={{ textAlign: 'center', padding: '10px 0', background: 'rgba(240, 56, 255, 0.1)', borderBottom: '1px solid #F038FF' }}>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#F038FF' }}>{m.thuis_score} - {m.uit_score}</span>
              </div>
            )}

            {/* Pronostiek velden en landen */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: thuisInfo.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>{thuisInfo.emoji}</div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, textAlign: 'center', marginTop: '8px', color: '#111827' }}>{thuisInfo.name}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 10px' }}>
                <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#ADB5BD', marginBottom: '5px', letterSpacing: '1px' }}>JOUW PRONO</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="tel" value={v.thuis} disabled={gestart} onClick={e => e.stopPropagation()} onChange={e => handleScore(m.id, 'thuis', e.target.value)} 
                    style={{ width: '45px', height: '50px', fontSize: '1.5rem', textAlign: 'center', borderRadius: '12px', border: '2px solid #DEE2E6', outline: 'none', fontWeight: 900, fontFamily: 'Bebas Neue', background: gestart ? '#f1f3f5' : '#fff', color: gestart ? '#adb5bd' : '#111827' }} />
                  <span style={{ fontWeight: 900, color: '#ADB5BD' }}>-</span>
                  <input type="tel" value={v.uit} disabled={gestart} onClick={e => e.stopPropagation()} onChange={e => handleScore(m.id, 'uit', e.target.value)} 
                    style={{ width: '45px', height: '50px', fontSize: '1.5rem', textAlign: 'center', borderRadius: '12px', border: '2px solid #DEE2E6', outline: 'none', fontWeight: 900, fontFamily: 'Bebas Neue', background: gestart ? '#f1f3f5' : '#fff', color: gestart ? '#adb5bd' : '#111827' }} />
                </div>
                {!gestart && save !== 'idle' && (
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, marginTop: '5px', color: save === 'saving' ? '#F038FF' : '#2ECC40' }}>{save === 'saving' ? '⏳ Opslaan...' : '✅ Opgeslagen'}</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: uitInfo.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>{uitInfo.emoji}</div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, textAlign: 'center', marginTop: '8px', color: '#111827' }}>{uitInfo.name}</span>
              </div>
            </div>

            {/* Spionagefunctie voor de start */}
            {!gestart && (
              <div style={{ background: '#F8F9FA', padding: '10px', borderTop: '1px dashed #DEE2E6', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ADB5BD' }}>{pVoorMatch.length} / {alleSpelers.length} spelers vulden dit al in:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                  {pVoorMatch.map((av: any) => (
                    <span key={av.speler_id} style={{ fontSize: '0.6rem', padding: '3px 8px', background: '#70E4EF', borderRadius: '8px', fontWeight: 900, color: '#3772FF' }}>
                      {av.spelers?.naam.split(' ')[0]}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Spionagefunctie NA de start (uitklappen) */}
            {gestart && expandedMatchId !== m.id && (
              <div style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: '#EF709D', paddingBottom: '10px', textTransform: 'uppercase' }}>Klik om voorspellingen te zien 👁️</div>
            )}

            {gestart && expandedMatchId === m.id && (
              <div style={{ background: 'rgba(240, 244, 248, 0.9)', padding: '15px', borderTop: '2px solid #E9ECEF' }}>
                <div style={{ fontWeight: 900, color: '#3772FF', fontSize: '0.75rem', marginBottom: '10px', borderBottom: '2px solid #DEE2E6', paddingBottom: '5px' }}>IEDEREENS VOORSPELLING</div>
                {pVoorMatch.map((av: any) => (
                  <div key={av.id} style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.85rem', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <span>{av.spelers?.naam} {av.gouden_bal ? '🌟' : ''}</span>
                    <span style={{ color: '#F038FF', fontFamily: 'Bebas Neue', fontSize: '1.2rem' }}>{av.thuis_score} - {av.uit_score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}