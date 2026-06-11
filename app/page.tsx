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
const POPUP_DEADLINE = new Date('2026-06-11T19:00:00+02:00').getTime();

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
  const [showInstallPopup, setShowInstallPopup] = useState(true);
  const [ontbrekendeBonus, setOntbrekendeBonus] = useState<string[]>([]); 

  const actieveTabRef = useRef(actieveTab);
  const actieveSpelerRef = useRef(actieveSpeler);
  const alleSpelersRef = useRef(alleSpelers);

  const [syncStatus, setSyncStatus] = useState('');
  
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
  const [isTimerLoaded, setIsTimerLoaded] = useState(false); // NIEUW: Zorgt ervoor dat we geen 0 0 0 0 zien
  const [isGesloten, setIsGesloten] = useState(false); 

  const toonInstallPopup = nu < POPUP_DEADLINE && showInstallPopup;

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
    haalDataVoorPopupOp(); 
    
    // Klok update functie
    const updateKlok = () => {
      const nuTijd = new Date().getTime();
      setNu(nuTijd); 
      const verschil = DEADLINE_DATE - nuTijd;
      if (verschil <= 0) {
        setIsGesloten(true);
      } else {
        setTijdOver({
          dagen: Math.floor(verschil / (1000 * 60 * 60 * 24)),
          uren: Math.floor((verschil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minuten: Math.floor((verschil % (1000 * 60 * 60)) / (1000 * 60)),
          seconden: Math.floor((verschil % (1000 * 60)) / 1000)
        });
      }
      setIsTimerLoaded(true); // Nu mag hij getoond worden!
    };

    updateKlok(); // Voer direct 1x uit om de "0 0 0 0" te vermijden
    const klokInterval = setInterval(updateKlok, 1000);

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

  const haalDataVoorPopupOp = async () => {
    const { data: spelers } = await supabase.from('spelers').select('id, naam, betaald');
    const { data: bonus } = await supabase.from('toernooi_voorspellingen').select('speler_id, winnaar');
    
    if (spelers && bonus) {
      const ontbrekend = spelers
        .filter(s => s.betaald) 
        .filter(s => {
           const v = bonus.find(b => b.speler_id === s.id);
           return !v || !v.winnaar || v.winnaar.trim() === '';
        })
        .map(s => s.naam.split(' ')[0]); 
      setOntbrekendeBonus(ontbrekend);
    }
  };

  useEffect(() => {
    if (!actieveSpeler) return;

    const registreerLogin = async () => {
      await supabase.from('spelers').update({
        aantal_logins: (actieveSpeler.aantal_logins || 0) + 1,
        laatste_login: new Date().toISOString()
      }).eq('id', actieveSpeler.id);
    };
    registreerLogin();

    const interval = setInterval(async () => {
      const { data } = await supabase.from('spelers').select('tijd_gespendeerd').eq('id', actieveSpeler.id).single();
      if (data) {
        await supabase.from('spelers').update({
          tijd_gespendeerd: (data.tijd_gespendeerd || 0) + 60
        }).eq('id', actieveSpeler.id);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [actieveSpeler?.id]); 

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

    const matchenGespeeld = m.some((match: any) => match.thuis_score !== null);
    
    let eindStats = stats.map(sp => {
      if (!matchenGespeeld) {
        return { ...sp, totaal_score: 0, prono_score: 0, bonus_score: 0, exact: 0, winnaarCorrect: 0, fout: 0, bonus_breakdown: [] };
      }
      return sp; 
    });

    eindStats.sort((a, b) => {
      if (!matchenGespeeld) {
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
        
        :root { 
          --wk-blue: #2B00FF;    
          --wk-red: #E30022;     
          --wk-orange: #FF6B00;  
          --wk-lime: #CCFF00;    
          --wk-aqua: #00E5FF;    
          --wk-purple: #7A00E6;  
          
          --crayola: var(--wk-blue); 
          --magenta: var(--wk-purple); 
          --rose: var(--wk-orange); 
          --lime: var(--wk-lime); 
          --aqua: var(--wk-aqua); 
        }
        
        *, *::before, *::after { box-sizing: border-box; }

        html, body { 
          margin: 0; padding: 0; width: 100%; min-height: 100%; 
          font-family: 'Nunito', sans-serif; 
          color: #FFF; 
          background: #090514; 
          overflow-x: hidden; 
        }
        
        .main-container { padding: 25px 15px 120px 15px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 100vh; width: 100%; }
        
        .glass-card { 
          background: transparent; 
          padding: 10px 0; 
          width: 100%; max-width: 500px; 
          margin: 0 auto 20px auto; 
        }
        
        .title { 
          font-family: 'Bebas Neue', sans-serif; font-size: 5.5rem; text-align: center; color: #FFF; 
          line-height: 1; 
          text-shadow: 4px 4px 0px var(--wk-blue), -3px -3px 0px var(--wk-red); 
          margin: 0 0 25px 0; letter-spacing: 2px;
        }

        .bottom-nav { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(20, 15, 30, 0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); padding: 6px; border-radius: 30px; display: flex; gap: 4px; z-index: 1000; box-shadow: 0 10px 40px rgba(0,0,0,0.8); width: 95%; max-width: 420px; justify-content: space-between; align-items: center; }
        .nav-item { display: flex; align-items: center; justify-content: center; height: 42px; border-radius: 21px; cursor: pointer; transition: all 0.3s ease; color: #6C757D; position: relative; overflow: hidden; flex: 1; }
        .nav-item.active { background: var(--wk-lime); color: #111827; padding: 0 16px; box-shadow: 0 0 15px rgba(204, 255, 0, 0.4); flex: 0 0 auto; }
        .nav-icon { font-size: 1.1rem; z-index: 2; }
        .nav-text { font-size: 0.65rem; font-weight: 900; margin-left: 4px; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.5px; z-index: 2; }
        .unread-dot { position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; background: var(--wk-red); border-radius: 50%; box-shadow: 0 0 8px var(--wk-red); z-index: 3; }
        
        .speler-badge { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--wk-lime); padding: 8px 20px; border-radius: 20px; font-size: 1rem; font-weight: 900; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(204, 255, 0, 0.3); margin-bottom: 25px; border: 2px solid #FFF; }
        .avatar-icon { font-size: 1.2rem; margin-top: -2px; }
        
        .admin-btn { background: var(--wk-red); color: #fff; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 900; cursor: pointer; font-size: 0.8rem; margin: 0 auto 20px; display: block; box-shadow: 0 4px 15px rgba(227, 0, 34, 0.4); }
        
        .login-title { font-family: 'Bebas Neue', sans-serif; color: var(--wk-lime); text-align: center; font-size: 3rem; margin: 0 0 20px 0; letter-spacing: 2px; text-shadow: 0 0 10px rgba(204,255,0,0.3); }
        .full-input { width: 100%; padding: 15px; border-radius: 15px; border: 2px solid #333; background: #1A1423; color: #FFF; font-weight: 800; font-size: 1rem; margin-bottom: 15px; outline: none; transition: 0.2s; }
        .full-input::placeholder { text-align: center; color: #6C757D; font-weight: 700; }
        .full-input:focus { border-color: var(--wk-aqua); box-shadow: 0 0 15px rgba(0, 229, 255, 0.2); }
        .btn-primary { width: 100%; padding: 18px; border-radius: 16px; background: var(--wk-blue); color: #FFF; border: none; font-weight: 900; font-size: 1.2rem; cursor: pointer; box-shadow: 0 4px 20px rgba(43, 0, 255, 0.5); transition: 0.2s; margin-top: 5px; display: block; text-transform: uppercase; letter-spacing: 1px; }
        .btn-primary:active { transform: scale(0.98); }
      `}</style>

      {/* 🚨 INSTALLATIE POP-UP & BONUS WAARSCHUWING 🚨 */}
      {toonInstallPopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(9, 5, 20, 0.85)', backdropFilter: 'blur(10px)',
          zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#1A1423', borderRadius: '24px', padding: '25px', width: '100%', maxWidth: '380px',
            position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '2px solid var(--wk-red)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <button 
              onClick={() => setShowInstallPopup(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.1)', border: 'none', width: '30px', height: '30px', borderRadius: '50%', fontWeight: 900, color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</button>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '10px' }}>🚨</div>
              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: 'var(--wk-red)', margin: '0 0 5px 0', lineHeight: 1, letterSpacing: '1px' }}>VERGEET DE BONUS NIET!</h2>
              <div style={{ background: 'var(--wk-red)', color: '#FFF', padding: '8px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', display: 'inline-block', marginBottom: '15px', boxShadow: '0 4px 15px rgba(227, 0, 34, 0.4)' }}>
                ⏰ DEADLINE: VANAVOND OM 21:00
              </div>
              
              <p style={{ fontSize: '0.85rem', color: '#ADB5BD', fontWeight: 800, margin: '0 0 10px 0' }}>Deze spelers moeten hun bonusvragen nog invullen:</p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                {ontbrekendeBonus.length === 0 ? (
                  <span style={{ background: 'var(--wk-lime)', color: '#111827', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 900 }}>
                    🎉 Iedereen heeft de bonus ingevuld!
                  </span>
                ) : (
                  ontbrekendeBonus.map((naam, i) => (
                    <span key={i} style={{ background: 'rgba(227, 0, 34, 0.15)', color: '#FFF', border: '1px solid var(--wk-red)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900 }}>
                      {naam}
                    </span>
                  ))
                )}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed rgba(255,255,255,0.2)', margin: '20px 0' }} />

            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: 'var(--wk-aqua)', margin: '0 0 10px 0', lineHeight: 1 }}>📲 App Installeren</h3>
            <p style={{ fontSize: '0.75rem', color: '#ADB5BD', fontWeight: 800, marginBottom: '15px' }}>Voor de beste ervaring zet je deze pronostiek op je startscherm.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px', borderLeft: '3px solid var(--wk-blue)' }}>
                <strong style={{ fontSize: '0.75rem', color: '#FFF' }}>🍎 iPhone (Safari):</strong>
                <div style={{ fontSize: '0.65rem', color: '#868E96', marginTop: '2px' }}>Tik onderaan op het <strong>deel-icoontje</strong> en kies <strong>'Zet op beginscherm'</strong>.</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px', borderLeft: '3px solid var(--wk-lime)' }}>
                <strong style={{ fontSize: '0.75rem', color: '#FFF' }}>🤖 Android (Chrome):</strong>
                <div style={{ fontSize: '0.65rem', color: '#868E96', marginTop: '2px' }}>Tik rechtsboven op de <strong>drie puntjes</strong> en kies <strong>'Toevoegen aan startscherm'</strong>.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div 
          onClick={() => { setActieveTab('kleedkamer'); setToast(null); }}
          style={{
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            background: '#1A1423', border: '2px solid var(--wk-lime)',
            padding: '12px 16px', borderRadius: '16px', zIndex: 9999,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', gap: '12px',
            alignItems: 'center', width: '90%', maxWidth: '350px', cursor: 'pointer'
          }}
        >
          <div style={{ background: 'var(--wk-lime)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
            💬
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontWeight: 900, color: '#FFF', fontSize: '0.8rem', marginBottom: '2px' }}>{toast.naam}</span>
            <span style={{ color: '#ADB5BD', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 800 }}>{toast.bericht}</span>
          </div>
        </div>
      )}

      <div className="glass-card">
        <h1 className="title">WK 2026</h1>

        {actieveSpeler && (
          <div style={{ textAlign: 'center' }}>
            <div className="speler-badge">
              <span className="avatar-icon">👤</span>
              <span>{actieveSpeler.naam}</span>
            </div>
          </div>
        )}

        {actieveSpeler && actieveTab === 'ranking' && (
          <div style={{ width: '100%', marginBottom: '20px' }}>
            <button 
              onClick={() => setInfoOpen(!infoOpen)}
              style={{ width: '100%', background: '#1A1423', border: '2px solid var(--wk-aqua)', color: 'var(--wk-aqua)', padding: '15px', borderRadius: '16px', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(0, 229, 255, 0.2)' }}
            >
              <span>📜 REGLEMENT & PUNTEN</span>
              <span>{infoOpen ? '▲' : '▼'}</span>
            </button>

            {infoOpen && (
              <div style={{ background: '#1A1423', padding: '20px', borderRadius: '16px', borderLeft: '4px solid var(--wk-purple)', marginTop: '10px', fontSize: '0.8rem', color: '#ADB5BD', lineHeight: '1.5', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <strong style={{color: 'var(--wk-red)', fontSize: '0.9rem'}}>⚽ MATCHEN</strong><br/>
                    <span style={{color: '#FFF'}}>• Exacte score: <strong>3 pt</strong></span><br/>
                    <span style={{color: '#FFF'}}>• Juiste winnaar/gelijk: <strong>1 pt</strong></span><br/>
                    <span style={{color: '#FFF'}}>• Fout: <strong>0 pt</strong></span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <strong style={{color: 'var(--wk-lime)', fontSize: '0.9rem'}}>💎 BONUSVRAGEN</strong><br/>
                    <span style={{color: '#FFF'}}>• Goals/Kaarten/WK: <strong>5 pt</strong></span><br/>
                    <span style={{color: '#FFF'}}>• Halve Fin/België: <strong>3 pt</strong></span><br/>
                    <span style={{color: '#FFF'}}>• Aanval/Defensie: <strong>3 pt</strong></span>
                  </div>
                </div>
                
                <div style={{ background: 'rgba(255, 107, 0, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid var(--wk-orange)', marginBottom: '15px' }}>
                  <strong style={{color: 'var(--wk-orange)', fontSize: '0.9rem'}}>⚖️ GELIJKE STAND (EX-AEQUO)</strong><br/>
                  <span style={{color: '#FFF'}}>• <strong>Klassement:</strong> Wie de meeste <em>'Exacte Uitslagen'</em> heeft, wint. Nog gelijk? Dan telt <em>'Juiste Winnaars'</em>.</span><br/>
                  <span style={{color: '#FFF'}}>• <strong>Bonusvragen:</strong> Gedeelde eerste plaats bij topschutter/verdediging/cijfers? Iedereen met dit antwoord krijgt de volle punten.</span>
                </div>

                <div style={{ background: 'var(--wk-blue)', padding: '12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 900, textAlign: 'center', color: '#FFF', boxShadow: '0 4px 15px rgba(43,0,255,0.3)' }}>
                  💰 DEELNAME: €10 NAAR BE85 0018 2075 8506<br/>
                  <span style={{color: 'var(--wk-lime)'}}>Mededeling: Naam + WK2026</span>
                </div>
              </div>
            )}
          </div>
        )}

        {isAdmin && (
          <button onClick={syncMetSpreadsheet} className="admin-btn">🔄 {syncStatus || 'SYNC MET GOOGLE SHEETS'}</button>
        )}

        {/* TIMER WORDT PAS GETOOND ALS DE BEREKENING KLAAR IS OM FLITSEN TE VERMIJDEN */}
        {!isGesloten && actieveSpeler && isTimerLoaded && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '30px', width: '100%' }}>
            <div style={{ flex: 1, background: 'var(--wk-lime)', color: '#111827', padding: '15px 5px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 15px rgba(204, 255, 0, 0.3)' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', lineHeight: 1 }}>{tijdOver.dagen}</div>
              <div style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '2px' }}>Dagen</div>
            </div>
            <div style={{ flex: 1, background: 'var(--wk-purple)', color: '#FFF', padding: '15px 5px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 15px rgba(122, 0, 230, 0.4)' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', lineHeight: 1 }}>{tijdOver.uren}</div>
              <div style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '2px' }}>Uren</div>
            </div>
            <div style={{ flex: 1, background: 'var(--wk-aqua)', color: '#111827', padding: '15px 5px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0, 229, 255, 0.4)' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', lineHeight: 1 }}>{tijdOver.minuten}</div>
              <div style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '2px' }}>Min</div>
            </div>
            <div style={{ flex: 1, background: 'var(--wk-red)', color: '#FFF', padding: '15px 5px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 15px rgba(227, 0, 34, 0.4)' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', lineHeight: 1 }}>{tijdOver.seconden}</div>
              <div style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '2px' }}>Sec</div>
            </div>
          </div>
        )}

        {actieveSpeler ? (
          (!actieveSpeler.betaald && !isJorden) ? (
            <div style={{ textAlign: 'center', padding: '20px 0', background: '#1A1423', borderRadius: '24px', border: '2px solid var(--wk-red)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🔒</div>
              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '3rem', color: 'var(--wk-red)', lineHeight: 1, margin: '0 0 10px 0' }}>APP VERGRENDELD</h2>
              <p style={{ fontWeight: 800, color: '#ADB5BD', fontSize: '0.9rem', marginBottom: '20px', padding: '0 15px' }}>
                Je account wacht nog op goedkeuring. Breng je deelname (<strong>€10</strong>) in orde om mee te doen.
              </p>
              
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', margin: '0 15px 20px 15px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--wk-aqua)', textTransform: 'uppercase' }}>Overschrijven naar:</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FFF', margin: '8px 0' }}>BE85 0018 2075 8506</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ADB5BD' }}>Mededeling: <strong style={{ color: 'var(--wk-lime)' }}>{actieveSpeler.naam} + WK2026</strong></div>
              </div>

              <button 
                style={{ background: '#333', border: 'none', color: '#FFF', fontWeight: 900, cursor: 'pointer', padding: '12px 25px', borderRadius: '12px', fontSize: '0.8rem' }} 
                onClick={() => { localStorage.removeItem('wk_speler_id'); window.location.reload(); }}
              >
                UITLOGGEN
              </button>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              {actieveTab === 'matchen' && <MatchenTab gefilterdeMatchen={gefilterdeMatchen} nu={nu} matchVoorspellingen={matchVoorspellingen} matchSaveStatus={matchSaveStatus} alleMatchVoorspellingen={alleMatchVoorspellingen} alleSpelers={alleSpelers} expandedMatchId={expandedMatchId} setExpandedMatchId={setExpandedMatchId} handleScore={handleScore} filterRonde={filterRonde} setFilterRonde={setFilterRonde} />}
            
              {actieveTab === 'prijs' && <PrijsTab klassement={klassement} matchen={matchen} alleToernooiV={alleToernooiV} />}
              {actieveTab === 'bonus' && <BonusTab winnaar={winnaar} setWinnaar={setWinnaar} hf={hf} setHf={setHf} meesteGoalsLand={meesteGoalsLand} setMeesteGoalsLand={setMeesteGoalsLand} besteVerdedigingLand={besteVerdedigingLand} setBesteVerdedigingLand={setBesteVerdedigingLand} eindstation={eindstation} setEindstation={setEindstation} totaalGoals={totaalGoals} setTotaalGoals={setTotaalGoals} totaalGeel={totaalGeel} setTotaalGeel={setTotaalGeel} totaalRood={totaalRood} setTotaalRood={setTotaalRood} isGesloten={isGesloten} slaBonusOp={slaBonusOp} opslaanStatus={opslaanStatus} WK_LANDEN={WK_LANDEN} />}
              {actieveTab === 'antwoorden' && <AntwoordenTab nu={nu} DEADLINE_DATE={DEADLINE_DATE} alleToernooiV={alleToernooiV} />}
              {actieveTab === 'ranking' && <RankingTab klassement={klassement} actieveSpeler={actieveSpeler} toggleBetaald={toggleBetaald} isJorden={isJorden} />}
              {actieveTab === 'tellers' && <TellersTab matchen={matchen} alleToernooiV={alleToernooiV} isAdmin={isAdmin} />}
              {actieveTab === 'kleedkamer' && <ChatTab chatBerichten={chatBerichten} actieveSpeler={actieveSpeler} chatEindeRef={chatEindeRef} nieuwBericht={nieuwBericht} setNieuwBericht={setNieuwBericht} verstuurChat={verstuurChat} />}
              
              <div style={{textAlign:'center', marginTop:40, paddingBottom: 20}}>
                <button style={{background:'rgba(255,255,255,0.1)', border:'none', color:'#ADB5BD', fontWeight:900, cursor:'pointer', padding: '10px 20px', borderRadius: '12px'}} onClick={() => {localStorage.removeItem('wk_speler_id'); window.location.reload();}}>UITLOGGEN</button>
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
              <p style={{color:'var(--wk-red)', textAlign:'center', fontWeight:900, marginTop: '15px'}}>{status}</p>
            </form>
            <button 
              onClick={(e) => { e.preventDefault(); setIsRegistreren(!isRegistreren); setStatus(''); setOntgrendelNaam(''); setInvoerCode(''); }}
              style={{background: 'transparent', border: 'none', color: '#ADB5BD', fontWeight: 900, marginTop: '10px', cursor: 'pointer', textDecoration: 'underline', padding: '10px'}}
            >
              {isRegistreren ? 'Heb je al een account? Log in' : 'Nieuw hier? Maak een account aan'}
            </button>
          </div>
        )}
      </div>

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
