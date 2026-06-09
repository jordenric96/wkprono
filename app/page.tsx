'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { WK_LANDEN } from '../lib/data';

import MatchenTab from '../components/MatchenTab';
import BonusTab from '../components/BonusTab';
import AntwoordenTab from '../components/AntwoordenTab';
import RankingTab from '../components/RankingTab';
import TellersTab from '../components/TellersTab';
import ChatTab from '../components/ChatTab';
import PrijsTab from '../components/PrijsTab';

const DEADLINE_DATE = new Date('2026-06-11T21:00:00+02:00').getTime();

export default function Home() {
  const [ontgrendelNaam, setOntgrendelNaam] = useState('');
  const [invoerCode, setInvoerCode] = useState('');
  const [status, setStatus] = useState('');
  const [isRegistreren, setIsRegistreren] = useState(false); 
  
  const [actieveSpeler, setActieveSpeler] = useState<any>(null);
  const [alleSpelers, setAlleSpelers] = useState<any[]>([]); 
  const [actieveTab, setActieveTab] = useState('ranking');
  const [filterRonde, setFilterRonde] = useState('Alle');
  const [ongelezenBerichten, setOngelezenBerichten] = useState(false);
  
  const [toast, setToast] = useState<{naam: string, bericht: string} | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const actieveTabRef = useRef(actieveTab);
  const actieveSpelerRef = useRef(actieveSpeler);
  const alleSpelersRef = useRef(alleSpelers);

  const [syncStatus, setSyncStatus] = useState('');
  
  // --- ROLLEN VERDELING ---
  const adminNamen = ['jorden ricour', 'wesley moonens', 'yarni ricour'];
  const isAdmin = actieveSpeler?.naam && adminNamen.some((admin: string) => actieveSpeler.naam.toLowerCase().includes(admin));
  const isJorden = actieveSpeler?.naam?.toLowerCase().includes('jorden ricour');
  
  const [matchen, setMatchen] = useState<any[]>([]);
  const [matchVoorspellingen, setMatchVoorspellingen] = useState<Record<number, {thuis: string, uit: string}>>({});
  const [alleMatchVoorspellingen, setAlleMatchVoorspellingen] = useState<any[]>([]); 
  const [matchSaveStatus, setMatchSaveStatus] = useState<Record<number, 'idle' | 'saving' | 'saved'>>({});
  const [alleToernooiV, setAlleToernooiV] = useState<any[]>([]);
  const [opslaanStatus, setOpslaanStatus] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState<number | null>(null);
  const saveTimeoutRef = useRef<Record<number, any>>({});

  const [winnaar, setWinnaar] = useState('');
  const [hf, setHf] = useState(['', '', '', '']);
  const [meesteGoalsLand, setMeesteGoalsLand] = useState('');
  const [besteVerdedigingLand, setBesteVerdedigingLand] = useState('');
  const [eindstation, setEindstation] = useState('');
  const [totaalGoals, setTotaalGoals] = useState('');
  const [totaalGeel, setTotaalGeel] = useState('');
  const [totaalRood, setTotaalRood] = useState('');

  const [klassement, setKlassement] = useState<any[]>([]);
  const [chatBerichten, setChatBerichten] = useState<any[]>([]);
  const [nieuwBericht, setNieuwBericht] = useState('');
  const chatEindeRef = useRef<HTMLDivElement>(null);

  const [nu, setNu] = useState(new Date().getTime());
  const [tijdOver, setTijdOver] = useState({ dagen: 0, uren: 0, minuten: 0, seconden: 0 });
  const [isGesloten, setIsGesloten] = useState(false); 

  const veranderTab = (tab: string) => {
    setActieveTab(tab);
    if (tab === 'kleedkamer') setOngelezenBerichten(false);
  };

  useEffect(() => { actieveTabRef.current = actieveTab; }, [actieveTab]);
  useEffect(() => { actieveSpelerRef.current = actieveSpeler; }, [actieveSpeler]);
  useEffect(() => { alleSpelersRef.current = alleSpelers; }, [alleSpelers]);

  useEffect(() => {
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

    const chatSub = supabase.channel('chat').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'kleedkamer' }, (payload) => {
      haalChatOp();
      if (actieveTabRef.current !== 'kleedkamer') {
        setOngelezenBerichten(true);
        if (payload.new.speler_id !== actieveSpelerRef.current?.id) {
          const afzender = alleSpelersRef.current.find(s => s.id === payload.new.speler_id);
          const afzenderNaam = afzender ? afzender.naam.split(' ')[0] : 'Nieuw bericht';
          setToast({ naam: afzenderNaam, bericht: payload.new.bericht });
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
            audio.play();
          } catch(e) {} 
          setTimeout(() => setToast(null), 4500); 
        }
      }
    }).subscribe();

    return () => { clearInterval(klokInterval); supabase.removeChannel(chatSub); };
  }, []);

  useEffect(() => {
    if (actieveSpeler && (actieveSpeler.betaald || isJorden)) {
      if (actieveTab === 'matchen') haalMatchenOp();
      if (actieveTab === 'bonus') haalToernooiVoorspellingOp();
      if (actieveTab === 'ranking' || actieveTab === 'prijs') haalKlassementOp();
      if (actieveTab === 'kleedkamer') haalChatOp();
      if (actieveTab === 'antwoorden') haalAlleAntwoordenOp();
    }
  }, [actieveSpeler, actieveTab, isJorden]);

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
    const { data: matchenData } = await supabase.from('matchen').select('*').order('datum', { ascending: true });
    if (matchenData) setMatchen(matchenData);
    const { data: vData } = await supabase.from('match_voorspellingen').select('*, spelers(naam)');
    if (vData) {
      setAlleMatchVoorspellingen(vData); 
      const mijnV = vData.filter(v => v.speler_id === actieveSpeler.id);
      const obj: any = {};
      mijnV.forEach(v => {
        obj[v.match_id] = { thuis: v.thuis_score?.toString() || '', uit: v.uit_score?.toString() || '' };
      });
      setMatchVoorspellingen(stateObj => ({...stateObj, ...obj}));
    }
  };

  const triggerAutoSave = (mId: number, data: { thuis: string, uit: string }) => {
    const m = matchen.find(x => x.id === mId);
    if (m && nu >= new Date(m.datum).getTime()) return;
    if (data.thuis === '' || data.uit === '') return;
    if (saveTimeoutRef.current[mId]) clearTimeout(saveTimeoutRef.current[mId]);
    setMatchSaveStatus(prev => ({ ...prev, [mId]: 'saving' }));
    saveTimeoutRef.current[mId] = setTimeout(async () => {
      const { error } = await supabase.from('match_voorspellingen').upsert({
        speler_id: actieveSpeler.id, match_id: mId, thuis_score: parseInt(data.thuis), uit_score: parseInt(data.uit)
      }, { onConflict: 'speler_id, match_id' });
      setMatchSaveStatus(prev => ({ ...prev, [mId]: error ? 'idle' : 'saved' }));
      if (!error) haalMatchenOp(); 
    }, 800); 
  };

  const handleScore = (mId: number, veld: 'thuis'|'uit', waarde: string) => {
    const v = matchVoorspellingen[mId] || { thuis: '', uit: '' };
    const newData = { ...v, [veld]: waarde };
    setMatchVoorspellingen(prev => ({ ...prev, [mId]: newData }));
    triggerAutoSave(mId, newData);
  };

  const slaBonusOp = async () => {
    if (isGesloten) return;
    setOpslaanStatus('Bezig...');
    await supabase.from('toernooi_voorspellingen').upsert({
      speler_id: actieveSpeler.id, winnaar, halve_finalist_1: hf[0], halve_finalist_2: hf[1], halve_finalist_3: hf[2], halve_finalist_4: hf[3],
      topschutter: meesteGoalsLand, beste_keeper: besteVerdedigingLand, eindstation_belgie: eindstation,
      totaal_goals: parseInt(totaalGoals) || 0,
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
      setTotaalGoals(data.totaal_goals?.toString() || '');
      setTotaalGeel(data.totaal_gele_kaarten?.toString() || '');
      setTotaalRood(data.totaal_rode_kaarten?.toString() || '');
    }
  };

  const haalAlleAntwoordenOp = async () => {
    const { data } = await supabase.from('toernooi_voorspellingen').select('*, spelers(naam)');
    if (data) setAlleToernooiV(data);
  };

  const haalKlassementOp = async () => {
    const { data: s, error: sErr } = await supabase.from('spelers').select('*');
    const { data: m, error: mErr } = await supabase.from('matchen').select('*');
    const { data: v, error: vErr } = await supabase.from('match_voorspellingen').select('*');
    const { data: bonusV, error: bonusErr } = await supabase.from('toernooi_voorspellingen').select('*');

    if (sErr || mErr || vErr || bonusErr || !s || !m || !v || !bonusV) return;

    let liveGoals = 0, liveGeel = 0, liveRood = 0;
    const teamGoalsVoor: Record<string, number> = {};
    const teamGoalsTegen: Record<string, number> = {};
    const halveFinalisten: string[] = [];
    let wkWinnaar = "";

    m.forEach(match => {
      if (match.id === 101 || match.id === 102) {
        if (match.thuisploeg && !match.thuisploeg.toLowerCase().includes('winnaar')) halveFinalisten.push(match.thuisploeg);
        if (match.uitploeg && !match.uitploeg.toLowerCase().includes('winnaar')) halveFinalisten.push(match.uitploeg);
      }
      if (match.id === 104 && match.thuis_score !== null && match.uit_score !== null) {
        if (match.thuis_score > match.uit_score) wkWinnaar = match.thuisploeg;
        else if (match.uit_score > match.thuis_score) wkWinnaar = match.uitploeg;
      }
      if (match.thuis_score !== null && match.uit_score !== null) {
        liveGoals += (match.thuis_score + match.uit_score);
        liveGeel += (match.gele_kaarten || 0);
        liveRood += (match.rode_kaarten || 0);
        teamGoalsVoor[match.thuisploeg] = (teamGoalsVoor[match.thuisploeg] || 0) + match.thuis_score;
        teamGoalsVoor[match.uitploeg] = (teamGoalsVoor[match.uitploeg] || 0) + match.uit_score;
        teamGoalsTegen[match.thuisploeg] = (teamGoalsTegen[match.thuisploeg] || 0) + match.uit_score;
        teamGoalsTegen[match.uitploeg] = (teamGoalsTegen[match.uitploeg] || 0) + match.thuis_score;
      }
    });

    const goalsValues = Object.values(teamGoalsVoor);
    const maxGoals = goalsValues.length > 0 ? Math.max(...goalsValues, -1) : -1;
    const topScorers = Object.keys(teamGoalsVoor).filter(t => teamGoalsVoor[t] === maxGoals && maxGoals > 0);

    const gespeeldeTeams = Object.keys(teamGoalsTegen);
    const minTegen = gespeeldeTeams.length > 0 ? Math.min(...Object.values(teamGoalsTegen)) : -1;
    const bestDefenses = Object.keys(teamGoalsTegen).filter(t => teamGoalsTegen[t] === minTegen && minTegen >= 0);

    let winnaarsGoals: any[] = [], winnaarsGeel: any[] = [], winnaarsRood: any[] = [];
    
    if (bonusV.length > 0) {
      const diffG = bonusV.map(bv => ({id: bv.speler_id, d: Math.abs((bv.totaal_goals || 0) - liveGoals)}));
      winnaarsGoals = diffG.filter(x => x.d === Math.min(...diffG.map(y => y.d))).map(x => x.id);

      const diffY = bonusV.map(bv => ({id: bv.speler_id, d: Math.abs((bv.totaal_gele_kaarten || 0) - liveGeel)}));
      winnaarsGeel = diffY.filter(x => x.d === Math.min(...diffY.map(y => y.d))).map(x => x.id);

      const diffR = bonusV.map(bv => ({id: bv.speler_id, d: Math.abs((bv.totaal_rode_kaarten || 0) - liveRood)}));
      winnaarsRood = diffR.filter(x => x.d === Math.min(...diffR.map(y => y.d))).map(x => x.id);
    }

    const stats = s.map(sp => {
      let pronoP = 0, bonusP = 0, ex = 0, wc = 0, f = 0;
      
      v.filter(vo => vo.speler_id === sp.id).forEach(vo => {
        const match = m.find(ma => ma.id === vo.match_id);
        if (match && match.thuis_score !== null) {
          const echt = match.thuis_score > match.uit_score ? 1 : match.thuis_score < match.uit_score ? 2 : 0;
          const pred = vo.thuis_score > vo.uit_score ? 1 : vo.thuis_score < vo.uit_score ? 2 : 0;
          if (vo.thuis_score === match.thuis_score && vo.uit_score === match.uit_score) { pronoP += 3; ex++; }
          else if (echt === pred) { pronoP += 1; wc++; }
          else f++;
        }
      });

      const bv = bonusV.find(b => b.speler_id === sp.id);
      const breakdown: {label: string, pt: number}[] = [];
      
      if (bv) {
        if (winnaarsGoals.includes(sp.id)) { bonusP += 5; breakdown.push({label: 'Dichtste bij Totaal Goals', pt: 5}); }
        if (winnaarsGeel.includes(sp.id)) { bonusP += 5; breakdown.push({label: 'Dichtste bij Gele Kaarten', pt: 5}); }
        if (winnaarsRood.includes(sp.id)) { bonusP += 5; breakdown.push({label: 'Dichtste bij Rode Kaarten', pt: 5}); }
        if (wkWinnaar && bv.winnaar === wkWinnaar) { bonusP += 5; breakdown.push({label: 'Wereldkampioen Juist', pt: 5}); }
        if (topScorers.includes(bv.topschutter)) { bonusP += 3; breakdown.push({label: 'Beste Aanval', pt: 3}); }
        if (bestDefenses.includes(bv.beste_keeper)) { bonusP += 3; breakdown.push({label: 'Beste Verdediging', pt: 3}); }
        [bv.halve_finalist_1, bv.halve_finalist_2, bv.halve_finalist_3, bv.halve_finalist_4].forEach(land => {
          if (land && halveFinalisten.includes(land)) { bonusP += 3; breakdown.push({label: `Halve Finalist (${land})`, pt: 3}); }
        });
      }
      
      return { 
        ...sp, prono_score: pronoP, bonus_score: bonusP, totaal_score: pronoP + bonusP, 
        exact: ex, winnaarCorrect: wc, fout: f, bonus_breakdown: breakdown 
      };
    });

    // --- 🚨 PROMO TRUCJE: MAARTEN, JONAS EN SAMMY OP 1, 2 EN 3 ZONDER ECHTE PUNTEN ---
    const matchenGespeeld = m.some((match: any) => match.thuis_score !== null);
    
    let eindStats = stats.map(sp => {
      // Als er nog GEEN matchen gespeeld zijn: reset alle punten naar 0
      if (!matchenGespeeld) {
        return { ...sp, totaal_score: 0, prono_score: 0, bonus_score: 0, exact: 0, winnaarCorrect: 0, fout: 0, bonus_breakdown: [] };
      }
      return sp; 
    });

    // FORCEER SORTERING VOOR HET PODIUM
    eindStats.sort((a, b) => {
      if (!matchenGespeeld) {
        // Geheime "weighing" voor het klassement: puur voor de volgorde!
        const getPromoWeight = (naam: string) => {
          const n = naam.toLowerCase();
          if (n.includes('maarten')) return 3;
          if (n.includes('jonas')) return 2;
          if (n.includes('sammy')) return 1;
          return 0; 
        };
        const weightA = getPromoWeight(a.naam);
        const weightB = getPromoWeight(b.naam);
        
        if (weightA !== weightB) return weightB - weightA; 
      }

      // Echte sortering als WK bezig is
      if (b.totaal_score !== a.totaal_score) return b.totaal_score - a.totaal_score;
      if (b.exact !== a.exact) return b.exact - a.exact;
      if (b.winnaarCorrect !== a.winnaarCorrect) return b.winnaarCorrect - a.winnaarCorrect;
      return a.naam.localeCompare(b.naam);
    });

    setKlassement(eindStats);
  };

  const toggleBetaald = async (spelerId: number, huidigeStatus: boolean) => {
    if (!isJorden) return;
    const { error } = await supabase.from('spelers').update({ betaald: !huidigeStatus }).eq('id', spelerId);
    if (!error) haalKlassementOp();
  };

  const verstuurChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nieuwBericht.trim()) return;
    const { error } = await supabase.from('kleedkamer').insert([{ speler_id: actieveSpeler.id, bericht: nieuwBericht.trim() }]);
    if (!error) { setNieuwBericht(''); haalChatOp(); }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const naam = ontgrendelNaam.trim();
    const code = invoerCode.trim();
    
    if (!naam || !code) { setStatus('Vul een naam en pincode in! 🚩'); return; }

    const s = alleSpelers.find(x => x.naam.toLowerCase() === naam.toLowerCase() && String(x.code) === code);
    if (s) { setActieveSpeler(s); localStorage.setItem('wk_speler_id', s.id.toString()); setStatus(''); }
    else { setStatus('Naam of pincode is fout! 🚩'); }
  };

  const handleRegistreer = async (e: React.FormEvent) => {
    e.preventDefault();
    const naam = ontgrendelNaam.trim();
    const code = invoerCode.trim();
    
    if (!naam || !code) { setStatus('Vul je naam en een pincode in! 🚩'); return; }
    if (alleSpelers.some(s => s.naam.toLowerCase() === naam.toLowerCase())) { setStatus('Deze naam bestaat al! Kies onderaan voor inloggen. 🚩'); return; }

    setStatus('Aanmaken... ⏳');
    const { data, error } = await supabase.from('spelers').insert([{ naam: naam, code: code, betaald: false }]).select().single();

    if (error) { setStatus('Oeps, fout bij aanmaken! 🚩'); }
    else if (data) { setAlleSpelers(prev => [...prev, data]); setActieveSpeler(data); localStorage.setItem('wk_speler_id', data.id.toString()); setStatus(''); }
  };

  const tellersData = useMemo(() => {
    let totaleGoals = 0, totaleGeleKaarten = 0, totaleRodeKaarten = 0;
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

    const meestScorendTeam = Object.entries(teamGoalsVoor).sort((a, b) => b[1] - a[1])[0] || ['Nog geen data', 0];
    const minstTegenTeam = Object.entries(teamGoalsTegen).sort((a, b) => a[1] - b[1])[0] || ['Nog geen data', 0];

    return { totaleGoals, totaleGeleKaarten, totaleRodeKaarten, meestScorendTeam, minstTegenTeam };
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
        
        *, *::before, *::after { box-sizing: border-box; }

        html, body { margin: 0; padding: 0; width: 100%; min-height: 100%; font-family: 'Nunito', sans-serif; color: #111827; background: radial-gradient(circle at 30% 20%, var(--rose), transparent 30%), radial-gradient(circle at 70% 80%, var(--lime), transparent 30%), linear-gradient(135deg, var(--crayola), var(--aqua)); background-size: 200% 200%; animation: background-fade 10s ease-in-out infinite; overflow-x: hidden; }
        body::before, body::after { content: ''; position: fixed; border-radius: 50%; filter: blur(50px); opacity: 0.5; z-index: -1; pointer-events: none; }
        body::before { width: 400px; height: 400px; top: -100px; left: -100px; background: var(--magenta); animation: blob-movement-a 12s linear infinite; }
        body::after { width: 350px; height: 350px; bottom: -80px; right: -80px; background: var(--aqua); animation: blob-movement-b 15s linear infinite; }
        
        .main-container { padding: 25px 15px 120px 15px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 100vh; width: 100%; }
        
        .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(15px); padding: 25px 20px; border-radius: 24px; width: 100%; max-width: 500px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); border: 3px solid rgba(255, 255, 255, 0.4); margin: 0 auto 20px auto; }
        
        .title { font-family: 'Bebas Neue', sans-serif; font-size: 4.5rem; text-align: center; color: #FFF; line-height: 1; text-shadow: 3px 3px 0px var(--magenta); margin: 0 0 15px 0; animation: title-glow 3s linear infinite; }

        .bottom-nav { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.7); padding: 6px; border-radius: 30px; display: flex; gap: 4px; z-index: 1000; box-shadow: 0 10px 40px rgba(0,0,0,0.1); width: 95%; max-width: 420px; justify-content: space-between; align-items: center; }
        .nav-item { display: flex; align-items: center; justify-content: center; height: 42px; border-radius: 21px; cursor: pointer; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); color: #495057; position: relative; overflow: hidden; flex: 1; }
        .nav-item.active { background: var(--crayola); color: white; padding: 0 16px; box-shadow: 0 4px 12px rgba(55, 114, 255, 0.4); flex: 0 0 auto; }
        .nav-icon { font-size: 1.1rem; z-index: 2; }
        .nav-text { font-size: 0.65rem; font-weight: 900; margin-left: 4px; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.5px; z-index: 2; }
        .unread-dot { position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; background: var(--rose); border-radius: 50%; box-shadow: 0 0 8px var(--rose); animation: pulse-red 2s infinite; z-index: 3; }
        
        .speler-badge { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: rgba(255, 255, 255, 0.8); padding: 6px 16px; border-radius: 20px; font-size: 0.9rem; font-weight: 900; color: var(--crayola); text-transform: uppercase; letter-spacing: 0.5px; border: 2px solid #FFF; box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin-bottom: 20px; }
        .avatar-icon { font-size: 1.1rem; margin-top: -2px; }
        
        .admin-btn { background: #111827; color: #fff; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 900; cursor: pointer; font-size: 0.8rem; margin: 0 auto 15px; display: block; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
        
        .login-title { font-family: 'Bebas Neue', sans-serif; color: var(--crayola); text-align: center; font-size: 2.5rem; margin: 0 0 20px 0; letter-spacing: 1px; }
        .full-input { width: 100%; padding: 15px; border-radius: 15px; border: 2px solid #E9ECEF; font-weight: 800; font-size: 1rem; margin-bottom: 15px; outline: none; transition: 0.2s; }
        .full-input::placeholder { text-align: center; color: #ADB5BD; font-weight: 700; }
        .full-input:focus { border-color: var(--crayola); box-shadow: 0 0 0 4px rgba(55, 114, 255, 0.1); }
        .btn-primary { width: 100%; padding: 18px; border-radius: 16px; background: var(--magenta); color: #FFF; border: none; font-weight: 900; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 15px rgba(240, 56, 255, 0.3); transition: 0.2s; margin-top: 5px; display: block; }
        .btn-primary:active { transform: scale(0.98); }
        
        @keyframes background-fade { 0%, 100% { background-position: 0% 0%; } 50% { background-position: 100% 100%; } }
        @keyframes blob-movement-a { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(50px, 80px) scale(1.1); } }
        @keyframes blob-movement-b { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-40px, -60px) scale(0.9); } }
        @keyframes title-glow { 0%, 100% { text-shadow: 3px 3px 0px var(--magenta); } 50% { text-shadow: 3px 3px 20px rgba(240, 56, 255, 0.8), 3px 3px 0px var(--magenta); } }
        @keyframes slide-down { 0% { top: -50px; opacity: 0; } 100% { top: 20px; opacity: 1; } }
        @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 112, 157, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(239, 112, 157, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 112, 157, 0); } }
      `}</style>

      {/* TOAST POP-UP MELDING */}
      {toast && (
        <div 
          onClick={() => { setActieveTab('kleedkamer'); setToast(null); }}
          style={{
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
            padding: '12px 16px', borderRadius: '16px', zIndex: 9999,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)', display: 'flex', gap: '12px',
            alignItems: 'center', width: '90%', maxWidth: '350px', cursor: 'pointer',
            border: '2px solid rgba(240, 56, 255, 0.3)', animation: 'slide-down 0.4s ease-out'
          }}
        >
          <div style={{ background: 'linear-gradient(135deg, var(--crayola), var(--magenta))', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
            💬
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontWeight: 900, color: '#111827', fontSize: '0.8rem', marginBottom: '2px' }}>{toast.naam}</span>
            <span style={{ color: '#6C757D', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 800 }}>{toast.bericht}</span>
          </div>
        </div>
      )}

      {showConfetti && <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',zIndex:999,textAlign:'center',fontSize:'5rem', pointerEvents:'none'}}>🎉🌟⚽</div>}

      <div className="glass-card">
        <h1 className="title">WK 2026</h1>

        {/* STRAKKE AVATAR BADGE */}
        {actieveSpeler && (
          <div style={{ textAlign: 'center' }}>
            <div className="speler-badge">
              <span className="avatar-icon">👤</span>
              <span>{actieveSpeler.naam}</span>
            </div>
          </div>
        )}

        {/* UITKLAPBAAR REGLEMENT (ENKEL BIJ RANKING) */}
        {actieveSpeler && actieveTab === 'ranking' && (
          <div style={{ width: '100%', marginBottom: '15px' }}>
            <button 
              onClick={() => setInfoOpen(!infoOpen)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.9)', border: '2px solid var(--crayola)', color: 'var(--crayola)', padding: '12px', borderRadius: '12px', fontWeight: 900, fontSize: '0.8rem', cursor: 'pointer', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}
            >
              <span>📜 REGLEMENT & PUNTEN</span>
              <span>{infoOpen ? '▲' : '▼'}</span>
            </button>

            {infoOpen && (
              <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid var(--magenta)', marginTop: '10px', fontSize: '0.8rem', color: '#495057', lineHeight: '1.5', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ background: '#F8F9FA', padding: '10px', borderRadius: '12px', border: '1px solid #E9ECEF' }}>
                    <strong style={{color: 'var(--magenta)'}}>⚽ MATCHEN</strong><br/>
                    • Exacte score: <strong>3 pt</strong><br/>
                    • Juiste winnaar/gelijk: <strong>1 pt</strong><br/>
                    • Fout: <strong>0 pt</strong>
                  </div>
                  <div style={{ background: '#F8F9FA', padding: '10px', borderRadius: '12px', border: '1px solid #E9ECEF' }}>
                    <strong style={{color: '#40C057'}}>💎 BONUSVRAGEN</strong><br/>
                    • Goals/Kaarten/WK: <strong>5 pt</strong><br/>
                    • Halve Fin/België: <strong>3 pt</strong><br/>
                    • Aanval/Defensie: <strong>3 pt</strong>
                  </div>
                </div>
                
                <div style={{ background: '#FFFDF5', padding: '10px', borderRadius: '12px', border: '1px solid #FFE066', marginBottom: '10px' }}>
                  <strong style={{color: '#D4AF37'}}>⚖️ GELIJKE STAND (EX-AEQUO)</strong><br/>
                  • <strong>Klassement:</strong> Wie de meeste <em>'Exacte Uitslagen'</em> heeft, wint. Nog gelijk? Dan telt <em>'Juiste Winnaars'</em>.<br/>
                  • <strong>Bonusvragen:</strong> Gedeelde eerste plaats bij topschutter/verdediging/cijfers? Iedereen met dit antwoord krijgt de volle punten.
                </div>

                <div style={{ background: '#F1F3F5', padding: '10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900, textAlign: 'center' }}>
                  💰 DEELNAME: €10 NAAR BE85 0018 2075 8506<br/>
                  <span style={{color: 'var(--magenta)'}}>Mededeling: Naam + WK2026</span>
                </div>
              </div>
            )}
          </div>
        )}

        {isAdmin && (
          <button onClick={syncMetSpreadsheet} className="admin-btn">🔄 {syncStatus || 'SYNC MET GOOGLE SHEETS'}</button>
        )}

        {/* TIMER FLEXBOX FIX VOOR MOBIEL */}
        {!isGesloten && actieveSpeler && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '25px', width: '100%' }}>
            <div style={{ flex: 1, background: 'var(--crayola)', color: '#FFF', padding: '10px 5px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 10px rgba(55, 114, 255, 0.3)' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.6rem', lineHeight: 1 }}>{tijdOver.dagen}</div>
              <div style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '2px' }}>Dagen</div>
            </div>
            <div style={{ flex: 1, background: 'var(--crayola)', color: '#FFF', padding: '10px 5px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 10px rgba(55, 114, 255, 0.3)' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.6rem', lineHeight: 1 }}>{tijdOver.uren}</div>
              <div style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '2px' }}>Uren</div>
            </div>
            <div style={{ flex: 1, background: 'var(--magenta)', color: '#FFF', padding: '10px 5px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 10px rgba(240, 56, 255, 0.3)' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.6rem', lineHeight: 1 }}>{tijdOver.minuten}</div>
              <div style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '2px' }}>Min</div>
            </div>
            <div style={{ flex: 1, background: 'var(--magenta)', color: '#FFF', padding: '10px 5px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 10px rgba(240, 56, 255, 0.3)' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.6rem', lineHeight: 1 }}>{tijdOver.seconden}</div>
              <div style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '2px' }}>Sec</div>
            </div>
          </div>
        )}

        {/* LOGICA: IS INGELOGD? */}
        {actieveSpeler ? (
          /* LOGICA: HEEFT BETAALD OF IS JORDEN? (Voor de goedkeuringen) */
          (!actieveSpeler.betaald && !isJorden) ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🔒</div>
              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: 'var(--magenta)', lineHeight: 1, margin: '0 0 10px 0' }}>APP VERGRENDELD</h2>
              <p style={{ fontWeight: 800, color: '#495057', fontSize: '0.9rem', marginBottom: '20px' }}>
                Je account is nog niet geactiveerd. Om toegang te krijgen tot de pronostiek en de rest van de app, moet je eerst je deelname (<strong>€10</strong>) in orde brengen.
              </p>
              
              <div style={{ background: '#F8F9FA', border: '2px dashed var(--crayola)', borderRadius: '16px', padding: '15px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ADB5BD', textTransform: 'uppercase' }}>Overschrijven naar:</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#111827', margin: '5px 0' }}>BE85 0018 2075 8506</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6C757D' }}>Mededeling: <strong style={{ color: 'var(--magenta)' }}>{actieveSpeler.naam} + WK2026</strong></div>
              </div>

              <p style={{ fontSize: '0.75rem', color: '#ADB5BD', fontWeight: 800 }}>
                Zodra we je betaling hebben ontvangen, wordt je account handmatig goedgekeurd en verdwijnt dit slotje.
              </p>
              
              <button 
                style={{ background: '#E9ECEF', border: 'none', color: '#495057', fontWeight: 900, cursor: 'pointer', padding: '10px 20px', borderRadius: '12px', marginTop: '20px', fontSize: '0.8rem' }} 
                onClick={() => { localStorage.removeItem('wk_speler_id'); window.location.reload(); }}
              >
                UITLOGGEN
              </button>
            </div>
          ) : (
            /* WEL BETAALD (OF JORDEN) = TOON DE APP */
            <div>
              {actieveTab === 'matchen' && <MatchenTab gefilterdeMatchen={gefilterdeMatchen} nu={nu} matchVoorspellingen={matchVoorspellingen} matchSaveStatus={matchSaveStatus} alleMatchVoorspellingen={alleMatchVoorspellingen} alleSpelers={alleSpelers} expandedMatchId={expandedMatchId} setExpandedMatchId={setExpandedMatchId} handleScore={handleScore} filterRonde={filterRonde} setFilterRonde={setFilterRonde} />}
            
              {actieveTab === 'prijs' && <PrijsTab klassement={klassement} matchen={matchen} alleToernooiV={alleToernooiV} />}
              {actieveTab === 'bonus' && <BonusTab winnaar={winnaar} setWinnaar={setWinnaar} hf={hf} setHf={setHf} meesteGoalsLand={meesteGoalsLand} setMeesteGoalsLand={setMeesteGoalsLand} besteVerdedigingLand={besteVerdedigingLand} setBesteVerdedigingLand={setBesteVerdedigingLand} eindstation={eindstation} setEindstation={setEindstation} totaalGoals={totaalGoals} setTotaalGoals={setTotaalGoals} totaalGeel={totaalGeel} setTotaalGeel={setTotaalGeel} totaalRood={totaalRood} setTotaalRood={setTotaalRood} isGesloten={isGesloten} slaBonusOp={slaBonusOp} opslaanStatus={opslaanStatus} WK_LANDEN={WK_LANDEN} />}
              {actieveTab === 'antwoorden' && <AntwoordenTab nu={nu} DEADLINE_DATE={DEADLINE_DATE} alleToernooiV={alleToernooiV} />}
              {actieveTab === 'ranking' && <RankingTab klassement={klassement} actieveSpeler={actieveSpeler} toggleBetaald={toggleBetaald} />}
              {actieveTab === 'tellers' && <TellersTab matchen={matchen} alleToernooiV={alleToernooiV} isAdmin={isAdmin} />}
              {actieveTab === 'kleedkamer' && <ChatTab chatBerichten={chatBerichten} actieveSpeler={actieveSpeler} chatEindeRef={chatEindeRef} nieuwBericht={nieuwBericht} setNieuwBericht={setNieuwBericht} verstuurChat={verstuurChat} />}
              
              <div style={{textAlign:'center', marginTop:30, paddingBottom: 20}}>
                <button style={{background:'none', border:'none', color:'#111827', fontWeight:900, cursor:'pointer', opacity: 0.6}} onClick={() => {localStorage.removeItem('wk_speler_id'); window.location.reload();}}>UITLOGGEN</button>
              </div>
            </div>
          )
        ) : (
          <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <form onSubmit={isRegistreren ? handleRegistreer : handleLogin} style={{width: '100%'}}>
              <h2 className="login-title">
                {isRegistreren ? 'Nieuwe Speler' : 'INLOGGEN'}
              </h2>
              <input className="full-input" placeholder={isRegistreren ? "Voornaam + Familienaam" : "Je Naam"} value={ontgrendelNaam} onChange={e=>setOntgrendelNaam(e.target.value)} />
              <input className="full-input" type="password" placeholder={isRegistreren ? "Kies een veilige pincode" : "Pincode"} value={invoerCode} onChange={e=>setInvoerCode(e.target.value)} />
              <button className="btn-primary" type="submit">
                {isRegistreren ? 'ACCOUNT AANMAKEN' : 'HET VELD OP ⚽'}
              </button>
              <p style={{color:'red', textAlign:'center', fontWeight:900, marginTop: '10px'}}>{status}</p>
            </form>
            <button 
              onClick={(e) => { e.preventDefault(); setIsRegistreren(!isRegistreren); setStatus(''); setOntgrendelNaam(''); setInvoerCode(''); }}
              style={{background: 'transparent', border: 'none', color: '#6C757D', fontWeight: 900, marginTop: '10px', cursor: 'pointer', textDecoration: 'underline', padding: '10px'}}
            >
              {isRegistreren ? 'Heb je al een account? Log in' : 'Nieuw hier? Maak een account aan'}
            </button>
          </div>
        )}
      </div>

      {/* ONDERSTE NAVIGATIEBALK (VERBERGEN ALS APP OP SLOT ZIT) */}
      {actieveSpeler && (actieveSpeler.betaald || isJorden) && (
        <div className="bottom-nav">
          {[
            {id:'ranking', i:'🏆', n:'Rank'},
            {id:'matchen', i:'⚽', n:'Match'},
            {id:'bonus', i:'💎', n:'Bonus'},
            {id:'kleedkamer', i:'💬', n:'Chat'},
            {id:'antwoorden', i:'👁️', n:'Antw'},
            {id:'tellers', i:'📊', n:'Data'},
            {id:'prijs', i:'💰', n:'Prijs'}
          ].map(t => {
            const isActive = actieveTab === t.id;
            return (
              <div 
                key={t.id} 
                className={`nav-item ${isActive ? 'active' : 'inactive'}`} 
                onClick={() => veranderTab(t.id)}
              >
                <span className="nav-icon">{t.i}</span>
                {isActive && <span className="nav-text">{t.n}</span>}
                {t.id === 'kleedkamer' && ongelezenBerichten && !isActive && <span className="unread-dot" />}
              </div>
            );
          })}
        </div>
      )}

    </main>
  );
}
