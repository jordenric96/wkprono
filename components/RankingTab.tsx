// src/components/RankingTab.tsx
import React, { useState, useEffect } from 'react';

// De felle WK Kleuren, inclusief de juiste tekstkleur voor perfecte leesbaarheid als jouw blok oplicht!
const cardThemes = [
  { hex: '#2B00FF', text: '#FFF', sub: 'rgba(255,255,255,0.7)' }, // Blauw
  { hex: '#7A00E6', text: '#FFF', sub: 'rgba(255,255,255,0.7)' }, // Paars
  { hex: '#E30022', text: '#FFF', sub: 'rgba(255,255,255,0.7)' }, // Rood
  { hex: '#CCFF00', text: '#000', sub: 'rgba(0,0,0,0.6)' },       // Lime Groen
  { hex: '#00E5FF', text: '#000', sub: 'rgba(0,0,0,0.6)' }        // Cyaan
];

// De harde TV-Broadcast rand: 6 kleuren in strakke blokken zónder gradient-overloop.
const tvBroadcastBorder = 'linear-gradient(135deg, #2B00FF 0%, #2B00FF 16.6%, #7A00E6 16.6%, #7A00E6 33.3%, #E30022 33.3%, #E30022 50%, #FF6B00 50%, #FF6B00 66.6%, #CCFF00 66.6%, #CCFF00 83.3%, #00E5FF 83.3%, #00E5FF 100%)';

