import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wachtwoord = searchParams.get('code');

  if (wachtwoord !== process.env.SYNC_WACHTWOORD) {
    return NextResponse.json({ error: 'Fout wachtwoord!' }, { status: 401 });
  }

  try {
    // We gebruiken nu de meest directe zoekopdracht: League 1 & Seizoen 2026
    const url = 'https://v3.football.api-sports.io/fixtures?league=1&season=2026';
    
    const res = await fetch(url, {
      headers: {
        'x-apisports-key': process.env.API_FOOTBALL_KEY!
      },
      next: { revalidate: 0 }
    });

    const data = await res.json();

    // Debugging: Dit zie je in je Vercel logs als er niets gevonden wordt
    if (!data.response || data.response.length === 0) {
      console.log("API Response was leeg voor League 1 Season 2026. Error info:", data.errors);
      return NextResponse.json({ 
        message: 'Geen matchen gevonden bij de API.', 
        debug: data.errors,
        tips: 'Check of je API-key nog gratis credits heeft (100 per dag).'
      });
    }

    const matchenOmOpTeSlaan = data.response.map((match: any) => {
      let statusNL = 'gepland';
      const s = match.fixture.status.short;
      if (['1H', 'HT', '2H', 'ET', 'P', 'LIVE'].includes(s)) statusNL = 'bezig';
      if (['FT', 'AET', 'PEN'].includes(s)) statusNL = 'afgelopen';

      return {
        id: match.fixture.id,
        thuisploeg: match.teams.home.name,
        uitploeg: match.teams.away.name,
        datum: match.fixture.date,
        thuis_score: match.goals.home !== null ? match.goals.home : null,
        uit_score: match.goals.away !== null ? match.goals.away : null,
        status: statusNL
      };
    });

    const { error } = await supabase
      .from('matchen')
      .upsert(matchenOmOpTeSlaan, { onConflict: 'id' });

    if (error) throw error;

    return NextResponse.json({ 
      succes: true, 
      bericht: `${matchenOmOpTeSlaan.length} matchen voor WK 2026 succesvol gesynchroniseerd!` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Sync Error', details: error.message }, { status: 500 });
  }
}