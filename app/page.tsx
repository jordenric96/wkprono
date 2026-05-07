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
          )) : <li className="autocomplete-item" style={{ color: '#F038FF' }}>Onbekend land...</li>}
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

  // DATA STATES
  const [matchen, setMatchen] = useState<any[]>([]);
  const [matchVoorspellingen, setMatchVoorspellingen] = useState<Record<number, {thuis: string, uit: string, joker: boolean}>>({});
  const [matchSaveStatus, setMatchSaveStatus] = useState<Record<number, 'idle' | 'saving' | 'saved'>>({});
  const [alleAntwoorden, setAlleAntwoorden] = useState<any[]>([]);
  const [opslaanStatus, setOpslaanStatus] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // BONUSVRAGEN STATES
  const [winnaar, setWinnaar] = useState('');
  const [hf1, setHf1] = useState('');
  const [hf2, setHf2] = useState('');
  const [hf3, setHf3] = useState('');
  const [hf4, setHf4] = useState('');
  const [meesteGoalsLand, setMeesteGoalsLand] = useState('');
  const [besteVerdedigingLand, setBesteVerdedigingLand] = useState('');
  const [eindstation, setEindstation] = useState('');
  const [totaalGeel, setTotaalGeel] = useState('');
  const [totaalRood, setTotaalRood] = useState('');

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
      if (actieveTab === 'antwoorden') haalAlleAntwoordenOp();
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
    setMatchSaveStatus(prev => ({...prev, [mId]: 'idle'}));
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
    setMatchSaveStatus(prev => ({...prev, [mId]: 'idle'}));
  };

  // NIEUW: Bewaar per match met visuele indicatie
  const slaMatchOp = async (mId: number) => {
    const v = matchVoorspellingen[mId];
    if (!v || v.thuis === '' || v.uit === '') return;

    setMatchSaveStatus(prev => ({...prev, [mId]: 'saving'}));

    const { error } = await supabase.from('match_voorspellingen').upsert({
      speler_id: actieveSpeler.id, 
      match_id: mId, 
      thuis_score: parseInt(v.thuis), 
      uit_score: parseInt(v.uit), 
      gouden_bal: v.joker
    }, { onConflict: 'speler_id, match_id' });

    if (!error) {
      setMatchSaveStatus(prev => ({...prev, [mId]: 'saved'}));
    } else {
      setMatchSaveStatus(prev => ({...prev, [mId]: 'idle'}));
    }
  };

  const slaBonusOp = async () => {
    setOpslaanStatus('Bezig... ⚽');
    await supabase.from('toernooi_voorspellingen').upsert({
      speler_id: actieveSpeler.id, 
      winnaar, 
      halve_finalist_1: hf1,
      halve_finalist_2: hf2,
      halve_finalist_3: hf3,
      halve_finalist_4: hf4,
      topschutter: meesteGoalsLand, 
      beste_keeper: besteVerdedigingLand, 
      eindstation_belgie: eindstation,
      totaal_gele_kaarten: parseInt(totaalGeel) || 0,
      totaal_rode_kaarten: parseInt(totaalRood) || 0
    }, { onConflict: 'speler_id' });

    setOpslaanStatus('Bonusvragen Opgeslagen! 🌟');
    setShowConfetti(true);
    setTimeout(() => { setShowConfetti(false); setOpslaanStatus(''); }, 3000);
  };

  const haalToernooiVoorspellingOp = async () => {
    const { data } = await supabase.from('toernooi_voorspellingen').select('*').eq('speler_id', actieveSpeler.id).single();
    if (data) {
      setWinnaar(data.winnaar || ''); 
      setHf1(data.halve_finalist_1 || '');
      setHf2(data.halve_finalist_2 || '');
      setHf3(data.halve_finalist_3 || '');
      setHf4(data.halve_finalist_4 || '');
      setMeesteGoalsLand(data.topschutter || '');
      setBesteVerdedigingLand(data.beste_keeper || ''); 
      setEindstation(data.eindstation_belgie || '');
      setTotaalGeel(data.totaal_gele_kaarten?.toString() || '');
      setTotaalRood(data.totaal_rode_kaarten?.toString() || '');
    }
  };

  const haalAlleAntwoordenOp = async () => {
    const { data } = await supabase.from('toernooi_voorspellingen').select('*, spelers(naam)');
    if (data) setAlleAntwoorden(data);
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

  // TELLERS BEREKENING
  const tellersData = useMemo(() => {
    let totaleGoals = 0; let totaleGeleKaarten = 0; let totaleRodeKaarten = 0;
    const teamGoalsVoor: Record<string, number> = {};
    const teamGoalsTegen: Record<string, number> = {};

    matchen.forEach(m => {
      if (m.thuis_score !== null && m.uit_score !== null) {
        totaleGoals += (m.thuis_score + m.uit_score);
        totaleGeleKaarten += (m.gele_kaarten || 0);
        totaleRodeKaarten += (m.rode_kaarten || 0);
        teamGoalsVoor[m.thuisploeg] = (teamGoalsVoor[m.thuisploeg] || 0) + m.thuis_score;
        teamGoalsVoor[m.uitploeg] = (teamGoalsVoor[m.uitploeg] || 0) + m.uit_score;
        teamGoalsTegen[m.thuisploeg] = (teamGoalsTegen[m.thuisploeg] || 0) + m.uit_score;
        teamGoalsTegen[m.uitploeg] = (teamGoalsTegen[m.uitploeg] || 0) + m.thuis_score;
      }
    });

    const meestScorendTeam = Object.entries(teamGoalsVoor).sort((a, b) => b[1] - a[1])[0] || ['N.v.t.', 0];
    const minstTegenTeam = Object.entries(teamGoalsTegen).sort((a, b) => a[1] - b[1])[0] || ['N.v.t.', 0];

    return { totaleGoals, totaleGeleKaarten, totaleRodeKaarten, meestScorendTeam, minstTegenTeam };
  }, [matchen]);

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@600;800;900&display=swap');
        :root { --crayola: #3772FF; --magenta: #F038FF; --lime: #E2EF70; --aqua: #70E4EF; --rose: #EF709D; }
        html, body { margin: 0; padding: 0; width: 100%; min-height: 100%; background: linear-gradient(135deg, var(--crayola), var(--aqua)); font-family: 'Nunito', sans-serif; color: #111827; }
        .main-container { padding: 25px 15px 80px 15px; display: flex; flex-direction: column; align-items: center; box-sizing: border-box; }
        .glass-card { background: rgba(255, 255, 255, 0.96); padding: 25px 20px; border-radius: 24px; width: 100%; max-width: 500px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); border: 3px solid rgba(255,255,255,0.5); }
        .title { font-family: 'Bebas Neue', sans-serif; font-size: 4.5rem; text-align: center; color: #FFF; line-height: 1; text-shadow: 3px 3px 0px var(--magenta); margin: 0; }
        
        .timer { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; }
        .timer-box { background: var(--magenta); color: #FFF; padding: 8px 12px; border-radius: 12px; text-align: center; font-weight: 900; line-height: 1.1; box-shadow: 0 4px 10px rgba(240, 56, 255, 0.3); }
        .timer-value { font-size: 1.5rem; }
        .timer-label { font-size: 0.6rem; text-transform: uppercase; opacity: 0.8; }

        .tab-container { display: flex; background: #F0F4F8; border-radius: 16px; padding: 5px; margin-bottom: 20px; overflow-x: auto; scrollbar-width: none; gap: 5px; }
        .tab { flex: 1; min-width: auto; text-align: center; padding: 12px 10px; font-size: 0.65rem; font-weight: 800; border-radius: 12px; cursor: pointer; color: #6C757D; position: relative; white-space: nowrap; }
        .tab.active { background: var(--crayola); color: #FFF; }
        .unread-badge { position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; background: var(--rose); border-radius: 50%; }

        .filter-scroll { display: flex; gap: 8px; margin-bottom: 15px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none; }
        .filter-chip { padding: 8px 14px; border-radius: 20px; background: #E9ECEF; font-size: 0.75rem; font-weight: 800; cursor: pointer; border: 2px solid transparent; white-space: nowrap; color: #495057; }
        .filter-chip.active { border-color: var(--crayola); color: var(--crayola); background: #eef2ff; }
        .filter-chip.urgent { background: #ffe3e3; color: #e03131; border-color: #ffa8a8; }
        .filter-chip.urgent.active { background: #e03131; color: #fff; border-color: #c92a2a; }

        .match-card { background: #FFF; border-radius: 16px; margin-bottom: 12px; border: 2px solid #E9ECEF; overflow: hidden; transition: 0.3s border-color, 0.3s box-shadow; position: relative; }
        .match-card.is-saved { border-color: #2ECC40; box-shadow: 0 0 15px rgba(46, 204, 64, 0.3); }
        .match-header { background: #F8F9FA; padding: 10px 15px; font-size: 0.7rem; font-weight: 800; color: #ADB5BD; display: flex; justify-content: space-between; align-items: center; }
        .match-body { display: flex; align-items: center; padding: 15px; }
        .team-naam { font-weight: 900; flex: 1; text-align: center; font-size: 0.95rem; }
        .score-invoer { width: 45px; height: 50px; text-align: center; font-size: 1.5rem; font-family: 'Bebas Neue', sans-serif; border-radius: 12px; border: 2px solid #DEE2E6; outline: none; }
        
        .joker-btn { width: 38px; height: 38px; border-radius: 50%; border: 2px solid #DEE2E6; background: #FFF; font-size: 1.2rem; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; filter: grayscale(1); opacity: 0.5; }
        .joker-btn.active { background: #FFD700; border-color: #FFA500; filter: grayscale(0); opacity: 1; transform: scale(1.15); box-shadow: 0 0 15px rgba(255, 215, 0, 0.6); }

        .save-match-btn { position: absolute; right: 15px; bottom: 15px; background: var(--crayola); color: white; border: none; border-radius: 10px; width: 40px; height: 40px; font-size: 1rem; cursor: pointer; font-weight: 900; display: flex; align-items: center; justify-content: center; }
        .save-match-btn.saved { background: #2ECC40; }

        .ranking-item { background: #FFF; border-radius: 16px; padding: 15px; margin-bottom: 12px; border: 2px solid #E9ECEF; display: flex; align-items: center; gap: 15px; }
        .ranking-pos { font-family: 'Bebas Neue'; font-size: 1.8rem; color: var(--crayola); width: 30px; text-align: center; }
        .ranking-main { flex: 1; }
        .ranking-naam { font-weight: 900; text-transform: uppercase; display: flex; align-items: center; gap: 6px; font-size: 1.1rem; }
        .ranking-stats { font-size: 0.75rem; color: #6C757D; font-weight: 800; margin-top: 4px; }
        .ranking-score { font-family: 'Bebas Neue'; font-size: 2.5rem; color: var(--magenta); }

        .teller-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; }
        .teller-card { background: var(--crayola); color: white; padding: 20px; border-radius: 16px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .teller-val { font-family: 'Bebas Neue'; font-size: 3rem; line-height: 1; }
        .teller-label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-top: 5px; opacity: 0.9; }

        .chat-container { height: 350px; overflow-y: auto; padding-right: 5px; margin-bottom: 15px; }
        .chat-bericht { background: #F8F9FA; padding: 12px; border-radius: 16px; border-bottom-left-radius: 4px; margin-bottom: 10px; font-size: 0.9rem; font-weight: 700; border: 1px solid #E9ECEF; }
        .chat-eigen { background: var(--lime); border-color: #d4e062; border-bottom-left-radius: 16px; border-bottom-right-radius: 4px; }

        .input-group { margin-bottom: 15px; text-align: left; }
        .input-label { display: block; font-size: 0.75rem; font-weight: 900; margin-bottom: 5px; color: #495057; text-transform: uppercase; }
        .full-input { width: 100%; padding: 15px; border-radius: 15px; border: 2px solid #E9ECEF; outline: none; box-sizing: border-box; font-weight: 800; font-size: 1rem; }
        .btn-primary { width: 100%; padding: 18px; border-radius: 16px; background: var(--magenta); color: #FFF; border: none; font-weight: 900; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 15px rgba(240, 56, 255, 0.3); transition: 0.2s; }
        .btn-primary:active { transform: translateY(2px); }

        .autocomplete-dropdown { position: absolute; z-index: 100; background: #FFF; width: 100%; border: 2px solid #E9ECEF; border-radius: 12px; max-height: 200px; overflow-y: auto; padding: 0; list-style: none; margin-top: 5px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .autocomplete-item { padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #F8F9FA; font-weight: 800; font-size: 0.9rem; }
        .autocomplete-item:hover { background: #F8F9FA; color: var(--crayola); }

        .antwoord-sectie { background: #F8F9FA; border-radius: 16px; padding: 15px; margin-bottom: 15px; border: 1px solid #E9ECEF; }
        .antwoord-header { font-weight: 900; color: var(--crayola); margin-bottom: 10px; font-size: 1.1rem; text-transform: uppercase; border-bottom: 2px solid #E9ECEF; padding-bottom: 5px; }
        .antwoord-rij { display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 800; padding: 6px 0; border-bottom: 1px solid #eee; }
        .antwoord-rij:last-child { border-bottom: none; }
        .antwoord-waarde { color: var(--magenta); }
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
              <div className={`tab ${actieveTab === 'antwoorden' ? 'active' : ''}`} onClick={() => veranderTab('antwoorden')}>ANTWOORDEN</div>
              <div className={`tab ${actieveTab === 'ranking' ? 'active' : ''}`} onClick={() => veranderTab('ranking')}>RANKING</div>
              <div className={`tab ${actieveTab === 'tellers' ? 'active' : ''}`} onClick={() => veranderTab('tellers')}>TELLERS</div>
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
                  <p style={{textAlign:'center', fontWeight:800, color:'#ADB5BD', margin:'40px 0'}}>Alle wedstrijden in deze ronde zijn ingevuld!</p>
                ) : (
                  gefilterdeMatchen.map(m => {
                    const v = matchVoorspellingen[m.id] || { thuis: '', uit: '', joker: false };
                    const saveStatus = matchSaveStatus[m.id] || 'idle';
                    
                    return (
                      <div key={m.id} className={`match-card ${saveStatus === 'saved' ? 'is-saved' : ''}`}>
                        <div className="match-header">
                          <span>{m.ronde} • {new Date(m.datum).toLocaleDateString('nl-BE', {day:'2-digit', month:'short'})}</span>
                          <button className={`joker-btn ${v.joker ? 'active' : ''}`} onClick={() => toggleJoker(m.id)}>🌟</button>
                        </div>
                        <div className="match-body" style={{paddingBottom: (v.thuis !== '' && v.uit !== '') ? '40px' : '15px'}}>
                          <span className="team-naam">{m.thuisploeg}</span>
                          <input className="score-invoer" type="tel" value={v.thuis} onChange={e => handleScore(m.id, 'thuis', e.target.value)} disabled={isGesloten} />
                          <span style={{margin:'0 10px', fontWeight:900, color:'#ADB5BD'}}>-</span>
                          <input className="score-invoer" type="tel" value={v.uit} onChange={e => handleScore(m.id, 'uit', e.target.value)} disabled={isGesloten} />
                          <span className="team-naam">{m.uitploeg}</span>
                        </div>
                        
                        {!isGesloten && v.thuis !== '' && v.uit !== '' && (
                          <button 
                            className={`save-match-btn ${saveStatus === 'saved' ? 'saved' : ''}`} 
                            onClick={() => slaMatchOp(m.id)}
                          >
                            {saveStatus === 'saving' ? '⏳' : saveStatus === 'saved' ? '✅' : '💾'}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {actieveTab === 'bonus' && (
              <div>
                <div className="input-group">
                  <label className="input-label">Wereldkampioen?</label>
                  <Autocomplete options={WK_LANDEN} value={winnaar} onChange={setWinnaar} placeholder="Typ een land..." disabled={isGesloten} />
                </div>

                <div className="input-group">
                  <label className="input-label" style={{color:'var(--magenta)'}}>Welke 4 landen bereiken de Halve Finale?</label>
                  <div style={{display:'flex', flexDirection:'column', gap:8}}>
                    <Autocomplete options={WK_LANDEN} value={hf1} onChange={setHf1} placeholder="Halve finalist 1..." disabled={isGesloten} />
                    <Autocomplete options={WK_LANDEN} value={hf2} onChange={setHf2} placeholder="Halve finalist 2..." disabled={isGesloten} />
                    <Autocomplete options={WK_LANDEN} value={hf3} onChange={setHf3} placeholder="Halve finalist 3..." disabled={isGesloten} />
                    <Autocomplete options={WK_LANDEN} value={hf4} onChange={setHf4} placeholder="Halve finalist 4..." disabled={isGesloten} />
                  </div>
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
                <div className="input-group">
                  <label className="input-label">Totaal aantal gele kaarten?</label>
                  <input className="full-input" type="number" value={totaalGeel} onChange={e => setTotaalGeel(e.target.value)} disabled={isGesloten} />
                </div>
                <div className="input-group">
                  <label className="input-label">Totaal aantal rode kaarten?</label>
                  <input className="full-input" type="number" value={totaalRood} onChange={e => setTotaalRood(e.target.value)} disabled={isGesloten} />
                </div>
                {!isGesloten && (
                  <>
                    <button className="btn-primary" onClick={slaBonusOp}>BONUS OPSLAAN</button>
                    <p style={{textAlign:'center', fontWeight:900, color:'var(--crayola)'}}>{opslaanStatus}</p>
                  </>
                )}
              </div>
            )}

            {actieveTab === 'antwoorden' && (
              <div>
                {!isGesloten ? (
                  <div style={{textAlign:'center', padding:'40px 20px', background:'#F8F9FA', borderRadius:16, border:'2px dashed #ADB5BD'}}>
                    <div style={{fontSize:'3.5rem', marginBottom:15}}>🔒</div>
                    <h3 style={{color:'#111827', margin:0, fontFamily:'Bebas Neue', fontSize:'2rem'}}>Top Secret</h3>
                    <p style={{color:'#6C757D', fontSize:'0.85rem', fontWeight:800, marginTop:10}}>
                      Om afkijken te voorkomen, blijven de antwoorden van je vrienden verborgen tot de allereerste WK-match is afgetrapt (11 Juni 2026).
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="antwoord-sectie">
                      <div className="antwoord-header">🏆 Wereldkampioen</div>
                      {alleAntwoorden.map(v => <div key={v.id} className="antwoord-rij"><span>{v.spelers?.naam}</span> <span className="antwoord-waarde">{v.winnaar || '-'}</span></div>)}
                    </div>

                    <div className="antwoord-sectie">
                      <div className="antwoord-header">⚔️ De 4 Halve Finalisten</div>
                      {alleAntwoorden.map(v => (
                        <div key={v.id} className="antwoord-rij" style={{flexDirection:'column'}}>
                          <span style={{color:'var(--crayola)', marginBottom:4}}>{v.spelers?.naam}</span> 
                          <span className="antwoord-waarde" style={{fontSize:'0.8rem'}}>{[v.halve_finalist_1, v.halve_finalist_2, v.halve_finalist_3, v.halve_finalist_4].filter(Boolean).join(' • ') || '-'}</span>
                        </div>
                      ))}
                    </div>

                    <div className="antwoord-sectie">
                      <div className="antwoord-header">⚽ Meeste Goals Voor</div>
                      {alleAntwoorden.map(v => <div key={v.id} className="antwoord-rij"><span>{v.spelers?.naam}</span> <span className="antwoord-waarde">{v.topschutter || '-'}</span></div>)}
                    </div>

                    <div className="antwoord-sectie">
                      <div className="antwoord-header">🛡️ Beste Verdediging (Minst Tegen)</div>
                      {alleAntwoorden.map(v => <div key={v.id} className="antwoord-rij"><span>{v.spelers?.naam}</span> <span className="antwoord-waarde">{v.beste_keeper || '-'}</span></div>)}
                    </div>

                    <div className="antwoord-sectie">
                      <div className="antwoord-header">🍟 Eindstation België</div>
                      {alleAntwoorden.map(v => <div key={v.id} className="antwoord-rij"><span>{v.spelers?.naam}</span> <span className="antwoord-waarde">{v.eindstation_belgie || '-'}</span></div>)}
                    </div>

                    <div className="antwoord-sectie" style={{display:'flex', gap:10, padding:0, background:'transparent', border:'none'}}>
                      <div style={{flex:1, background:'#F8F9FA', borderRadius:16, padding:15, border:'1px solid #E9ECEF'}}>
                        <div className="antwoord-header" style={{color:'#EAB308'}}>🟨 Geel</div>
                        {alleAntwoorden.map(v => <div key={v.id} className="antwoord-rij"><span>{v.spelers?.naam}</span> <span>{v.totaal_gele_kaarten || '-'}</span></div>)}
                      </div>
                      <div style={{flex:1, background:'#F8F9FA', borderRadius:16, padding:15, border:'1px solid #E9ECEF'}}>
                        <div className="antwoord-header" style={{color:'#EF4444'}}>🟥 Rood</div>
                        {alleAntwoorden.map(v => <div key={v.id} className="antwoord-rij"><span>{v.spelers?.naam}</span> <span>{v.totaal_rode_kaarten || '-'}</span></div>)}
                      </div>
                    </div>
                  </div>
                )}
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

            {actieveTab === 'tellers' && (
              <div>
                <div className="teller-grid">
                  <div className="teller-card" style={{gridColumn: 'span 2'}}>
                    <div className="teller-val">{tellersData.totaleGoals}</div>
                    <div className="teller-label">Totaal Aantal Doelpunten</div>
                  </div>
                  
                  <div className="teller-card" style={{background: '#FFD43B', color: '#111827'}}>
                    <div className="teller-val">{tellersData.totaleGeleKaarten}</div>
                    <div className="teller-label">Gele Kaarten</div>
                  </div>
                  
                  <div className="teller-card" style={{background: '#FA5252'}}>
                    <div className="teller-val">{tellersData.totaleRodeKaarten}</div>
                    <div className="teller-label">Rode Kaarten</div>
                  </div>

                  <div className="teller-card" style={{background: '#40C057'}}>
                    <div className="teller-val" style={{fontSize: '2rem'}}>{tellersData.meestScorendTeam[1]} goals</div>
                    <div className="teller-label">Meest Scorend ({tellersData.meestScorendTeam[0]})</div>
                  </div>

                  <div className="teller-card" style={{background: '#228BE6'}}>
                    <div className="teller-val" style={{fontSize: '2rem'}}>{tellersData.minstTegenTeam[1]} goals</div>
                    <div className="teller-label">Minst Tegen ({tellersData.minstTegenTeam[0]})</div>
                  </div>
                </div>
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