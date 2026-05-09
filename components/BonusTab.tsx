// src/components/BonusTab.tsx
import { useEffect, useRef } from 'react';

// --- HULPFUNCTIE: VLAGGEN & KLEUREN GENERATOR ---
const parseTeam = (teamString: string) => {
  if (!teamString) return { name: '', emoji: '🏳️', gradient: 'linear-gradient(135deg, #e9ecef, #adb5bd)' };

  const emojiMatch = teamString.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu);
  let emoji = emojiMatch ? emojiMatch.join('') : '';
  let name = teamString.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();

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
    'Marokko': 'linear-gradient(135deg, #c1272d 45%, #006233 45%, #006233 55%, #c1272d 55%)'
  };

  const defaultEmojis: any = {
    'België': '🇧🇪', 'Nederland': '🇳🇱', 'Frankrijk': '🇫🇷', 'Duitsland': '🇩🇪', 'Spanje': '🇪🇸',
    'Brazilië': '🇧🇷', 'Argentinië': '🇦🇷', 'Portugal': '🇵🇹', 'Italië': '🇮🇹', 'Engeland': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Mexico': '🇲🇽', 'USA': '🇺🇸', 'Verenigde Staten': '🇺🇸', 'Canada': '🇨🇦', 'Marokko': '🇲🇦'
  };

  if (!emoji && defaultEmojis[name]) emoji = defaultEmojis[name];
  if (!emoji) emoji = '🏳️';

  const gradient = colors[name] || 'linear-gradient(135deg, #3772FF, #70E4EF)';
  return { name, emoji, gradient };
};

// --- NIEUW COMPONENT: HORIZONTALE CAROUSEL ---
const CountryCarousel = ({ value, onChange, options, disabled }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Zorgt ervoor dat het gekozen land mooi in beeld schuift
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
          display: 'flex',
          overflowX: 'auto',
          gap: '12px',
          padding: '15px', // Vaste padding, geen lege ruimtes meer!
          scrollSnapType: 'x mandatory',
          pointerEvents: disabled ? 'none' : 'auto',
          opacity: disabled ? 0.6 : 1,
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {options.map((land: string) => {
          const isSelected = value === land;
          const noSelection = !value;
          const teamInfo = parseTeam(land);

          return (
            <div 
              key={land}
              data-country={land}
              onClick={() => !disabled && onChange(land)}
              style={{
                flexShrink: 0,
                scrollSnapAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isSelected ? 1 : (noSelection ? 0.9 : 0.4), // Helderheid
                transform: isSelected ? 'scale(1.15)' : 'scale(0.95)', // Grootte
                cursor: 'pointer',
                width: '65px'
              }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: teamInfo.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isSelected ? '0 8px 20px rgba(0,0,0,0.2)' : 'none',
                border: isSelected ? '2px solid white' : '2px solid transparent'
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.6rem'
                }}>
                  {teamInfo.emoji}
                </div>
              </div>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: 900, 
                marginTop: '8px', 
                color: isSelected ? 'var(--magenta)' : '#6C757D',
                textTransform: 'uppercase',
                textAlign: 'center',
                lineHeight: 1.1
              }}>
                {teamInfo.name}
              </span>
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
      
      {/* CSS VOOR STYLING */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .bonus-card { background: rgba(255, 255, 255, 0.95); border-radius: 16px; padding: 15px; border: 2px solid #E9ECEF; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden; }
        .bonus-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; margin: 0 0 5px 0; letter-spacing: 1px; line-height: 1; }
        
        .custom-select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111827%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat;
          background-position: right 15px top 50%;
          background-size: 12px auto;
        }
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

      {/* EINDSTATION BELGIË */}
      <div className="bonus-card">
        <h3 className="bonus-title" style={{color: '#111827'}}>📍 Eindstation België</h3>
        <select 
          className="custom-select"
          value={eindstation} 
          onChange={(e: any) => setEindstation(e.target.value)} 
          disabled={isGesloten}
          style={{
            width: '100%', padding: '15px', borderRadius: '12px', background: '#F8F9FA', 
            border: '2px solid #DEE2E6', fontSize: '1rem', fontWeight: 900, outline: 'none',
            marginTop: '10px', color: '#111827', cursor: 'pointer', transition: '0.2s'
          }}
        >
          <option value="">Kies een ronde...</option>
          {['Groepsfase', 'Ronde van 32', 'Achtste finale', 'Kwartfinale', 'Halve finale', 'Troostfinale', 'Finale', 'Wereldkampioen'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      
      {/* KAARTEN */}
      <div style={{ display: 'flex', gap: '15px' }}>
        <div className="bonus-card" style={{ flex: 1, background: 'linear-gradient(135deg, #FFD700, #F1BF00)', borderColor: '#E6C200', padding: '20px 15px', textAlign: 'center' }}>
          <h3 className="bonus-title" style={{color: '#000'}}>🟨 Totaal Geel</h3>
          <input 
            type="tel" 
            value={totaalGeel} 
            onChange={(e: any) => setTotaalGeel(e.target.value)} 
            disabled={isGesloten}
            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: 'none', fontSize: '2.5rem', fontFamily: 'Bebas Neue', textAlign: 'center', background: 'rgba(255,255,255,0.9)', outline: 'none', marginTop: '10px', color: '#111827' }}
          />
        </div>
        <div className="bonus-card" style={{ flex: 1, background: 'linear-gradient(135deg, #FA5252, #E03131)', borderColor: '#C92A2A', padding: '20px 15px', textAlign: 'center' }}>
          <h3 className="bonus-title" style={{color: '#FFF'}}>🟥 Totaal Rood</h3>
          <input 
            type="tel" 
            value={totaalRood} 
            onChange={(e: any) => setTotaalRood(e.target.value)} 
            disabled={isGesloten}
            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: 'none', fontSize: '2.5rem', fontFamily: 'Bebas Neue', textAlign: 'center', background: 'rgba(255,255,255,0.9)', outline: 'none', marginTop: '10px', color: '#111827' }}
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