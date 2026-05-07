'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { WK_LANDEN } from '../lib/data';

// Importeer jouw nieuwe, schone componenten!
import { CountdownTimer } from '../components/Shared';
import MatchenTab from '../components/MatchenTab';
import BonusTab from '../components/BonusTab';
import AntwoordenTab from '../components/AntwoordenTab';
import RankingTab from '../components/RankingTab';
import TellersTab from '../components/TellersTab';
import ChatTab from '../components/ChatTab';

const DEADLINE_DATE = new Date('2026-06-11T21:00:00+02:00').getTime();

export default function Home() {
  const [ontgrendelNaam, setOntgrendelNaam] = useState('');
  const [invoerCode, setInvoerCode] = useState('');
  const [status, setStatus] = useState('');
  
  const [actieveSpeler, setActieveSpeler] = useState<any>(null);
  const [alleSpelers, setAlleSpelers] = useState<any[]>([]); 
  const [actieveTab, setActieveTab] = useState('matchen');
  const [filterRonde, setFilterRonde] = useState('Alle');
  const [ongelezenBerichten, setOngelezenBerichten] = useState(false);
  const actieveTabRef = useRef(actieveTab);

  // DATA STATES
  const [matchen, setMatchen] = useState<any[]>([]);
  const [matchVoorspellingen, setMatchVoorspellingen] = useState<Record<number, {thuis: string, uit: string, joker: boolean}>>({});
  const [alleMatchVoorspellingen, setAlleMatchVoorspellingen] = useState<any[]>([]); 
  const [matchSaveStatus, setMatchSaveStatus] = useState<Record<number, 'idle' | 'saving' | 'saved'>>({});
  const [alleToernooiV, setAlleToernooiV] = useState<any[]>([]);
  const [opslaanStatus, setOpslaanStatus] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState<number | null>(null);
  
  const saveTimeoutRef = useRef<Record<number, any>>({});

  // BONUSVRAGEN STATES
  const [winnaar, setWinnaar] = useState('');
  const [hf, setHf] = useState(['', '', '', '']);
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
  const [nu, setNu] = useState(new Date().getTime());
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
      const nuTijd = new Date().getTime();
      setNu(nuTijd); 
      
      const verschil = DEADLINE_DATE - nuTijd;
      if (verschil <= 0) { setIsGesloten(true); } 
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
    if (data) {
      setAlleSpelers(data);
      if (checkId) {
        const gevonden = data.find(s => s.id.toString() === checkId);
        if (gevonden) setActieveSpeler(gevonden);
      }
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

    const { data: voorspellingenData } = await supabase.from('match_voorspellingen').select('*, spelers(naam)');
    if (voorspellingenData) {
      setAlleMatchVoorspellingen(voorspellingenData); 

      const mijnVoorspellingen = voorspellingenData.filter(v => v.speler_id === actieveSpeler.id);
      const stateObj: any = {};
      mijnVoorspellingen.forEach(v => {
        stateObj[v.match_id] = { thuis: v.thuis_score?.toString() || '', uit: v.uit_score?.toString() || '', joker: v.gouden_bal };
      });
      setMatchVoorspellingen(stateObj);
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
      
      if (!error) {
        setAlleMatchVoorspellingen(prev => {
          const bestaand = prev.filter(p => !(p.match_id === mId && p.speler_id === actieveSpeler.id));
          return [...bestaand, { 
            match_id: mId, speler_id: actieveSpeler.id, thuis_score: parseInt(data.thuis), uit_score: parseInt(data.uit), gouden_bal: data.joker, spelers: { naam: actieveSpeler.naam } 
          }];
        });
      }
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
      Object.keys(nieuwStaat).forEach(key => {
        if (nieuwStaat[Number(key)]) nieuwStaat[Number(key)].joker = false;
      });
      const newData = { ...prev[mId], joker: !isNuJoker, thuis: prev[mId]?.thuis || '', uit: prev[mId]?.uit || '' };
      nieuwStaat[mId] = newData;
      triggerAutoSave(mId, newData);
      return nieuwStaat;
    });
  };

  const slaMatchOp = async (mId: number) => {
    const v = matchVoorspellingen[mId];
    if (!v || v.thuis === '' || v.uit === '') return;
    setMatchSaveStatus(prev => ({...prev, [mId]: 'saving'}));
    const { error } = await supabase.from('match_voorspellingen').upsert({
      speler_id: actieveSpeler.id, match_id: mId, thuis_score: parseInt(v.thuis), uit_score: parseInt(v.uit), gouden_bal: v.joker
    }, { onConflict: 'speler_id, match_id' });
    if (!error) setMatchSaveStatus(prev => ({...prev, [mId]: 'saved'}));
    else setMatchSaveStatus(prev => ({...prev, [mId]: 'idle'}));
  };

  const slaBonusOp = async () => {
    setOpslaanStatus('Bezig... ⚽');
    await supabase.from('toernooi_voorspellingen').upsert({
      speler_id: actieveSpeler.id, winnaar, halve_finalist_1: hf[0], halve_finalist_2: hf[1], halve_finalist_3: hf[2], halve_finalist_4: hf[3],
      topschutter: meesteGoalsLand, beste_keeper: besteVerdedigingLand, eindstation_belgie: eindstation,
      totaal_gele_kaarten: parseInt(totaalGeel) || 0, totaal_rode_kaarten: parseInt(totaalRood) || 0
    }, { onConflict: 'speler_id' });

    setOpslaanStatus('Bonusvragen Opgeslagen! 🌟');
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
        let punten = 0; let exact = 0; let winnaarCorrect = 0; let fout = 0; let jokerIngezet = false;

        const spelerV = v.filter(vo => vo.speler_id === sp.id);
        spelerV.forEach(vo => {
          if (vo.gouden_bal) jokerIngezet = true;
          const match = m.find(ma => ma.id === vo.match_id);
          if (match && match.thuis_score !== null && match.uit_score !== null) {
            const factor = vo.gouden_bal ? 2 : 1;
            const echtResultaat = match.thuis_score > match.uit_score ? 1 : match.thuis_score < match.uit_score ? 2 : 0;
            const voorspeldResultaat = vo.thuis_score > vo.uit_score ? 1 : vo.thuis_score < vo.uit_score ? 2 : 0;

            if (vo.thuis_score === match.thuis_score && vo.uit_score === match.uit_score) {
              punten += (5 * factor); exact++;
            } else if (echtResultaat === voorspeldResultaat) {
              punten += (3 * factor); winnaarCorrect++;
            } else {
              fout++;
            }
          }
        });
        return { ...sp, totaal_score: punten, exact, winnaarCorrect, fout, jokerIngezet };
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
        return (!v || v.thuis === '' || v.uit === '' || v.thuis === undefined || v.uit === undefined) && (nu < new Date(m.datum).getTime());
      });
    }
    return matchen.filter(m => m.ronde === filterRonde);
  }, [matchen, filterRonde, matchVoorspellingen, nu]);

  return (
    <main className="main-container">
      {/* DE GLOBALE STYLING BLIJFT HIER, ZODAT ALLE COMPONENTEN DEZE KUNNEN GEBRUIKEN */}
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
          background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(15px); padding: 25px 20px; border-radius: 24px;
          width: 100%; max-width: 500px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); border: 3px solid rgba(255, 255, 255, 0.4); margin-bottom: 20px;
        }

        .title { font-family: 'Bebas Neue', sans-serif; font-size: 4.5rem; text-align: center; color: #FFF; line-height: 1; text-shadow: 3px 3px 0px var(--magenta); margin: 0; animation: title-glow 3s linear infinite; }
        
        .timer { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; }
        .timer-box { background: var(--magenta); color: #FFF; padding: 8px 12px; border-radius: 12px; text-align: center; font-weight: 900; line-height: 1.1; box-shadow: 0 4px 10px rgba(240, 56, 255, 0.3); }
        .timer-value { font-size: 1.5rem; }
        .timer-label { font-size: 0.6rem; text-transform: uppercase; opacity: 0.8; }

        .tab-container { display: flex; background: rgba(240, 244, 248, 0.8); border-radius: 16px; padding: 5px; margin-bottom: 20px; overflow-x: auto; scrollbar-width: none; backdrop-filter: blur(5px); }
        .tab { flex: 1; min-width: 80px; text-align: center; padding: 12px 5px; font-size: 0.65rem; font-weight: 800; border-radius: 12px; cursor: pointer; color: #6C757D; transition: 0.3s; position: relative; }
        .tab.active { background: var(--crayola); color: #FFF; transform: scale(1.05); box-shadow: 0 4px 10px rgba(55, 114, 255, 0.3); }
        .unread-badge { position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; background: var(--rose); border-radius: 50%; }

        .filter-scroll { display: flex; gap: 8px; margin-bottom: 15px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none; }
        .filter-chip { padding: 8px 14px; border-radius: 20px; background: #E9ECEF; font-size: 0.75rem; font-weight: 800; cursor: pointer; border: 2px solid transparent; white-space: nowrap; color: #495057; transition: 0.2s; }
        .filter-chip.active { border-color: var(--crayola); color: var(--crayola); background: #eef2ff; transform: scale(1.05); }
        .filter-chip.urgent { background: #ffe3e3; color: #e03131; border-color: #ffa8a8; }
        .filter-chip.urgent.active { background: #e03131; color: #fff; border-color: #c92a2a; }

        .match-card { background: rgba(255, 255, 255, 0.95); border-radius: 16px; margin-bottom: 12px; border: 3px solid #E9ECEF; overflow: hidden; transition: 0.3s; position: relative; }
        .match-card.locked { border-color: var(--rose); cursor: pointer; } 
        .match-header { background: var(--lime); padding: 10px 15px; font-size: 0.7rem; font-weight: 900; color: #111827; display: flex; justify-content: space-between; align-items: center; position: relative; }
        .match-body { display: flex; align-items: center; padding: 15px; }
        .team-naam { font-weight: 900; flex: 1; text-align: center; font-size: 0.95rem; }
        .score-invoer { width: 45px; height: 50px; text-align: center; font-size: 1.5rem; font-family: 'Bebas Neue', sans-serif; border-radius: 12px; border: 2px solid #DEE2E6; outline: none; transition: 0.2s; }
        .score-invoer:focus { border-color: var(--aqua); box-shadow: 0 0 10px rgba(112, 228, 239, 0.3); }
        .score-invoer:disabled { background: #f8f9fa; color: #666; cursor: not-allowed; }
        
        .joker-btn { width: 38px; height: 38px; border-radius: 50%; border: 2px solid #DEE2E6; background: #FFF; font-size: 1.2rem; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; filter: grayscale(1); opacity: 0.5; }
        .joker-btn.active { background: #FFD700; border-color: #FFA500; filter: grayscale(0); opacity: 1; transform: scale(1.15); box-shadow: 0 0 15px rgba(255, 215, 0, 0.6); }

        .save-indicator { position: absolute; right: 50px; top: 10px; font-size: 0.65rem; font-weight: 900; padding: 4px 8px; border-radius: 10px; transition: 0.3s; opacity: 0; }
        .save-indicator.saving { background: rgba(240, 56, 255, 0.2); color: var(--magenta); opacity: 1; }
        .save-indicator.saved { background: rgba(46, 204, 64, 0.2); color: #2ECC40; opacity: 1; }

        .filled-container { display: flex; align-items: center; gap: 8px; padding: 10px 15px; border-top: 1px dashed #DEE2E6; justify-content: center; background: #F8F9FA; }
        .filled-avatars { display: flex; }
        .filled-avatar { width: 22px; height: 22px; border-radius: 50%; background: var(--crayola); color: white; font-size: 0.55rem; font-weight: 900; display: flex; align-items: center; justify-content: center; border: 2px solid white; margin-left: -8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .filled-avatar:first-child { margin-left: 0; }
        .filled-text { font-size: 0.65rem; font-weight: 800; color: #ADB5BD; }

        .click-to-expand { text-align: center; font-size: 0.7rem; font-weight: 900; color: var(--rose); padding-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
        .predictions-dropdown { background: rgba(240, 244, 248, 0.9); padding: 15px; border-top: 2px solid #E9ECEF; }
        .pred-title { font-weight: 900; color: var(--crayola); font-size: 0.75rem; margin-bottom: 10px; border-bottom: 2px solid #DEE2E6; padding-bottom: 5px; }
        .pred-row { display: flex; justify-content: space-between; font-weight: 800; font-size: 0.85rem; padding: 6px 0; border-bottom: 1px solid rgba(0,0,0,0.05); }
        .pred-row:last-child { border-bottom: none; }
        .pred-score { color: var(--magenta); font-family: 'Bebas Neue'; font-size: 1.2rem; }

        .ranking-item { position: relative; overflow: hidden; background: rgba(255, 255, 255, 0.9); border-radius: 16px; padding: 15px; margin-bottom: 12px; border: 2px solid #E9ECEF; display: flex; align-items: center; gap: 15px; transition: 0.2s; }
        .ranking-item:hover { transform: translateY(-3px); }
        .ranking-item.rank-1 { border-color: #FFD700; background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 255, 255, 0.9)); box-shadow: 0 10px 20px rgba(255,215,0,0.2); }
        .ranking-item.rank-2 { border-color: #C0C0C0; background: linear-gradient(135deg, rgba(192, 192, 192, 0.15), rgba(255, 255, 255, 0.9)); }
        .ranking-item.rank-3 { border-color: #CD7F32; background: linear-gradient(135deg, rgba(205, 127, 50, 0.15), rgba(255, 255, 255, 0.9)); }
        
        .rank-badge { width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue'; font-size: 1.8rem; color: white; background: var(--crayola); }
        .rank-1 .rank-badge { background: #FFD700; box-shadow: 0 0 15px rgba(255,215,0,0.6); color: #111827; }
        .rank-2 .rank-badge { background: #C0C0C0; color: #111827; }
        .rank-3 .rank-badge { background: #CD7F32; color: #111827; }

        .ranking-main { flex: 1; }
        .ranking-naam { font-weight: 900; text-transform: uppercase; display: flex; align-items: center; gap: 6px; font-size: 1.1rem; }
        .ranking-stats { font-size: 0.75rem; color: #6C757D; font-weight: 800; margin-top: 4px; }
        .ranking-score { font-family: 'Bebas Neue'; font-size: 2.5rem; color: var(--magenta); }

        .teller-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px; }
        .teller-card { background: var(--crayola); color: white; padding: 20px; border-radius: 16px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .teller-val { font-family: 'Bebas Neue'; font-size: 3rem; line-height: 1; }
        .teller-label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-top: 5px; opacity: 0.9; }

        .antwoord-sectie { background: rgba(255, 255, 255, 0.8); border-radius: 16px; padding: 15px; margin-bottom: 15px; border: 2px solid #E9ECEF; }
        .antwoord-header { font-weight: 900; color: var(--crayola); margin-bottom: 10px; font-size: 1rem; text-transform: uppercase; border-bottom: 2px solid #E9ECEF; padding-bottom: 5px; }

        .input-group { margin-bottom: 15px; text-align: left; }
        .input-label { display: block; font-size: 0.75rem; font-weight: 900; margin-bottom: 5px; color: #495057; text-transform: uppercase; }
        .full-input { width: 100%; padding: 15px; border-radius: 15px; border: 2px solid #E9ECEF; outline: none; box-sizing: border-box; font-weight: 800; font-size: 1rem; transition: 0.2s; }
        .full-input:focus { border-color: var(--magenta); box-shadow: 0 0 10px rgba(240, 56, 255, 0.3); }

        .btn-primary { width: 100%; padding: 18px; border-radius: 16px; background: var(--magenta); color: #FFF; border: none; font-weight: 900; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 15px rgba(240, 56, 255, 0.3); transition: 0.2s; }
        .btn-primary:active { transform: translateY(2px); box-shadow: 0 2px 8px rgba(240, 56, 255, 0.3); }

        .chat-container { height: 350px; overflow-y: auto; padding-right: 5px; margin-bottom: 15px; }
        .chat-bericht { background: rgba(248, 249, 250, 0.9); padding: 12px; border-radius: 16px; border-bottom-left-radius: 4px; margin-bottom: 10px; font-size: 0.9rem; font-weight: 700; border: 1px solid #E9ECEF; }
        .chat-eigen { background: var(--aqua); border-color: #61cbd6; border-bottom-left-radius: 16px; border-bottom-right-radius: 4px; }
        
        .autocomplete-dropdown { position: absolute; z-index: 100; background: #FFF; width: 100%; border: 2px solid #E9ECEF; border-radius: 12px; max-height: 200px; overflow-y: auto; padding: 0; list-style: none; margin-top: 5px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .autocomplete-item { padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #F8F9FA; font-weight: 800; font-size: 0.9rem; }

        .main-container { padding: 25px 15px 80px 15px; display: flex; flex-direction: column; align-items: center; box-sizing: border-box; }

        @keyframes background-fade { 0%, 100% { background-position: 0% 0%; } 50% { background-position: 100% 100%; } }
        @keyframes blob-movement-a { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(50px, 80px) scale(1.1); } }
        @keyframes blob-movement-b { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-40px, -60px) scale(0.9); } }
        @keyframes title-glow { 0%, 100% { text-shadow: 3px 3px 0px var(--magenta); } 50% { text-shadow: 3px 3px 20px rgba(240, 56, 255, 0.8), 3px 3px 0px var(--magenta); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
      `}</style>

      {showConfetti && (
        <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:999, display:'flex', justifyContent:'center', alignItems:'center'}}>
          <div style={{fontSize:'5rem', animation:'bounce 1s infinite'}}>🎉🌟⚽</div>
        </div>
      )}

      <div className="glass-card">
        <h1 className="title">WK 2026</h1>

        {!isGesloten && actieveSpeler && <CountdownTimer tijdOver={tijdOver} />}

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
              <MatchenTab 
                gefilterdeMatchen={gefilterdeMatchen} 
                nu={nu} 
                matchVoorspellingen={matchVoorspellingen} 
                matchSaveStatus={matchSaveStatus} 
                alleMatchVoorspellingen={alleMatchVoorspellingen} 
                actieveSpeler={actieveSpeler} 
                alleSpelers={alleSpelers} 
                handleScore={handleScore} 
                toggleJoker={toggleJoker} 
                slaMatchOp={slaMatchOp} 
                filterRonde={filterRonde} 
                setFilterRonde={setFilterRonde} 
                expandedMatchId={expandedMatchId} 
                setExpandedMatchId={setExpandedMatchId} 
              />
            )}

            {actieveTab === 'bonus' && (
              <BonusTab 
                winnaar={winnaar} setWinnaar={setWinnaar} 
                hf={hf} setHf={setHf} 
                meesteGoalsLand={meesteGoalsLand} setMeesteGoalsLand={setMeesteGoalsLand} 
                besteVerdedigingLand={besteVerdedigingLand} setBesteVerdedigingLand={setBesteVerdedigingLand} 
                eindstation={eindstation} setEindstation={setEindstation} 
                totaalGeel={totaalGeel} setTotaalGeel={setTotaalGeel} 
                totaalRood={totaalRood} setTotaalRood={setTotaalRood} 
                isGesloten={isGesloten} slaBonusOp={slaBonusOp} opslaanStatus={opslaanStatus} WK_LANDEN={WK_LANDEN} 
              />
            )}

            {actieveTab === 'antwoorden' && <AntwoordenTab nu={nu} DEADLINE_DATE={DEADLINE_DATE} alleToernooiV={alleToernooiV} />}

            {actieveTab === 'ranking' && <RankingTab klassement={klassement} />}

            {actieveTab === 'tellers' && <TellersTab tellersData={tellersData} />}

            {actieveTab === 'kleedkamer' && (
              <ChatTab 
                chatBerichten={chatBerichten} actieveSpeler={actieveSpeler} chatEindeRef={chatEindeRef} 
                nieuwBericht={nieuwBericht} setNieuwBericht={setNieuwBericht} verstuurChat={verstuurChat} 
              />
            )}
            
            <div style={{textAlign:'center', marginTop:20}}>
              <button style={{background:'none', border:'none', color:'#111827', fontWeight:900, cursor:'pointer', opacity: 0.6}} onClick={() => {localStorage.removeItem('wk_speler_id'); window.location.reload();}}>UITLOGGEN</button>
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