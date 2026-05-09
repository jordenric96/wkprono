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
    'Canada': 'linear-gradient(135deg, #FF0000 30%, #FFF 30%, #FFF 70%, #FF0000 70%)',
    'Marokko': 'linear-gradient(135deg, #c1272d 45%, #006233 45%, #006233 55%, #c1272d 55%)'
  };

  const defaultEmojis: any = {
    'België': '🇧🇪', 'Nederland': '🇳🇱', 'Frankrijk': '🇫🇷', 'Duitsland': '🇩🇪', 'Spanje': '🇪🇸',
    'Brazilië': '🇧🇷', 'Argentinië': '🇦🇷', 'Portugal': '🇵🇹', 'Italië': '🇮🇹', 'Engeland': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Mexico': '🇲🇽', 'USA': '🇺🇸', 'Canada': '🇨🇦', 'Marokko': '🇲🇦'
  };

  if (!emoji && defaultEmojis[name]) emoji = defaultEmojis[name];
  if (!emoji) emoji = '🏳️';

  const gradient = colors[name] || 'linear-gradient(135deg, #3772FF, #70E4EF)';
  return { name, emoji, gradient };
};

// --- NIEUW COMPONENT: HORIZONTALE CAROUSEL ---
const CountryCarousel = ({ value, onChange, options, disabled }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Zorgt ervoor dat het gekozen land mooi naar het midden scrollt
  useEffect(() => {
    if (scrollRef.current && value) {
      const selectedEl = scrollRef.current.querySelector(`[data-country="${value}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [value]);

  return (
    <div style={{ position: 'relative', margin: '10px -20px 20px -20px' }}>
      <div 
        ref={scrollRef}
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          gap: '15px',
          padding: '20px calc(50% - 35px)', // Zorgt dat het eerste en laatste land in het midden kunnen staan
          scrollbarWidth: 'none', // Verbergt scrollbar Firefox
          msOverflowStyle: 'none', // Verbergt scrollbar IE
          pointerEvents: disabled ? 'none' : 'auto',
          opacity: disabled ? 0.6 : 1,
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Trucje om Chrome/Safari scrollbars te verbergen gebeurt in page.tsx */}
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
                opacity: isSelected ? 1 : (noSelection ? 0.8 : 0.3), // Actief 100%, rest 30%
                transform: isSelected ? 'scale(1.2)' : 'scale(0.9)', // Actief groot, rest klein
                cursor: 'pointer',
                width: '70px'
              }}
            >
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: teamInfo.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isSelected ? '0 10px 25px rgba(0,0,0,0.3)' : 'none'
              }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.8rem'
                }}>
                  {teamInfo.emoji}
                </div>
              </div>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: 900, 
                marginTop: '12px', 
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
      
      {/* Scrollbar verbergen truc voor Safari/Chrome via inline CSS */}
      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
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
    <div style={{ overflowX: 'hidden' }}>
      
      {/* WERELDKAMPIOEN */}
      <div className="antwoord-sectie" style={{ background: 'rgba(255, 255, 255, 0.9)', paddingBottom: 0 }}>
        <label className="input-label" style={{ fontSize: '1rem', color: 'var(--crayola)' }}>Wereldkampioen?</label>
        <CountryCarousel options={WK_LANDEN} value={winnaar} onChange={setWinnaar} disabled={isGesloten} />
      </div>

      {/* HALVE FINALISTEN */}
      <div className="antwoord-sectie" style={{ background: 'rgba(255, 255, 255, 0.9)', paddingBottom: 0 }}>
        <label className="input-label" style={{ fontSize: '1rem', color: 'var(--magenta)' }}>De 4 Halve Finalisten?</label>
        <div style={{ marginTop: '-10px' }}>
          <CountryCarousel options={WK_LANDEN} value={hf[0]} onChange={(v: string) => { const n = [...hf]; n[0] = v; setHf(n); }} disabled={isGesloten} />
          <div style={{ height: '1px', background: '#E9ECEF', margin: '-10px 0 10px 0' }} />
          <CountryCarousel options={WK_LANDEN} value={hf[1]} onChange={(v: string) => { const n = [...hf]; n[1] = v; setHf(n); }} disabled={isGesloten} />
          <div style={{ height: '1px', background: '#E9ECEF', margin: '-10px 0 10px 0' }} />
          <CountryCarousel options={WK_LANDEN} value={hf[2]} onChange={(v: string) => { const n = [...hf]; n[2] = v; setHf(n); }} disabled={isGesloten} />
          <div style={{ height: '1px', background: '#E9ECEF', margin: '-10px 0 10px 0' }} />
          <CountryCarousel options={WK_LANDEN} value={hf[3]} onChange={(v: string) => { const n = [...hf]; n[3] = v; setHf(n); }} disabled={isGesloten} />
        </div>
      </div>

      {/* MEESTE GOALS & VERDEDIGING */}
      <div className="antwoord-sectie" style={{ background: 'rgba(255, 255, 255, 0.9)', paddingBottom: 0 }}>
        <label className="input-label" style={{ fontSize: '0.9rem' }}>Land met meeste goals (totaal)?</label>
        <CountryCarousel options={WK_LANDEN} value={meesteGoalsLand} onChange={setMeesteGoalsLand} disabled={isGesloten} />
      </div>
      
      <div className="antwoord-sectie" style={{ background: 'rgba(255, 255, 255, 0.9)', paddingBottom: 0 }}>
        <label className="input-label" style={{ fontSize: '0.9rem' }}>Beste verdediging (minste tegengoals)?</label>
        <CountryCarousel options={WK_LANDEN} value={besteVerdedigingLand} onChange={setBesteVerdedigingLand} disabled={isGesloten} />
      </div>

      {/* EINDSTATION BELGIË */}
      <div className="antwoord-sectie" style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
        <label className="input-label" style={{ fontSize: '0.9rem', marginBottom: 10 }}>Eindstation België?</label>
        <select className="full-input" value={eindstation} onChange={(e: any) => setEindstation(e.target.value)} disabled={isGesloten} style={{ background: '#F8F9FA' }}>
          <option value="">Kies een ronde...</option>
          {['Groepsfase', 'Ronde van 32', 'Achtste finale', 'Kwartfinale', 'Halve finale', 'Troostfinale', 'Finale', 'Wereldkampioen'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      
      {/* KAARTEN */}
      <div className="antwoord-sectie" style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
        <div style={{display:'flex', gap:15}}>
          <div style={{flex:1}}>
            <label className="input-label" style={{ color: '#FFD700', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>Totaal Geel?</label>
            <input className="full-input" type="number" value={totaalGeel} onChange={(e: any) => setTotaalGeel(e.target.value)} disabled={isGesloten} style={{ textAlign: 'center', fontSize: '1.5rem', fontFamily: 'Bebas Neue' }} />
          </div>
          <div style={{flex:1}}>
            <label className="input-label" style={{ color: '#FA5252' }}>Totaal Rood?</label>
            <input className="full-input" type="number" value={totaalRood} onChange={(e: any) => setTotaalRood(e.target.value)} disabled={isGesloten} style={{ textAlign: 'center', fontSize: '1.5rem', fontFamily: 'Bebas Neue' }} />
          </div>
        </div>
      </div>

      {/* OPSLAAN KNOP */}
      {!isGesloten && (
        <button 
          className="btn-primary" 
          onClick={slaBonusOp}
          style={{ width: '100%', padding: '20px', borderRadius: '20px', fontSize: '1.3rem', letterSpacing: '1px' }}
        >
          BONUS OPSLAAN 💎
        </button>
      )}
      
      <p style={{textAlign:'center', fontWeight:900, color:'var(--crayola)', marginTop: 15, fontSize: '1.1rem'}}>{opslaanStatus}</p>
    </div>
  );
}