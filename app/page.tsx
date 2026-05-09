'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { WK_LANDEN } from '../lib/data';

import { CountdownTimer } from '../components/Shared';
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

  const [infoOpen, setInfoOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const isAdmin = actieveSpeler?.naam?.toLowerCase() === 'jorden ricour'.toLowerCase();

  const [matchen, setMatchen] = useState<any[]>([]);
  const [matchVoorspellingen, setMatchVoorspellingen] = useState<Record<number, {thuis: string, uit: string, joker: boolean}>>({});
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
    const m = matchen.find(x => x.id === mId);
    if (m && nu >= new Date(m.datum).getTime()) return;
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
    if (isGesloten) return;
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

  const getMatchCountdown = (matchTime: string) => {
    const diff = new Date(matchTime).getTime() - nu;
    if (diff <= 0) return "🔒 GESLOTEN";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const isUrgent = diff < (1000 * 60 * 60); 
    
    return (
      <span style={{ color: isUrgent ? '#FA5252' : 'inherit', fontWeight: 900 }}>
        ⏱️ {h > 0 ? `${h}u ` : ''}{m}m
      </span>
    );
  };

  // --- MEGA DATABASE MET VLAGGEN EN KLEUREN ---
  const parseTeam = (teamString: string) => {
    if (!teamString || teamString.includes('TBD')) {
      return { name: teamString || 'TBD', emoji: '❓', gradient: 'linear-gradient(135deg, #DEE2E6, #ADB5BD)' };
    }

    const emojiMatch = teamString.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu);
    let emoji = emojiMatch ? emojiMatch.join('') : '';
    let name = teamString.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();

    const colors: any = {
      // Europa
      'België': 'linear-gradient(135deg, #000 33%, #FFD700 33%, #FFD700 66%, #ED2939 66%)',
      'Nederland': 'linear-gradient(135deg, #AE1C28 33%, #FFF 33%, #FFF 66%, #21468B 66%)',
      'Frankrijk': 'linear-gradient(135deg, #002395 33%, #FFF 33%, #FFF 66%, #ED2939 66%)',
      'Duitsland': 'linear-gradient(135deg, #000 33%, #FF0000 33%, #FF0000 66%, #FFCC00 66%)',
      'Spanje': 'linear-gradient(135deg, #AA151B 33%, #F1BF00 33%, #F1BF00 66%, #AA151B 66%)',
      'Portugal': 'linear-gradient(135deg, #006600 50%, #FF0000 50%)',
      'Engeland': 'linear-gradient(135deg, #FFF 40%, #CE1124 40%, #CE1124 60%, #FFF 60%)',
      'Italië': 'linear-gradient(135deg, #009246 33%, #FFF 33%, #FFF 66%, #CE2B37 66%)',
      'Kroatië': 'linear-gradient(135deg, #FF0000 33%, #FFF 33%, #FFF 66%, #0000FF 66%)',
      'Zwitserland': 'linear-gradient(135deg, #FF0000 40%, #FFF 40%, #FFF 60%, #FF0000 60%)',
      'Oostenrijk': 'linear-gradient(135deg, #ED2939 33%, #FFF 33%, #FFF 66%, #ED2939 66%)',
      'Tsjechië': 'linear-gradient(135deg, #11457E 33%, #D7141A 33%, #D7141A 66%, #FFF 66%)',
      'Czechia': 'linear-gradient(135deg, #11457E 33%, #D7141A 33%, #D7141A 66%, #FFF 66%)',
      'Zweden': 'linear-gradient(135deg, #004B87 40%, #FFCD00 40%, #FFCD00 60%, #004B87 60%)',
      'Denemarken': 'linear-gradient(135deg, #C60C30 40%, #FFF 40%, #FFF 60%, #C60C30 60%)',
      'Schotland': 'linear-gradient(135deg, #005EB8 40%, #FFF 40%, #FFF 60%, #005EB8 60%)',
      'Polen': 'linear-gradient(135deg, #FFF 50%, #DC143C 50%)',
      'Servië': 'linear-gradient(135deg, #C6363C 33%, #0C4076 33%, #0C4076 66%, #FFF 66%)',
      'Wales': 'linear-gradient(135deg, #FFF 50%, #00AB39 50%)',
      'Oekraïne': 'linear-gradient(135deg, #0057B7 50%, #FFD700 50%)',
      'Roemenië': 'linear-gradient(135deg, #002B7F 33%, #FCD116 33%, #FCD116 66%, #CE1126 66%)',
      'Hongarije': 'linear-gradient(135deg, #CE2939 33%, #FFF 33%, #FFF 66%, #477050 66%)',
      'Slowakije': 'linear-gradient(135deg, #FFF 33%, #0B4EA2 33%, #0B4EA2 66%, #EE1C25 66%)',
      'Turkije': 'linear-gradient(135deg, #E30A17 80%, #FFF 80%)',
      
      // Zuid-Amerika
      'Brazilië': 'linear-gradient(135deg, #009c3b 33%, #ffdf00 33%, #ffdf00 66%, #002776 66%)',
      'Argentinië': 'linear-gradient(135deg, #75AADB 33%, #FFF 33%, #FFF 66%, #75AADB 66%)',
      'Chili': 'linear-gradient(135deg, #0039A6 33%, #FFF 33%, #FFF 66%, #D52B1E 66%)',
      'Colombia': 'linear-gradient(135deg, #FCD116 50%, #003893 50%, #003893 75%, #CE1126 75%)',
      'Uruguay': 'linear-gradient(135deg, #0038A8 40%, #FFF 40%, #FFF 60%, #0038A8 60%)',
      'Ecuador': 'linear-gradient(135deg, #FFD100 50%, #003893 50%, #003893 75%, #CE1126 75%)',
      'Peru': 'linear-gradient(135deg, #D91023 33%, #FFF 33%, #FFF 66%, #D91023 66%)',
      'Paraguay': 'linear-gradient(135deg, #D52B1E 33%, #FFF 33%, #FFF 66%, #0038A8 66%)',
      'Venezuela': 'linear-gradient(135deg, #FCE300 50%, #0038A8 50%, #0038A8 75%, #CE1126 75%)',
      
      // Noord-Amerika
      'Mexico': 'linear-gradient(135deg, #006847 33%, #FFF 33%, #FFF 66%, #CE1126 66%)',
      'USA': 'linear-gradient(135deg, #B31942 33%, #FFF 33%, #FFF 66%, #0A3161 66%)',
      'Verenigde Staten': 'linear-gradient(135deg, #B31942 33%, #FFF 33%, #FFF 66%, #0A3161 66%)',
      'Canada': 'linear-gradient(135deg, #FF0000 30%, #FFF 30%, #FFF 70%, #FF0000 70%)',
      'Costa Rica': 'linear-gradient(135deg, #002B7F 20%, #FFF 20%, #FFF 40%, #CE1126 40%, #CE1126 60%, #FFF 60%, #FFF 80%, #002B7F 80%)',
      'Panama': 'linear-gradient(135deg, #FFF 25%, #C2113A 25%, #C2113A 50%, #00225D 50%, #00225D 75%, #FFF 75%)',
      'Jamaica': 'linear-gradient(135deg, #009B3A 40%, #FED100 40%, #FED100 60%, #000 60%)',

      // Afrika
      'Marokko': 'linear-gradient(135deg, #c1272d 45%, #006233 45%, #006233 55%, #c1272d 55%)',
      'Kameroen': 'linear-gradient(135deg, #007A5E 33%, #CE1126 33%, #CE1126 66%, #FCD116 66%)',
      'Ivoorkust': 'linear-gradient(135deg, #FF8200 33%, #FFF 33%, #FFF 66%, #009A44 66%)',
      'Senegal': 'linear-gradient(135deg, #00853F 33%, #FDEF42 33%, #FDEF42 66%, #E31B23 66%)',
      'Ghana': 'linear-gradient(135deg, #CE1126 33%, #FCD116 33%, #FCD116 66%, #006B3F 66%)',
      'Nigeria': 'linear-gradient(135deg, #008751 33%, #FFF 33%, #FFF 66%, #008751 66%)',
      'Egypte': 'linear-gradient(135deg, #CE1126 33%, #FFF 33%, #FFF 66%, #000 66%)',
      'Tunesië': 'linear-gradient(135deg, #E70013 40%, #FFF 40%, #FFF 60%, #E70013 60%)',
      'South Africa': 'linear-gradient(135deg, #007A4D 25%, #FFB612 25%, #FFB612 50%, #000 50%, #000 75%, #DE3831 75%)',
      'Zuid-Afrika': 'linear-gradient(135deg, #007A4D 25%, #FFB612 25%, #FFB612 50%, #000 50%, #000 75%, #DE3831 75%)',
      'Algerije': 'linear-gradient(135deg, #006233 50%, #FFF 50%)',
      
      // Azië & Oceanië
      'Japan': 'linear-gradient(135deg, #FFF 40%, #BC002D 40%, #BC002D 60%, #FFF 60%)',
      'Zuid-Korea': 'linear-gradient(135deg, #FFF 40%, #CD2E3A 40%, #CD2E3A 60%, #0047A0 60%)',
      'South Korea': 'linear-gradient(135deg, #FFF 40%, #CD2E3A 40%, #CD2E3A 60%, #0047A0 60%)',
      'Australië': 'linear-gradient(135deg, #012169 40%, #FFF 40%, #FFF 50%, #E4002B 50%)',
      'Iran': 'linear-gradient(135deg, #239F40 33%, #FFF 33%, #FFF 66%, #DA0000 66%)',
      'Saudi-Arabië': 'linear-gradient(135deg, #006C35 80%, #FFF 80%)',
      'Qatar': 'linear-gradient(135deg, #FFF 30%, #8A1538 30%)',
      'Nieuw-Zeeland': 'linear-gradient(135deg, #00247D 40%, #FFF 40%, #FFF 50%, #CC142B 50%)'
    };

    const defaultEmojis: any = {
      'België': '🇧🇪', 'Nederland': '🇳🇱', 'Frankrijk': '🇫🇷', 'Duitsland': '🇩🇪', 'Spanje': '🇪🇸',
      'Brazilië': '🇧🇷', 'Argentinië': '🇦🇷', 'Portugal': '🇵🇹', 'Italië': '🇮🇹', 'Engeland': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Mexico': '🇲🇽', 'USA': '🇺🇸', 'Verenigde Staten': '🇺🇸', 'Canada': '🇨🇦', 'Marokko': '🇲🇦',
      'Chili': '🇨🇱', 'Kameroen': '🇨🇲', 'Colombia': '🇨🇴', 'Costa Rica': '🇨🇷', 'Zwitserland': '🇨🇭',
      'Ivoorkust': '🇨🇮', 'Oostenrijk': '🇦🇹', 'Australië': '🇦🇺', 'Japan': '🇯🇵', 'Zuid-Korea': '🇰🇷',
      'South Korea': '🇰🇷', 'Kroatië': '🇭🇷', 'Uruguay': '🇺🇾', 'Senegal': '🇸🇳', 'Ghana': '🇬🇭',
      'Nigeria': '🇳🇬', 'Ecuador': '🇪🇨', 'Zweden': '🇸🇪', 'Denemarken': '🇩🇰', 'Schotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'Polen': '🇵🇱', 'Servië': '🇷🇸', 'Iran': '🇮🇷', 'Saudi-Arabië': '🇸🇦', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
      'Oekraïne': '🇺🇦', 'Peru': '🇵🇪', 'Panama': '🇵🇦', 'Egypte': '🇪🇬', 'Tunesië': '🇹🇳',
      'Nieuw-Zeeland': '🇳🇿', 'Qatar': '🇶🇦', 'Ierland': '🇮🇪', 'Turkije': '🇹🇷', 'South Africa': '🇿🇦',
      'Zuid-Afrika': '🇿🇦', 'Czechia': '🇨🇿', 'Tsjechië': '🇨🇿', 'Roemenië': '🇷🇴', 'Hongarije': '🇭🇺',
      'Slowakije': '🇸🇰', 'Paraguay': '🇵🇾', 'Venezuela': '🇻🇪', 'Algerije': '🇩🇿', 'Jamaica': '🇯🇲'
    };

    if (!emoji && defaultEmojis[name]) emoji = defaultEmojis[name];
    if (!emoji) emoji = '🏳️';

    // Geen blauwe fallback meer! Nu zacht grijs voor onbekende landen.
    const gradient = colors[name] || 'linear-gradient(135deg, #DEE2E6, #ADB5BD)';
    return { name, emoji, gradient };
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
        .timer-box { background: var(--magenta); color: #FFF; padding: 8px 12px; border-radius: 12px; text-align: center; font-weight: 900; box-shadow: 0 4px 10px rgba(240, 56, 255, 0.3); }
        .timer-value { font-size: 1.5rem; line-height: 1.1; }
        .timer-label { font-size: 0.6rem; text-transform: uppercase; opacity: 0.8; }

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

        .info-toggle-btn { width: 100%; background: rgba(255,255,255,0.9); border: 2px solid var(--crayola); color: var(--crayola); padding: 12px; border-radius: 12px; font-weight: 900; font-size: 0.8rem; cursor: pointer; text-transform: uppercase; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; }
        .info-content { background: rgba(255,255,255,0.9); padding: 15px; border-radius: 12px; font-size: 0.8rem; font-weight: 700; margin-bottom: 20px; border-left: 4px solid var(--magenta); line-height: 1.5; }
        .admin-btn { background: #111827; color: #fff; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 900; cursor: pointer; font-size: 0.8rem; margin: 0 auto 15px; display: block; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }

        .full-input { width: 100%; padding: 15px; border-radius: 15px; border: 2px solid #E9ECEF; font-weight: 800; font-size: 1rem; margin-bottom: 10px; }
        .btn-primary { width: 100%; padding: 18px; border-radius: 16px; background: var(--magenta); color: #FFF; border: none; font-weight: 900; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 15px rgba(240, 56, 255, 0.3); }

        @keyframes background-fade { 0%, 100% { background-position: 0% 0%; } 50% { background-position: 100% 100%; } }
        @keyframes blob-movement-a { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(50px, 80px) scale(1.1); } }
        @keyframes blob-movement-b { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-40px, -60px) scale(0.9); } }
        @keyframes title-glow { 0%, 100% { text-shadow: 3px 3px 0px var(--magenta); } 50% { text-shadow: 3px 3px 20px rgba(240, 56, 255, 0.8), 3px 3px 0px var(--magenta); } }
        .main-container { padding: 25px 15px 80px 15px; display: flex; flex-direction: column; align-items: center; box-sizing: border-box; }
      `}</style>

      {showConfetti && <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',zIndex:999,textAlign:'center',fontSize:'5rem', pointerEvents:'none'}}>🎉🌟⚽</div>}

      <div className="glass-card">
        <h1 className="title">WK 2026</h1>

        <button className="info-toggle-btn" onClick={() => setInfoOpen(!infoOpen)}>
          <span>ℹ️ Info & Betalen</span>
          <span>{infoOpen ? '▲' : '▼'}</span>
        </button>

        {infoOpen && (
          <div className="info-content">
            <h4>📲 App Installeren op je GSM</h4>
            <p style={{marginBottom:15}}>
              <strong>iPhone (Safari):</strong> Klik op 'Deel' en kies <em>'Zet op beginscherm'</em>.<br/>
              <strong>Android (Chrome):</strong> Klik op drie puntjes en kies <em>'Toevoegen aan startscherm'</em>.
            </p>
            <h4>💰 Inleggeld Betalen</h4>
            <p>Deelname kost <strong>€10</strong>. Betalen via Payconiq of overschrijven naar Jorden Ricour.</p>
          </div>
        )}

        {isAdmin && (
          <button onClick={syncMetSpreadsheet} className="admin-btn">🔄 {syncStatus || 'SYNC MET GOOGLE SHEETS'}</button>
        )}

        {!isGesloten && actieveSpeler && <CountdownTimer tijdOver={tijdOver} />}

        {actieveSpeler ? (
          <div>
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

            {actieveTab === 'matchen' && (
              <div>
                {gefilterdeMatchen.length === 0 ? (
                  <p style={{textAlign:'center', fontWeight:800, color:'#6C757D', margin:'40px 0'}}>Geen matchen gevonden.</p>
                ) : (
                  gefilterdeMatchen.map(m => {
                    const gestart = nu > new Date(m.datum).getTime();
                    const v = matchVoorspellingen[m.id] || { thuis: '', uit: '', joker: false };
                    const save = matchSaveStatus[m.id] || 'idle';
                    const pVoorMatch = alleMatchVoorspellingen.filter(av => av.match_id === m.id);
                    const heeftUitslag = m.thuis_score !== null;

                    return (
                      <div 
                        key={m.id} 
                        style={{
                          background: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', marginBottom: '15px', 
                          border: gestart ? '3px solid #EF709D' : '3px solid #E9ECEF', overflow: 'hidden',
                          boxShadow: '0 10px 20px rgba(0,0,0,0.05)', cursor: gestart ? 'pointer' : 'default'
                        }}
                        onClick={() => gestart && setExpandedMatchId(expandedMatchId === m.id ? null : m.id)}
                      >
                        <div style={{ background: heeftUitslag ? '#F038FF' : '#E2EF70', color: heeftUitslag ? 'white' : '#111827', padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem' }}>{heeftUitslag ? '🏆 EINDSTAND' : (gestart ? '🔒 GESLOTEN' : getMatchCountdown(m.datum))}</span>
                          <button onClick={(e) => { e.stopPropagation(); if(!gestart) toggleJoker(m.id); }} disabled={gestart}
                            style={{
                              background: v.joker ? '#FFD700' : '#FFFFFF', color: v.joker ? '#000' : '#111827', border: v.joker ? '2px solid #E6C200' : '2px solid #DEE2E6',
                              borderRadius: '20px', padding: '6px 12px', fontSize: '0.7rem', fontWeight: 900, cursor: gestart ? 'not-allowed' : 'pointer',
                              boxShadow: v.joker ? '0 4px 10px rgba(255, 215, 0, 0.4)' : '0 2px 5px rgba(0,0,0,0.05)', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                            {v.joker ? '🌟 JOKER ACTIEF' : '⭐ GEBRUIK JOKER'}
                          </button>
                        </div>

                        {heeftUitslag && (
                          <div style={{ textAlign: 'center', padding: '10px 0', background: 'rgba(240, 56, 255, 0.1)', borderBottom: '1px solid #F038FF' }}>
                            <span style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#F038FF' }}>{m.thuis_score} - {m.uit_score}</span>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 10px' }}>
                          {(() => {
                            const thuis = parseTeam(m.thuisploeg);
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: thuis.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>{thuis.emoji}</div>
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 900, textAlign: 'center', marginTop: '8px', color: '#111827' }}>{thuis.name}</span>
                              </div>
                            );
                          })()}

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 10px' }}>
                            <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#ADB5BD', marginBottom: '5px', letterSpacing: '1px' }}>JOUW PRONO</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input type="tel" value={v.thuis} disabled={gestart} onClick={e => e.stopPropagation()} onChange={e => handleScore(m.id, 'thuis', e.target.value)} 
                                style={{ width: '45px', height: '50px', fontSize: '1.5rem', textAlign: 'center', borderRadius: '12px', border: '2px solid #DEE2E6', outline: 'none', fontWeight: 900, fontFamily: 'Bebas Neue', background: gestart ? '#f1f3f5' : '#fff', color: gestart ? '#adb5bd' : '#111827' }} />
                              <span style={{ fontWeight: 900, color: '#ADB5BD' }}>-</span>
                              <input type="tel" value={v.uit} disabled={gestart} onClick={e => e.stopPropagation()} onChange={e => handleScore(m.id, 'uit', e.target.value)} 
                                style={{ width: '45px', height: '50px', fontSize: '1.5rem', textAlign: 'center', borderRadius: '12px', border: '2px solid #DEE2E6', outline: 'none', fontWeight: 900, fontFamily: 'Bebas Neue', background: gestart ? '#f1f3f5' : '#fff', color: gestart ? '#adb5bd' : '#111827' }} />
                            </div>
                            {!gestart && save !== 'idle' && (
                              <span style={{ fontSize: '0.6rem', fontWeight: 900, marginTop: '5px', color: save === 'saving' ? '#F038FF' : '#2ECC40' }}>{save === 'saving' ? '⏳ Opslaan...' : '✅ Opgeslagen'}</span>
                            )}
                          </div>

                          {(() => {
                            const uit = parseTeam(m.uitploeg);
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: uit.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>{uit.emoji}</div>
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 900, textAlign: 'center', marginTop: '8px', color: '#111827' }}>{uit.name}</span>
                              </div>
                            );
                          })()}
                        </div>

                        {!gestart && (
                          <div style={{ background: '#F8F9FA', padding: '10px', borderTop: '1px dashed #DEE2E6', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ADB5BD' }}>{pVoorMatch.length} / {alleSpelers.length} spelers vulden dit al in:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                              {pVoorMatch.map((av: any) => (
                                <span key={av.speler_id} style={{ fontSize: '0.6rem', padding: '3px 8px', background: '#70E4EF', borderRadius: '8px', fontWeight: 900, color: '#3772FF' }}>
                                  {av.spelers?.naam.split(' ')[0]}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {gestart && expandedMatchId !== m.id && (
                          <div style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: '#EF709D', paddingBottom: '10px', textTransform: 'uppercase' }}>Klik om voorspellingen te zien 👁️</div>
                        )}

                        {gestart && expandedMatchId === m.id && (
                          <div style={{ background: 'rgba(240, 244, 248, 0.9)', padding: '15px', borderTop: '2px solid #E9ECEF' }}>
                            <div style={{ fontWeight: 900, color: '#3772FF', fontSize: '0.75rem', marginBottom: '10px', borderBottom: '2px solid #DEE2E6', paddingBottom: '5px' }}>IEDEREENS VOORSPELLING</div>
                            {pVoorMatch.map((av: any) => (
                              <div key={av.id} style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.85rem', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                <span>{av.spelers?.naam} {av.gouden_bal ? '🌟' : ''}</span>
                                <span style={{ color: '#F038FF', fontFamily: 'Bebas Neue', fontSize: '1.2rem' }}>{av.thuis_score} - {av.uit_score}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {actieveTab === 'bonus' && (
              <BonusTab 
                winnaar={winnaar} setWinnaar={setWinnaar} hf={hf} setHf={setHf} 
                meesteGoalsLand={meesteGoalsLand} setMeesteGoalsLand={setMeesteGoalsLand} 
                besteVerdedigingLand={besteVerdedigingLand} setBesteVerdedigingLand={setBesteVerdedigingLand} 
                eindstation={eindstation} setEindstation={setEindstation} 
                totaalGeel={totaalGeel} setTotaalGeel={setTotaalGeel} totaalRood={totaalRood} setTotaalRood={setTotaalRood} 
                isGesloten={isGesloten} slaBonusOp={slaBonusOp} opslaanStatus={opslaanStatus} WK_LANDEN={WK_LANDEN} 
              />
            )}

            {actieveTab === 'antwoorden' && <AntwoordenTab nu={nu} DEADLINE_DATE={DEADLINE_DATE} alleToernooiV={alleToernooiV} />}
            {actieveTab === 'ranking' && <RankingTab klassement={klassement} actieveSpeler={actieveSpeler} toggleBetaald={toggleBetaald} />}
            {actieveTab === 'tellers' && <TellersTab tellersData={tellersData} />}
            {actieveTab === 'kleedkamer' && (
              <ChatTab chatBerichten={chatBerichten} actieveSpeler={actieveSpeler} chatEindeRef={chatEindeRef} 
                       nieuwBericht={nieuwBericht} setNieuwBericht={setNieuwBericht} verstuurChat={verstuurChat} />
            )}
            
            <div style={{textAlign:'center', marginTop:20}}>
              <button style={{background:'none', border:'none', color:'#111827', fontWeight:900, cursor:'pointer', opacity: 0.6}} onClick={() => {localStorage.removeItem('wk_speler_id'); window.location.reload();}}>UITLOGGEN</button>
            </div>
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