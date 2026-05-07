'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { WK_LANDEN, TOP_SPELERS, TOP_KEEPERS } from '../lib/data';

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
      <input className="input-field" value={value} onChange={(e) => { onChange(e.target.value); setIsOpen(true); }} onFocus={() => setIsOpen(true)} disabled={disabled} placeholder={placeholder} />
      {isOpen && !disabled && (
        <ul className="autocomplete-dropdown">
          {filtered.length > 0 ? filtered.map(opt => (
            <li key={opt} className="autocomplete-item" onClick={() => { onChange(opt); setIsOpen(false); }}>{opt}</li>
          )) : <li className="autocomplete-item" style={{ color: 'var(--magenta)' }}>Ongekende speler...</li>}
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
  const [actieveTab, setActieveTab] = useState('matchen');
  
  const [ongelezenBerichten, setOngelezenBerichten] = useState(false);
  const actieveTabRef = useRef(actieveTab);
  
  // TOERNOOI STATE
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

  // MATCHEN STATE
  const [matchen, setMatchen] = useState<any[]>([]);
  const [matchVoorspellingen, setMatchVoorspellingen] = useState<Record<number, {thuis: string, uit: string, goudenBal: boolean}>>({});
  const [matchOpslaanStatus, setMatchOpslaanStatus] = useState('');
  const [gebruikteJokers, setGebruikteJokers] = useState<number[]>([]); // Array van speler_ids die hun joker hebben ingezet

  const [tijdOver, setTijdOver] = useState({ dagen: 0, uren: 0, minuten: 0, seconden: 0 });
  const [isGesloten, setIsGesloten] = useState(false);
  const [klassement, setKlassement] = useState<any[]>([]);
  const [alleVoorspellingen, setAlleVoorspellingen] = useState<any[]>([]);
  const [chatBerichten, setChatBerichten] = useState<any[]>([]);
  const [nieuwBericht, setNieuwBericht] = useState('');
  const chatEindeRef = useRef<HTMLDivElement>(null);

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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'kleedkamer' }, (payload) => {
        haalChatOp();
        if (actieveTabRef.current !== 'kleedkamer') setOngelezenBerichten(true);
        if (document.hidden && Notification.permission === "granted") {
          new Notification("Nieuw bericht in de Kleedkamer! ⚽", { body: payload.new.bericht });
        }
      }).subscribe();

    return () => { clearInterval(klokInterval); supabase.removeChannel(chatSubscription); };
  }, []);

  useEffect(() => {
    if (actieveSpeler) {
      if (actieveTab === 'matchen') haalMatchenOp();
      if (actieveTab === 'toernooi') haalToernooiVoorspellingOp();
      if (actieveTab === 'ranking') haalKlassementOp();
      if (actieveTab === 'antwoorden') haalAlleVoorspellingenOp();
      if (actieveTab === 'kleedkamer') haalChatOp();
    }
  }, [actieveSpeler, actieveTab]);

  const veranderTab = (tab: string) => {
    setActieveTab(tab);
    if (tab === 'kleedkamer') setOngelezenBerichten(false);
  };

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

    // Kijk na wie zijn Joker al heeft gebruikt in de match_voorspellingen tabel
    const { data: jokerData } = await supabase.from('match_voorspellingen').select('speler_id').eq('gouden_bal', true);
    if (jokerData) {
      setGebruikteJokers(jokerData.map(j => j.speler_id));
    }
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

  // --- MATCHEN LOGICA ---
  const haalMatchenOp = async () => {
    const { data: matchenData } = await supabase.from('matchen').select('*').order('datum', { ascending: true });
    
    if (!matchenData || matchenData.length === 0) {
      // Test matchen uitgebreid naar 5 stuks voor een vollere look
      setMatchen([
        { id: 998, thuisploeg: '🇲🇽 Mexico', uitploeg: '🇿🇦 Zuid-Afrika', datum: '2026-06-11T21:00:00Z', status: 'gepland' },
        { id: 999, thuisploeg: '🇧🇪 België', uitploeg: '🇨🇦 Canada', datum: '2026-06-12T18:00:00Z', status: 'gepland' },
        { id: 1000, thuisploeg: '🇪🇸 Spanje', uitploeg: '🇭🇷 Kroatië', datum: '2026-06-13T15:00:00Z', status: 'gepland' },
        { id: 1001, thuisploeg: '🇫🇷 Frankrijk', uitploeg: '🇦🇺 Australië', datum: '2026-06-13T21:00:00Z', status: 'gepland' },
        { id: 1002, thuisploeg: '🇧🇷 Brazilië', uitploeg: '🇨🇭 Zwitserland', datum: '2026-06-14T18:00:00Z', status: 'gepland' }
      ]);
    } else {
      setMatchen(matchenData);
    }

    const { data: voorspellingenData } = await supabase.from('match_voorspellingen').select('*').eq('speler_id', actieveSpeler.id);
    if (voorspellingenData) {
      const stateObj: any = {};
      voorspellingenData.forEach(v => {
        stateObj[v.match_id] = { thuis: v.thuis_score.toString(), uit: v.uit_score.toString(), goudenBal: v.gouden_bal };
      });
      setMatchVoorspellingen(stateObj);
    }
  };

  const handleMatchScoreChange = (matchId: number, veld: 'thuis'|'uit', waarde: string) => {
    setMatchVoorspellingen(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [veld]: waarde, goudenBal: prev[matchId]?.goudenBal || false }
    }));
  };

  const toggleGoudenBal = (matchId: number) => {
    setMatchVoorspellingen(prev => {
      const geselecteerd = prev[matchId]?.goudenBal || false;
      const newState = { ...prev };
      // Verwijder gouden bal van alle andere matchen in deze sessie
      Object.keys(newState).forEach(key => {
        if (newState[Number(key)]) newState[Number(key)].goudenBal = false;
      });
      // Zet deze aan (of uit)
      newState[matchId] = { ...prev[matchId], goudenBal: !geselecteerd, thuis: prev[matchId]?.thuis || '', uit: prev[matchId]?.uit || '' };
      return newState;
    });
  };

  const slaMatchenOp = async () => {
    setMatchOpslaanStatus('Bezig... ⚽');
    const inserts: any[] = [];
    
    Object.keys(matchVoorspellingen).forEach(mId => {
      const id = Number(mId);
      const v = matchVoorspellingen[id];
      if (v.thuis !== '' && v.uit !== '') {
        inserts.push({
          speler_id: actieveSpeler.id,
          match_id: id,
          thuis_score: parseInt(v.thuis),
          uit_score: parseInt(v.uit),
          gouden_bal: v.goudenBal
        });
      }
    });

    if (inserts.length > 0) {
      const { error } = await supabase.from('match_voorspellingen').upsert(inserts, { onConflict: 'speler_id, match_id' });
      if (error) setMatchOpslaanStatus('Oeps! 🚩 Er ging iets mis.');
      else {
        setMatchOpslaanStatus('Scores opgeslagen! 🌟');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        setTimeout(() => setMatchOpslaanStatus(''), 3000);
      }
    } else {
      setMatchOpslaanStatus('Vul minstens 1 score in!');
      setTimeout(() => setMatchOpslaanStatus(''), 3000);
    }
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

    if (!TOP_SPELERS.includes(topschutter)) { setVoorspellingStatus('Oeps! 🚩 Kies een geldige topschutter.'); return; }
    if (!TOP_KEEPERS.includes(besteKeeper)) { setVoorspellingStatus('Oeps! 🚩 Kies een geldige keeper.'); return; }

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

    if (error) setVoorspellingStatus('Oeps! 🚩 Er ging iets mis.');
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
          --text-dark: #111827;
        }

        /* FELLE ACHTERGROND */
        html, body { margin: 0; padding: 0; width: 100%; min-height: 100%; overflow-x: hidden; background: linear-gradient(135deg, var(--crayola), var(--aqua)); }
        .main-container { margin: 0; padding: 25px 15px 80px 15px; min-height: 100vh; display: flex; flex-direction: column; align-items: center; font-family: 'Nunito', sans-serif; color: var(--text-dark); box-sizing: border-box; }
        
        /* WITTE, LICHT DOORZICHTIGE KAARTEN */
        .glass-card { background: rgba(255, 255, 255, 0.96); padding: 30px 20px; border-radius: 24px; width: 100%; max-width: 500px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); border: 3px solid rgba(255,255,255,0.5); position: relative; z-index: 10; }
        
        .title { font-family: 'Bebas Neue', sans-serif; font-size: 4.5rem; letter-spacing: 2px; margin: 0; text-align: center; color: #FFF; line-height: 1; text-shadow: 3px 3px 0px var(--magenta); }
        .subtitle { font-size: 0.85rem; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 25px; color: var(--lime); text-align: center; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
        
        .tab-container { display: flex; background: #F0F4F8; border-radius: 16px; padding: 5px; margin-bottom: 25px; overflow-x: auto; scrollbar-width: none; width: 100%; box-shadow: inset 0 2px 5px rgba(0,0,0,0.05); }
        .tab { position: relative; flex: 1; min-width: 80px; text-align: center; padding: 12px 5px; font-size: 0.65rem; font-weight: 800; border-radius: 12px; cursor: pointer; color: #6C757D; white-space: nowrap; transition: 0.2s; }
        .tab.active { background: var(--crayola); color: #FFF; box-shadow: 0 4px 10px rgba(55, 114, 255, 0.3); }

        .unread-badge { position: absolute; top: 6px; right: 10px; width: 10px; height: 10px; background-color: var(--rose); border-radius: 50%; box-shadow: 0 0 8px var(--rose); animation: pulse-dot 1.5s infinite; }
        @keyframes pulse-dot { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 112, 157, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 112, 157, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 112, 157, 0); } }
        
        .prijzen-banner { background: linear-gradient(135deg, var(--lime), var(--aqua)); color: var(--text-dark); padding: 15px; border-radius: 20px; text-align: center; font-weight: 900; margin-bottom: 20px; font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; letter-spacing: 1.5px; box-shadow: 0 8px 20px rgba(226, 239, 112, 0.4); animation: pulse 2s infinite; border: 3px solid #FFF; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
        
        /* MATCHEN LAYOUT */
        .match-card { background: #FFF; border-radius: 20px; margin-bottom: 15px; border: 2px solid #E9ECEF; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: 0.2s; }
        .match-card:hover { border-color: var(--crayola); }
        .match-header { background: #F8F9FA; padding: 10px 15px; font-size: 0.7rem; font-weight: 800; color: #ADB5BD; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #E9ECEF; display: flex; justify-content: space-between; align-items: center; }
        .match-body { display: flex; align-items: center; justify-content: space-between; padding: 15px; }
        .ploeg-naam { font-weight: 900; font-size: 1.1rem; color: var(--text-dark); flex: 1; text-align: center; }
        .score-invoer { width: 45px; height: 50px; text-align: center; font-size: 1.5rem; font-family: 'Bebas Neue', sans-serif; border-radius: 12px; border: 2px solid #DEE2E6; background: #F4F7F6; color: var(--crayola); outline: none; transition: 0.2s; }
        .score-invoer:focus { border-color: var(--magenta); background: #FFF; box-shadow: 0 0 10px rgba(240, 56, 255, 0.2); }
        .score-divider { font-weight: 900; color: #ADB5BD; margin: 0 10px; }
        
        /* GOUDEN BAL KNOP */
        .gouden-bal-btn { background: transparent; border: 2px solid #E9ECEF; border-radius: 50%; width: 35px; height: 35px; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: 0.2s; filter: grayscale(1); opacity: 0.4; font-size: 1.2rem; }
        .gouden-bal-btn.active { border-color: #FFD700; background: rgba(255, 215, 0, 0.1); filter: grayscale(0); opacity: 1; box-shadow: 0 0 15px rgba(255, 215, 0, 0.4); transform: scale(1.1); }

        /* RANKING */
        .ranking-item { background: #FFFFFF; border-radius: 20px; padding: 16px 16px; margin: 0 auto 16px auto; border: 2px solid #E9ECEF; display: flex; flex-direction: column; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: transform 0.2s; width: 94%; max-width: 420px; }
        .ranking-item:hover { transform: translateY(-2px); border-color: var(--aqua); }
        .ranking-item.is-me { border-color: var(--crayola); border-width: 2px; background: #F8FBFF; box-shadow: 0 4px 15px rgba(55, 114, 255, 0.15); }
        .ranking-hoofd { display: flex; align-items: center; width: 100%; margin-bottom: 12px; }
        .ranking-pos { width: 35px; font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; color: #ADB5BD; line-height: 1; }
        .pos-1 { color: #FFD700; text-shadow: 0 2px 4px rgba(212, 175, 55, 0.3); font-size: 2.2rem; } 
        .pos-2 { color: #A0AEC0; } 
        .pos-3 { color: #CD7F32; }
        .ranking-naam { flex: 1; font-size: 1.1rem; font-weight: 900; color: var(--text-dark); text-align: left; text-transform: uppercase; letter-spacing: 0.5px; }
        .ranking-totaal { font-family: 'Bebas Neue', sans-serif; font-size: 2.6rem; color: var(--magenta); min-width: 45px; text-align: right; line-height: 1; }
        .ranking-breakdown { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; margin-bottom: 14px; }
        .score-pill { padding: 8px 4px; border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; gap: 2px; }
        .pill-matchen { background: rgba(55, 114, 255, 0.08); color: var(--crayola); border: 1px solid rgba(55, 114, 255, 0.2); }
        .pill-bonus { background: rgba(240, 56, 255, 0.08); color: var(--magenta); border: 1px solid rgba(240, 56, 255, 0.2); }
        .pill-label { font-size: 0.65rem; font-weight: 900; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.5px; }
        .pill-score { font-size: 1rem; font-weight: 900; }
        
        .ranking-status { display: flex; justify-content: space-between; align-items: center; width: 100%; font-size: 0.75rem; font-weight: 800; color: #6C757D; border-top: 2px dashed #E9ECEF; padding-top: 12px; }
        
        /* CHAT */
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
        
        /* FORMS */
        .input-group { text-align: left; margin-bottom: 18px; }
        .label { font-size: 0.7rem; font-weight: 900; text-transform: uppercase; color: var(--crayola); margin-bottom: 8px; display: block; margin-left: 15px; letter-spacing: 1px; }
        .input-field { width: 100%; padding: 16px 20px; border-radius: 20px; border: 2px solid #E9ECEF; background: #F8F9FA; color: var(--text-dark); font-size: 1rem; font-family: 'Nunito', sans-serif; font-weight: 800; box-sizing: border-box; transition: all 0.3s; outline: none; }
        .input-field:focus { border-color: var(--magenta); background: #FFF; box-shadow: 0 5px 15px rgba(240, 56, 255, 0.1); transform: translateY(-2px); }
        .input-field:disabled { opacity: 0.6; cursor: not-allowed; background: #E9ECEF; }
        
        .autocomplete-dropdown { position: absolute; top: calc(100% + 5px); left: 0; right: 0; max-height: 200px; overflow-y: auto; background: #FFF; border: 2px solid var(--crayola); border-radius: 15px; z-index: 100; list-style: none; padding: 0; margin: 0; box-shadow: 0 10px 25px rgba(55, 114, 255, 0.2); }
        .autocomplete-item { padding: 12px 18px; border-bottom: 1px solid #F1F3F5; cursor: pointer; color: var(--text-dark); font-size: 0.95rem; font-weight: 800; transition: 0.2s; }
        .autocomplete-item:hover { background: #F8FBFF; color: var(--crayola); }
        .autocomplete-item:last-child { border-bottom: none; }

        .btn-primary { width: 100%; padding: 18px; border-radius: 25px; border: none; background: var(--magenta); color: #FFF; font-weight: 900; cursor: pointer; text-transform: uppercase; font-size: 1.1rem; letter-spacing: 2px; box-shadow: 0 8px 25px rgba(240, 56, 255, 0.3); transition: all 0.2s; }
        .btn-primary:active { transform: scale(0.95); }
        .btn-secondary { width: 100%; padding: 15px; margin-top: 15px; border-radius: 20px; border: 3px solid var(--crayola); background: transparent; color: var(--crayola); font-weight: 900; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        
        /* COUNTDOWN */
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
        
        /* ANTWOORDEN */
        .cat-card { background: #FFF; border-radius: 20px; margin-bottom: 18px; border: 2px solid #E9ECEF; overflow: hidden; text-align: left; transition: 0.2s; }
        .cat-card:hover { border-color: var(--aqua); box-shadow: 0 5px 20px rgba(112, 228, 239, 0.2); }
        .cat-header { background: #F8F9FA; padding: 15px 20px; border-bottom: 2px solid #E9ECEF; display: flex; justify-content: space-between; align-items: center; }
        .cat-titel { font-size: 0.85rem; font-weight: 900; color: var(--crayola); text-transform: uppercase; margin: 0; }
        .cat-stand { font-size: 0.65rem; font-weight: 900; background: var(--aqua); color: var(--text-dark); padding: 5px 10px; border-radius: 10px; }
        .cat-lijst { padding: 5px 20px; }
        .cat-speler-rij { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px dashed #F1F3F5; font-size: 0.9rem; }
        .antw-naam { font-weight: 800; color: #ADB5BD; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px;}
        .antw-text { font-weight: 900; color: var(--text-dark); text-align: right; max-width: 60%; }
        .blurred-waarde { filter: blur(5px); opacity: 0.3; letter-spacing: 2px; }
        .eigen-antw .antw-text { color: var(--magenta); }
        .eigen-antw .antw-naam { color: var(--magenta); }

        .bouncing-ball-loader { font-size: 3rem; text-align: center; animation: bounceBall 0.8s infinite alternate cubic-bezier(0.5, 0.05, 1, 0.5); padding: 20px; text-shadow: 0 10px 10px rgba(0,0,0,0.2); }
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

      <datalist id="top-spelers">{TOP_SPELERS.map(s => <option key={s} value={s} />)}</datalist>
      <datalist id="top-keepers">{TOP_KEEPERS.map(k => <option key={k} value={k} />)}</datalist>

      <div className="glass-card">
        <h1 className="title">WK 2026</h1>
        <p className="subtitle">Pronostiek • Road to America</p>

        {actieveSpeler ? (
          <div>
            <div className="tab-container">
              <div className={`tab ${actieveTab === 'matchen' ? 'active' : ''}`} onClick={() => veranderTab('matchen')}>MATCHEN</div>
              <div className={`tab ${actieveTab === 'toernooi' ? 'active' : ''}`} onClick={() => veranderTab('toernooi')}>BONUSVRAGEN</div>
              <div className={`tab ${actieveTab === 'antwoorden' ? 'active' : ''}`} onClick={() => veranderTab('antwoorden')}>ANTWOORDEN</div>
              <div className={`tab ${actieveTab === 'ranking' ? 'active' : ''}`} onClick={() => veranderTab('ranking')}>RANKING</div>
              <div className={`tab ${actieveTab === 'kleedkamer' ? 'active' : ''}`} onClick={() => veranderTab('kleedkamer')}>
                CHAT 💬
                {ongelezenBerichten && <span className="unread-badge"></span>}
              </div>
            </div>

            {/* MATCHEN TABBLAD */}
            {actieveTab === 'matchen' && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                <p style={{ textAlign: 'center', fontSize: '0.75rem', opacity: 0.8, margin: '0 0 15px 0' }}>Voorspel de score. Zet je Gouden Bal (🌟) in voor dubbele punten!</p>
                
                {matchen.length === 0 ? <div className="bouncing-ball-loader">⚽</div> : matchen.map((match) => {
                  const voorspelling = matchVoorspellingen[match.id] || { thuis: '', uit: '', goudenBal: false };
                  const datumText = new Date(match.datum).toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={match.id} className="match-card">
                      <div className="match-header">
                        <span>{datumText}</span>
                        <button 
                          type="button" 
                          className={`gouden-bal-btn ${voorspelling.goudenBal ? 'active' : ''}`} 
                          onClick={() => toggleGoudenBal(match.id)}
                          title="Zet Gouden Bal in (x2 punten)"
                        >
                          🌟
                        </button>
                      </div>
                      
                      <div className="match-body">
                        <div className="ploeg-naam" style={{ textAlign: 'right' }}>{match.thuisploeg}</div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', margin: '0 15px' }}>
                          <input 
                            className="score-invoer" type="tel" maxLength={2} value={voorspelling.thuis} 
                            onChange={e => handleMatchScoreChange(match.id, 'thuis', e.target.value.replace(/[^0-9]/g, ''))} 
                          />
                          <span className="score-divider">-</span>
                          <input 
                            className="score-invoer" type="tel" maxLength={2} value={voorspelling.uit} 
                            onChange={e => handleMatchScoreChange(match.id, 'uit', e.target.value.replace(/[^0-9]/g, ''))} 
                          />
                        </div>

                        <div className="ploeg-naam" style={{ textAlign: 'left' }}>{match.uitploeg}</div>
                      </div>
                    </div>
                  );
                })}

                <button className="btn-primary" style={{marginTop: '10px'}} onClick={slaMatchenOp}>MATCHEN OPSLAAN</button>
                <div style={{color:'var(--magenta)', marginTop:'15px', fontWeight:900, textAlign:'center', fontSize:'1.1rem'}}>{matchOpslaanStatus}</div>
              </div>
            )}

            {actieveTab === 'ranking' && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                <div className="prijzen-banner">🏆 TOTALE PRIJZENPOT: €{prijzenPot}</div>
                {klassement.length === 0 ? <div className="bouncing-ball-loader">⚽</div> : klassement.map((s, i) => {
                  const heeftJokerNog = !gebruikteJokers.includes(s.id);
                  return (
                    <div key={s.id} className={`ranking-item ${s.id === actieveSpeler.id ? 'is-me' : ''}`}>
                      <div className="ranking-hoofd">
                        <div className={`ranking-pos pos-${i+1}`}>{i + 1}</div>
                        <div className="ranking-naam">{s.naam}</div>
                        <div className="ranking-totaal">{s.totaal_score || 0}</div>
                      </div>
                      
                      <div className="ranking-breakdown">
                        <div className="score-pill pill-matchen">
                          <span className="pill-label">⚽ Matchen</span>
                          <span className="pill-score">0 pt</span>
                        </div>
                        <div className="score-pill pill-bonus">
                          <span className="pill-label">🏆 Bonusvragen</span>
                          <span className="pill-score">0 pt</span>
                        </div>
                      </div>

                      <div className="ranking-status">
                        <span>Status Joker:</span>
                        <span title={heeftJokerNog ? "Joker is nog beschikbaar!" : "Joker is al ingezet!"} style={{ fontSize: '1.2rem', filter: heeftJokerNog ? 'none' : 'grayscale(1)', opacity: heeftJokerNog ? 1 : 0.4 }}>
                          {heeftJokerNog ? '🌟' : '🌑'}
                        </span>
                      </div>
                    </div>
                  );
                })}
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
                <div style={{color:'var(--magenta)', marginTop:'15px', fontWeight:900, textAlign:'center', fontSize:'1.1rem'}}>{voorspellingStatus}</div>
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
            <div style={{marginTop:'15px', color:'var(--lime)', fontWeight:900, textAlign:'center', textShadow:'1px 1px 2px rgba(0,0,0,0.5)'}}>{status}</div>
          </div>
        )}
      </div>
    </main>
  );
}