export default function RankingTab({ klassement = [], actieveSpeler, toggleBetaald, isJorden }: any) {
  const [modus, setModus] = useState('tussenstand'); 
  const [expandedBonusId, setExpandedBonusId] = useState<number | null>(null);

  // --- AUTO-SCROLL NAAR JEZELF ---
  useEffect(() => {
    if (actieveSpeler?.id) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`speler-${actieveSpeler.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [actieveSpeler?.id, modus]);

  // Sorteer de spelers op basis van de gekozen modus
  const gesorteerd = [...klassement].sort((a: any, b: any) => {
    if (modus === 'tussenstand') {
      if (b.prono_score !== a.prono_score) return b.prono_score - a.prono_score;
      if (b.exact !== a.exact) return b.exact - a.exact;
      if (b.winnaarCorrect !== a.winnaarCorrect) return b.winnaarCorrect - a.winnaarCorrect;
    } else {
      if (b.totaal_score !== a.totaal_score) return b.totaal_score - a.totaal_score;
      if (b.exact !== a.exact) return b.exact - a.exact;
      if (b.winnaarCorrect !== a.winnaarCorrect) return b.winnaarCorrect - a.winnaarCorrect;
    }
    return (a.naam || '').localeCompare(b.naam || '');
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      {/* MENU KNOPPEN */}
      <div style={{ display: 'flex', background: '#000', borderRadius: '16px', padding: '6px', border: '2px solid #333', marginBottom: '4px' }}>
        <button
          onClick={() => { setModus('tussenstand'); setExpandedBonusId(null); }}
          style={{
            flex: 1, padding: '10px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer',
            background: modus === 'tussenstand' ? '#FFF' : 'transparent',
            color: modus === 'tussenstand' ? '#000' : '#FFF',
            transition: 'all 0.3s'
          }}
        >
          TUSSENSTAND
        </button>
        <button
          onClick={() => { setModus('eindstand'); }}
          style={{
            flex: 1, padding: '10px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer',
            background: modus === 'eindstand' ? '#FFF' : 'transparent',
            color: modus === 'eindstand' ? '#000' : '#FFF',
            transition: 'all 0.3s'
          }}
        >
          EINDSTAND
        </button>
      </div>

      {/* DUIDELIJKE UITLEG BANNERS */}
      {modus === 'tussenstand' ? (
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#ADB5BD', margin: 0, fontWeight: 800 }}>
            ℹ️ <strong style={{color: '#FFF'}}>ZUIVERE TUSSENSTAND</strong>: Puur de matchen, zónder bonusvragen.
          </p>
        </div>
      ) : (
        <div style={{ background: 'rgba(204, 255, 0, 0.1)', padding: '10px', borderRadius: '12px', border: '1px solid #CCFF00', textAlign: 'center', boxShadow: '0 4px 10px rgba(204, 255, 0, 0.1)' }}>
          <p style={{ fontSize: '0.75rem', color: '#FFF', margin: 0, fontWeight: 800 }}>
            ⚠️ <strong style={{color: '#CCFF00'}}>TELT VOOR DE PRIJZEN</strong>: Inclusief bonus. Tik op een speler voor details.
          </p>
        </div>
      )}

      {/* HET GROTE "TV BROADCAST" KADER */}
      <div style={{
        background: tvBroadcastBorder,
        padding: '6px', // De dikte van de buitenste gekleurde tv-rand
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
        marginTop: '5px'
      }}>
        {/* De zwarte opvulling van het grote kader */}
        <div style={{ background: '#000', borderRadius: '14px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* KLASSEMENT LIJST */}
          {gesorteerd.map((speler: any, index: number) => {
            const isMij = speler.id === actieveSpeler?.id;
            const isExpanded = expandedBonusId === speler.id;
            const theme = cardThemes[index % cardThemes.length];
            
            // Textkleur: Als het jouw blok is, gebruiken we de felle contrastkleur. Anders wit.
            const textColor = isMij ? theme.text : '#FFF';
            const subTextColor = isMij ? theme.sub : '#ADB5BD';
            
            let rankIcon = <span style={{ opacity: isMij ? 0.9 : 0.6, color: textColor }}>{index + 1}</span>;
            if (index === 0) rankIcon = <span>🥇</span>;
            if (index === 1) rankIcon = <span>🥈</span>;
            if (index === 2) rankIcon = <span>🥉</span>;

            return (
              <div 
                id={`speler-${speler.id}`}
                key={speler.id} 
                onClick={() => { if (modus === 'eindstand') setExpandedBonusId(isExpanded ? null : speler.id); }}
                style={{ 
                  // ELKE SPELER HEEFT EEN HARDE KADER
                  background: isMij ? theme.hex : '#000', 
                  border: isMij ? `4px solid #FFF` : `4px solid ${theme.hex}`, // Dikke witte kader voor jou, gekleurde kader voor de rest
                  borderRadius: '12px', 
                  padding: '12px 14px', 
                  cursor: modus === 'eindstand' ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  transform: isMij ? 'scale(1.02)' : 'scale(1)', // Jouw blokje komt iets naar voren
                  boxShadow: isMij ? `0 6px 20px ${theme.hex}80` : 'none',
                  position: 'relative',
                  zIndex: isMij ? 10 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '1.4rem', width: '30px', textAlign: 'center', fontWeight: 900 }}>{rankIcon}</div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900, fontSize: '1.15rem', color: textColor, letterSpacing: '0.5px' }}>
                      {speler.naam}
                    </div>
                    <div style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: 800, color: subTextColor }}>
                      🎯 {speler.exact} &nbsp; 🟢 {speler.winnaarCorrect} &nbsp; ❌ {speler.fout}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    
                    {/* ADMIN KNOP */}
                    {isJorden && toggleBetaald && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleBetaald(speler.id, speler.betaald); }}
                        style={{
                          background: speler.betaald ? 'rgba(255,255,255,0.1)' : '#E30022',
                          border: 'none', color: '#FFF',
                          padding: '4px 8px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer',
                          boxShadow: speler.betaald ? 'none' : '0 2px 5px rgba(0,0,0,0.3)'
                        }}
                      >
                        {speler.betaald ? '✅ OK' : '💰 BETALEN'}
                      </button>
                    )}

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontFamily: 'Bebas Neue', 
                        fontSize: '2.5rem', 
                        lineHeight: 0.9, 
                        // Zorgt ervoor dat de score opvalt en matcht met de kaart
                        color: isMij ? textColor : theme.hex
                      }}>
                        {modus === 'tussenstand' ? speler.prono_score : speler.totaal_score}
                      </div>
                      <div style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', color: subTextColor, marginTop: '2px' }}>
                        Punten
                      </div>
                    </div>
                  </div>
                </div>

                {/* UITKLAPBAAR BONUS BLOK (Alleen in de Eindstand tab) */}
                {modus === 'eindstand' && isExpanded && (
                  <div style={{ 
                    marginTop: '12px', paddingTop: '12px', 
                    borderTop: `1px solid ${isMij ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`, 
                    fontSize: '0.75rem', fontWeight: 800, color: textColor
                  }}>
                    {speler.bonus_breakdown && speler.bonus_breakdown.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {speler.bonus_breakdown.map((b: any, i: number) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9, background: isMij ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px' }}>
                            <span>• {b.label}</span>
                            <span style={{ fontWeight: 900 }}>+{b.pt} pt</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ opacity: 0.6, fontStyle: 'italic', textAlign: 'center' }}>Nog geen extra punten gescoord...</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
