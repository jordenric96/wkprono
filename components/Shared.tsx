import { useState, useEffect, useRef } from 'react';

export const Autocomplete = ({ options, value, onChange, placeholder, disabled }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const filtered = options.filter((o: string) => o.toLowerCase().includes(value.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input className="full-input" value={value} onChange={(e) => { onChange(e.target.value); setIsOpen(true); }} onFocus={() => setIsOpen(true)} disabled={disabled} placeholder={placeholder} />
      {isOpen && !disabled && (
        <ul className="autocomplete-dropdown">
          {filtered.length > 0 ? filtered.map((opt: string) => (
            <li key={opt} className="autocomplete-item" onClick={() => { onChange(opt); setIsOpen(false); }}>{opt}</li>
          )) : <li className="autocomplete-item" style={{ color: '#F038FF' }}>Onbekend land...</li>}
        </ul>
      )}
    </div>
  );
};

export const CountdownTimer = ({ tijdOver }: any) => (
  <div className="timer">
    <div className="timer-box"><div className="timer-value">{tijdOver.dagen}</div><div className="timer-label">Dagen</div></div>
    <div className="timer-box"><div className="timer-value">{tijdOver.uren}</div><div className="timer-label">Uren</div></div>
    <div className="timer-box"><div className="timer-value">{tijdOver.minuten}</div><div className="timer-label">Min</div></div>
    <div className="timer-box"><div className="timer-value">{tijdOver.seconden}</div><div className="timer-label">Sec</div></div>
  </div>
);