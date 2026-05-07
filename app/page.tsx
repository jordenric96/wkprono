'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { WK_LANDEN, TOP_SPELERS, TOP_KEEPERS } from '../lib/data';

const DEADLINE_DATE = new Date('2026-06-11T21:00:00+02:00').getTime();
const AVATARS = ['⚽', '🦁', '🍟', '🍺', '👑', '🔥', '🏆', '👽', '🤡', '😎', '👻', '🌶️'];

export default function Home() {
  const [ontgrendelNaam, setOntgrendelNaam] = useState('');
  const [inschrijfNaam, setInschrijfNaam] = useState('');
  const [invoerCode, setInvoerCode] = useState('');
  const [kiesAvatar, setKiesAvatar] = useState('⚽');
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

    // Notificatie toestemming vragen
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

    // REALTIME CHAT LISTENER
    const chatSubscription = supabase
      .channel('kleedkamer_berichten')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'kleedkamer' }, (payload) => {
        haalChatOp();
        // Stuur notificatie als tab niet actief is
        if (document.hidden && Notification.permission === "granted") {
          new Notification("Nieuw bericht in de Kleedkamer! ⚽", {
            body: payload.new.bericht,
            icon: "/favicon.ico"
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
    const { data, error } = await supabase.from('kleedkamer').select('*, spelers(naam, avatar)').order('created_at', { ascending: true });
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
    setVoorspellingStatus('De VAR checkt je keuzes... 📺');
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

    if (error) setVoorspellingStatus('🚩 Buitenspel! Probeer opnieuw.');
    else {
      setVoorspellingStatus('✅ Wereldgoal! Opgeslagen.');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      setTimeout(() => setVoorspellingStatus(''), 3000);
    }
  };

  const schrijfIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('De VAR kijkt ernaar... 📺');
    const { error } = await supabase.from('spelers').insert([{ naam: inschrijfNaam.trim(), totaal_score: 0, avatar: kiesAvatar }]);
    if (error) setStatus('🚩 Naam bestaat al.');
    else { setStatus('✅ Transfer afgerond!'); setInschrijfNaam(''); haalSpelersOp(); }
  };

  const ontgrendel = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: speler, error } = await supabase.from('spelers').select('*').ilike('naam', ontgrendelNaam.trim()).single();
    if (error || !speler) { setStatus('🚩 Speler niet gevonden.'); return; }
    if (String(speler.code).trim() === String(invoerCode).trim()) {
      localStorage.setItem('wk_speler_id', speler.id.toString());
      setActieveSpeler(speler); setStatus('');
    } else setStatus('🚩 Code is fout. Gele kaart!');
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
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;800;900&display=swap');
        html, body { margin: 0; padding: 0; width: 100%; min-height: 100%; background: #0B0E14; overflow-x: hidden; }
        .main-container { margin: 0; padding: 15px 15px 80px 15px; min-height: 100vh; display: flex; flex-direction: column; align-items: center; font-family: 'Inter', sans-serif; background: radial-gradient(circle at 50% 0%, #1a2235 0%, #090c15 100%); color: #E0E6ED; box-sizing: border-box; }
        .glass-card { background: rgba(15, 20, 30, 0.6); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); padding: 30px 20px; border-radius: 32px; border: 1px solid rgba(0, 240, 255, 0.15); width: 100%; max-width: 500px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .title { font-family: 'Bebas Neue', sans-serif; font-size: 4rem; letter-spacing: 2px; margin: 0; text-align: center; color: #FFF; text-shadow: 0 0 20px rgba(0, 240, 255, 0.4); line-height: 1; }
        .subtitle { font-size: 0.75rem; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 25px; color: #00F0FF; text-align: center; }
        .tab-container { display: flex; background: rgba(0,0,0,0.4); border-radius: 16px; padding: 5px; margin-bottom: 25px; overflow-x: auto; scrollbar-width: none; width: 100%; }
        .tab { flex: 1; min-width: 80px; text-align: center; padding: 12px 5px; font-size: 0.65rem; font-weight: 800; border-radius: 12px; cursor: pointer; color: white; opacity: 0.5; white-space: nowrap; }
        .tab.active { background: rgba(0, 240, 255, 0.1); color: #00F0FF; opacity: 1; border: 1px solid rgba(0, 240, 255, 0.3); }
        .prijzen-banner { background: linear-gradient(90deg, #FFD700, #DAA520); color: #000; padding: 10px; border-radius: 12px; text-align: center; font-weight: 900; margin-bottom: 20px; font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; letter-spacing: 1px; box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); }
        .ranking-item { background: rgba(0,0,0,0.3); border-radius: 14px; padding: 12px 15px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; position: relative; }
        .ranking-item.is-me { border-color: #00F0FF; background: rgba(0, 240, 255, 0.05); }
        .ranking-pos { width: 30px; font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; color: rgba(255,255,255,0.4); }
        .pos-1 { color: #FFD700; } .pos-2 { color: #C0C0C0; } .pos-3 { color: #CD7F32; }
        .ranking-avatar { font-size: 1.4rem; margin-right: 12px; }
        .ranking-naam { flex: 1; font-size: 1rem; font-weight: 800; color: #FFF; text-align: left; }
        .ranking-totaal { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; color: #00F0FF; min-width: 45px; text-align: right; }
        .ranking-pijl { position: absolute; bottom: 5px; right: 15px; font-size: 0.6rem; opacity: 0.6; display: flex; gap: 8px; font-weight: 700; }
        .ranking-pijl span { color: #00F0FF; }
        .chat-container { display: flex; flex-direction: column; height: 420px; background: rgba(0,0,0,0.4); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; }
        .chat-berichten { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
        .chat-bubbel { background: rgba(255,255,255,0.08); padding: 8px 12px; border-radius: 14px; border-top-left-radius: 2px; max-width: 80%; font-size: 0.85rem; position: relative; text-align: left; }
        .chat-bericht.is-mij { flex-direction: row-reverse; display: flex; gap: 8px; align-items: flex-start; }
        .chat-bericht.is-mij .chat-bubbel { background: rgba(0, 240, 255, 0.15); border-radius: 14px; border-top-right-radius: 2px; border-top-left-radius: 14px; border: 1px solid rgba(0, 240, 255, 0.2); }
        .chat-invoer { display: flex; padding: 10px; background: rgba(0,0,0,0.5); }
        .chat-input { flex: 1; background: rgba(255,255,255,0.1); border: none; padding: 12px; border-radius: 20px; color: white; outline: none; }
        .chat-send { background: #00F0FF; border: none; width: 42px; height: 42px; border-radius: 50%; margin-left: 8px; cursor: pointer; }
        .input-group { text-align: left; margin-bottom: 15px; }
        .label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #00F0FF; margin-bottom: 6px; display: block; margin-left: 10px; }
        .input-field { width: 100%; padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: white; font-size: 1rem; box-sizing: border-box; }
        .btn-primary { width: 100%; padding: 16px; border-radius: 16px; border: none; background: #00F0FF; color: #090c15; font-weight: 900; cursor: pointer; text-transform: uppercase; }
        .btn-secondary { width: 100%; padding: 12px; margin-top: 10px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: white; font-weight: 600; cursor: pointer; }
        .avatar-picker { display: flex; gap: 10px; overflow-x: auto; padding: 5px; }
        .avatar-optie { font-size: 1.4rem; padding: 8px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; }
        .avatar-optie.selected { border-color: #00F0FF; background: rgba(0, 240, 255, 0.1); }
        .countdown-banner { background: rgba(0,0,0,0.3); border-radius: 16px; padding: 15px; margin-bottom: 25px; border: 1px solid rgba(0, 240, 255, 0.2); text-align: center; }
        .tijd-grid { display: flex; justify-content: center; gap: 8px; }
        .tijd-box { flex: 1; max-width: 65px; background: rgba(255,255,255,0.05); padding: 8px 4px; border-radius: 10px; }
        .tijd-cijfer { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; line-height: 1; color: #FFF; }
        .tijd-label { font-size: 0.5rem; text-transform: uppercase; opacity: 0.6; }
        .cat-card { background: rgba(0,0,0,0.3); border-radius: 16px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; text-align: left; }
        .cat-header { background: rgba(255,255,255,0.03); padding: 10px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
        .cat-titel { font-size: 0.8rem; font-weight: 800; color: #00F0FF; text-transform: uppercase; margin: 0; }
        .cat-stand { font-size: 0.6rem; font-weight: 800; background: rgba(0,0,0,0.4); padding: 3px 7px; border-radius: 6px; }
        .cat-lijst { padding: 5px 15px; }
        .cat-speler-rij { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 0.8rem; }
        .antw-text { font-weight: 800; color: #FFF; }
        .blurred-waarde { filter: blur(4px); opacity: 0.4; letter-spacing: 2px; }
      `}</style>

      {showConfetti && (
        <div className="confetti-container">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="confetti" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}></div>
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
              <div className={`tab ${actieveTab === 'matchen' ? 'active' : ''}`} onClick={() => setActieveTab('matchen')}>MATCHEN</div>
              <div className={`tab ${actieveTab === 'toernooi' ? 'active' : ''}`} onClick={() => setActieveTab('toernooi')}>TOERNOOI</div>
              <div className={`tab ${actieveTab === 'antwoorden' ? 'active' : ''}`} onClick={() => setActieveTab('antwoorden')}>ANTWOORDEN</div>
              <div className={`tab ${actieveTab === 'ranking' ? 'active' : ''}`} onClick={() => setActieveTab('ranking')}>RANKING</div>
              <div className={`tab ${actieveTab === 'kleedkamer' ? 'active' : ''}`} onClick={() => setActieveTab('kleedkamer')}>CHAT 💬</div>
            </div>

            {actieveTab === 'ranking' && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                <div className="prijzen-banner">🏆 TOTALE PRIJZENPOT: €{prijzenPot}</div>
                {klassement.map((s, i) => (
                  <div key={s.id} className={`ranking-item ${s.id === actieveSpeler.id ? 'is-me' : ''}`}>
                    <div className={`ranking-pos pos-${i+1}`}>{i + 1}</div>
                    <div className="ranking-avatar">{s.avatar || '⚽'}</div>
                    <div className="ranking-naam">{s.naam}</div>
                    <div className="ranking-totaal">{s.totaal_score || 0}</div>
                    <div className="ranking-pijl">
                      M: <span>0</span> B: <span>0</span>
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
                      <div className="tijd-box"><div className="tijd-cijfer">{tijdOver.dagen}</div><div className="tijd-label">Dag</div></div>
                      <div className="tijd-box"><div className="tijd-cijfer">{tijdOver.uren}</div><div className="tijd-label">Uur</div></div>
                      <div className="tijd-box"><div className="tijd-cijfer">{tijdOver.minuten}</div><div className="tijd-label">Min</div></div>
                    </div>
                  </div>
                )}
                <div className="input-group"><label className="label">Eindwinnaar</label><select className="input-field" value={winnaar} onChange={e=>setWinnaar(e.target.value)} required disabled={isGesloten}><option value="" disabled>Kies...</option>{WK_LANDEN.map(l=><option key={l} value={l}>{l}</option>)}</select></div>
                <div className="input-group"><label className="label">Topschutter</label><input className="input-field" list="top-spelers" value={topschutter} onChange={e=>setTopschutter(e.target.value)} required disabled={isGesloten}/></div>
                <div className="input-group"><label className="label">Eindstation België</label><select className="input-field" value={eindstation} onChange={e=>setEindstation(e.target.value)} required disabled={isGesloten}><option value="Groepsfase">Groepsfase</option><option value="1/16e">1/16e</option><option value="1/8e">1/8e</option><option value="Kwart">Kwart</option><option value="Halve">Halve</option><option value="Finale">Finale</option><option value="Winnaar">Winnaar 🏆</option></select></div>
                <div className="grid-2">
                  <div className="input-group"><label className="label">Gele kaarten</label><input className="input-field" type="number" value={geelKaarten} onChange={e=>setGeelKaarten(e.target.value)} required disabled={isGesloten}/></div>
                  <div className="input-group"><label className="label">Rode kaarten</label><input className="input-field" type="number" value={roodKaarten} onChange={e=>setRoodKaarten(e.target.value)} required disabled={isGesloten}/></div>
                </div>
                {!isGesloten && <button className="btn-primary" type="submit">OPSLAAN</button>}
                <div style={{color:'#00F0FF', marginTop:'10px', fontWeight:800}}>{voorspellingStatus}</div>
              </form>
            )}

            {actieveTab === 'kleedkamer' && (
              <div className="chat-container">
                <div className="chat-berichten">
                  {chatBerichten.map((c, idx) => (
                    <div key={idx} className={`chat-bericht ${c.speler_id === actieveSpeler.id ? 'is-mij' : ''}`}>
                      <div className="chat-avatar" style={{fontSize:'1.2rem'}}>{c.spelers?.avatar}</div>
                      <div style={{maxWidth:'85%'}}>
                        <div style={{fontSize:'0.6rem', opacity:0.5, marginBottom:'2px', textAlign: c.speler_id === actieveSpeler.id ? 'right' : 'left'}}>{c.spelers?.naam}</div>
                        <div className="chat-bubbel">{c.bericht}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEindeRef} />
                </div>
                <form onSubmit={verstuurChat} className="chat-invoer">
                  <input className="chat-input" placeholder="Stuur bericht..." value={nieuwBericht} onChange={e=>setNieuwBericht(e.target.value)} />
                  <button type="submit" className="chat-send">🚀</button>
                </form>
              </div>
            )}

            {actieveTab === 'antwoorden' && (
              <div style={{maxHeight:'500px', overflowY:'auto'}}>
                {CATEGORIEEN.map((cat, idx) => (
                  <div key={idx} className="cat-card">
                    <div className="cat-header"><h3 className="cat-titel">{cat.label}</h3><div className="cat-stand">{cat.stand}</div></div>
                    <div className="cat-lijst">
                      {spelers.map(speler => {
                        const v = alleVoorspellingen.find(x => x.speler_id === speler.id);
                        const toonData = isGesloten || speler.id === actieveSpeler.id;
                        return (
                          <div key={speler.id} className="cat-speler-rij">
                            <span>{speler.avatar} {speler.naam}</span>
                            <span className={`antw-text ${!toonData ? 'blurred-waarde' : ''}`}>{v ? (v[cat.key] || '-') : '...'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button className="btn-secondary" onClick={()=>{localStorage.removeItem('wk_speler_id'); setActieveSpeler(null);}}>Uitloggen</button>
          </div>
        ) : (
          <div>
            <form onSubmit={ontgrendel}>
              <div className="input-group"><label className="label">Naam</label><input className="input-field" value={ontgrendelNaam} onChange={e=>setOntgrendelNaam(e.target.value)} /></div>
              <div className="input-group"><label className="label">Code</label><input className="input-field" type="text" value={invoerCode} onChange={e=>setInvoerCode(e.target.value)} /></div>
              <button className="btn-primary" type="submit">HET VELD OP</button>
            </form>
            <div style={{margin:'20px 0', opacity:0.3}}>--- OF ---</div>
            <form onSubmit={schrijfIn}>
              <input className="input-field" placeholder="Nieuwe speler naam" value={inschrijfNaam} onChange={e=>setInschrijfNaam(e.target.value)} />
              <div className="avatar-picker">{AVATARS.map(a=><div key={a} className={`avatar-optie ${kiesAvatar===a?'selected':''}`} onClick={()=>setKiesAvatar(a)}>{a}</div>)}</div>
              <button className="btn-secondary" type="submit">INSCHRIJVEN</button>
            </form>
            <div style={{marginTop:'10px', color:'#00F0FF', fontWeight:800}}>{status}</div>
          </div>
        )}
      </div>
    </main>
  );
}