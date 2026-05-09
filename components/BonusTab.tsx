// src/components/BonusTab.tsx
import { useEffect, useRef } from 'react';

// --- HULPFUNCTIE: VLAGGEN & KLEUREN GENERATOR ---
const parseTeam = (teamString: string) => {
  if (!teamString) return { name: '', emoji: '🏳️', gradient: 'linear-gradient(135deg, #DEE2E6, #ADB5BD)' };

  const emojiMatch = teamString.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu);
  let emoji = emojiMatch ? emojiMatch.join('') : '';
  let name = teamString.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();

  // Uitgebreide kleurenlijst voor de randen
  const colors: any = {
    'België': 'linear-gradient(135deg, #000 33%, #FFD700 33%, #FFD700 66%, #ED2939 66%)',
    'Nederland': 'linear-gradient(135deg, #AE1C28 33%, #FFF 33%, #FFF 66%, #21468B 66%)',
    'Frankrijk': 'linear-gradient(135deg, #002395 33%, #FFF 33%, #FFF 66%, #ED2939 66%)',
    'Duitsland': 'linear-gradient(135deg, #000 33%, #FF0000 33%, #FF0000 66%, #FFCC00 66%)',
    'Spanje': 'linear-gradient(135deg, #AA151B 33%, #F1BF00 33%, #F1BF00 66%, #AA151B 66%)',
    'Brazilië': 'linear-gradient(135deg, #009c3b 33%, #ffdf00 33%, #ffdf00 66%, #002776 66%)',
    'Argentinië': 'linear-gradient(135deg, #75AADB 33%, #FFF 33%, #FFF 66%, #75AADB 66%)',
    'Portugal': 'linear-gradient(135deg, #006600 50%, #FF0000 50%)',
    'Engeland': 'linear-gradient(135deg, #FFF 40%, #CE1124 40%, #CE1124 60%, #FFF 60%)',
    'Italië': 'linear-gradient(135deg, #009246 33%, #FFF 33%, #FFF 66%, #CE2B37 66%)',
    'Mexico': 'linear-gradient(135deg, #006847 33%, #FFF 33%, #FFF 66%, #CE1126 66%)',
    'USA': 'linear-gradient(135deg, #B31942 33%, #FFF 33%, #FFF 66%, #0A3161 66%)',
    'Verenigde Staten': 'linear-gradient(135deg, #B31942 33%, #FFF 33%, #FFF 66%, #0A3161 66%)',
    'Canada': 'linear-gradient(135deg, #FF0000 30%, #FFF 30%, #FFF 70%, #FF0000 70%)',
    'Marokko': 'linear-gradient(135deg, #c1272d 45%, #006233 45%, #006233 55%, #c1272d 55%)',
    
    // Nieuw toegevoegd uit screenshot:
    'Chili': 'linear-gradient(135deg, #0039A6 33%, #FFF 33%, #FFF 66%, #D52B1E 66%)',
    'Kameroen': 'linear-gradient(135deg, #007A5E 33%, #CE1126 33%, #CE1126 66%, #FCD116 66%)',
    'Colombia': 'linear-gradient(135deg, #FCD116 50%, #003893 50%, #003893 75%, #CE1126 75%)',
    'Costa Rica': 'linear-gradient(135deg, #002B7F 20%, #FFF 20%, #FFF 40%, #CE1126 40%, #CE1126 60%, #FFF 60%, #FFF 80%, #002B7F 80%)',
    'Zwitserland': 'linear-gradient(135deg, #FF0000 40%, #FFF 40%, #FFF 60%, #FF0000 60%)',
    'Ivoorkust': 'linear-gradient(135deg, #FF8200 33%, #FFF 33%, #FFF 66%, #009A44 66%)',
    'Oostenrijk': 'linear-gradient(135deg, #ED2939 33%, #FFF 33%, #FFF 66%, #ED2939 66%)',
    'Australië': 'linear-gradient(135deg, #012169 40%, #FFF 40%, #FFF 50%, #E4002B 50%)'
  };

  const defaultEmojis: any = {
    'België': '🇧🇪', 'Nederland': '🇳🇱', 'Frankrijk': '🇫🇷', 'Duitsland': '🇩🇪', 'Spanje': '🇪🇸',
    'Brazilië': '🇧🇷', 'Argentinië': '🇦🇷', 'Portugal': '🇵🇹', 'Italië': '🇮🇹', 'Engeland': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Mexico': '🇲🇽', 'USA': '🇺🇸', 'Verenigde Staten': '🇺🇸', 'Canada': '🇨🇦', 'Marokko': '🇲🇦',
    'Chili': '🇨🇱', 'Kameroen': '🇨🇲', 'Colombia': '🇨🇴', 'Costa Rica': '🇨🇷', 'Zwitserland': '🇨🇭',
    'Ivoorkust': '🇨🇮', 'Oostenrijk': '🇦🇹', 'Australië': '🇦🇺'
  };

  if (!emoji && defaultEmojis[name]) emoji = defaultEmojis[name];
  if (!emoji) emoji = '🏳️';

  // Als het land niet in de lijst staat, wordt de rand nu zachtgrijs in plaats van blauw
  const gradient = colors[name] || 'linear-gradient(135deg, #DEE2E6, #ADB5BD)';
  return { name, emoji, gradient };
};

