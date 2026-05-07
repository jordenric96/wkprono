import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Verbind met je database
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  // Beveiliging: zorg dat alleen jij dit kan aanroepen!
  const { searchParams } = new URL(request.url);
  const wachtwoord = searchParams.get('code');

  if (wachtwoord !== process.env.SYNC_WACHTWOORD) {
    return NextResponse.json({ error: 'Fout wachtwoord!' }, { status: 401 });
  }

  try {
    // 1. Haal data van de directe API (Test: Champions League 2023, League ID 2)
    const res = await fetch('https://v3.football.api-sports.io/fixtures?league=2&season=2023', {
      headers: {
        'x-apisports-key': process.env.API_FOOTBALL_KEY!
      }
    });

    const data = await res.json();

    if (!data.response || data.response.length === 0) {
      return NextResponse.json({ message: 'Geen matchen gevonden bij de API.' });
    }

    // 2. Vertaal de ingewikkelde API data naar onze simpele database structuur
    const matchenOmOpTeSlaan = data.response.map((match: any) => {
      let statusNL = 'gepland';
      if (['1H', 'HT', '2H', 'ET', 'P', 'LIVE'].includes(match.fixture.status.short)) statusNL = 'bezig';
      if (['FT', 'AET', 'PEN'].includes(match.fixture.status.short)) statusNL = 'afgelopen';

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

    // 3. Pomp alles in Supabase (upsert = toevoegen of updaten als het ID al bestaat)
    const { error } = await supabase.from('matchen').upsert(matchenOmOpTeSlaan);

    if (error) throw error;

    return NextResponse.json({ 
      succes: true, 
      bericht: `${matchenOmOpTeSlaan.length} matchen succesvol gesynchroniseerd met de database!` 
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Er is iets misgegaan met de synchronisatie', details: error.message }, { status: 500 });
  }
}