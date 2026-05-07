'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { WK_LANDEN, TOP_SPELERS, TOP_KEEPERS } from '../lib/data';

// DEADLINE: 11 Juni 2026 om 21:00
const DEADLINE_DATE = new Date('2026-06-11T21:00:00+02:00').getTime();

// Leuke avatars om uit te kiezen
const AVATARS = ['⚽', '🦁', '🍟', '🍺', '👑', '🔥', '🏆', '👽', '🤡', '😎', '👻', '🌶️'];

export default function Home() {
  // LOGIN / INSCHRIJVING
  const [ontgrendelNaam, setOntgrendelNaam] = useState('');
  const [inschrijfNaam, setInschrijfNaam] = useState('');
  const [invoerCode, setInvoerCode] = useState('');
  const [kiesAvatar, setKiesAvatar] = useState('⚽');
  const [status, setStatus] = useState('');
  const [spelers, setSpelers] = useState<any[]>([]);
  const [actieveSpeler, setActieveSpeler] = useState<any>(null);
  
  // NAVIGATIE
  const [actieveTab, setActieveTab] = useState('toernooi');
  
  // TOERNOOI INVOER
  const [voorspellingStatus, setVoorspellingStatus] = useState('');
  const [showConfetti, setShowConfetti] = useState(false); // 🎉 CONFETTI STATE
  const [winnaar, setWinnaar] = useState('');
  const [topschutter, setTopschutter] = useState('');
  const [besteKeeper, setBesteKeeper] = useState('');
  const [eindstation, setEindstation] = useState('');
  const [totaalGoals, setTotaalGoals] = useState('');
  const [geelKaarten, setGeelKaarten] = useState('');
  const [roodKaarten, setRoodKaarten] = useState('');
  const [lv1, setLv1] = useState('');
  const [lv2, setLv2] = useState('');
  const [lv3, setLv3] = useState('');
  const [lv4, setLv4] = useState('');

  // COUNTDOWN
  const [tijdOver, setTijdOver] = useState({ dagen: 0, uren: 0, minuten: 0, seconden: 0 });
  const [isGesloten, setIsGesloten] = useState(false);

  // DATA
  const [klassement, setKlassement] = useState<any[]>([]);
  const [alleVoorspellingen, setAlleVoorspellingen] = useState<any[]>([]);
  
  // KLEEDKAMER (CHAT)
  const [chatBerichten, setChatBerichten] = useState<any[]>([]);
  const [nieuwBericht, setNieuwBericht] = useState('');
  const chatEindeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opgeslagenId = localStorage.getItem('wk_speler_id');
    haalSpelersOp(opgeslagenId);

    const klokInterval = setInterval(() => {
      const nu = new Date().getTime();
      const verschil = DEADLINE_DATE - nu;

      if (verschil <= 0) {
        setIsGesloten(true);
        clearInterval(klokInterval);
      } else {
        setTijdOver({
          dagen: Math.floor(verschil / (1000 * 60 * 60 * 24)),
          uren: Math.floor((verschil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minuten: Math.floor((verschil % (1000 * 60 * 60)) / (1000 * 60)),
          seconden: Math.floor((verschil % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(klokInterval);
  }, []);

  useEffect(() => {
    if (actieveSpeler) {
      if (actieveTab === 'toernooi') haalToernooiVoorspellingOp();
      if (actieveTab === 'ranking') haalKlassementOp();
      if (actieveTab === 'antwoorden') haalAlleVoorspellingenOp();
      if (actieveTab === 'kleedkamer') haalChatOp();
    }
  }, [actieveSpeler, actieveTab]);

  const haalSpelersOp = async (checkId?: string | null) => {
    const { data, error } = await supabase.from('spelers').select('*').order('created_at', { ascending: true });
    if (!error && data) {
      setSpelers(data);
      if (checkId) {
        const gevonden = data.find(s => s.id.toString() === checkId);
        if (gevonden) setActieveSpeler(gevonden);
      }
    }
  };

  const haalKlassementOp = async () => {
    const { data, error } = await supabase.from('spelers').select('*').order('totaal_score', { ascending: false });
    if (!error && data) setKlassement(data);
  };

  const haalAlleVoorspellingenOp = async () => {
    if (spelers.length === 0) await haalSpelersOp();
    const { data, error } = await supabase.from('toernooi_voorspellingen').select('*');
    if (!error && data) setAlleVoorspellingen(data);
  };

  const haalChatOp = async () => {
    const { data, error } = await supabase
      .from('kleedkamer')
      .select('*, spelers(naam, avatar)')
      .order('created_at', { ascending: true });
    if (!error && data) {
      setChatBerichten(data);
      setTimeout(() => chatEindeRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const verstuurChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nieuwBericht.trim()) return;
    const { error } = await supabase.from('kleedkamer').insert([{ speler_id: actieveSpeler.id, bericht: nieuwBericht.trim() }]);
    if (!error) { setNieuwBericht(''); haalChatOp(); }
  };

  const haalToernooiVoorspellingOp = async () => {
    if (!actieveSpeler) return;
    const { data } = await supabase.from('toernooi_voorspellingen').select('*').eq('speler_id', actieveSpeler.id).single();
    if (data) {
      setWinnaar(data.winnaar || ''); setTopschutter(data.topschutter || '');
      setBesteKeeper(data.beste_keeper || ''); setEindstation(data.eindstation_belgie || '');
      setTotaalGoals(data.totaal_goals_tornooi?.toString() || '');
      setGeelKaarten(data.totaal_gele_kaarten?.toString() || '');
      setRoodKaarten(data.totaal_rode_kaarten?.toString() || '');
      if (data.laatste_vier && data.laatste_vier.length === 4) {
        setLv1(data.laatste_vier[0]); setLv2(data.laatste_vier[1]);
        setLv3(data.laatste_vier[2]); setLv4(data.laatste_vier[3]);
      }
    }
  };

  const slaToernooiVoorspellingOp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGesloten) return;

    setVoorspellingStatus('Bezig met opslaan...');
    const laatsteVierArray = [lv1, lv2, lv3, lv4].filter(land => land.trim() !== '');
    const voorspellingData = {
      speler_id: actieveSpeler.id, winnaar: winnaar.trim(), topschutter: topschutter.trim(),
      beste_keeper: besteKeeper.trim(), eindstation_belgie: eindstation.trim(),
      totaal_goals_tornooi: parseInt(totaalGoals) || 0, totaal_gele_kaarten: parseInt(geelKaarten) || 0,
      totaal_rode_kaarten: parseInt(roodKaarten) || 0, laatste_vier: laatsteVierArray
    };

    const { data: bestaand } = await supabase.from('toernooi_voorspellingen').select('id').eq('speler_id', actieveSpeler.id).single();
    let error;
    if (bestaand) {
      error = (await supabase.from('toernooi_voorspellingen').update(voorspellingData).eq('speler_id', actieveSpeler.id)).error;
    } else {
      error = (await supabase.from('toernooi_voorspellingen').insert([voorspellingData])).error;
    }

    if (error) setVoorspellingStatus('🚩 Buitenspel! Probeer opnieuw.');
    else {
      setVoorspellingStatus('✅ Wereldgoal! Opgeslagen.');
      setShowConfetti(true); // 🎉 Activeer Confetti
      setTimeout(() => setShowConfetti(false), 4000); // Zet uit na 4s
      setTimeout(() => setVoorspellingStatus(''), 3000);
    }
  };

  const schrijfIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('De VAR kijkt ernaar... 📺');
    const { error } = await supabase.from('spelers').insert([{ naam: inschrijfNaam.trim(), totaal_score: 0, avatar: kiesAvatar }]);
    if (error) setStatus('🚩 Naam bestaat al of er is een fout.');
    else { setStatus('✅ Transfer afgerond! Vraag je code.'); setInschrijfNaam(''); haalSpelersOp(); }
  };

  const ontgrendel = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('De VAR kijkt ernaar... 📺');
    const { data: speler, error } = await supabase.from('spelers').select('*').ilike('naam', ontgrendelNaam.trim()).single();
    if (error || !speler) { setStatus('🚩 Speler niet gevonden op het veld.'); return; }
    if (String(speler.code).trim() === String(invoerCode).trim()) {
      localStorage.setItem('wk_speler_id', speler.id.toString());
      setActieveSpeler(speler); setStatus(''); setInvoerCode(''); setOntgrendelNaam('');
    } else setStatus('🚩 Code is fout. Gele kaart!');
  };

  const VeiligAntwoord = ({ toon, waarde }: { toon: boolean, waarde: string }) => {
    if (toon) return <span className="antw-text neon-text">{waarde}</span>;
    return <span className="antw-text blurred-waarde">█████████</span>;
  };

  const CATEGORIEEN = [
    { key: 'winnaar', label: 'Eindwinnaar WK', stand: 'Nog niet bekend' },
    { key: 'topschutter', label: 'Topschutter', stand: 'Momenteel: 0 goals' },
    { key: 'beste_keeper', label: 'Beste Keeper', stand: 'Nog niet bekend' },
    { key: 'eindstation_belgie', label: 'Eindstation Rode Duivels', stand: 'Groepsfase bezig' },
    { key: 'laatste_vier', label: 'De Laatste Vier', stand: 'Nog niet bekend' },
    { key: 'totaal_goals_tornooi', label: 'Totaal Doelpunten', stand: 'Momenteel: 0 goals' },
    { key: 'totaal_gele_kaarten', label: 'Totaal Gele Kaarten', stand: 'Momenteel: 0 kaarten' },
    { key: 'totaal_rode_kaarten', label: 'Totaal Rode Kaarten', stand: 'Momenteel: 0 kaarten' },
  ];

  return (
    <main className="main-container">
      <style>{`
        /* IMPORT SPORT FONTS */
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;800;900&display=swap');

        html, body { margin: 0; padding: 0; width: 100%; min-height: 100%; background: #0B0E14; overflow-x: hidden; }
        .main-container { margin: 0; padding: 15px 15px 80px 15px; min-height: 100vh; display: flex; flex-direction: column; align-items: center; font-family: 'Inter', sans-serif; background: radial-gradient(circle at 50% 0%, #1a2235 0%, #090c15 100%); color: #E0E6ED; box-sizing: border-box; }
        
        .glass-card { background: rgba(15, 20, 30, 0.6); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); padding: 30px 20px; border-radius: 32px; border: 1px solid rgba(0, 240, 255, 0.15); width: 100%; max-width: 500px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(0, 240, 255, 0.05); position: relative; z-index: 10; }
        
        .title { font-family: 'Bebas Neue', sans-serif; font-size: 4rem; letter-spacing: 2px; margin: 0; text-align: center; color: #FFF; text-shadow: 0 0 20px rgba(0, 240, 255, 0.4); line-height: 1; }
        .subtitle { font-size: 0.75rem; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 25px; color: #00F0FF; text-align: center; }
        
        /* CONFETTI ANIMATIE */
        .confetti-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999; overflow: hidden; display: flex; justify-content: center; }
        .confetti { position: absolute; width: 10px; height: 10px; background-color: #00F0FF; animation: fall linear forwards; }
        .confetti:nth-child(2n) { background-color: #FF0055; }
        .confetti:nth-child(3n) { background-color: #FFD700; }
        @keyframes fall { 0% { transform: translateY(-100px) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }

        /* TABS (SCROLLABLE OP MOBIEL) */
        .tab-container { display: flex; background: rgba(0,0,0,0.4); border-radius: 16px; padding: 5px; margin-bottom: 25px; overflow-x: auto; scrollbar-width: none; }
        .tab-container::-webkit-scrollbar { display: none; }
        .tab { flex: 1; min-width: 80px; text-align: center; padding: 12px 5px; font-size: 0.65rem; font-weight: 800; border-radius: 12px; cursor: pointer; transition: all 0.3s; opacity: 0.5; white-space: nowrap; letter-spacing: 1px; color: white; }
        .tab:active { transform: scale(0.95); }
        .tab.active { background: rgba(0, 240, 255, 0.1); color: #00F0FF; opacity: 1; box-shadow: inset 0 0 10px rgba(0, 240, 255, 0.2); border: 1px solid rgba(0, 240, 255, 0.3); }
        
        /* COUNTDOWN (SPORT FONT) */
        .countdown-banner { background: rgba(0,0,0,0.3); border-radius: 16px; padding: 15px 10px; margin-bottom: 25px; text-align: center; border: 1px solid rgba(0, 240, 255, 0.2); box-shadow: 0 0 15px rgba(0, 240, 255, 0.05); }
        .countdown-title { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 2px; color: #00F0FF; margin-bottom: 10px; font-weight: 800; }
        .tijd-grid { display: flex; justify-content: center; gap: 6px; width: 100%; }
        .tijd-box { background: rgba(255,255,255,0.05); padding: 8px 4px; border-radius: 12px; text-align: center; flex: 1; max-width: 70px; border: 1px solid rgba(255,255,255,0.05); }
        .tijd-cijfer { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; color: #FFF; line-height: 1; margin-bottom: 0px; letter-spacing: 1px; }
        .tijd-label { font-size: 0.5rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.6; }
        .gesloten-banner { background: rgba(255, 0, 85, 0.15); border: 1px solid #FF0055; color: #FF0055; padding: 15px; border-radius: 16px; text-align: center; font-weight: 800; margin-bottom: 25px; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 0 15px rgba(255, 0, 85, 0.2); }

        /* FORMULIER */
        .input-group { text-align: left; margin-bottom: 15px; }
        .label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; margin-left: 12px; margin-bottom: 6px; display: block; color: #00F0FF; }
        .input-field { width: 100%; padding: 15px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: white; font-size: 1rem; outline: none; box-sizing: border-box; -webkit-appearance: none; transition: 0.3s; }
        .input-field:focus { border-color: #00F0FF; box-shadow: 0 0 10px rgba(0, 240, 255, 0.2); }
        .input-field:disabled { opacity: 0.5; cursor: not-allowed; }
        .input-field option { background: #0B0E14; color: white; }
        .btn-primary { width: 100%; padding: 18px; border-radius: 18px; border: none; background: #00F0FF; color: #090c15; font-weight: 900; cursor: pointer; font-size: 1rem; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 20px rgba(0, 240, 255, 0.4); transition: 0.2s; }
        .btn-primary:active { transform: scale(0.98); }
        .btn-primary:disabled { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); box-shadow: none; cursor: not-allowed; }
        .btn-secondary { width: 100%; padding: 14px; margin-top: 15px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: white; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: 0.2s; }
        .btn-secondary:active { background: rgba(255,255,255,0.05); }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .avatar-picker { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none; }
        .avatar-optie { font-size: 1.5rem; padding: 10px; border-radius: 50%; background: rgba(0,0,0,0.3); cursor: pointer; border: 2px solid transparent; transition: 0.2s; }
        .avatar-optie.selected { border-color: #00F0FF; background: rgba(0, 240, 255, 0.1); transform: scale(1.1); }

        /* RANKING (SFEERVOL) */
        .ranking-item { background: rgba(0,0,0,0.3); border-radius: 16px; padding: 12px 15px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s; position: relative; overflow: hidden; }
        .ranking-item.is-me { border-color: #00F0FF; background: rgba(0, 240, 255, 0.05); }
        .ranking-item.leader-glow { border-color: #FFD700; box-shadow: 0 0 15px rgba(255, 215, 0, 0.2); background: linear-gradient(90deg, rgba(255,215,0,0.05) 0%, transparent 100%); }
        .ranking-hoofd { display: flex; align-items: center; margin-bottom: 8px; }
        .ranking-pos { width: 30px; font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; color: rgba(255,255,255,0.5); text-align: left; }
        .pos-1 { color: #FFD700; text-shadow: 0 0 10px rgba(255,215,0,0.5); font-size: 1.8rem; }
        .pos-2 { color: #C0C0C0; }
        .pos-3 { color: #CD7F32; }
        .ranking-avatar { font-size: 1.4rem; margin-right: 10px; }
        .ranking-naam { flex: 1; font-size: 1rem; font-weight: 800; margin: 0; color: #FFF; }
        .ranking-totaal { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; color: #00F0FF; text-align: right; min-width: 40px; line-height: 1; }
        
        .ranking-sub { display: flex; justify-content: space-between; align-items: center; font-size: 0.65rem; color: rgba(255,255,255,0.6); background: rgba(0,0,0,0.2); padding: 6px 10px; border-radius: 8px; }
        .ranking-punten { display: flex; gap: 10px; }
        .ranking-punten span { font-weight: 800; color: #FFF; margin-left: 4px; }
        .ranking-stats { display: flex; gap: 8px; }
        .stat-mini { display: flex; align-items: center; gap: 3px; }
        .stat-mini span { font-weight: 800; color: white; font-family: 'Bebas Neue', sans-serif; font-size: 0.9rem; letter-spacing: 1px; }

        /* KLEEDKAMER CHAT */
        .chat-container { display: flex; flex-direction: column; height: 400px; background: rgba(0,0,0,0.3); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; }
        .chat-berichten { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 12px; }
        .chat-bericht { display: flex; gap: 10px; align-items: flex-start; }
        .chat-bericht.is-mij { flex-direction: row-reverse; }
        .chat-avatar { font-size: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 50%; padding: 5px; }
        .chat-bubbel { background: rgba(255,255,255,0.08); padding: 10px 15px; border-radius: 16px; border-top-left-radius: 4px; max-width: 75%; font-size: 0.85rem; line-height: 1.4; color: #E0E6ED; }
        .chat-bericht.is-mij .chat-bubbel { background: rgba(0, 240, 255, 0.15); border-radius: 16px; border-top-right-radius: 4px; color: #FFF; border: 1px solid rgba(0, 240, 255, 0.2); }
        .chat-naam { font-size: 0.6rem; font-weight: 800; opacity: 0.5; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
        .chat-bericht.is-mij .chat-naam { text-align: right; color: #00F0FF; opacity: 0.8; }
        .chat-invoer { display: flex; padding: 10px; background: rgba(0,0,0,0.5); border-top: 1px solid rgba(255,255,255,0.1); }
        .chat-input { flex: 1; background: rgba(255,255,255,0.1); border: none; padding: 12px 15px; border-radius: 20px; color: white; outline: none; font-size: 0.9rem; }
        .chat-send { background: #00F0FF; border: none; width: 42px; height: 42px; border-radius: 50%; margin-left: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: 0.2s; }
        .chat-send:active { transform: scale(0.9); }

        /* ANTWOORDEN */
        .cat-card { background: rgba(0,0,0,0.3); border-radius: 16px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
        .cat-header { background: rgba(255,255,255,0.03); padding: 12px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;}
        .cat-titel { font-size: 0.85rem; font-weight: 800; color: #00F0FF; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
        .cat-stand { font-size: 0.65rem; color: rgba(255,255,255,0.6); font-weight: 800; background: rgba(0,0,0,0.4); padding: 4px 8px; border-radius: 8px; }
        .cat-lijst { padding: 5px 15px; }
        .cat-speler-rij { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .cat-speler-rij:last-child { border-bottom: none; }
        .antw-naam { font-size: 0.8rem; font-weight: 600; opacity: 0.8; display: flex; align-items: center; gap: 6px;}
        .antw-text { font-size: 0.85rem; font-weight: 700; text-align: right; max-width: 60%; }
        .blurred-waarde { filter: blur(4px); opacity: 0.4; user-select: none; letter-spacing: 2px; }
        .neon-text { color: #FFF; text-shadow: 0 0 8px rgba(255,255,255,0.3); }
        .eigen-antw .antw-naam { color: #00F0FF; font-weight: 800; opacity: 1;}
        .eigen-antw .antw-text { color: #00F0FF; }
      `}</style>

      {/* CONFETTI KANON OVERLAY */}
      {showConfetti && (
        <div className="confetti-container">
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="confetti" style={{ 
              left: `${Math.random() * 100}%`, 
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 2 + 2}s`
            }}></div>
          ))}
        </div>
      )}

      <datalist id="top-spelers">{TOP_SPELERS.map(speler => <option key={speler} value={speler} />)}</datalist>
      <datalist id="top-keepers">{TOP_KEEPERS.map(keeper => <option key={keeper} value={keeper} />)}</datalist>

      <div className="glass-card">
        <h1 className="title">WK 2026</h1>
        <p className="subtitle">Pronostiek • Road to America</p>

        {actieveSpeler ? (
          <div>
            {/* 5 TABS MENU */}
            <div className="tab-container">
              <div className={`tab ${actieveTab === 'matchen' ? 'active' : ''}`} onClick={() => setActieveTab('matchen')}>MATCHEN</div>
              <div className={`tab ${actieveTab === 'toernooi' ? 'active' : ''}`} onClick={() => setActieveTab('toernooi')}>TOERNOOI</div>
              <div className={`tab ${actieveTab === 'antwoorden' ? 'active' : ''}`} onClick={() => setActieveTab('antwoorden')}>ANTWOORDEN</div>
              <div className={`tab ${actieveTab === 'ranking' ? 'active' : ''}`} onClick={() => setActieveTab('ranking')}>RANKING</div>
              <div className={`tab ${actieveTab === 'kleedkamer' ? 'active' : ''}`} onClick={() => setActieveTab('kleedkamer')}>KLEEDKAMER💬</div>
            </div>

            {actieveTab === 'toernooi' && (
              <form onSubmit={slaToernooiVoorspellingOp} style={{ animation: 'fadeIn 0.4s' }}>
                {isGesloten ? (
                  <div className="gesloten-banner">⛔ Inzendingen Gesloten</div>
                ) : (
                  <div className="countdown-banner">
                    <div className="countdown-title">De bal rolt over:</div>
                    <div className="tijd-grid">
                      <div className="tijd-box"><div className="tijd-cijfer">{tijdOver.dagen}</div><div className="tijd-label">Dagen</div></div>
                      <div className="tijd-box"><div className="tijd-cijfer">{tijdOver.uren}</div><div className="tijd-label">Uren</div></div>
                      <div className="tijd-box"><div className="tijd-cijfer">{tijdOver.minuten}</div><div className="tijd-label">Min</div></div>
                      <div className="tijd-box"><div className="tijd-cijfer">{tijdOver.seconden}</div><div className="tijd-label">Sec</div></div>
                    </div>
                  </div>
                )}

                <div className="input-group"><label className="label">Eindwinnaar WK</label><select className="input-field" value={winnaar} onChange={e => setWinnaar(e.target.value)} required disabled={isGesloten}><option value="" disabled>Kies je kampioen...</option>{WK_LANDEN.map(land => <option key={land} value={land}>{land}</option>)}</select></div>
                <div className="input-group"><label className="label">Topschutter</label><input className="input-field" list="top-spelers" placeholder="Wie schiet ze erin?" value={topschutter} onChange={e => setTopschutter(e.target.value)} required disabled={isGesloten} /></div>
                <div className="input-group"><label className="label">Beste Keeper</label><input className="input-field" list="top-keepers" placeholder="De muur in de goal..." value={besteKeeper} onChange={e => setBesteKeeper(e.target.value)} required disabled={isGesloten} /></div>
                
                <div className="input-group">
                  <label className="label">Eindstation Rode Duivels</label>
                  <select className="input-field" value={eindstation} onChange={e => setEindstation(e.target.value)} required disabled={isGesloten}>
                    <option value="" disabled>Tot waar geraken ze?</option>
                    <option value="Groepsfase">Groepsfase (Schande!)</option>
                    <option value="1/16e Finale">1/16e Finale</option>
                    <option value="1/8e Finale">1/8e Finale</option>
                    <option value="Kwartfinale">Kwartfinale</option>
                    <option value="Halve Finale">Halve Finale</option>
                    <option value="Verliezend Finalist">Verliezend Finalist</option>
                    <option value="Wereldkampioen">Wereldkampioen 🏆</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="label">De Laatste Vier (Halve Finalisten)</label>
                  <div className="grid-2">
                    <select className="input-field" value={lv1} onChange={e => setLv1(e.target.value)} required disabled={isGesloten}><option value="" disabled>Land 1</option>{WK_LANDEN.map(land => <option key={land} value={land}>{land}</option>)}</select>
                    <select className="input-field" value={lv2} onChange={e => setLv2(e.target.value)} required disabled={isGesloten}><option value="" disabled>Land 2</option>{WK_LANDEN.map(land => <option key={land} value={land}>{land}</option>)}</select>
                    <select className="input-field" value={lv3} onChange={e => setLv3(e.target.value)} required disabled={isGesloten}><option value="" disabled>Land 3</option>{WK_LANDEN.map(land => <option key={land} value={land}>{land}</option>)}</select>
                    <select className="input-field" value={lv4} onChange={e => setLv4(e.target.value)} required disabled={isGesloten}><option value="" disabled>Land 4</option>{WK_LANDEN.map(land => <option key={land} value={land}>{land}</option>)}</select>
                  </div>
                </div>

                <div className="input-group"><label className="label">Tie-breaker: Totaal goals hele toernooi</label><input className="input-field" type="number" placeholder="Bv. 172" value={totaalGoals} onChange={e => setTotaalGoals(e.target.value)} required disabled={isGesloten} /></div>
                <div className="grid-2">
                  <div className="input-group"><label className="label">Gele Kaarten</label><input className="input-field" type="number" placeholder="Bv. 220" value={geelKaarten} onChange={e => setGeelKaarten(e.target.value)} required disabled={isGesloten} /></div>
                  <div className="input-group"><label className="label">Rode Kaarten</label><input className="input-field" type="number" placeholder="Bv. 12" value={roodKaarten} onChange={e => setRoodKaarten(e.target.value)} required disabled={isGesloten} /></div>
                </div>

                {voorspellingStatus && <div style={{ textAlign: 'center', margin: '15px 0', fontSize: '0.9rem', fontWeight: '800', color: voorspellingStatus.includes('✅') ? '#00F0FF' : '#FF0055' }}>{voorspellingStatus}</div>}
                {!isGesloten && <button className="btn-primary" type="submit">OPSLAAN</button>}
                <button className="btn-secondary" type="button" onClick={() => { localStorage.removeItem('wk_speler_id'); setActieveSpeler(null); }}>Terug naar de spelerstunnel (Uitloggen)</button>
              </form>
            )}

            {actieveTab === 'antwoorden' && (
              <div style={{ animation: 'fadeIn 0.4s' }}>
                <p style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.8, marginBottom: '20px', lineHeight: '1.4' }}>Kijk wat de concurrentie denkt.<br/><strong style={{color: '#00F0FF'}}>Tegenstanders zijn geblurred tot de aftrap!</strong></p>
                {CATEGORIEEN.map((cat, idx) => (
                  <div key={idx} className="cat-card">
                    <div className="cat-header">
                      <h3 className="cat-titel">{cat.label}</h3>
                      <div className="cat-stand">{cat.stand}</div>
                    </div>
                    <div className="cat-lijst">
                      {spelers.map(speler => {
                        const v = alleVoorspellingen.find(x => x.speler_id === speler.id);
                        const isMijzelf = speler.id === actieveSpeler.id;
                        const toonData = isGesloten || isMijzelf;
                        let getoondeWaarde = "Zit nog in de kleedkamer 🚪";
                        if (v) {
                          if (cat.key === 'laatste_vier') getoondeWaarde = v[cat.key]?.join(', ') || '-';
                          else getoondeWaarde = v[cat.key] || '-';
                        }
                        return (
                          <div key={speler.id} className={`cat-speler-rij ${isMijzelf ? 'eigen-antw' : ''}`}>
                            <span className="antw-naam"><span style={{fontSize:'1rem'}}>{speler.avatar || '⚽'}</span> {speler.naam}</span>
                            {v ? <VeiligAntwoord toon={toonData} waarde={getoondeWaarde.toString()} /> : <span style={{ fontSize: '0.75rem', fontStyle: 'italic', opacity: 0.4 }}>Wachtend...</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {actieveTab === 'ranking' && (
              <div style={{ animation: 'fadeIn 0.4s' }}>
                <p style={{ textAlign: 'center', fontSize: '0.75rem', opacity: 0.8, margin: '0 0 15px 0' }}>Live klassement inclusief bonuspunten.</p>
                {klassement.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#00F0FF', fontWeight: 'bold' }}>De VAR kijkt ernaar... 📺</p>
                ) : (
                  klassement.map((speler, index) => {
                    const isMijzelf = speler.id === actieveSpeler.id;
                    const isNummerEen = index === 0 && klassement[0].totaal_score > 0; // Alleen glow als er punten zijn
                    const isLaatste = index === klassement.length - 1 && klassement.length > 1; // Rode lantaarn
                    const positieKlasse = index === 0 ? 'pos-1' : index === 1 ? 'pos-2' : index === 2 ? 'pos-3' : '';
                    
                    return (
                      <div key={speler.id} className={`ranking-item ${isMijzelf ? 'is-me' : ''} ${isNummerEen ? 'leader-glow' : ''}`}>
                        <div className="ranking-hoofd">
                          <div className={`ranking-pos ${positieKlasse}`}>{index + 1}</div>
                          <div className="ranking-avatar">{speler.avatar || '⚽'}</div>
                          <h3 className="ranking-naam">
                            {speler.naam} 
                            {isNummerEen && <span style={{marginLeft:'5px'}} title="On Fire!">🔥</span>}
                            {isLaatste && <span style={{marginLeft:'5px', filter: 'grayscale(1)'}} title="De Rode Lantaarn">🐌</span>}
                          </h3>
                          <div className="ranking-totaal">{speler.totaal_score || 0}</div>
                        </div>
                        <div className="ranking-sub">
                          <div className="ranking-punten" title="Punten uit Matchen & Bonus">
                            <div>⚽ <span>0</span></div>
                            <div>🏆 <span>0</span></div>
                          </div>
                          <div className="ranking-stats">
                            <div className="stat-mini" title="Exacte score">🎯 <span>0</span></div>
                            <div className="stat-mini" title="Juiste ploeg">✅ <span>0</span></div>
                            <div className="stat-mini" title="Fout">❌ <span>0</span></div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* NIEUWE TAB: KLEEDKAMER CHAT */}
            {actieveTab === 'kleedkamer' && (
              <div style={{ animation: 'fadeIn 0.4s' }}>
                <p style={{ textAlign: 'center', fontSize: '0.75rem', opacity: 0.8, margin: '0 0 15px 0' }}>Banter, bluf en trash talk.</p>
                <div className="chat-container">
                  <div className="chat-berichten">
                    {chatBerichten.length === 0 ? (
                      <p style={{ textAlign: 'center', opacity: 0.5, marginTop: 'auto', marginBottom: 'auto' }}>Het is hier nog stil... Deel de eerste plaagstoot! 🥊</p>
                    ) : (
                      chatBerichten.map((chat) => {
                        const isMij = chat.speler_id === actieveSpeler.id;
                        return (
                          <div key={chat.id} className={`chat-bericht ${isMij ? 'is-mij' : ''}`}>
                            <div className="chat-avatar">{chat.spelers?.avatar || '⚽'}</div>
                            <div style={{ maxWidth: '80%' }}>
                              <div className="chat-naam">{chat.spelers?.naam || 'Onbekend'}</div>
                              <div className="chat-bubbel">{chat.bericht}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEindeRef} />
                  </div>
                  <form onSubmit={verstuurChat} className="chat-invoer">
                    <input className="chat-input" placeholder="Zeg iets snedig..." value={nieuwBericht} onChange={e => setNieuwBericht(e.target.value)} maxLength={150} />
                    <button type="submit" className="chat-send" disabled={!nieuwBericht.trim()}>🚀</button>
                  </form>
                </div>
              </div>
            )}

            {actieveTab === 'matchen' && (
              <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.7 }}>
                <div style={{fontSize: '3rem', marginBottom: '10px'}}>🏟️</div>
                <h3 style={{color: '#00F0FF', margin: 0}}>Het Gras wordt gemaaid...</h3>
                <p style={{ fontSize: '0.85rem' }}>De wedstrijdkalender wordt hier binnenkort opgebouwd, inclusief jouw **Gouden Bal Joker**!</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <form onSubmit={ontgrendel}>
              <div className="input-group">
                <label className="label">Ontgrendelen</label>
                <input className="input-field" placeholder="Je naam" value={ontgrendelNaam} onChange={e => setOntgrendelNaam(e.target.value)} />
                <input className="input-field" style={{marginTop:'10px'}} type="text" placeholder="Geheime code" value={invoerCode} onChange={e => setInvoerCode(e.target.value)} />
              </div>
              <button className="btn-primary" type="submit">HET VELD OP</button>
            </form>
            <div style={{ margin: '30px 0', display: 'flex', alignItems: 'center', opacity: 0.18 }}><hr style={{ flex: 1, border: 'none', height: '1px', background: 'white' }} /><span style={{ padding: '0 15px', fontSize: '0.6rem', fontWeight: 900 }}>OF</span><hr style={{ flex: 1, border: 'none', height: '1px', background: 'white' }} /></div>
            <form onSubmit={schrijfIn}>
              <div className="input-group">
                <label className="label">Nieuwe Transfer (Inschrijven)</label>
                <input className="input-field" placeholder="Naam + Achternaam" value={inschrijfNaam} onChange={e => setInschrijfNaam(e.target.value)} required />
              </div>
              
              <label className="label">Kies je Avatar</label>
              <div className="avatar-picker">
                {AVATARS.map(emoji => (
                  <div key={emoji} className={`avatar-optie ${kiesAvatar === emoji ? 'selected' : ''}`} onClick={() => setKiesAvatar(emoji)}>
                    {emoji}
                  </div>
                ))}
              </div>

              <button className="btn-secondary" type="submit" style={{marginTop:'20px'}}>TEKEN CONTRACT</button>
            </form>
            <div style={{ marginTop: '20px', fontSize: '0.85rem', fontWeight: '800', color: status.includes('🚩') ? '#FF0055' : '#00F0FF', textAlign: 'center' }}>{status}</div>
          </div>
        )}
      </div>
    </main>
  );
}