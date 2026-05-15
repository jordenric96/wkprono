// src/components/MatchenTab.tsx
import React, { useState } from 'react';

export default function MatchenTab({
  gefilterdeMatchen, nu, matchVoorspellingen, matchSaveStatus,
  alleMatchVoorspellingen, alleSpelers, expandedMatchId, setExpandedMatchId,
  handleScore, filterRonde, setFilterRonde
}: any) {
  
  // State voor ons nieuwe pop-up venster
  const [geselecteerdTeam, setGeselecteerdTeam] = useState<string | null>(null);

  const rondes = ['Alle', 'Nog in te vullen', 'Groepsfase', 'Ronde van 32', 'Achtste finale', 'Kwartfinale', 'Halve finale', 'Troostfinale', 'Finale'];

  // Functie om land-emoji's te genereren (maakt het visueel mooier in de pop-up)
  const getFlag = (team: string) => {
    if (!team) return '🏳️';
    const flags: any = { 'België': '🇧🇪', 'Frankrijk': '🇫🇷', 'Nederland': '🇳🇱', 'Duitsland': '🇩🇪', 'Spanje': '🇪🇸', 'Engeland': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Brazilië': '🇧🇷', 'Argentinië': '🇦🇷', 'Italië': '🇮🇹', 'Portugal': '🇵🇹' };
    return flags[team] || '⚽';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* FILTER KNOPPEN */}
      <div className="hide-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '5px' }}>
        {rondes.map(r => (
          <button 
            key={r} onClick={() => setFilterRonde(r)}
            style={{
              padding: '8px 16px', borderRadius: '20px', border: 'none', whiteSpace: 'nowrap',
              fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', cursor: 'pointer', transition: '0.2s',
              background: filterRonde === r ? 'var(--crayola)' : 'rgba(255,255,255,0.7)',
              color: filterRonde === r ? '#FFF' : '#6C757D',
              boxShadow: filterRonde === r ? '0 4px 10px rgba(55, 114, 255, 0.3)' : 'none'
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* LIJST MET MATCHEN */}
      {gefilterdeMatchen.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#ADB5BD', fontWeight: 900 }}>Geen matchen gevonden in deze ronde.</div>
      ) : (
        gefilterdeMatchen.map((match: any) => {
          const isMatchGesloten = nu >= new Date(match.datum).getTime();
          const voorspelling = matchVoorspellingen[match.id] || { thuis: '', uit: '' };
          const saveStatus = matchSaveStatus[match.id] || 'idle';
          const isExpanded = expandedMatchId === match.id;
          
          // Formatteer Datum
          const matchDate = new Date(match.datum);
          const dateStr = matchDate.toLocaleDateString('nl-BE', { weekday: 'short', day: '2-digit', month: 'short' });
          const timeStr = matchDate.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={match.id} style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', border: '2px solid #E9ECEF', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
              
              {/* MATCH HEADER (Datum + Save Status) */}
              <div style={{ background: '#F8F9FA', padding: '8px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E9ECEF', fontSize: '0.7rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase' }}>
                <span>{dateStr} • {timeStr} • {match.ronde}</span>
                {saveStatus === 'saving' && <span style={{ color: 'var(--crayola)' }}>Opslaan... ⏳</span>}
                {saveStatus === 'saved' && <span style={{ color: '#40C057' }}>Opgeslagen ✅</span>}
                {isMatchGesloten && <span style={{ color: '#FA5252' }}>🔒 GESLOTEN</span>}
              </div>

              {/* MATCH BODY (Ploegen + Inputs) */}
              <div style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                
                {/* THUISPLOEG (Klikbaar) */}
                <div 
                  onClick={() => setGeselecteerdTeam(match.thuisploeg)}
                  style={{ flex: 1, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', cursor: 'pointer', padding: '5px', borderRadius: '10px', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F1F3F5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '30px', height: '30px', background: '#F8F9FA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '1px solid #E9ECEF', marginBottom: '4px' }}>
                    {getFlag(match.thuisploeg)}
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '0.9rem', color: '#111827' }}>{match.thuisploeg}</span>
                </div>

                {/* SCORES INVULLEN */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input 
                    type="tel" value={voorspelling.thuis} disabled={isMatchGesloten}
                    onChange={(e) => handleScore(match.id, 'thuis', e.target.value)}
                    style={{ width: '45px', height: '45px', textAlign: 'center', fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Bebas Neue', borderRadius: '12px', border: '2px solid #E9ECEF', background: isMatchGesloten ? '#F1F3F5' : '#FFF', color: '#111827', outline: 'none' }}
                  />
                  <span style={{ fontWeight: 900, color: '#ADB5BD' }}>-</span>
                  <input 
                    type="tel" value={voorspelling.uit} disabled={isMatchGesloten}
                    onChange={(e) => handleScore(match.id, 'uit', e.target.value)}
                    style={{ width: '45px', height: '45px', textAlign: 'center', fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Bebas Neue', borderRadius: '12px', border: '2px solid #E9ECEF', background: isMatchGesloten ? '#F1F3F5' : '#FFF', color: '#111827', outline: 'none' }}
                  />
                </div>

                {/* UITPLOEG (Klikbaar) */}
                <div 
                  onClick={() => setGeselecteerdTeam(match.uitploeg)}
                  style={{ flex: 1, textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', cursor: 'pointer', padding: '5px', borderRadius: '10px', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F1F3F5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '30px', height: '30px', background: '#F8F9FA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '1px solid #E9ECEF', marginBottom: '4px' }}>
                    {getFlag(match.uitploeg)}
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '0.9rem', color: '#111827' }}>{match.uitploeg}</span>
                </div>
              </div>

              {/* Uitslag & Spionage (Zodra match gestart is) */}
              {isMatchGesloten && (
                <div style={{ borderTop: '1px dashed #E9ECEF' }}>
                  
                  {/* Echte Uitslag indien bekend */}
                  {match.thuis_score !== null && (
                    <div style={{ background: '#FFFDF5', padding: '8px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 900, color: '#D4AF37' }}>
                      EINDSTAND: {match.thuis_score} - {match.uit_score}
                    </div>
                  )}

                  {/* Klik om voorspellingen te zien */}
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : match.id)}
                    style={{ padding: '10px', textAlign: 'center', background: isExpanded ? '#FDF0FF' : 'transparent', color: 'var(--magenta)', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer', transition: '0.2s' }}
                  >
                    {isExpanded ? '▲ SLUIT VOORSPELLINGEN' : '👁️ KLIK OM VOORSPELLINGEN TE ZIEN'}
                  </div>

                  {/* Uitgeklapte lijst van alle spelers */}
                  {isExpanded && (
                    <div style={{ padding: '15px', background: '#F8F9FA', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {alleSpelers.map((s: any) => {
                        const v = alleMatchVoorspellingen.find((x: any) => x.match_id === match.id && x.speler_id === s.id);
                        const heeftIngevuld = v && v.thuis_score !== null && v.uit_score !== null;
                        
                        // Check of punten verdiend (indien match gespeeld is)
                        let statusColor = '#495057';
                        let isExact = false;
                        if (match.thuis_score !== null && heeftIngevuld) {
                          const echt = match.thuis_score > match.uit_score ? 1 : match.thuis_score < match.uit_score ? 2 : 0;
                          const pred = v.thuis_score > v.uit_score ? 1 : v.thuis_score < v.uit_score ? 2 : 0;
                          if (v.thuis_score === match.thuis_score && v.uit_score === match.uit_score) { statusColor = '#40C057'; isExact = true; } // Groen
                          else if (echt === pred) statusColor = '#228BE6'; // Blauw
                          else statusColor = '#FA5252'; // Rood
                        }

                        return (
                          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#FFF', borderRadius: '8px', border: '1px solid #E9ECEF' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '1rem' }}>👤</span>
                              <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#111827' }}>{s.naam}</span>
                            </div>
                            <div style={{ fontWeight: 900, fontSize: '1.1rem', color: statusColor, display: 'flex', alignItems: 'center', gap: '5px' }}>
                              {heeftIngevuld ? `${v.thuis_score} - ${v.uit_score}` : <span style={{ fontSize: '0.7rem', color: '#ADB5BD' }}>Niets ingevuld</span>}
                              {isExact && <span style={{ fontSize: '0.8rem' }}>🎯</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* ========================================= */}
      {/* 📊 TEAM DOSSIER POP-UP (HET NIEUWE DEEL)  */}
      {/* ========================================= */}
      {geselecteerdTeam && (
        <div 
          onClick={() => setGeselecteerdTeam(null)} // Sluit bij klikken naast het venster
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', zIndex: 10000,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          {/* Het witte paneel */}
          <div 
            onClick={(e) => e.stopPropagation()} // Zorg dat klikken ín het venster hem niet sluit
            style={{
              background: '#FFF', width: '100%', maxWidth: '500px', maxHeight: '80vh',
              borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
              padding: '25px 20px', boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
              display: 'flex', flexDirection: 'column',
              animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflowY: 'auto'
            }}
          >
            {/* Header van de Pop-up */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '50px', height: '50px', background: '#F8F9FA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', border: '2px solid #E9ECEF' }}>
                  {getFlag(geselecteerdTeam)}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontFamily: 'Bebas Neue', fontSize: '2.2rem', color: 'var(--crayola)', lineHeight: 1 }}>{geselecteerdTeam}</h2>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', letterSpacing: '1px' }}>Team Dossier & Uitslagen</div>
                </div>
              </div>
              <button onClick={() => setGeselecteerdTeam(null)} style={{ background: '#F1F3F5', border: 'none', width: '35px', height: '35px', borderRadius: '50%', fontSize: '1rem', fontWeight: 900, color: '#495057', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Matchen lijst van dit specifieke team */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {gefilterdeMatchen
                .filter((m: any) => m.thuisploeg === geselecteerdTeam || m.uitploeg === geselecteerdTeam)
                .map((m: any) => {
                  const isGespeeld = m.thuis_score !== null;
                  const isThuis = m.thuisploeg === geselecteerdTeam;
                  const tegenstander = isThuis ? m.uitploeg : m.thuisploeg;
                  
                  // Bepaal kleur op basis van winst/verlies (indien gespeeld)
                  let uitslagKleur = '#111827';
                  let statusIcoon = '⏳';
                  if (isGespeeld) {
                    if ((isThuis && m.thuis_score > m.uit_score) || (!isThuis && m.uit_score > m.thuis_score)) { uitslagKleur = '#40C057'; statusIcoon = '🟢'; } // Winst
                    else if (m.thuis_score === m.uit_score) { uitslagKleur = '#228BE6'; statusIcoon = '➖'; } // Gelijk
                    else { uitslagKleur = '#FA5252'; statusIcoon = '🔴'; } // Verlies
                  }

                  return (
                    <div key={m.id} style={{ background: '#F8F9FA', padding: '12px 15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E9ECEF' }}>
                      
                      {/* Datum & Tegenstander */}
                      <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase', marginBottom: '2px' }}>
                          {new Date(m.datum).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short' })} • {m.ronde}
                        </div>
                        <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#6C757D' }}>vs</span> {tegenstander} {getFlag(tegenstander)}
                        </div>
                      </div>

                      {/* Uitslag */}
                      <div style={{ textAlign: 'right' }}>
                        {isGespeeld ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: uitslagKleur }}>
                              {isThuis ? `${m.thuis_score} - ${m.uit_score}` : `${m.uit_score} - ${m.thuis_score}`}
                            </span>
                            <span style={{ fontSize: '0.8rem' }}>{statusIcoon}</span>
                          </div>
                        ) : (
                          <div style={{ background: 'var(--crayola)', color: '#FFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>
                            Te spelen
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              
              {/* Fallback indien ze een filter aan hebben staan (bv. Groepsfase) */}
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.7rem', color: '#ADB5BD', fontWeight: 800 }}>
                (Tip: Zorg dat je filter bovenaan op "Alle" staat om de volledige historiek te zien).
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
