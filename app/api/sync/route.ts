import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialiseer de Supabase-client met de omgevingsvariabelen
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  // 1. Veiligheidscontrole: komt het wachtwoord in de URL overeen met de SYNC_WACHTWOORD variabele?
  const { searchParams } = new URL(request.url);
  const wachtwoord = searchParams.get('code');

  if (wachtwoord !== process.env.SYNC_WACHTWOORD) {
    return NextResponse.json({ error: 'Fout wachtwoord!' }, { status: 401 });
  }

  try {
    // 2. Haal de data op van de Voetbal API
    // We gebruiken 'league=1' (WK) en 'next=50' om de eerstvolgende 50 wedstrijden op te vragen
    const res = await fetch('https://v3.football.api-sports.io/fixtures?league=1&next=50', {
      headers: {
        'x-apisports-key': process.env.API_FOOTBALL_KEY!
      },
      next: { revalidate: 0 } // Voorkom dat de browser de data cached
    });

    const data = await res.json();

    // Controleer of er daadwerkelijk wedstrijden in de response zitten
    if (!data.response || data.response.length === 0) {
      return NextResponse.json({ message: 'Geen matchen gevonden bij de API.' });
    }

    // 3. Transformeer de API-data naar onze database-structuur
    const matchenOmOpTeSlaan = data.response.map((match: any) => {
      // Vertaal API-statussen naar eenvoudige Nederlandse termen
      let statusNL = 'gepland';
      const s = match.fixture.status.short;
      if (['1H', 'HT', '2H', 'ET', 'P', 'LIVE'].includes(s)) statusNL = 'bezig';
      if (['FT', 'AET', 'PEN'].includes(s)) statusNL = 'afgelopen';

      return {
        id: match.fixture.id, // We behouden het originele API ID
        thuisploeg: match.teams.home.name,
        uitploeg: match.teams.away.name,
        datum: match.fixture.date,
        thuis_score: match.goals.home !== null ? match.goals.home : null,
        uit_score: match.goals.away !== null ? match.goals.away : null,
        status: statusNL
      };
    });

    // 4. Opslaan in Supabase
    // 'upsert' zorgt ervoor dat bestaande matchen worden bijgewerkt (bv. met de score)
    // en nieuwe matchen worden toegevoegd.
    const { error } = await supabase
      .from('matchen')
      .upsert(matchenOmOpTeSlaan, { onConflict: 'id' });

    if (error) throw error;

    return NextResponse.json({ 
      succes: true, 
      bericht: `${matchenOmOpTeSlaan.length} matchen succesvol gesynchroniseerd met de database!` 
    });

  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({ 
      error: 'Er is iets misgegaan met de synchronisatie', 
      details: error.message 
    }, { status: 500 });
  }
}