'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { WK_LANDEN } from '../lib/data';

const DEADLINE_DATE = new Date('2026-06-11T21:00:00+02:00').getTime();

// --- HULP COMPONENT: AUTOCOMPLETE ---
const Autocomplete = ({ options, value, onChange, placeholder, disabled }: any) => {
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
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input className="full-input" value={value} onChange={(e) => { onChange(e.target.value); setIsOpen(true); }} onFocus={() => setIsOpen(true)} disabled={disabled} placeholder={placeholder} />
      {isOpen && !disabled && (
        <ul className="autocomplete-dropdown">
          {filtered.length > 0 ? filtered.map((opt: string) => (
            <li key={opt} className="autocomplete-item" onClick={() => { onChange(opt); setIsOpen(false); }}>{opt}</li>
          )) : <li className="autocomplete-item" style={{ color: '#F038FF' }}>Onbekend...</li>}
        </ul>
      )}
    </div>
  );
};

export default function Home() {
  // --- AUTH & NAV ---
  const [ontgrendelNaam, setOntgrendelNaam] = useState('');
  const [invoerCode, setInvoerCode] = useState('');
  const [status, setStatus] = useState('');
  const [actieveSpeler, setActieveSpeler] = useState<any>(null);
  const [alleSpelers, setAlleSpelers] = useState<any[]>([]); 
  const [actieveTab, setActieveTab] = useState('matchen');
  const [filterRonde, setFilterRonde] = useState('Alle');
  const [ongelezenBerichten, setOngelezenBerichten] = useState(false);
  const actieveTabRef = useRef(actieveTab);

  // --- ADMIN & INFO ---
  const [infoOpen, setInfoOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const isAdmin = actieveSpeler?.naam?.toLowerCase() === 'jorden ricour'.toLowerCase();

  // --- MATCHES & VOORSPELLINGEN ---
  const [matchen, setMatchen] = useState<any[]>([]);
  const [matchVoorspellingen, setMatchVoorspellingen] = useState<Record<number, {thuis: string, uit: string, joker: boolean}>>({});
  const [alleMatchVoorspellingen, setAlleMatchVoorspellingen] = useState<any[]>([]); 
  const [matchSaveStatus, setMatchSaveStatus] = useState<Record<number, 'idle' | 'saving' | 'saved'>>({});
  const [expandedMatchId, setExpandedMatchId] = useState<number | null>(null);
  const saveTimeoutRef = useRef<Record<number, any>>({});

  // --- BONUS ---
  const [winnaar, setWinnaar] = useState('');
  const [hf, setHf] = useState(['', '', '', '']);
  const [meesteGoalsLand, setMeesteGoalsLand] = useState('');
  const [besteVerdedigingLand, setBesteVerdedigingLand] = useState('');
  const [eindstation, setEindstation] = useState('');
  const [totaalGeel, setTotaalGeel] = useState('');
  const [totaalRood, setTotaalRood] = useState('');
  const [alleToernooiV, setAlleToernooiV] = useState<any[]>([]);
  const [opslaanStatus, setOpslaanStatus] = useState('');

  // --- RANKING & CHAT ---
  const [klassement, setKlassement] = useState<any[]>([]);
  const [chatBerichten, setChatBerichten] = useState<any[]>([]);
  const [nieuwBericht, setNieuwBericht] = useState('');
  const chatEindeRef = useRef<HTMLDivElement>(null);

  // --- TIMER ---
  const [nu, setNu] = useState(new Date().getTime());
  const [tijdOver, setTijdOver] = useState({ dagen: 0, uren: 0, minuten: 0, seconden: 0 });
  const [isGesloten, setIsGesloten] = useState(false); 
  const [showConfetti, setShowConfetti] = useState(false);

  // 1. INITIALISEREN
  useEffect(() => {
    actieveTabRef.current = actieveTab;
    const opgeslagenId = localStorage.getItem('wk_speler_id');
    haalSpelersOp(opgeslagenId);
    
    const klokInterval = setInterval(() => {
      const nuTijd = new Date().getTime();
      setNu(nuTijd); 
      const verschil = DEADLINE_DATE - nuTijd;
      if (verschil <= 0) setIsGesloten(true);
      else {
        setTijdOver({
          dagen: Math.floor(verschil / (1000 * 60 * 60 * 24)),
          uren: Math.floor((verschil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minuten: Math.floor((verschil % (1000 * 60 * 60)) / (1000 * 60)),
          seconden: Math.floor((verschil % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    const chatSub = supabase.channel('chat').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'kleedkamer' }, () => {
      haalChatOp();
      if (actieveTabRef.current !== 'kleedkamer') setOngelezenBerichten(true);
    }).subscribe();

    return () => { clearInterval(klokInterval); supabase.removeChannel(chatSub); };
  }, []);

  // 2. DATA LADEN BIJ TABWISSEL
  useEffect(() => {
    if (actieveSpeler) {
      if (actieveTab === 'matchen') haalMatchenOp();
      if (actieveTab === 'bonus') haalToernooiVoorspellingOp();
      if (actieveTab === 'ranking') haalKlassementOp();
      if (actieveTab === 'kleedkamer') haalChatOp();
      if (actieveTab === 'antwoorden') haalAlleAntwoordenOp();
    }
  }, [actieveSpeler, actieveTab]);

  const haalSpelersOp = async (id?: string | null) => {
    const { data } = await supabase.from('spelers').select('*').order('created_at', { ascending: true });
    if (data) {
      setAlleSpelers(data);
      if (id) {
        const gev = data.find(s => s.id.toString() === id);
        if (gev) setActieveSpeler(gev);
      }
    }
  };

  const haalChatOp = async () => {
    const { data } = await supabase.from('kleedkamer').select('*, spelers(naam)').order('created_at', { ascending: true });
    if (data) setChatBerichten(data);
  };

  const syncMetSpreadsheet = async () => {
    if (!isAdmin) return;
    setSyncStatus('⏳ Bezig...');
    try {
      const res = await fetch('/api/sync?code=geheim123');
      const data = await res.json();
      setSyncStatus(data.succes ? '✅ Klaar' : '❌ Fout');
      if (data.succes) { haalMatchenOp(); haalKlassementOp(); }
    } catch (e) { setSyncStatus('❌ Error'); }
    setTimeout(() => setSyncStatus(''), 3000);
  };

  const haalMatchenOp = async () => {
    const { data: matchenData } = await supabase.from('matchen').select('*').order('id', { ascending: true });
    if (matchenData) setMatchen(matchenData);
    const { data: vData } = await supabase.from('match_voorspellingen').select('*, spelers(naam)');
    if (vData) {
      setAlleMatchVoorspellingen(vData); 
      const mijnV = vData.filter(v => v.speler_id === actieveSpeler.id);
      const obj: any = {};
      mijnV.forEach(v => {
        obj[v.match_id] = { thuis: v.thuis_score?.toString() || '', uit: v.uit_score?.toString() || '', joker: v.gouden_bal };
      });
      setMatchVoorspellingen(stateObj => ({...stateObj, ...obj}));
    }
  };

  const triggerAutoSave = (mId: number, data: { thuis: string, uit: string, joker: boolean }) => {
    if (data.thuis === '' || data.uit === '') return;
    if (saveTimeoutRef.current[mId]) clearTimeout(saveTimeoutRef.current[mId]);
    setMatchSaveStatus(prev => ({ ...prev, [mId]: 'saving' }));
    saveTimeoutRef.current[mId] = setTimeout(async () => {
      const { error } = await supabase.from('match_voorspellingen').upsert({
        speler_id: actieveSpeler.id, match_id: mId, thuis_score: parseInt(data.thuis), uit_score: parseInt(data.uit), gouden_bal: data.joker
      }, { onConflict: 'speler_id, match_id' });
      setMatchSaveStatus(prev => ({ ...prev, [mId]: error ? 'idle' : 'saved' }));
      if (!error) haalMatchenOp(); 
    }, 800); 
  };

  const handleScore = (mId: number, veld: 'thuis'|'uit', waarde: string) => {
    const v = matchVoorspellingen[mId] || { thuis: '', uit: '', joker: false };
    const newData = { ...v, [veld]: waarde };
    setMatchVoorspellingen(prev => ({ ...prev, [mId]: newData }));
    triggerAutoSave(mId, newData);
  };

  const toggleJoker = (mId: number) => {
    setMatchVoorspellingen(prev => {
      const isNuJoker = prev[mId]?.joker || false;
      const nieuwStaat = { ...prev };
      Object.keys(nieuwStaat).forEach(key => { if (nieuwStaat[Number(key)]) nieuwStaat[Number(key)].joker = false; });
      const newData = { ...prev[mId], joker: !isNuJoker, thuis: prev[mId]?.thuis || '', uit: prev[mId]?.uit || '' };
      nieuwStaat[mId] = newData;
      triggerAutoSave(mId, newData);
      return nieuwStaat;
    });
  };

  const slaBonusOp = async () => {
    setOpslaanStatus('Bezig...');
    await supabase.from('toernooi_voorspellingen').upsert({
      speler_id: actieveSpeler.id, winnaar, halve_finalist_1: hf[0], halve_finalist_2: hf[1], halve_finalist_3: hf[2], halve_finalist_4: hf[3],
      topschutter: meesteGoalsLand, beste_keeper: besteVerdedigingLand, eindstation_belgie: eindstation,
      totaal_gele_kaarten: parseInt(totaalGeel) || 0, totaal_rode_kaarten: parseInt(totaalRood) || 0
    }, { onConflict: 'speler_id' });
    setOpslaanStatus('Opgeslagen! 🌟');
    setShowConfetti(true);
    setTimeout(() => { setShowConfetti(false); setOpslaanStatus(''); }, 3000);
  };

  const haalToernooiVoorspellingOp = async () => {
    const { data } = await supabase.from('toernooi_voorspellingen').select('*').eq('speler_id', actieveSpeler.id).single();
    if (data) {
      setWinnaar(data.winnaar || ''); 
      setHf([data.halve_finalist_1 || '', data.halve_finalist_2 || '', data.halve_finalist_3 || '', data.halve_finalist_4 || '']);
      setMeesteGoalsLand(data.topschutter || '');
      setBesteVerdedigingLand(data.beste_keeper || ''); 
      setEindstation(data.eindstation_belgie || '');
      setTotaalGeel(data.totaal_gele_kaarten?.toString() || '');
      setTotaalRood(data.totaal_rode_kaarten?.toString() || '');
    }
  };

  const haalAlleAntwoordenOp = async () => {
    const { data } = await supabase.from('toernooi_voorspellingen').select('*, spelers(naam)');
    if (data) setAlleToernooiV(data);
  };

  const haalKlassementOp = async () => {
    const { data: s } = await supabase.from('spelers').select('*');
    const { data: m } = await supabase.from('matchen').select('*');
    const { data: v } = await supabase.from('match_voorspellingen').select('*');
    if (s && m && v) {
      const stats = s.map(sp => {
        let p = 0; let ex = 0; let wc = 0; let f = 0; let jk = false;
        const spV = v.filter(vo => vo.speler_id === sp.id);
        spV.forEach(vo => {
          if (vo.gouden_bal) jk = true;
          const match = m.find(ma => ma.id === vo.match_id);
          if (match && match.thuis_score !== null) {
            const fac = vo.gouden_bal ? 2 : 1;
            const echt = match.thuis_score > match.uit_score ? 1 : match.thuis_score < match.uit_score ? 2 : 0;
            const pred = vo.thuis_score > vo.uit_score ? 1 : vo.thuis_score < vo.uit_score ? 2 : 0;
            if (vo.thuis_score === match.thuis_score && vo.uit_score === match.uit_score) { p += (5 * fac); ex++; }
            else if (echt === pred) { p += (3 * fac); wc++; }
            else f++;
          }
        });
        return { ...sp, totaal_score: p, exact: ex, winnaarCorrect: wc, fout: f, jokerIngezet: jk };
      });
      setKlassement(stats.sort((a, b) => b.totaal_score - a.totaal_score));
    }
  };

  const toggleBetaald = async (spelerId: number, huidigeStatus: boolean) => {
    if (!isAdmin) return;
    await supabase.from('spelers').update({ betaald: !huidigeStatus }).eq('id', spelerId);
    haalKlassementOp();
  };

  const verstuurChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nieuwBericht.trim()) return;
    const { error } = await supabase.from('kleedkamer').insert([{ speler_id: actieveSpeler.id, bericht: nieuwBericht.trim() }]);
    if (!error) { setNieuwBericht(''); haalChatOp(); }
  };

  // --- COMPUTED DATA ---
  const tellersData = useMemo(() => {
    let g = 0; let y = 0; let r = 0;
    const v: any = {}; const t: any = {};
    matchen.forEach(m => {
      if (m.thuis_score !== null) {
        g += (m.thuis_score + m.uit_score); y += (m.gele_kaarten || 0); r += (m.rode_kaarten || 0);
        v[m.thuisploeg] = (v[m.thuisploeg] || 0) + m.thuis_score; v[m.uitploeg] = (v[m.uitploeg] || 0) + m.uit_score;
        t[m.thuisploeg] = (t[m.thuisploeg] || 0) + m.uit_score; t[m.uitploeg] = (t[m.uitploeg] || 0) + m.thuis_score;
      }
    });
    const mS = Object.entries(v).sort((a:any, b:any) => b[1] - a[1])[0] || ['-', 0];
    const mT = Object.entries(t).sort((a:any, b:any) => a[1] - b[1])[0] || ['-', 0];
    return { g, y, r, mS, mT };
  }, [matchen]);

  const gefilterdeMatchen = useMemo(() => {
    let basis = matchen;
    if (filterRonde === 'Nog in te vullen') return basis.filter(m => (!matchVoorspellingen[m.id] || matchVoorspellingen[m.id].thuis === '') && (nu < new Date(m.datum).getTime()));
    if (filterRonde !== 'Alle') basis = basis.filter(m => m.ronde === filterRonde);
    return basis;
  }, [matchen, filterRonde, matchVoorspellingen, nu]);

  return (
    <main className="main-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@600;800;900&display=swap');
        :root { --crayola: #3772FF; --magenta: #F038FF; --rose: #EF709D; --lime: #E2EF70; --aqua: #70E4EF; }

        html, body {
          margin: 0; padding: 0; width: 100%; min-height: 100%; font-family: 'Nunito', sans-serif; color: #111827;
          background: radial-gradient(circle at 30% 20%, var(--rose), transparent 30%),
                      radial-gradient(circle at 70% 80%, var(--lime), transparent 30%),
                      linear-gradient(135deg, var(--crayola), var(--aqua));
          background-size: 200% 200%; animation: background-fade 10s ease-in-out infinite; overflow-x: hidden;
        }

        body::before, body::after { content: ''; position: fixed; border-radius: 50%; filter: blur(50px); opacity: 0.5; z-index: -1; pointer-events: none; }
        body::before { width: 400px; height: 400px; top: -100px; left: -100px; background: var(--magenta); animation: blob-movement-a 12s linear infinite; }
        body::after { width: 350px; height: 350px; bottom: -80px; right: -80px; background: var(--aqua); animation: blob-movement-b 15s linear infinite; }

        .glass-card {
          background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(15px); padding: 20px; border-radius: 24px;
          width: 100%; max-width: 500px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); border: 3px solid rgba(255, 255, 255, 0.4); margin-bottom: 20px;
        }

        .title { font-family: 'Bebas Neue', sans-serif; font-size: 4.5rem; text-align: center; color: #FFF; line-height: 1; text-shadow: 3px 3px 0px var(--magenta); margin: 0; animation: title-glow 3s linear infinite; }
        
        /* MENU - FLOATING DOCK */
        .tab-container {
          display: flex; background: rgba(17, 24, 39, 0.85); backdrop-filter: blur(15px); border-radius: 22px; padding: 6px;
          margin-bottom: 25px; overflow-x: auto; scrollbar-width: none; gap: 6px; border: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky; top: 10px; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .tab-container::-webkit-scrollbar { display: none; }

        .tab {
          flex: 1; min-width: 85px; text-align: center; padding: 10px 5px; font-size: 0.6rem; font-weight: 900;
          border-radius: 16px; cursor: pointer; color: #9CA3AF; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; flex-direction: column; align-items: center; gap: 4px; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .tab-icon { font-size: 1.3rem; transition: transform 0.3s ease; }
        .tab.active { background: var(--crayola); color: #FFF; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(55, 114, 255, 0.4); }
        .tab.active .tab-icon { transform: scale(1.2); }

        .unread-badge {
          position: absolute; top: 8px; right: 15px; width: 8px; height: 8px; background: var(--rose);
          border-radius: 50%; box-shadow: 0 0 10px var(--rose); animation: pulse-red 2s infinite;
        }

        /* INFO & ADMIN */
        .info-toggle-btn { width: 100%; background: rgba(255,255,255,0.9); border: 2px solid var(--crayola); color: var(--crayola); padding: 12px; border-radius: 12px; font-weight: 900; font-size: 0.8rem; cursor: pointer; text-transform: uppercase; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
        .info-content { background: rgba(255,255,255,0.9); padding: 15px; border-radius: 12px; font-size: 0.8rem; font-weight: 700; margin-bottom: 20px; border-left: 4px solid var(--magenta); line-height: 1.5; }
        .admin-btn { background: #111827; color: #fff; border: none; padding: 10px 20px; borderRadius: 12px; font-weight: 900; cursor: pointer; fontSize: 0.8rem; margin: 0 auto 15px; display: block; }

        /* MATCH CARDS */
        .match-card { background: rgba(255, 255, 255, 0.95); border-radius: 16px; margin-bottom: 12px; border: 3px solid #E9ECEF; overflow: hidden; position: relative; }
        .match-header { background: var(--lime); padding: 10px 15px; font-size: 0.7rem; font-weight: 900; color: #111827; display: flex; justify-content: space-between; align-items: center; }
        .match-body { display: flex; align-items: center; padding: 15px; }
        .score-invoer { width: 45px; height: 50px; text-align: center; font-size: 1.5rem; font-family: 'Bebas Neue'; border-radius: 12px; border: 2px solid #DEE2E6; outline: none; }
        .save-indicator { position: absolute; right: 50px; top: 10px; font-size: 0.65rem; font-weight: 900; opacity: 0; transition: 0.3s; }
        .save-indicator.saving { opacity: 1; color: var(--magenta); }
        .save-indicator.saved { opacity: 1; color: #2ECC40; }
        .joker-btn { width: 38px; height: 38px; border-radius: 50%; border: 2px solid #DEE2E6; background: #FFF; font-size: 1.2rem; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; filter: grayscale(1); opacity: 0.5; }
        .joker-btn.active { background: #FFD700; border-color: #FFA500; filter: grayscale(0); opacity: 1; transform: scale(1.15); box-shadow: 0 0 15px rgba(255, 215, 0, 0.6); }

        /* RANKING */
        .ranking-item { background: rgba(255, 255, 255, 0.9); border-radius: 16px; padding: 15px; margin-bottom: 12px; border: 2px solid #E9ECEF; display: flex; align-items: center; gap: 15px; }
        .rank-badge { width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue'; font-size: 1.8rem; color: white; background: var(--crayola); }
        .rank-1 { border-color: #FFD700; background: linear-gradient(135deg, rgba(255,215,0,0.1), #fff); }
        .rank-1 .rank-badge { background: #FFD700; color: #111827; }
        .betaal-badge { font-size: 0.6rem; padding: 3px 6px; border-radius: 6px; font-weight: 900; margin-top: 5px; display: inline-block; }
        .is-betaald { background: #d3f9d8; color: #2b8a3e; }
        .niet-betaald { background: #ffe3e3; color: #e03131; }

        /* INPUTS & BUTTONS */
        .full-input { width: 100%; padding: 15px; border-radius: 15px; border: 2px solid #E9ECEF; font-weight: 800; font-size: 1rem; margin-bottom: 10px; }
        .btn-primary { width: 100%; padding: 18px; border-radius: 16px; background: var(--magenta); color: #FFF; border: none; font-weight: 900; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 15px rgba(240, 56, 255, 0.3); }

        /* TELLER GRID */
        .teller-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .teller-card { background: var(--crayola); color: white; padding: 20px; border-radius: 16px; text-align: center; }
        .teller-val { font-family: 'Bebas Neue'; font-size: 3rem; line-height: 1; }

        /* ANIMATIONS */
        @keyframes background-fade { 0%, 100% { background-position: 0% 0%; } 50% { background-position: 100% 100%; } }
        @keyframes blob-movement-a { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(50px, 80px) scale(1.1); } }
        @keyframes blob-movement-b { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-40px, -60px) scale(0.9); } }
        @keyframes title-glow { 0%, 100% { text-shadow: 3px 3px 0px var(--magenta); } 50% { text-shadow: 3px 3px 20px rgba(240, 56, 255, 0.8), 3px 3px 0px var(--magenta); } }
        .main-container { padding: 25px 15px 80px 15px; display: flex; flex-direction: column; align-items: center; box-sizing: border-box; }
      `}</style>

      {showConfetti && <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',zIndex:999,textAlign:'center',fontSize:'5rem'}}>🎉🌟⚽</div>}

      <div className="glass-card">
        <h1 className="title">WK 2026</h1>

        {/* INFO BANNER */}
        <button className="info-toggle-btn" onClick={() => setInfoOpen(!infoOpen)}>
          <span>ℹ️ Info & Betalen</span>
          <span>{infoOpen ? '▲' : '▼'}</span>
        </button>
        {infoOpen && (
          <div className="info-content">
            <h4>📲 App Installeren</h4>
            <p><strong>iPhone:</strong> Tik op Deel &gt; <em>Zet op beginscherm</em>.<br/><strong>Android:</strong> Tik op drie puntjes &gt; <em>Toevoegen aan startscherm</em>.</p>
            <p>Inleggeld: <strong>€10</strong> t.a.v. Jorden Ricour.</p>
          </div>
        )}

        {/* ADMIN SYNC */}
        {isAdmin && (
          <button onClick={syncMetSpreadsheet} className="admin-btn">🔄 {syncStatus || 'SYNC MET GOOGLE SHEETS'}</button>
        )}

        {actieveSpeler ? (
          <div>
            {/* FLOATING MENU */}
            <div className="tab-container">
              {[
                {id:'matchen', i:'⚽', n:'Matchen'},
                {id:'bonus', i:'💎', n:'Bonus'},
                {id:'antwoorden', i:'👁️', n:'Antw.'},
                {id:'ranking', i:'🏆', n:'Rank'},
                {id:'tellers', i:'📊', n:'Data'},
                {id:'kleedkamer', i:'💬', n:'Chat'}
              ].map(t => (
                <div key={t.id} className={`tab ${actieveTab === t.id ? 'active' : ''}`} onClick={() => veranderTab(t.id)}>
                  <span className="tab-icon">{t.i}</span>
                  <span>{t.n}</span>
                  {t.id === 'kleedkamer' && ongelezenBerichten && <span className="unread-badge" />}
                </div>
              ))}
            </div>

            {/* TAB: MATCHEN */}
            {actieveTab === 'matchen' && (
              <div>
                <div className="filter-scroll">
                  <span className={`filter-chip ${filterRonde === 'Nog in te vullen' ? 'active' : ''}`} onClick={() => setFilterRonde('Nog in te vullen')}>✍️ INVULLEN</span>
                  {['Alle', 'Groepsfase', 'Ronde van 32', 'Finale'].map(r => (
                    <span key={r} className={`filter-chip ${filterRonde === r ? 'active' : ''}`} onClick={() => setFilterRonde(r)}>{r}</span>
                  ))}
                </div>
                {gefilterdeMatchen.map(m => {
                  const gestart = nu > new Date(m.datum).getTime();
                  const v = matchVoorspellingen[m.id] || { thuis: '', uit: '', joker: false };
                  const save = matchSaveStatus[m.id] || 'idle';
                  const pVoorMatch = alleMatchVoorspellingen.filter(av => av.match_id === m.id);
                  const heeftUitslag = m.thuis_score !== null;

                  return (
                    <div key={m.id} className={`match-card ${gestart ? 'locked' : ''}`} onClick={() => gestart && setExpandedMatchId(expandedMatchId === m.id ? null : m.id)}>
                      <div className="match-header" style={{background: heeftUitslag ? 'var(--magenta)' : 'var(--lime)', color: heeftUitslag ? '#fff' : '#111827'}}>
                        <span>{heeftUitslag ? '🏆 EINDSTAND' : `${m.ronde} • ${new Date(m.datum).toLocaleDateString('nl-BE', {day:'2-digit',month:'short'})}`}</span>
                        <span className={`save-indicator ${save}`}>{save === 'saving' ? '⏳' : '✅'}</span>
                        <button className={`joker-btn ${v.joker ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); if(!gestart) toggleJoker(m.id); }}>🌟</button>
                      </div>
                      
                      {heeftUitslag && (
                        <div style={{textAlign:'center', padding:10, borderBottom:'1px solid #eee', fontWeight:900, fontSize:'2rem'}}>{m.thuis_score} - {m.uit_score}</div>
                      )}

                      <div className="match-body">
                        <span className="team-naam">{m.thuisploeg}</span>
                        <div style={{display:'flex', gap:5, alignItems:'center'}}>
                          <input className="score-invoer" type="tel" value={v.thuis} disabled={gestart} onChange={e => handleScore(m.id, 'thuis', e.target.value)} onClick={e=>e.stopPropagation()}/>
                          <span>-</span>
                          <input className="score-invoer" type="tel" value={v.uit} disabled={gestart} onChange={e => handleScore(m.id, 'uit', e.target.value)} onClick={e=>e.stopPropagation()}/>
                        </div>
                        <span className="team-naam">{m.uitploeg}</span>
                      </div>

                      {!gestart && (
                        <div style={{padding: '0 15px 10px', fontSize:'0.6rem', color:'#999', display:'flex', flexWrap:'wrap', gap:4}}>
                           {pVoorMatch.length} spelers vulden in: {pVoorMatch.map(av => <span key={av.speler_id} style={{background:'#eee', padding:'2px 5px', borderRadius:4}}>{av.spelers?.naam.split(' ')[0]}</span>)}
                        </div>
                      )}

                      {gestart && expandedMatchId === m.id && (
                        <div style={{background:'#f9f9f9', padding:15, borderTop:'1px solid #eee'}}>
                          {pVoorMatch.map(av => (
                            <div key={av.id} style={{display:'flex', justifyContent:'space-between', fontSize:'0.8rem', fontWeight:800, padding:'4px 0'}}>
                              <span>{av.spelers?.naam} {av.gouden_bal ? '🌟' : ''}</span>
                              <span style={{color:'var(--magenta)'}}>{av.thuis_score} - {av.uit_score}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {gestart && expandedMatchId !== m.id && <div style={{textAlign:'center', fontSize:'0.6rem', paddingBottom:5, color:'var(--rose)', fontWeight:900}}>KLIK VOOR VOORSPELLINGEN 👁️</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB: BONUS */}
            {actieveTab === 'bonus' && (
              <div>
                <label className="input-label">Wereldkampioen?</label>
                <Autocomplete options={WK_LANDEN} value={winnaar} onChange={setWinnaar} disabled={isGesloten} />
                <label className="input-label">Halve Finalisten?</label>
                {hf.map((h, i) => <Autocomplete key={i} options={WK_LANDEN} value={h} onChange={(v:string)=>{const n=[...hf]; n[i]=v; setHf(n);}} disabled={isGesloten} />)}
                <label className="input-label">Meeste Goals?</label>
                <Autocomplete options={WK_LANDEN} value={meesteGoalsLand} onChange={setMeesteGoalsLand} disabled={isGesloten} />
                <div style={{display:'flex', gap:10}}>
                  <div style={{flex:1}}><label className="input-label">Geel</label><input className="full-input" type="number" value={totaalGeel} onChange={e=>setTotaalGeel(e.target.value)} disabled={isGesloten}/></div>
                  <div style={{flex:1}}><label className="input-label">Rood</label><input className="full-input" type="number" value={totaalRood} onChange={e=>setTotaalRood(e.target.value)} disabled={isGesloten}/></div>
                </div>
                {!isGesloten && <button className="btn-primary" onClick={slaBonusOp}>BONUS OPSLAAN</button>}
              </div>
            )}

            {/* TAB: RANKING */}
            {actieveTab === 'ranking' && (
              <div>
                {klassement.map((s, i) => (
                  <div key={s.id} className={`ranking-item ${i===0?'rank-1':''}`}>
                    <div className="rank-badge">{i+1}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:900}}>{s.naam} {s.jokerIngezet?'🌑':'🌟'}</div>
                      <div style={{fontSize:'0.6rem', color:'#666'}}>✅{s.exact} • 🏆{s.winnaarCorrect} • ❌{s.fout}</div>
                      {isAdmin ? (
                        <button onClick={()=>toggleBetaald(s.id, s.betaald)} className={`betaal-badge ${s.betaald?'is-betaald':'niet-betaald'}`}>{s.betaald?'✅ Betaald':'❌ Klik om betaald'}</button>
                      ) : (
                        <span className={`betaal-badge ${s.betaald?'is-betaald':'niet-betaald'}`}>{s.betaald?'💰 Betaald':'⏳ Betaling verwerken'}</span>
                      )}
                    </div>
                    <div className="ranking-score">{s.totaal_score}</div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: TELLERS */}
            {actieveTab === 'tellers' && (
              <div className="teller-grid">
                <div className="teller-card" style={{gridColumn:'span 2'}}><div className="teller-val">{tellersData.g}</div><div>Totaal Goals</div></div>
                <div className="teller-card" style={{background:'#FFD700', color:'#000'}}><div className="teller-val">{tellersData.y}</div><div>Geel</div></div>
                <div className="teller-card" style={{background:'#FF4136'}}><div className="teller-val">{tellersData.r}</div><div>Rood</div></div>
                <div className="teller-card" style={{gridColumn:'span 2', background:'#40C057'}}><div style={{fontSize:'0.8rem'}}>MEESTE GOALS</div><div className="teller-val" style={{fontSize:'1.8rem'}}>{tellersData.mS[0]}</div><div>({tellersData.mS[1]})</div></div>
                <div className="teller-card" style={{gridColumn:'span 2', background:'#228BE6'}}><div style={{fontSize:'0.8rem'}}>MINSTE TEGEN</div><div className="teller-val" style={{fontSize:'1.8rem'}}>{tellersData.mT[0]}</div><div>({tellersData.mT[1]})</div></div>
              </div>
            )}

            {/* TAB: ANTWOORDEN */}
            {actieveTab === 'antwoorden' && (
              <div>
                {nu < DEADLINE_DATE ? <p style={{textAlign:'center', padding:40, fontWeight:900, color:'#999'}}>🔒 Geheime antwoorden worden onthuld op 11 juni.</p> : (
                  <div>
                    <div className="glass-card" style={{background:'#fff', marginBottom:10}}>
                      <div style={{fontWeight:900, color:'var(--crayola)', marginBottom:10}}>TROFEE VOORSPELLINGEN</div>
                      {alleToernooiV.map(v => <div key={v.id} style={{display:'flex', justifyContent:'space-between', fontSize:'0.8rem', borderBottom:'1px solid #eee', padding:'5px 0'}}><span>{v.spelers?.naam}</span><span style={{fontWeight:900, color:'var(--magenta)'}}>{v.winnaar}</span></div>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: CHAT */}
            {actieveTab === 'kleedkamer' && (
              <div>
                <div style={{height:300, overflowY:'auto', marginBottom:10}}>
                  {chatBerichten.map(b => (
                    <div key={b.id} style={{background: b.speler_id===actieveSpeler.id?'var(--aqua)':'#fff', padding:10, borderRadius:12, marginBottom:5, border:'1px solid #eee'}}>
                      <div style={{fontSize:'0.6rem', fontWeight:900, opacity:0.5}}>{b.spelers?.naam}</div>
                      <div style={{fontWeight:800}}>{b.bericht}</div>
                    </div>
                  ))}
                  <div ref={chatEindeRef} />
                </div>
                <form onSubmit={verstuurChat} style={{display:'flex', gap:5}}><input className="full-input" style={{marginBottom:0}} value={nieuwBericht} onChange={e=>setNieuwBericht(e.target.value)} /><button className="btn-primary" style={{width:60, padding:0}}>➤</button></form>
              </div>
            )}

            <button style={{width:'100%', marginTop:20, opacity:0.5, border:'none', background:'none', cursor:'pointer', fontWeight:900}} onClick={()=>{localStorage.removeItem('wk_speler_id'); window.location.reload();}}>UITLOGGEN</button>
          </div>
        ) : (
          <form onSubmit={(e)=>{ e.preventDefault(); const s = alleSpelers.find(x=>x.naam.toLowerCase()===ontgrendelNaam.toLowerCase() && String(x.code)===invoerCode); if(s){setActieveSpeler(s); localStorage.setItem('wk_speler_id', s.id.toString());} else setStatus('Fout! 🚩');}}>
            <input className="full-input" placeholder="Je Naam" value={ontgrendelNaam} onChange={e=>setOntgrendelNaam(e.target.value)} />
            <input className="full-input" type="password" placeholder="Pincode" value={invoerCode} onChange={e=>setInvoerCode(e.target.value)} />
            <button className="btn-primary" type="submit">HET VELD OP</button>
            <p style={{color:'red', textAlign:'center', fontWeight:900}}>{status}</p>
          </form>
        )}
      </div>
    </main>
  );
}