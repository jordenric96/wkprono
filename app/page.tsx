'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { WK_LANDEN, TOP_SPELERS, TOP_KEEPERS } from '../lib/data';

const DEADLINE_DATE = new Date('2026-06-11T21:00:00+02:00').getTime();

// --- EIGEN SLIM KEUZEMENU (Voor Mobiel) ---
const Autocomplete = ({ options, value, onChange, placeholder, disabled }: { options: string[], value: string, onChange: (val: string) => void, placeholder: string, disabled: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Zoek direct de opties die overeenkomen met wat je typt
  const filtered = options.filter(o => o.toLowerCase().includes(value.toLowerCase()));

  useEffect(() => {
    // Sluit het menu als je ergens anders op het scherm klikt
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        className="input-field"
        value={value}
        onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        disabled={disabled}
        placeholder={placeholder}
      />
      {isOpen && !disabled && (
        <ul className="autocomplete-dropdown">
          {filtered.length > 0 ? filtered.map(opt => (
            <li key={opt} className="autocomplete-item" onClick={() => { onChange(opt); setIsOpen(false); }}>
              {opt}
            </li>
          )) : <li className="autocomplete-item" style={{ color: 'var(--wk-red)' }}>Ongekende speler...</li>}
        </ul>
      )}
    </div>
  );
};

export default function Home() {
  const [ontgrendelNaam, setOntgrendelNaam] = useState('');
  const [inschrijfNaam, setInschrijfNaam] = useState('');
  const [invoerCode, setInvoerCode] = useState('');
  const [status, setStatus] = useState('');
  const [spelers, setSpelers] = useState<any[]>([]);
  const [actieveSpeler, setActieveSpeler] = useState<any>(null);
  const [actieveTab, setActieveTab] = useState('toernooi');
  
  const [voorspellingStatus, setVoorspellingStatus] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
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

  const [tijdOver, setTijdOver] = useState({ dagen: 0, uren: 0, minuten: 0, seconden: 0 });
  const [isGesloten, setIsGesloten] = useState(false);
  const [klassement, setKlassement] = useState<any[]>([]);
  const [alleVoorspellingen, setAlleVoorspellingen] = useState<any[]>([]);
  const [chatBerichten, setChatBerichten] = useState<any[]>([]);
  const [nieuwBericht, setNieuwBericht] = useState('');
  const chatEindeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opgeslagenId = localStorage.getItem('wk_speler_id');
    haalSpelersOp(opgeslagenId);

    if ("Notification" in window) {
      Notification.requestPermission();
    }

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

    const chatSubscription = supabase
      .channel('kleedkamer_berichten')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'kleedkamer' }, (payload) => {
        haalChatOp();
        if (document.hidden && Notification.permission === "granted") {
          new Notification("Nieuw bericht in de Kleedkamer! ⚽", {
            body: payload.new.bericht,
          });
        }
      })
      .subscribe();

    return () => {
      clearInterval(klokInterval);
      supabase.removeChannel(chatSubscription);
    };
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

  const haalChatOp = async () => {
    const { data, error } = await supabase.from('kleedkamer').select('*, spelers(naam)').order('created_at', { ascending: true });
    if (!error && data) {
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

  const haalAlleVoorspellingenOp = async () => {
    const { data, error } = await supabase.from('toernooi_voorspellingen').select('*');
    if (!error && data) setAlleVoorspellingen(data);
  };

  const haalToernooiVoorspellingOp = async () => {
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

    // --- STRIKTE VALIDATIE ---
    if (!TOP_SPELERS.includes(topschutter)) {
      setVoorspellingStatus('Oeps! 🚩 Kies een geldige topschutter uit de lijst.');
      return;
    }
    if (!TOP_KEEPERS.includes(besteKeeper)) {
      setVoorspellingStatus('Oeps! 🚩 Kies een geldige keeper uit de lijst.');
      return;
    }

    setVoorspellingStatus('Bezig met opslaan... ⚽');
    const laatsteVierArray = [lv1, lv2, lv3, lv4].filter(land => land.trim() !== '');
    const voorspellingData = {
      speler_id: actieveSpeler.id, winnaar: winnaar.trim(), topschutter: topschutter.trim(),
      beste_keeper: besteKeeper.trim(), eindstation_belgie: eindstation.trim(),
      totaal_goals_tornooi: parseInt(totaalGoals) || 0, totaal_gele_kaarten: parseInt(geelKaarten) || 0,
      totaal_rode_kaarten: parseInt(roodKaarten) || 0, laatste_vier: laatsteVierArray
    };

    const { data: bestaand } = await supabase.from('toernooi_voorspellingen').select('id').eq('speler_id', actieveSpeler.id).single();
    let error;
    if (bestaand) error = (await supabase.from('toernooi_voorspellingen').update(voorspellingData).eq('speler_id', actieveSpeler.id)).error;
    else error = (await supabase.from('toernooi_voorspellingen').insert([voorspellingData])).error;

    if (error) setVoorspellingStatus('Oeps! 🚩 Er ging iets mis. Probeer opnieuw.');
    else {
      setVoorspellingStatus('Gelukt! 🌟');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      setTimeout(() => setVoorspellingStatus(''), 3000);
    }
  };

  const schrijfIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Even geduld... ⚽');
    const { error } = await supabase.from('spelers').insert([{ naam: inschrijfNaam.trim(), totaal_score: 0 }]);
    if (error) setStatus('Oeps! 🚩 Naam bestaat al.');
    else { setStatus('Gelukt! 🌟 Vraag de code aan de beheerder.'); setInschrijfNaam(''); haalSpelersOp(); }
  };

  const ontgrendel = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: speler, error } = await supabase.from('spelers').select('*').ilike('naam', ontgrendelNaam.trim()).single();
    if (error || !speler) { setStatus('Oeps! 🚩 Speler niet gevonden.'); return; }
    if (String(speler.code).trim() === String(invoerCode).trim()) {
      localStorage.setItem('wk_speler_id', speler.id.toString());
      setActieveSpeler(speler); setStatus('');
    } else setStatus('Oeps! 🚩 Code is fout.');
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

  const prijzenPot = spelers.length * 10;

  return (
    <main className="main-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@600;800;900&display=swap');
        
        :root {
          --crayola: #3772FF;
          --magenta: #F038FF;
          --rose: #EF709D;
          --lime: #E2EF70;
          --aqua: #70E4EF;
          --wk-blue: #002D72;
          --wk-red: #E3002F;
          --wk-green: #00843D;
          --bg-light: #F4F7F6;
          --text-dark: #111827;
        }

        html, body { margin: 0; padding: 0; width: 100%; min-height: 100%; background: var(--bg-light); overflow-x: hidden; }
        .main-container { margin: 0; padding: 15px 15px 80px 15px; min-height: 100vh; display: flex; flex-direction: column; align-items: center; font-family: 'Nunito', sans-serif; color: var(--text-dark); box-sizing: border-box; }
        
        .glass-card { background: #FFFFFF; padding: 30px 20px; border-radius: 24px; width: 100%; max-width: 500px; box-shadow: 0 15px 35px rgba(0,0,0,0.06); border: 2px solid var(--aqua); position: relative; z-index: 10; }
        
        .title { font-family: 'Bebas Neue', sans-serif; font-size: 4rem; letter-spacing: 2px; margin: 0; text-align: center; color: var(--crayola); line-height: 1; }
        .subtitle { font-size: 0.75rem; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 25px; color: var(--magenta); text-align: center; }
        
        .tab-container { display: flex; background: #E9ECEF; border-radius: 16px; padding: 5px; margin-bottom: 25px; overflow-x: auto; scrollbar-width: none; width: 100%; }
        .tab { flex: 1; min-width: 80px; text-align: center; padding: 12px 5px; font-size: 0.65rem; font-weight: 800; border-radius: 12px; cursor: pointer; color: #6C757D; white-space: nowrap; transition: 0.2s; }
        .tab.active { background: var(--crayola); color: #FFF; box-shadow: 0 4px 10px rgba(55, 114, 255, 0.3); }
        
        .prijzen-banner { background: linear-gradient(135deg, var(--aqua), var(--crayola)); color: #FFF; padding: 15px; border-radius: 20px; text-align: center; font-weight: 900; margin-bottom: 20px; font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; letter-spacing: 1.5px; box-shadow: 0 8px 20px rgba(112, 228, 239, 0.4); animation: pulse 2s infinite; border: 3px solid #FFF; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
        
        .ranking-item { background: #FFFFFF; border-radius: 20px; padding: 16px 20px; margin-bottom: 16px; border: 2px solid #E9ECEF; display: flex; flex-direction: column; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: transform 0.2s; }
        .ranking-item:hover { transform: translateY(-2px); border-color: var(--aqua); }
        .ranking-item.is-me { border-color: var(--crayola); border-width: 2px; background: #F8FBFF; box-shadow: 0 4px 15px rgba(55, 114, 255, 0.15); }
        
        .ranking-hoofd { display: flex; align-items: center; width: 100%; margin-bottom: 12px; }
        .ranking-pos { width: 35px; font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; color: #ADB5BD; line-height: 1; }
        .pos-1 { color: #FFD700; text-shadow: 0 2px 4px rgba(212, 175, 55, 0.3); font-size: 2.2rem; } 
        .pos-2 { color: #A0AEC0; } 
        .pos-3 { color: #CD7F32; }
        .ranking-naam { flex: 1; font-size: 1.1rem; font-weight: 900; color: var(--text-dark); text-align: left; text-transform: uppercase; letter-spacing: 0.5px; }
        .ranking-totaal { font-family: 'Bebas Neue', sans-serif; font-size: 2.6rem; color: var(--wk-red); min-width: 45px; text-align: right; line-height: 1; }
        
        .ranking-breakdown { display: flex; gap: 10px; width: 100%; margin-bottom: 12px; }
        .score-pill { flex: 1; padding: 8px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 900; display: flex; justify-content: space-between; align-items: center; letter-spacing: 0.5px; }
        .pill-matchen { background: rgba(55, 114, 255, 0.1); color: var(--crayola); border: 1px solid rgba(55, 114, 255, 0.2); }
        .pill-bonus { background: rgba(240, 56, 255, 0.1); color: var(--magenta); border: 1px solid rgba(240, 56, 255, 0.2); }
        
        .ranking-stats { display: flex; justify-content: space-between; width: 100%; font-size: 0.7rem; font-weight: 800; color: #6C757D; border-top: 2px dashed #E9ECEF; padding-top: 10px; }
        .ranking-stats span { display: flex; align-items: center; gap: 4px; }
        
        .chat-container { display: flex; flex-direction: column; height: 450px; background: #F8F9FA; border-radius: 20px; border: 2px solid #E9ECEF; overflow: hidden; }
        .chat-berichten { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
        .chat-bubbel { background: #FFFFFF; padding: 12px 16px; border-radius: 18px; border-top-left-radius: 4px; max-width: 80%; font-size: 0.9rem; font-weight: 700; position: relative; text-align: left; box-shadow: 0 2px 8px rgba(0,0,0,0.05); color: var(--text-dark); border: 1px solid #E9ECEF; }
        .chat-bericht.is-mij { flex-direction: row-reverse; display: flex; gap: 8px; align-items: flex-start; }
        .chat-bericht.is-mij .chat-bubbel { background: var(--crayola); color: #FFF; border: none; border-top-right-radius: 4px; border-top-left-radius: 18px; }
        .chat-naam { font-size: 0.65rem; font-weight: 900; color: #ADB5BD; margin-bottom: 4px; padding: 0 5px; text-transform: uppercase; }
        .chat-invoer { display: flex; padding: 12px; background: #FFFFFF; border-top: 2px solid #E9ECEF; align-items: center; }
        .chat-input { flex: 1; background: #F4F7F6; border: 2px solid #E9ECEF; padding: 14px; border-radius: 20px; color: var(--text-dark); font-family: 'Nunito', sans-serif; font-weight: 700; outline: none; transition: 0.2s; }
        .chat-input:focus { border-color: var(--crayola); }
        .chat-send { background: var(--magenta); color: white; border: none; width: 48px; height: 48px; border-radius: 50%; margin-left: 8px; cursor: pointer; font-size: 1.2rem; box-shadow: 0 4px 10px rgba(240, 56, 255, 0.3); transition: 0.2s; }
        .chat-send:active { transform: scale(0.9); }
        
        .input-group { text-align: left; margin-bottom: 18px; }
        .label { font-size: 0.7rem; font-weight: 900; text-transform: uppercase; color: var(--crayola); margin-bottom: 8px; display: block; margin-left: 15px; letter-spacing: 1px; }
        .input-field { width: 100%; padding: 16px 20px; border-radius: 20px; border: 2px solid #E9ECEF; background: #F8F9FA; color: var(--text-dark); font-size: 1rem; font-family: 'Nunito', sans-serif; font-weight: 800; box-sizing: border-box; transition: all 0.3s; outline: none; }
        .input-field:focus { border-color: var(--magenta); background: #FFF; box-shadow: 0 5px 15px rgba(240, 56, 255, 0.1); transform: translateY(-2px); }
        .input-field:disabled { opacity: 0.6; cursor: not-allowed; background: #E9ECEF; }
        
        /* CSS VOOR AUTOCOMPLETE DROPDOWN */
        .autocomplete-dropdown { position: absolute; top: calc(100% + 5px); left: 0; right: 0; max-height: 200px; overflow-y: auto; background: #FFF; border: 2px solid var(--crayola); border-radius: 15px; z-index: 100; list-style: none; padding: 0; margin: 0; box-shadow: 0 10px 25px rgba(55, 114, 255, 0.2); }
        .autocomplete-item { padding: 12px 18px; border-bottom: 1px solid #F1F3F5; cursor: pointer; color: var(--text-dark); font-size: 0.95rem; font-weight: 800; transition: 0.2s; }
        .autocomplete-item:hover { background: #F8FBFF; color: var(--crayola); }
        .autocomplete-item:last-child { border-bottom: none; }

        .btn-primary { width: 100%; padding: 18px; border-radius: 25px; border: none; background: var(--magenta); color: #FFF; font-weight: 900; cursor: pointer; text-transform: uppercase; font-size: 1.1rem; letter-spacing: 2px; box-shadow: 0 8px 25px rgba(240, 56, 255, 0.3); transition: all 0.2s; }
        .btn-primary:active { transform: scale(0.95); }
        .btn-secondary { width: 100%; padding: 15px; margin-top: 15px; border-radius: 20px; border: 3px solid var(--crayola); background: transparent; color: var(--crayola); font-weight: 900; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        
        .countdown-banner { background: #FFF; border-radius: 25px; padding: 20px; margin-bottom: 25px; border: 3px solid var(--rose); text-align: center; box-shadow: 0 10px 30px rgba(239, 112, 157, 0.15); }
        .countdown-title { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px; color: var(--rose); margin-bottom: 15px; font-weight: 900; }
        .tijd-grid { display: flex; justify-content: center; gap: 6px; flex-wrap: nowrap; width: 100%; }
        .tijd-box { flex: 1; background: #F8F9FA; border: 2px solid #E9ECEF; padding: 10px 2px; border-radius: 12px; animation: floatBox 4s ease-in-out infinite; min-width: 0; text-align: center; }
        .tijd-box:nth-child(2) { animation-delay: 0.5s; }
        .tijd-box:nth-child(3) { animation-delay: 1s; }
        .tijd-box:nth-child(4) { animation-delay: 1.5s; }
        @keyframes floatBox { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .tijd-cijfer { font-family: 'Bebas Neue', sans-serif; font-size: 2.2rem; line-height: 1; color: var(--crayola); animation: bouncenum 2s infinite; margin-bottom: 2px; }
        @keyframes bouncenum { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .tijd-label { font-size: 0.5rem; text-transform: uppercase; color: #ADB5BD; font-weight: 900; letter-spacing: 0.5px; }
        
        .cat-card { background: #FFF; border-radius: 20px; margin-bottom: 18px; border: 2px solid #E9ECEF; overflow: hidden; text-align: left; transition: 0.2s; }
        .cat-card:hover { border-color: var(--aqua); box-shadow: 0 5px 20px rgba(112, 228, 239, 0.2); }
        .cat-header { background: #F8F9FA; padding: 15px 20px; border-bottom: 2px solid #E9ECEF; display: flex; justify-content: space-between; align-items: center; }
        .cat-titel { font-size: 0.85rem; font-weight: 900; color: var(--crayola); text-transform: uppercase; margin: 0; }
        .cat-stand { font-size: 0.65rem; font-weight: 900; background: var(--wk-green); color: white; padding: 5px 10px; border-radius: 10px; }
        .cat-lijst { padding: 5px 20px; }
        .cat-speler-rij { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px dashed #F1F3F5; font-size: 0.9rem; }
        .antw-naam { font-weight: 800; color: #ADB5BD; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px;}
        .antw-text { font-weight: 900; color: var(--text-dark); text-align: right; max-width: 60%; }
        .blurred-waarde { filter: blur(5px); opacity: 0.3; letter-spacing: 2px; }
        .eigen-antw .antw-text { color: var(--magenta); }
        .eigen-antw .antw-naam { color: var(--magenta); }

        .bouncing-ball-loader { font-size: 3rem; text-align: center; animation: bounceBall 0.8s infinite alternate cubic-bezier(0.5, 0.05, 1, 0.5); padding: 20px; }
        @keyframes bounceBall { from { transform: translateY(0); } to { transform: translateY(-30px); } }

        .confetti-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999; overflow: hidden; display: flex; justify-content: center; }
        .confetti { position: absolute; width: 12px; height: 12px; background-color: var(--crayola); animation: fall linear forwards; border-radius: 2px; }
        .confetti:nth-child(2n) { background-color: var(--magenta); }
        .confetti:nth-child(3n) { background-color: var(--lime); border-radius: 50%; }
        .confetti:nth-child(4n) { background-color: var(--aqua); border-radius: 50%; }
        @keyframes fall { 0% { transform: translateY(-100px) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
      `}</style>

      {showConfetti && (
        <div className="confetti-container">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="confetti" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 1.5}s` }}></div>
          ))}
        </div>
      )}

      <div className="glass-card">
        <h1 className="title">WK 2026</h1>
        <p className="subtitle">Pronostiek • Road to America</p>

        {actieveSpeler ? (
          <div>
            <div className="tab-container">
              <div className={`tab ${actieveTab === 'matchen' ? 'active' : ''}`} onClick={() => setActieveTab('matchen')}>MATCHEN</div>
              <div className={`tab ${actieveTab === 'toernooi' ? 'active' : ''}`} onClick={() => setActieveTab('toernooi')}>TOERNOOI</div>
              <div className={`tab ${actieveTab === 'antwoorden' ? 'active' : ''}`} onClick={() => setActieveTab('antwoorden')}>ANTWOORDEN</div>
              <div className={`tab ${actieveTab === 'ranking' ? 'active' : ''}`} onClick={() => setActieveTab('ranking')}>RANKING</div>
              <div className={`tab ${actieveTab === 'kleedkamer' ? 'active' : ''}`} onClick={() => setActieveTab('kleedkamer')}>CHAT 💬</div>
            </div>

            {actieveTab === 'ranking' && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                <div className="prijzen-banner">🏆 TOTALE PRIJZENPOT: €{prijzenPot}</div>
                {klassement.length === 0 ? <div className="bouncing-ball-loader">⚽</div> : klassement.map((s, i) => (
                  <div key={s.id} className={`ranking-item ${s.id === actieveSpeler.id ? 'is-me' : ''}`}>
                    <div className="ranking-hoofd">
                      <div className={`ranking-pos pos-${i+1}`}>{i + 1}</div>
                      <div className="ranking-naam">{s.naam}</div>
                      <div className="ranking-totaal">{s.totaal_score || 0}</div>
                    </div>
                    
                    <div className="ranking-breakdown">
                      <div className="score-pill pill-matchen">
                        <span>⚽ Matchen</span>
                        <span>0 pt</span>
                      </div>
                      <div className="score-pill pill-bonus">
                        <span>🏆 Bonusvragen</span>
                        <span>0 pt</span>
                      </div>
                    </div>

                    <div className="ranking-stats">
                      <span title="Exacte uitslag">🎯 0 Exact</span>
                      <span title="Juiste winnaar">✅ 0 Juist</span>
                      <span title="Fout voorspeld">❌ 0 Fout</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {actieveTab === 'toernooi' && (
              <form onSubmit={slaToernooiVoorspellingOp}>
                {!isGesloten && (
                  <div className="countdown-banner">
                    <div className="countdown-title">Inzending sluit over:</div>
                    <div className="tijd-grid">
                      <div className="tijd-box"><div className="tijd-cijfer">{tijdOver.dagen}</div><div className="tijd-label">Dagen</div></div>
                      <div className="tijd-box"><div className="tijd-cijfer">{tijdOver.uren}</div><div className="tijd-label">Uren</div></div>
                      <div className="tijd-box"><div className="tijd-cijfer">{tijdOver.minuten}</div><div className="tijd-label">Minuten</div></div>
                      <div className="tijd-box"><div className="tijd-cijfer">{tijdOver.seconden}</div><div className="tijd-label">Sec</div></div>
                    </div>
                  </div>
                )}
                
                <div className="input-group"><label className="label">Eindwinnaar WK</label><select className="input-field" value={winnaar} onChange={e=>setWinnaar(e.target.value)} required disabled={isGesloten}><option value="" disabled>Kies je kampioen...</option>{WK_LANDEN.map(l=><option key={l} value={l}>{l}</option>)}</select></div>
                
                {/* AANGEPAST NAAR HET NIEUWE AUTOCOMPLETE MENU */}
                <div className="input-group">
                  <label className="label">Topschutter</label>
                  <Autocomplete options={TOP_SPELERS} value={topschutter} onChange={setTopschutter} placeholder="Wie schiet ze erin?" disabled={isGesloten} />
                </div>
                
                <div className="input-group">
                  <label className="label">Beste Keeper</label>
                  <Autocomplete options={TOP_KEEPERS} value={besteKeeper} onChange={setBesteKeeper} placeholder="De muur..." disabled={isGesloten} />
                </div>

                <div className="input-group"><label className="label">Eindstation België</label><select className="input-field" value={eindstation} onChange={e=>setEindstation(e.target.value)} required disabled={isGesloten}><option value="" disabled>Tot waar geraken ze?</option><option value="Groepsfase">Groepsfase</option><option value="1/16e">1/16e</option><option value="1/8e">1/8e</option><option value="Kwart">Kwart</option><option value="Halve">Halve</option><option value="Finale">Finale</option><option value="Winnaar">Winnaar 🏆</option></select></div>
                <div className="input-group">
                  <label className="label">Laatste Vier (Halve finalisten)</label>
                  <div className="grid-2">
                    <select className="input-field" value={lv1} onChange={e=>setLv1(e.target.value)} required disabled={isGesloten}><option value="" disabled>Land 1</option>{WK_LANDEN.map(l=><option key={l} value={l}>{l}</option>)}</select>
                    <select className="input-field" value={lv2} onChange={e=>setLv2(e.target.value)} required disabled={isGesloten}><option value="" disabled>Land 2</option>{WK_LANDEN.map(l=><option key={l} value={l}>{l}</option>)}</select>
                    <select className="input-field" value={lv3} onChange={e=>setLv3(e.target.value)} required disabled={isGesloten}><option value="" disabled>Land 3</option>{WK_LANDEN.map(l=><option key={l} value={l}>{l}</option>)}</select>
                    <select className="input-field" value={lv4} onChange={e=>setLv4(e.target.value)} required disabled={isGesloten}><option value="" disabled>Land 4</option>{WK_LANDEN.map(l=><option key={l} value={l}>{l}</option>)}</select>
                  </div>
                </div>
                <div className="input-group"><label className="label">Tie-breaker: Totaal goals hele toernooi</label><input className="input-field" type="number" placeholder="Bv. 172" value={totaalGoals} onChange={e=>setTotaalGoals(e.target.value)} required disabled={isGesloten}/></div>
                <div className="grid-2">
                  <div className="input-group"><label className="label">Gele kaarten</label><input className="input-field" type="number" placeholder="Bv. 220" value={geelKaarten} onChange={e=>setGeelKaarten(e.target.value)} required disabled={isGesloten}/></div>
                  <div className="input-group"><label className="label">Rode kaarten</label><input className="input-field" type="number" placeholder="Bv. 12" value={roodKaarten} onChange={e=>setRoodKaarten(e.target.value)} required disabled={isGesloten}/></div>
                </div>
                {!isGesloten && <button className="btn-primary" type="submit">OPSLAAN</button>}
                <div style={{color:'var(--wk-red)', marginTop:'15px', fontWeight:900, textAlign:'center', fontSize:'1.1rem'}}>{voorspellingStatus}</div>
              </form>
            )}

            {actieveTab === 'kleedkamer' && (
              <div className="chat-container">
                <div className="chat-berichten">
                  {chatBerichten.length === 0 ? <p style={{textAlign:'center', marginTop:'20px', color:'#ADB5BD', fontSize:'0.8rem'}}>Het is hier stil... Deel de eerste plaagstoot!</p> : chatBerichten.map((c, idx) => (
                    <div key={idx} className={`chat-bericht ${c.speler_id === actieveSpeler.id ? 'is-mij' : ''}`}>
                      {c.speler_id !== actieveSpeler.id && <div className="chat-naam">{c.spelers?.naam}</div>}
                      <div className="chat-bubbel">{c.bericht}</div>
                    </div>
                  ))}
                  <div ref={chatEindeRef} />
                </div>
                <form onSubmit={verstuurChat} className="chat-invoer">
                  <input className="chat-input" placeholder="Typ je bericht..." value={nieuwBericht} onChange={e=>setNieuwBericht(e.target.value)} />
                  <button type="submit" className="chat-send">▶</button>
                </form>
              </div>
            )}

            {actieveTab === 'antwoorden' && (
              <div style={{maxHeight:'550px', overflowY:'auto', paddingBottom:'20px'}}>
                {CATEGORIEEN.map((cat, idx) => (
                  <div key={idx} className="cat-card">
                    <div className="cat-header"><h3 className="cat-titel">{cat.label}</h3><div className="cat-stand">{cat.stand}</div></div>
                    <div className="cat-lijst">
                      {spelers.map(speler => {
                        const v = alleVoorspellingen.find(x => x.speler_id === speler.id);
                        const toonData = isGesloten || speler.id === actieveSpeler.id;
                        return (
                          <div key={speler.id} className={`cat-speler-rij ${speler.id === actieveSpeler.id ? 'eigen-antw' : ''}`}>
                            <span className="antw-naam">{speler.naam}</span>
                            <span className={`antw-text ${!toonData ? 'blurred-waarde' : ''}`}>{v ? (v[cat.key] || '-') : '...'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button className="btn-secondary" onClick={()=>{localStorage.removeItem('wk_speler_id'); setActieveSpeler(null);}}>UITLOGGEN</button>
          </div>
        ) : (
          <div>
            <form onSubmit={ontgrendel}>
              <div className="input-group"><label className="label">Naam</label><input className="input-field" placeholder="Voornaam Achternaam" value={ontgrendelNaam} onChange={e=>setOntgrendelNaam(e.target.value)} /></div>
              <div className="input-group"><label className="label">Pincode</label><input className="input-field" type="number" placeholder="Bv. 1234" value={invoerCode} onChange={e=>setInvoerCode(e.target.value)} /></div>
              <button className="btn-primary" type="submit">HET VELD OP</button>
            </form>
            <div style={{margin:'25px 0', opacity:0.3, textAlign:'center', fontWeight:900}}>--- OF ---</div>
            <form onSubmit={schrijfIn}>
              <div className="input-group"><label className="label">Nieuwe Deelnemer</label><input className="input-field" placeholder="Voornaam Achternaam" value={inschrijfNaam} onChange={e=>setInschrijfNaam(e.target.value)} /></div>
              <button className="btn-secondary" type="submit">REGISTREREN</button>
            </form>
            <div style={{marginTop:'15px', color:'var(--magenta)', fontWeight:900, textAlign:'center'}}>{status}</div>
          </div>
        )}
      </div>
    </main>
  );
}