// --- COMPONENT: LANDEN CAROUSEL ---
const CountryCarousel = ({ value, onChange, options, disabled }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && value) {
      const selectedEl = scrollRef.current.querySelector(`[data-country="${value}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [value]);

  return (
    <div style={{ position: 'relative', margin: '0 -15px' }}>
      <div 
        ref={scrollRef}
        className="hide-scrollbar"
        style={{
          display: 'flex', overflowX: 'auto', gap: '12px', padding: '15px',
          scrollSnapType: 'x mandatory', pointerEvents: disabled ? 'none' : 'auto',
          opacity: disabled ? 0.6 : 1, WebkitOverflowScrolling: 'touch'
        }}
      >
        {options.map((land: string) => {
          const isSelected = value === land;
          const noSelection = !value;
          const teamInfo = parseTeam(land);

          return (
            <div 
              key={land} data-country={land} onClick={() => !disabled && onChange(land)}
              style={{
                flexShrink: 0, scrollSnapAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isSelected ? 1 : (noSelection ? 0.9 : 0.4), 
                transform: isSelected ? 'scale(1.15)' : 'scale(0.95)', 
                cursor: 'pointer', width: '65px'
              }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', background: teamInfo.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isSelected ? '0 8px 20px rgba(0,0,0,0.2)' : 'none',
                border: isSelected ? '2px solid white' : '2px solid transparent'
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%', background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem'
                }}>{teamInfo.emoji}</div>
              </div>
              <span style={{ 
                fontSize: '0.65rem', fontWeight: 900, marginTop: '8px', 
                color: isSelected ? 'var(--magenta)' : '#6C757D', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.1
              }}>{teamInfo.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- NIEUW COMPONENT: RONDEN CAROUSEL (Eindstation België) ---
const RoundCarousel = ({ value, onChange, disabled }: any) => {
  const rondes = [
    { id: 'Groepsfase', label: 'GF' },
    { id: 'Ronde van 32', label: '1/16' },
    { id: 'Achtste finale', label: '1/8' },
    { id: 'Kwartfinale', label: '1/4' },
    { id: 'Halve finale', label: '1/2' },
    { id: 'Troostfinale', label: '3e' },
    { id: 'Finale', label: 'FIN' },
    { id: 'Wereldkampioen', label: '🏆' }
  ];

  return (
    <div style={{ position: 'relative', margin: '0 -15px' }}>
      <div 
        className="hide-scrollbar"
        style={{
          display: 'flex', overflowX: 'auto', gap: '12px', padding: '15px',
          pointerEvents: disabled ? 'none' : 'auto', opacity: disabled ? 0.6 : 1, WebkitOverflowScrolling: 'touch'
        }}
      >
        {rondes.map(r => {
          const isSelected = value === r.id;
          const noSelection = !value;
          // De Belgische gradient voor als de ronde actief is!
          const belgiumGradient = 'linear-gradient(135deg, #000 33%, #FFD700 33%, #FFD700 66%, #ED2939 66%)';

          return (
            <div 
              key={r.id} onClick={() => !disabled && onChange(r.id)}
              style={{
                flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: '65px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isSelected ? 1 : (noSelection ? 0.9 : 0.4),
                transform: isSelected ? 'scale(1.15)' : 'scale(0.95)',
              }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: isSelected ? belgiumGradient : '#DEE2E6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isSelected ? '0 8px 20px rgba(0,0,0,0.2)' : 'none',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%', background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '1.1rem', color: '#111827'
                }}>
                  {r.label}
                </div>
              </div>
              <span style={{ 
                fontSize: '0.55rem', fontWeight: 900, marginTop: '8px', 
                color: isSelected ? '#ED2939' : '#6C757D', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.1
              }}>{r.id}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function BonusTab({
  winnaar, setWinnaar, hf, setHf, meesteGoalsLand, setMeesteGoalsLand,
  besteVerdedigingLand, setBesteVerdedigingLand, eindstation, setEindstation,
  totaalGeel, setTotaalGeel, totaalRood, setTotaalRood,
  isGesloten, slaBonusOp, opslaanStatus, WK_LANDEN
}: any) {
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflowX: 'hidden' }}>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .bonus-card { background: rgba(255, 255, 255, 0.95); border-radius: 16px; padding: 15px; border: 2px solid #E9ECEF; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden; }
        .bonus-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; margin: 0 0 5px 0; letter-spacing: 1px; line-height: 1; }
      `}</style>

      {/* WERELDKAMPIOEN */}
      <div className="bonus-card">
        <h3 className="bonus-title" style={{color: 'var(--crayola)'}}>🏆 Wereldkampioen</h3>
        <CountryCarousel options={WK_LANDEN} value={winnaar} onChange={setWinnaar} disabled={isGesloten} />
      </div>

      {/* HALVE FINALISTEN */}
      <div className="bonus-card">
        <h3 className="bonus-title" style={{color: 'var(--magenta)'}}>⚔️ De 4 Halve Finalisten</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '10px' }}>
          <CountryCarousel options={WK_LANDEN} value={hf[0]} onChange={(v: string) => { const n = [...hf]; n[0] = v; setHf(n); }} disabled={isGesloten} />
          <div style={{ height: '1px', background: '#E9ECEF', margin: '5px 0' }} />
          <CountryCarousel options={WK_LANDEN} value={hf[1]} onChange={(v: string) => { const n = [...hf]; n[1] = v; setHf(n); }} disabled={isGesloten} />
          <div style={{ height: '1px', background: '#E9ECEF', margin: '5px 0' }} />
          <CountryCarousel options={WK_LANDEN} value={hf[2]} onChange={(v: string) => { const n = [...hf]; n[2] = v; setHf(n); }} disabled={isGesloten} />
          <div style={{ height: '1px', background: '#E9ECEF', margin: '5px 0' }} />
          <CountryCarousel options={WK_LANDEN} value={hf[3]} onChange={(v: string) => { const n = [...hf]; n[3] = v; setHf(n); }} disabled={isGesloten} />
        </div>
      </div>

      {/* MEESTE GOALS & VERDEDIGING */}
      <div className="bonus-card">
        <h3 className="bonus-title" style={{color: '#40C057'}}>⚽ Meeste Goals</h3>
        <p style={{fontSize:'0.7rem', color:'#6C757D', margin:'0 0 10px 0', fontWeight:800}}>Welk land scoort het meest in het hele toernooi?</p>
        <CountryCarousel options={WK_LANDEN} value={meesteGoalsLand} onChange={setMeesteGoalsLand} disabled={isGesloten} />
      </div>
      
      <div className="bonus-card">
        <h3 className="bonus-title" style={{color: '#228BE6'}}>🛡️ Beste Verdediging</h3>
        <p style={{fontSize:'0.7rem', color:'#6C757D', margin:'0 0 10px 0', fontWeight:800}}>Welk land krijgt de minste tegengoals?</p>
        <CountryCarousel options={WK_LANDEN} value={besteVerdedigingLand} onChange={setBesteVerdedigingLand} disabled={isGesloten} />
      </div>

      {/* EINDSTATION BELGIË (GEÜPDATE NAAR CAROUSEL) */}
      <div className="bonus-card">
        <h3 className="bonus-title" style={{color: '#111827'}}>📍 Eindstation België</h3>
        <p style={{fontSize:'0.7rem', color:'#6C757D', margin:'0 0 5px 0', fontWeight:800}}>In welke ronde strandt België?</p>
        <RoundCarousel value={eindstation} onChange={setEindstation} disabled={isGesloten} />
      </div>
      
      {/* KAARTEN (GEÜPDATE NAAR SCREENSHOT LAYOUT) */}
      <div style={{ display: 'flex', gap: '15px' }}>
        
        {/* GEEL */}
        <div style={{ flex: 1, background: '#F4D03F', borderRadius: '16px', padding: '15px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', color: '#000', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '16px', background: '#FFD700', borderRadius: '2px', border: '1px solid rgba(0,0,0,0.2)' }} />
            TOTAAL GEEL
          </div>
          <input 
            type="tel" value={totaalGeel} onChange={(e: any) => setTotaalGeel(e.target.value)} disabled={isGesloten}
            style={{ 
              width: '100%', boxSizing: 'border-box', padding: '15px', borderRadius: '8px', border: 'none', 
              fontSize: '2rem', fontFamily: 'Bebas Neue', textAlign: 'center', background: '#FFFDF5', 
              outline: 'none', color: '#111827' 
            }}
          />
        </div>

        {/* ROOD */}
        <div style={{ flex: 1, background: '#FA5252', borderRadius: '16px', padding: '15px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', color: '#FFF', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '16px', background: '#C92A2A', borderRadius: '2px', border: '1px solid rgba(0,0,0,0.2)' }} />
            TOTAAL ROOD
          </div>
          <input 
            type="tel" value={totaalRood} onChange={(e: any) => setTotaalRood(e.target.value)} disabled={isGesloten}
            style={{ 
              width: '100%', boxSizing: 'border-box', padding: '15px', borderRadius: '8px', border: 'none', 
              fontSize: '2rem', fontFamily: 'Bebas Neue', textAlign: 'center', background: '#FFF5F5', 
              outline: 'none', color: '#111827' 
            }}
          />
        </div>

      </div>

      {/* OPSLAAN KNOP */}
      {!isGesloten && (
        <button 
          onClick={slaBonusOp}
          style={{
            width: '100%', padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--magenta), #FF6B6B)',
            color: '#FFF', border: 'none', fontWeight: 900, fontSize: '1.2rem', cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(240, 56, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '2px',
            marginTop: '10px', transition: '0.2s'
          }}
        >
          BONUS OPSLAAN 💎
        </button>
      )}
      
      <p style={{textAlign:'center', fontWeight:900, color:'var(--crayola)', marginTop: 5, fontSize: '1.1rem'}}>{opslaanStatus}</p>

    </div>
  );
}