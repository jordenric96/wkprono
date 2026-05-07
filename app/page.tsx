'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { WK_LANDEN } from '../lib/data';

const DEADLINE_DATE = new Date('2026-06-11T21:00:00+02:00').getTime();

const Autocomplete = ({ options, value, onChange, placeholder, disabled }: { options: string[], value: string, onChange: (val: string) => void, placeholder: string, disabled: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const filtered = options.filter(o => o.toLowerCase().includes(value.toLowerCase()));

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
          {filtered.length > 0 ? filtered.map(opt => (
            <li key={opt} className="autocomplete-item" onClick={() => { onChange(opt); setIsOpen(false); }}>{opt}</li>
          )) : <li className="autocomplete-item" style={{ color: '#F038FF' }}>Ongekend land...</li>}
        </ul>
      )}
    </div>
  );
};

export default function Home() {
  const [ontgrendelNaam, setOntgrendelNaam] = useState('');
  const [invoerCode, setInvoerCode] = useState('');
  const [status, setStatus] = useState('');
  
  const [actieveSpeler, setActieveSpeler] = useState<any>(null);
  const [actieveTab, setActieveTab] = useState('matchen');
  const [filterRonde, setFilterRonde] = useState('Alle');
  const [ongelezenBerichten, setOngelezenBerichten] = useState(false);
  const actieveTabRef = useRef(actieveTab);

  // MATCHEN & VOORSPELLINGEN
  const [matchen, setMatchen] = useState<any[]>([]);
  const [matchVoorspellingen, setMatchVoorspellingen] = useState<Record<number, {thuis: string, uit: string, joker: boolean}>>({});
  const [opslaanStatus, setOpslaanStatus] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // BONUSVRAGEN
  const [winnaar, setWinnaar] = useState('');
  const [meesteGoalsLand, setMeesteGoalsLand] = useState('');
  const [besteVerdedigingLand, setBesteVerdedigingLand] = useState('');
  const [eindstation, setEindstation] = useState('');

  // KLASSEMENT & CHAT
  const [klassement, setKlassement] = useState<any[]>([]);
  const [chatBerichten, setChatBerichten] = useState<any[]>([]);
  const [nieuwBericht, setNieuwBericht] = useState('');
  const chatEindeRef = useRef<HTMLDivElement>(null);

  // TIMER
  const [tijdOver, setTijdOver] = useState({ dagen: 0, uren: 0, minuten: 0, seconden: 0 });
  const [isGesloten, setIsGesloten] = useState(false);

  useEffect(() => {
    actieveTabRef.current = actieveTab;
  }, [actieveTab]);

  useEffect(() => {
    const opgeslagenId = localStorage.getItem('wk_speler_id');
    haalSpelersOp(opgeslagenId);
    
    if ("Notification" in window) Notification.requestPermission();
    
    const klokInterval = setInterval(() => {
      const nu = new Date().getTime();
      const verschil = DEADLINE_DATE - nu;
      if (verschil <= 0) { setIsGesloten(true); clearInterval(klokInterval); } 
      else {
        setTijdOver({
          dagen: Math.floor(verschil / (1000 * 60 * 60 * 24)),
          uren: Math.floor((verschil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minuten: Math.floor((verschil % (1000 * 60 * 60)) / (1000 * 60)),
          seconden: Math.floor((verschil % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    const chatSubscription = supabase.channel('kleedkamer_berichten')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'kleedkamer' }, () => {
        haalChatOp();
        if (actieveTabRef.current !== 'kleedkamer') setOngelezenBerichten(true);
      }).subscribe();

    return () => { clearInterval(klokInterval); supabase.removeChannel(chatSubscription); };
  }, []);

  useEffect(() => {
    if (actieveSpeler) {
      if (actieveTab === 'matchen') haalMatchenOp();
      if (actieveTab === 'bonus') haalToernooiVoorspellingOp();
      if (actieveTab === 'ranking') haalKlassementOp();
      if (actieveTab === 'kleedkamer') haalChatOp();
    }
  }, [actieveSpeler, actieveTab]);

  const veranderTab = (tab: string) => {
    setActieveTab(tab);
    if (tab === 'kleedkamer') setOngelezenBerichten(false);
  };

  const haalSpelersOp = async (checkId?: string | null) => {
    const { data } = await supabase.from('spelers').select('*').order('created_at', { ascending: true });
    if (data && checkId) {
      const gevonden = data.find(s => s.id.toString() === checkId);
      if (gevonden) setActieveSpeler(gevonden);
    }
  };

  const haalChatOp = async () => {
    const { data } = await supabase.from('kleedkamer').select('*, spelers(naam)').order('created_at', { ascending: true });
    if (data) {
      setChatBerichten(data);
      setTimeout(() => chatEindeRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const verstuurChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nieuwBericht.trim()) return;
    const { error } = await supabase.from('kleedkamer').insert([{ speler_id: actieveSpeler.id, bericht: nieuwBericht.trim() }]);
    if (!error) setNieuwBericht('');
  };

  const haalMatchenOp = async () => {
    const { data: matchenData } = await supabase.from('matchen').select('*').order('id', { ascending: true });
    if (matchenData) setMatchen(matchenData);

    const { data: voorspellingenData } = await supabase.from('match_voorspellingen').select('*').eq('speler_id', actieveSpeler.id);
    if (voorspellingenData) {
      const stateObj: any = {};
      voorspellingenData.forEach(v => {
        stateObj[v.match_id] = { thuis: v.thuis_score?.toString() || '', uit: v.uit_score?.toString() || '', joker: v.gouden_bal };
      });
      setMatchVoorspellingen(stateObj);
    }
  };

  const handleScore = (mId: number, veld: 'thuis'|'uit', waarde: string) => {
    setMatchVoorspellingen(prev => ({
      ...prev,
      [mId]: { ...prev[mId], [veld]: waarde, joker: prev[mId]?.joker || false }
    }));
  };

  const toggleJoker = (mId: number) => {
    setMatchVoorspellingen(prev => {
      const isNuJoker = prev[mId]?.joker || false;
      const nieuwStaat = { ...prev };
      Object.keys(nieuwStaat).forEach(key => {
        if (nieuwStaat[Number(key)]) nieuwStaat[Number(key)].joker = false;
      });
      nieuwStaat[mId] = { ...prev[mId], joker: !isNuJoker, thuis: prev[mId]?.thuis || '', uit: prev[mId]?.uit || '' };
      return nieuwStaat;
    });
  };

  const slaAllesOp = async () => {
    setOpslaanStatus('Bezig... ⚽');
    
    // Matchen opslaan
    const inserts: any[] = [];
    Object.keys(matchVoorspellingen).forEach(mId => {
      const v = matchVoorspellingen[Number(mId)];
      if (v.thuis !== '' && v.uit !== '') {
        inserts.push({ speler_id: actieveSpeler.id, match_id: Number(mId), thuis_score: parseInt(v.thuis), uit_score: parseInt(v.uit), gouden_bal: v.joker });
      }
    });

    if (inserts.length > 0) {
      await supabase.from('match_voorspellingen').upsert(inserts, { onConflict: 'speler_id, match_id' });
    }

    // Bonus opslaan (we hergebruiken tijdelijk topschutter/beste_keeper kolommen voor de nieuwe vragen)
    await supabase.from('toernooi_voorspellingen').upsert({
      speler_id: actieveSpeler.id, winnaar, topschutter: meesteGoalsLand, beste_keeper: besteVerdedigingLand, eindstation_belgie: eindstation
    }, { onConflict: 'speler_id' });

    setOpslaanStatus('Alles opgeslagen! 🌟');
    setShowConfetti(true);
    setTimeout(() => { setShowConfetti(false); setOpslaanStatus(''); }, 3000);
  };

  const haalToernooiVoorspellingOp = async () => {
    const { data } = await supabase.from('toernooi_voorspellingen').select('*').eq('speler_id', actieveSpeler.id).single();
    if (data) {
      setWinnaar(data.winnaar || ''); setMeesteGoalsLand(data.topschutter || '');
      setBesteVerdedigingLand(data.beste_keeper || ''); setEindstation(data.eindstation_belgie || '');
    }
  };

  const haalKlassementOp = async () => {
    const { data: alleSpelers } = await supabase.from('spelers').select('*');
    const { data: alleMatchen } = await supabase.from('matchen').select('*');
    const { data: alleVoorspellingen } = await supabase.from('match_voorspellingen').select('*');

    if (alleSpelers && alleMatchen && alleVoorspellingen) {
      const stats = alleSpelers.map(s => {
        let punten = 0; let exact = 0; let winnaarCorrect = 0; let fout = 0; let jokerIngezet = false;

        const spelerV = alleVoorspellingen.filter(v => v.speler_id === s.id);
        spelerV.forEach(v => {
          if (v.gouden_bal) jokerIngezet = true;
          const m = alleMatchen.find(m => m.id === v.match_id);
          if (m && m.thuis_score !== null && m.uit_score !== null) {
            const factor = v.gouden_bal ? 2 : 1;
            const echtResultaat = m.thuis_score > m.uit_score ? 1 : m.thuis_score < m.uit_score ? 2 : 0;
            const voorspeldResultaat = v.thuis_score > v.uit_score ? 1 : v.thuis_score < v.uit_score ? 2 : 0;

            if (v.thuis_score === m.thuis_score && v.uit_score === m.uit_score) {
              punten += (5 * factor); exact++;
            } else if (echtResultaat === voorspeldResultaat) {
              punten += (3 * factor); winnaarCorrect++;
            } else {
              fout++;
            }
          }
        });
        return { ...s, totaal_score: punten, exact, winnaarCorrect, fout, jokerIngezet };
      });
      setKlassement(stats.sort((a, b) => b.totaal_score - a.totaal_score));
    }
  };

  const ontgrendel = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: speler } = await supabase.from('spelers').select('*').ilike('naam', ontgrendelNaam.trim()).single();
    if (speler && String(speler.code) === String(invoerCode)) {
      localStorage.setItem('wk_speler_id', speler.id.toString());
      setActieveSpeler(speler);
    } else setStatus('Naam of code fout! 🚩');
  };

  const gefilterdeMatchen = useMemo(() => {
    if (filterRonde === 'Alle') return matchen;
    if (filterRonde === 'Nog in te vullen') {
      return matchen.filter(m => {
        const v = matchVoorspellingen[m.id];
        return !v || v.thuis === '' || v.uit === '' || v.thuis === undefined || v.uit === undefined;
      });
    }
    return matchen.filter(m => m.ronde === filterRonde);
  }, [matchen, filterRonde, matchVoorspellingen]);

  return (
    <main className="main-container">
      {/* ========================================================================
        VERBETERDE STYLING: DYNAMISCH, LEUK, SPEELS & BEWEEGELIJK (UITGEBREIDE STYLING)
        ========================================================================
      */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@600;800;900&display=swap');

        :root {
          /* Jouw Kleurenpaletvariabelen */
          --crayola: #3772FF;
          --magenta: #F038FF;
          --rose: #EF709D;
          --lime: #E2EF70;
          --aqua: #70E4EF;
        }

        /* 1. DYNAMISCHE, BEWEEGELIJKE ACHTERGROND */
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
          font-family: 'Nunito', sans-serif;
          color: #111827;
          /* Achtergrond met organische vormen en fadende gradient */
          background: radial-gradient(circle at 30% 20%, var(--rose), transparent 30%),
                      radial-gradient(circle at 70% 80%, var(--lime), transparent 30%),
                      linear-gradient(135deg, var(--crayola), var(--aqua));
          background-size: 200% 200%;
          animation: background-fade 10s ease-in-out infinite;
          overflow-x: hidden;
        }

        /* Bewegelijke pseudo-elementen voor organische "blobs" */
        body::before, body::after {
          content: '';
          position: fixed;
          border-radius: 50%;
          filter: blur(50px);
          opacity: 0.5;
          z-index: -1;
          pointer-events: none;
        }

        body::before {
          width: 400px; height: 400px;
          top: -100px; left: -100px;
          background: var(--magenta);
          animation: blob-movement-a 12s linear infinite;
        }

        body::after {
          width: 350px; height: 350px;
          bottom: -80px; right: -80px;
          background: var(--aqua);
          animation: blob-movement-b 15s linear infinite;
        }

        /* 2. VERBETERDE MODERNE GLASS-CARD */
        .glass-card {
          background: rgba(255, 255, 255, 0.6); /* Semi-transparant voor frosteffect */
          backdrop-filter: blur(12px); /* Frosteffect */
          padding: 25px 20px;
          border-radius: 24px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15); /* Verfijnde schaduw */
          border: 3px solid rgba(255, 255, 255, 0.4); /* Subtiele rand */
          margin-top: 10px;
          margin-bottom: 20px;
        }

        /* 3. SPEELSE TITEL */
        .title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 4.5rem;
          text-align: center;
          color: #FFF;
          line-height: 1;
          text-shadow: 3px 3px 0px var(--magenta); /* Magenta schaduw */
          margin: 0;
          animation: title-glow 3s linear infinite; /* Subtiele glow */
        }
        
        /* 4. VERBETERDE TIMER MET NEON-GLOW */
        .timer {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .timer-box {
          background: var(--magenta);
          color: #FFF;
          padding: 8px 12px;
          border-radius: 12px;
          text-align: center;
          font-weight: 900;
          line-height: 1.1;
          box-shadow: 0 4px 10px rgba(240, 56, 255, 0.3); /* Subtiele glow */
        }
        .timer-value { font-size: 1.5rem; }
        .timer-label { font-size: 0.6rem; text-transform: uppercase; opacity: 0.8; }

        /* 5. VERBETERDE SPEELSE TABS */
        .tab-container {
          display: flex;
          background: rgba(240, 244, 248, 0.8); /* Semi-transparant */
          border-radius: 16px;
          padding: 5px;
          margin-bottom: 20px;
          overflow-x: auto;
          scrollbar-width: none;
          backdrop-filter: blur(5px);
        }
        .tab {
          flex: 1; min-width: 80px; text-align: center; padding: 12px 5px; font-size: 0.65rem; font-weight: 800; border-radius: 12px; cursor: pointer; color: #6C757D; position: relative; transition: 0.3s;
        }
        .tab.active {
          background: var(--crayola);
          color: #FFF;
          transform: scale(1.05); /* Speels schalingseffect */
          box-shadow: 0 4px 10px rgba(55, 114, 255, 0.3);
        }
        .tab:hover:not(.active) { color: var(--crayola); } /* Hover-kleur */
        .unread-badge { position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; background: var(--rose); border-radius: 50%; }

        /* 6. VERBETERDE SPEELSE FILTERCHIPS */
        .filter-scroll { display: flex; gap: 8px; margin-bottom: 15px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none; }
        .filter-chip { padding: 8px 14px; border-radius: 20px; background: #E9ECEF; font-size: 0.75rem; font-weight: 800; cursor: pointer; border: 2px solid transparent; white-space: nowrap; color: #495057; transition: 0.2s; }
        .filter-chip.active { border-color: var(--crayola); color: var(--crayola); background: #eef2ff; transform: scale(1.05); }
        .filter-chip.urgent { background: #ffe3e3; color: #e03131; border-color: #ffa8a8; }
        .filter-chip.urgent.active { background: #e03131; color: #fff; border-color: #c92a2a; }
        .filter-chip:hover:not(.active) { background: #dee2e6; }

        /* 7. VERBETERDE SPEELSE MATCHES CARDS */
        .match-card {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 16px;
          margin-bottom: 12px;
          border: 2px solid #E9ECEF;
          overflow: hidden;
          transition: 0.3s transform, 0.3s box-shadow;
        }
        .match-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); } /* Speelse hover */
        .match-header {
          background: var(--lime); /* Lime achtergrond */
          padding: 10px 15px; font-size: 0.7rem; font-weight: 800; color: #111827; display: flex; justify-content: space-between; align-items: center;
        }
        .match-body { display: flex; align-items: center; padding: 15px; }
        .team-naam { font-weight: 900; flex: 1; text-align: center; font-size: 0.95rem; }
        .score-invoer { width: 45px; height: 50px; text-align: center; font-size: 1.5rem; font-family: 'Bebas Neue', sans-serif; border-radius: 12px; border: 2px solid #DEE2E6; outline: none; transition: 0.2s; }
        .score-invoer:focus { border-color: var(--aqua); box-shadow: 0 0 10px rgba(112, 228, 239, 0.3); }

        /* NEON-GLOW JOKER-KNOP */
        .joker-btn { width: 38px; height: 38px; border-radius: 50%; border: 2px solid #DEE2E6; background: #FFF; font-size: 1.2rem; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; filter: grayscale(1); opacity: 0.5; }
        .joker-btn.active {
          background: #FFD700;
          border-color: #FFA500;
          filter: grayscale(0); opacity: 1;
          transform: scale(1.15); /* Speelse schaling */
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.6); /* Goudglow */
        }
        .joker-btn:hover:not(.active) { filter: grayscale(0); opacity: 0.8; }

        /* 8. VERBETERD MODERNE KLASSEMENT & CHAT CARDS */
        .ranking-item {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 16px; padding: 15px; margin-bottom: 12px; border: 2px solid #E9ECEF; display: flex; align-items: center; gap: 15px; transition: 0.2s;
        }
        .ranking-item:hover { transform: translateY(-3px); }
        .ranking-pos { font-family: 'Bebas Neue'; font-size: 1.8rem; color: var(--crayola); width: 30px; text-align: center; }
        .ranking-main { flex: 1; }
        .ranking-naam { font-weight: 900; text-transform: uppercase; display: flex; align-items: center; gap: 6px; font-size: 1.1rem; }
        .ranking-stats { font-size: 0.75rem; color: #6C757D; font-weight: 800; margin-top: 4px; }
        .ranking-score { font-family: 'Bebas Neue'; font-size: 2.5rem; color: var(--magenta); animation: score-pulse 1.5s ease-out infinite; }

        .chat-container { height: 350px; overflow-y: auto; padding-right: 5px; margin-bottom: 15px; }
        .chat-bericht {
          background: rgba(248, 249, 250, 0.8); padding: 12px; border-radius: 16px; border-bottom-left-radius: 4px; margin-bottom: 10px; font-size: 0.9rem; font-weight: 700; border: 1px solid #E9ECEF; transition: 0.2s;
        }
        .chat-bericht:hover { background: rgba(240, 244, 248, 1); }
        .chat-eigen { background: var(--aqua); border-color: #61cbd6; border-bottom-left-radius: 16px; border-bottom-right-radius: 4px; }

        /* 9. VERBETERDE SPEELSE INVOEREN EN KNOPPEN */
        .input-group { margin-bottom: 15px; text-align: left; }
        .input-label { display: block; font-size: 0.75rem; font-weight: 900; margin-bottom: 5px; color: #495057; text-transform: uppercase; }
        .full-input {
          width: 100%; padding: 15px; border-radius: 15px; border: 2px solid #E9ECEF; outline: none; box-sizing: border-box; font-weight: 800; font-size: 1rem; transition: 0.2s;
        }
        .full-input:focus { border-color: var(--magenta); box-shadow: 0 0 10px rgba(240, 56, 255, 0.3); }

        .btn-primary {
          width: 100%; padding: 18px; border-radius: 16px;
          background: var(--magenta);
          color: #FFF; border: none; font-weight: 900; font-size: 1.1rem; cursor: pointer;
          box-shadow: 0 4px 15px rgba(240, 56, 255, 0.3); /* Glow */
          transition: 0.2s;
        }
        .btn-primary:active { transform: translateY(2px); box-shadow: 0 2px 8px rgba(240, 56, 255, 0.3); }
        .btn-primary:hover { background: #cf2fdc; }

        /* AUTOCOMPLETE */
        .autocomplete-dropdown { position: absolute; z-index: 100; background: #FFF; width: 100%; border: 2px solid #E9ECEF; border-radius: 12px; max-height: 200px; overflow-y: auto; padding: 0; list-style: none; margin-top: 5px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .autocomplete-item { padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #F8F9FA; font-weight: 800; font-size: 0.9rem; }
        .autocomplete-item:hover { background: #F8F9FA; color: var(--crayola); }

        /* MAIN CONTAINER */
        .main-container { padding: 25px 15px 80px 15px; display: flex; flex-direction: column; align-items: center; box-sizing: border-box; }

        /* ============================ ANIMATIES ============================ */
        
        /* Bewegelijke, organische organische blobs achtergrond */
        @keyframes background-fade {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }

        @keyframes blob-movement-a {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(50px, 80px) scale(1.1); }
        }

        @keyframes blob-movement-b {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-40px, -60px) scale(0.9); }
        }

        @keyframes title-glow {
          0%, 100% { text-shadow: 3px 3px 0px var(--magenta); }
          50% { text-shadow: 3px 3px 20px rgba(240, 56, 255, 0.8), 3px 3px 0px var(--magenta); }
        }

        @keyframes score-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        /* EINDE STYLING */
      `}</style>

      {showConfetti && (
        <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:999, display:'flex', justifyContent:'center', alignItems:'center'}}>
          <div style={{fontSize:'5rem', animation:'bounce 1s infinite'}}>🎉🌟⚽</div>
        </div>
      )}

      <div className="glass-card">
        <h1 className="title">WK 2026</h1>

        {!isGesloten && actieveSpeler && (
          <div className="timer">
            <div className="timer-box"><div className="timer-value">{tijdOver.dagen}</div><div className="timer-label">Dagen</div></div>
            <div className="timer-box"><div className="timer-value">{tijdOver.uren}</div><div className="timer-label">Uren</div></div>
            <div className="timer-box"><div className="timer-value">{tijdOver.minuten}</div><div className="timer-label">Min</div></div>
            <div className="timer-box"><div className="timer-value">{tijdOver.seconden}</div><div className="timer-label">Sec</div></div>
          </div>
        )}

        {actieveSpeler ? (
          <div>
            <div className="tab-container">
              <div className={`tab ${actieveTab === 'matchen' ? 'active' : ''}`} onClick={() => veranderTab('matchen')}>MATCHEN</div>
              <div className={`tab ${actieveTab === 'bonus' ? 'active' : ''}`} onClick={() => veranderTab('bonus')}>BONUS</div>
              <div className={`tab ${actieveTab === 'ranking' ? 'active' : ''}`} onClick={() => veranderTab('ranking')}>RANKING</div>
              <div className={`tab ${actieveTab === 'kleedkamer' ? 'active' : ''}`} onClick={() => veranderTab('kleedkamer')}>CHAT {ongelezenBerichten && <span className="unread-badge" />}</div>
            </div>

            {actieveTab === 'matchen' && (
              <div>
                <div className="filter-scroll">
                  <span className={`filter-chip urgent ${filterRonde === 'Nog in te vullen' ? 'active' : ''}`} onClick={() => setFilterRonde('Nog in te vullen')}>Nog in te vullen ✍️</span>
                  {['Alle', 'Groepsfase', 'Ronde van 32', 'Achtste finale', 'Kwartfinale', 'Halve finale', 'Troostfinale', 'Finale'].map(r => (
                    <span key={r} className={`filter-chip ${filterRonde === r ? 'active' : ''}`} onClick={() => setFilterRonde(r)}>{r}</span>
                  ))}
                </div>

                {gefilterdeMatchen.length === 0 ? (
                  <p style={{textAlign:'center', fontWeight:800, color:'#ADB5BD', margin:'40px 0'}}>Geen matchen gevonden in deze categorie.</p>
                ) : (
                  gefilterdeMatchen.map(m => {
                    const v = matchVoorspellingen[m.id] || { thuis: '', uit: '', joker: false };
                    return (
                      <div key={m.id} className="match-card">
                        <div className="match-header">
                          <span>{m.ronde} • {new Date(m.datum).toLocaleDateString('nl-BE', {day:'2-digit', month:'short'})}</span>
                          <button className={`joker-btn ${v.joker ? 'active' : ''}`} onClick={() => toggleJoker(m.id)}>🌟</button>
                        </div>
                        <div className="match-body">
                          <span className="team-naam">{m.thuisploeg}</span>
                          <input className="score-invoer" type="tel" value={v.thuis} onChange={e => handleScore(m.id, 'thuis', e.target.value)} />
                          <span style={{margin:'0 10px', fontWeight:900, color:'#ADB5BD'}}>-</span>
                          <input className="score-invoer" type="tel" value={v.uit} onChange={e => handleScore(m.id, 'uit', e.target.value)} />
                          <span className="team-naam">{m.uitploeg}</span>
                        </div>
                      </div>
                    );
                  })
                )}
                <button className="btn-primary" onClick={slaAllesOp}>OPSLAAN</button>
                <p style={{textAlign:'center', fontWeight:900, color:'var(--crayola)'}}>{opslaanStatus}</p>
              </div>
            )}

            {actieveTab === 'bonus' && (
              <div>
                <div className="input-group">
                  <label className="input-label">Wereldkampioen?</label>
                  <Autocomplete options={WK_LANDEN} value={winnaar} onChange={setWinnaar} placeholder="Typ een land..." disabled={isGesloten} />
                </div>
                <div className="input-group">
                  <label className="input-label">Land met meeste goals (totaal)?</label>
                  <Autocomplete options={WK_LANDEN} value={meesteGoalsLand} onChange={setMeesteGoalsLand} placeholder="Typ een land..." disabled={isGesloten} />
                </div>
                <div className="input-group">
                  <label className="input-label">Beste verdediging (minste tegengoals)?</label>
                  <Autocomplete options={WK_LANDEN} value={besteVerdedigingLand} onChange={setBesteVerdedigingLand} placeholder="Typ een land..." disabled={isGesloten} />
                </div>
                <div className="input-group">
                  <label className="input-label">Eindstation België?</label>
                  <select className="full-input" value={eindstation} onChange={e => setEindstation(e.target.value)} disabled={isGesloten}>
                    <option value="">Kies een ronde...</option>
                    {['Groepsfase', 'Ronde van 32', 'Achtste finale', 'Kwartfinale', 'Halve finale', 'Troostfinale', 'Finale', 'Wereldkampioen'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <button className="btn-primary" onClick={slaAllesOp} disabled={isGesloten}>BONUS OPSLAAN</button>
              </div>
            )}

            {actieveTab === 'ranking' && (
              <div>
                {klassement.map((s, i) => (
                  <div key={s.id} className="ranking-item">
                    <span className="ranking-pos">{i+1}</span>
                    <div className="ranking-main">
                      <span className="ranking-naam">{s.naam} {s.jokerIngezet ? <span style={{fontSize:'1rem'}}>🌑</span> : <span style={{fontSize:'1rem'}}>🌟</span>}</span>
                      <div className="ranking-stats">
                        ✅ {s.exact} exact • 🏆 {s.winnaarCorrect} winnaar • ❌ {s.fout} fout
                      </div>
                    </div>
                    <span className="ranking-score">{s.totaal_score}</span>
                  </div>
                ))}
              </div>
            )}

            {actieveTab === 'kleedkamer' && (
              <div>
                <div className="chat-container">
                  {chatBerichten.map(b => (
                    <div key={b.id} className={`chat-bericht ${b.speler_id === actieveSpeler.id ? 'chat-eigen' : ''}`}>
                      <div style={{fontSize: '0.65rem', color: b.speler_id === actieveSpeler.id ? '#828c31' : '#ADB5BD', marginBottom: 2}}>{b.spelers?.naam}</div>
                      <div>{b.bericht}</div>
                    </div>
                  ))}
                  <div ref={chatEindeRef} />
                </div>
                <form onSubmit={verstuurChat} style={{display:'flex', gap:10}}>
                  <input className="full-input" style={{padding:'12px'}} value={nieuwBericht} onChange={e => setNieuwBericht(e.target.value)} placeholder="Zeg iets..." />
                  <button className="btn-primary" style={{width:'80px', padding:'12px'}} type="submit">➤</button>
                </form>
              </div>
            )}
            
            <div style={{textAlign:'center', marginTop:20}}>
              <button style={{background:'none', border:'none', color:'#ADB5BD', fontWeight:800, cursor:'pointer'}} onClick={() => {localStorage.removeItem('wk_speler_id'); window.location.reload();}}>UITLOGGEN</button>
            </div>
          </div>
        ) : (
          <form onSubmit={ontgrendel}>
            <div className="input-group"><input className="full-input" placeholder="Je Naam" value={ontgrendelNaam} onChange={e=>setOntgrendelNaam(e.target.value)} /></div>
            <div className="input-group"><input className="full-input" type="password" placeholder="Pincode" value={invoerCode} onChange={e=>setInvoerCode(e.target.value)} /></div>
            <button className="btn-primary" type="submit">HET VELD OP</button>
            <p style={{color:'var(--rose)', fontWeight:900, textAlign:'center'}}>{status}</p>
          </form>
        )}
      </div>
    </main>
  );
}