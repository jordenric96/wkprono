// src/components/ChatTab.tsx
import React, { useState, useEffect, useMemo } from 'react';

export default function ChatTab({ 
  chatBerichten = [], actieveSpeler, chatEindeRef, nieuwBericht, setNieuwBericht, verstuurChat,
  matchen = [], alleMatchVoorspellingen = [], klassement = []
}: any) {
  const [modus, setModus] = useState('chat'); // 'chat' of 'stats'

  // Scroll automatisch naar beneden als er een nieuw bericht is in de chat-modus
  useEffect(() => {
    if (modus === 'chat' && chatEindeRef?.current) {
      chatEindeRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatBerichten, modus, chatEindeRef]);

  // --- 🎭 WATERDICHTE BEREKENING VAN DE AWARDS & STATS ---
  const stats = useMemo(() => {
    // Alleen filteren op matchen die écht gespeeld zijn
    const afgewerkteMatchen = matchen.filter((m: any) => m.thuis_score !== null && m.uit_score !== null);
    if (afgewerkteMatchen.length === 0 || !klassement.length) return null; 

    const spelerStats: Record<number, any> = {};
    klassement.forEach((s: any) => {
      spelerStats[s.id] = {
        naam: s.naam.split(' ')[0], // Alleen voornaam
        streak: 0, maxStreak: 0,
        cold: 0, maxCold: 0,
        belgiePt: 0,
        kuddeGedrag: 0
      };
    });

    const matchPunten: Record<number, number> = {};

    afgewerkteMatchen.sort((a: any, b: any) => new Date(a.datum).getTime() - new Date(b.datum).getTime()).forEach((m: any) => {
      matchPunten[m.id] = 0;
      const isBelgie = m.thuisploeg.toLowerCase() === 'belgië' || m.uitploeg.toLowerCase() === 'belgië';
      
      // Zoek wat de meest ingevulde (populairste) score was voor deze match
      const scoreTelling: Record<string, number> = {};
      const voorspellingenVoorMatch = alleMatchVoorspellingen.filter((v: any) => v.match_id === m.id);
      
      voorspellingenVoorMatch.forEach((v: any) => {
        if (v.thuis_score !== null) {
          const str = `${v.thuis_score}-${v.uit_score}`;
          scoreTelling[str] = (scoreTelling[str] || 0) + 1;
        }
      });
      
      let popScore = '';
      let maxCount = 0;
      Object.entries(scoreTelling).forEach(([scoreStr, count]) => {
        if (count > maxCount) { maxCount = count; popScore = scoreStr; }
      });

      // Analyseer elke speler voor deze match
      voorspellingenVoorMatch.forEach((v: any) => {
        if (!spelerStats[v.speler_id]) return;
        const echt = m.thuis_score > m.uit_score ? 1 : m.thuis_score < m.uit_score ? 2 : 0;
        const pred = v.thuis_score > v.uit_score ? 1 : v.thuis_score < v.uit_score ? 2 : 0;
        
        let pt = 0;
        if (v.thuis_score === m.thuis_score && v.uit_score === m.uit_score) pt = 3;
        else if (echt === pred) pt = 1;

        matchPunten[m.id] += pt; // Totaal aantal punten dat de groep pakte op deze match

        // Bereken Streaks
        if (pt > 0) {
          spelerStats[v.speler_id].streak += 1;
          spelerStats[v.speler_id].cold = 0;
          if (spelerStats[v.speler_id].streak > spelerStats[v.speler_id].maxStreak) {
            spelerStats[v.speler_id].maxStreak = spelerStats[v.speler_id].streak;
          }
        } else {
          spelerStats[v.speler_id].cold += 1;
          spelerStats[v.speler_id].streak = 0;
          if (spelerStats[v.speler_id].cold > spelerStats[v.speler_id].maxCold) {
            spelerStats[v.speler_id].maxCold = spelerStats[v.speler_id].cold;
          }
        }

        // Punten op België
        if (isBelgie) spelerStats[v.speler_id].belgiePt += pt;

        // Kuddegedrag / Grijze muis check
        if (`${v.thuis_score}-${v.uit_score}` === popScore) {
          spelerStats[v.speler_id].kuddeGedrag += 1;
        }
      });
    });

    const spelersArr = Object.values(spelerStats);

    // Bepaal winnaars
    const winStreak = [...spelersArr].sort((a, b) => b.maxStreak - a.maxStreak)[0];
    const winCold = [...spelersArr].sort((a, b) => b.maxCold - a.maxCold)[0];
    const winBelgie = [...spelersArr].sort((a, b) => b.belgiePt - a.belgiePt)[0];
    const winMuis = [...spelersArr].sort((a, b) => b.kuddeGedrag - a.kuddeGedrag)[0];

    // De Pechvogel: Wie heeft de meeste 1-punters, maar staat laag qua 3-punters?
    const pechvogel = [...klassement].sort((a: any, b: any) => {
      if (b.winnaarCorrect !== a.winnaarCorrect) return b.winnaarCorrect - a.winnaarCorrect; // Meeste 1-punters bovenaan
      return a.exact - b.exact; // Als dat gelijk is, degene met de MINSTE 3-punters bovenaan
    })[0];

    // Match Extremen (Beste en slechtste match van de groep)
    const matchScoresArr = Object.entries(matchPunten).map(([id, pt]) => ({ id: Number(id), pt }));
    matchScoresArr.sort((a, b) => b.pt - a.pt);
    
    const bestMatchId = matchScoresArr[0]?.id;
    const worstMatchId = matchScoresArr[matchScoresArr.length - 1]?.id;

    const bestMatch = afgewerkteMatchen.find((m: any) => m.id === bestMatchId);
    const worstMatch = afgewerkteMatchen.find((m: any) => m.id === worstMatchId);

    return {
      winStreak, winCold,
      pechvogel: pechvogel ? { naam: pechvogel.naam.split(' ')[0], eenpt: pechvogel.winnaarCorrect, driept: pechvogel.exact } : null,
      winBelgie, winMuis,
      bestMatch: bestMatch ? { naam: `${bestMatch.thuisploeg} - ${bestMatch.uitploeg}`, pt: matchScoresArr[0].pt } : null,
      worstMatch: worstMatch ? { naam: `${worstMatch.thuisploeg} - ${worstMatch.uitploeg}`, pt: matchScoresArr[matchScoresArr.length - 1].pt } : null
    };
  }, [matchen, alleMatchVoorspellingen, klassement]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 190px)', gap: '10px' }}>
      
      {/* HIGH CONTRAST MENU KNOPPEN */}
      <div style={{ display: 'flex', background: '#090514', borderRadius: '16px', padding: '6px', border: '2px solid #00E5FF', boxShadow: '0 10px 20px rgba(0,0,0,0.5)', flexShrink: 0 }}>
        <button
          onClick={() => setModus('chat')}
          style={{
            flex: 1, padding: '10px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer',
            background: modus === 'chat' ? '#CCFF00' : 'transparent',
            color: modus === 'chat' ? '#111827' : '#ADB5BD',
            transition: 'all 0.3s'
          }}
        >
          💬 DE CHAT
        </button>
        <button
          onClick={() => setModus('stats')}
          style={{
            flex: 1, padding: '10px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer',
            background: modus === 'stats' ? '#CCFF00' : 'transparent',
            color: modus === 'stats' ? '#111827' : '#ADB5BD',
            transition: 'all 0.3s'
          }}
        >
          🎭 AWARDS & STATS
        </button>
      </div>

      {/* --- DE CHAT WEERGAVE --- */}
      {modus === 'chat' && (
        <>
          <div style={{ 
            flex: 1, overflowY: 'auto', background: '#1A1423', borderRadius: '20px', 
            padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px',
            border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.3)'
          }}>
            {chatBerichten.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: '#6C757D', fontWeight: 900, fontSize: '0.9rem' }}>
                De kleedkamer is nog leeg...
              </div>
            ) : (
              chatBerichten.map((msg: any) => {
                const isMij = msg.speler_id === actieveSpeler?.id;
                const afzender = msg.spelers?.naam ? msg.spelers.naam.split(' ')[0] : 'Onbekend';
                const datum = new Date(msg.created_at).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMij ? 'flex-end' : 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', maxWidth: '85%', flexDirection: isMij ? 'row-reverse' : 'row' }}>
                      <div style={{ 
                        background: isMij ? '#CCFF00' : 'rgba(255,255,255,0.1)', 
                        color: isMij ? '#111827' : '#FFF',
                        padding: '10px 15px', 
                        borderRadius: isMij ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        fontSize: '0.9rem', fontWeight: 800,
                        boxShadow: isMij ? '0 4px 15px rgba(204, 255, 0, 0.2)' : '0 4px 10px rgba(0,0,0,0.2)',
                        border: isMij ? 'none' : '1px solid rgba(255,255,255,0.05)'
                      }}>
                        {msg.bericht}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#6C757D', fontWeight: 900, marginTop: '4px', padding: '0 5px' }}>
                      {afzender} • {datum}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEindeRef} />
          </div>

          <form onSubmit={verstuurChat} style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <input 
              value={nieuwBericht} 
              onChange={(e) => setNieuwBericht(e.target.value)}
              placeholder="Zeg iets in de kleedkamer..."
              style={{ 
                flex: 1, padding: '14px', borderRadius: '16px', border: 'none', background: '#1A1423', 
                color: '#FFF', fontSize: '0.9rem', fontWeight: 800, outline: 'none',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}
            />
            <button 
              type="submit" 
              style={{ 
                background: '#00E5FF', border: 'none', color: '#111827', width: '50px', 
                borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '1.2rem', boxShadow: '0 4px 15px rgba(0, 229, 255, 0.4)'
              }}
            >
              🚀
            </button>
          </form>
        </>
      )}

      {/* --- 🎭 DE AWARDS & STATS WEERGAVE --- */}
      {modus === 'stats' && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '20px' }}>
          
          {!stats ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#1A1423', borderRadius: '24px', border: '2px dashed #6C757D' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⏳</div>
              <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: '#FFF', margin: '0 0 5px 0' }}>NOG GEEN DATA</h3>
              <p style={{ color: '#ADB5BD', fontSize: '0.85rem', fontWeight: 800 }}>De awards en statistieken worden berekend zodra de eerste wedstrijd is afgelopen!</p>
            </div>
          ) : (
            <>
              {/* STREAKS */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1, background: '#1A1423', borderRadius: '16px', padding: '15px 10px', textAlign: 'center', border: '2px solid #FF6B00', boxShadow: '0 4px 15px rgba(255, 107, 0, 0.2)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>🔥</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--wk-orange)', textTransform: 'uppercase' }}>Langste Streak</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FFF', margin: '5px 0' }}>{stats.winStreak?.naam || '-'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#ADB5BD', fontWeight: 800 }}>{stats.winStreak?.maxStreak || 0} matchen op rij gescoord</div>
                </div>

                <div style={{ flex: 1, background: '#1A1423', borderRadius: '16px', padding: '15px 10px', textAlign: 'center', border: '2px solid #00E5FF', boxShadow: '0 4px 15px rgba(0, 229, 255, 0.2)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>🥶</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#00E5FF', textTransform: 'uppercase' }}>Koude Douche</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FFF', margin: '5px 0' }}>{stats.winCold?.naam || '-'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#ADB5BD', fontWeight: 800 }}>{stats.winCold?.maxCold || 0} matchen op rij géén punten</div>
                </div>
              </div>

              {/* AWARDS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                <div style={{ background: '#1A1423', borderRadius: '16px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '4px solid #E30022' }}>
                  <div style={{ fontSize: '2rem' }}>🤡</div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#E30022', textTransform: 'uppercase' }}>De Pechvogel</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FFF' }}>{stats.pechvogel?.naam || '-'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#ADB5BD', fontWeight: 700 }}>Scoorde {stats.pechvogel?.eenpt}x nét niet exact (en had maar {stats.pechvogel?.driept}x de volle pot).</div>
                  </div>
                </div>

                <div style={{ background: '#1A1423', borderRadius: '16px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '4px solid #7A00E6' }}>
                  <div style={{ fontSize: '2rem' }}>🐭</div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#7A00E6', textTransform: 'uppercase' }}>De Grijze Muis</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FFF' }}>{stats.winMuis?.naam || '-'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#ADB5BD', fontWeight: 700 }}>Liep {stats.winMuis?.kuddeGedrag}x braaf mee met de meest ingevulde score. Speelt op safe!</div>
                  </div>
                </div>

                <div style={{ background: '#1A1423', borderRadius: '16px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '4px solid #CCFF00' }}>
                  <div style={{ fontSize: '2rem' }}>🇧🇪</div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#CCFF00', textTransform: 'uppercase' }}>Rode Duivel Expert</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FFF' }}>{stats.winBelgie?.naam || '-'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#ADB5BD', fontWeight: 700 }}>Verdiende al {stats.winBelgie?.belgiePt} punten puur op de matchen van België.</div>
                  </div>
                </div>

              </div>

              {/* MATCH STATS */}
              <div style={{ background: '#090514', borderRadius: '16px', padding: '15px', border: '2px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: '#FFF', margin: '0 0 10px 0', textAlign: 'center', letterSpacing: '1px' }}>🤯 Groepsdynamiek</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(204, 255, 0, 0.05)', padding: '10px', borderRadius: '10px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#CCFF00', textTransform: 'uppercase' }}>De "Weggever" Match</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#FFF' }}>{stats.bestMatch?.naam || '-'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: '#CCFF00', lineHeight: 1 }}>{stats.bestMatch?.pt || 0}</div>
                    <div style={{ fontSize: '0.55rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase' }}>PUNTEN (GROEP)</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(227, 0, 34, 0.05)', padding: '10px', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#E30022', textTransform: 'uppercase' }}>De Grootste Shock</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#FFF' }}>{stats.worstMatch?.naam || '-'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: '#E30022', lineHeight: 1 }}>{stats.worstMatch?.pt || 0}</div>
                    <div style={{ fontSize: '0.55rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase' }}>PUNTEN (GROEP)</div>
                  </div>
                </div>
              </div>

            </>
          )}
        </div>
      )}

    </div>
  );
}
