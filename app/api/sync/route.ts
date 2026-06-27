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
    // 1. Haal de data op uit JOUW Google Sheet (via de Vercel variabele)
    const res = await fetch(process.env.GOOGLE_SHEETS_CSV_URL!, { cache: 'no-store' });
    const csvData = await res.text();

    // 2. Hak de tekst in rijen en sla de titel-rij over
    const rijen = csvData.split('\n').map(rij => rij.split(','));
    const rijenZonderHeader = rijen.slice(1);

    // 3. Koppel de kolommen aan de database velden
    const matchenOmOpTeSlaan = rijenZonderHeader.map(rij => {
      // Check of de rij wel data bevat (minstens 9 kolommen)
      if (rij.length < 9 || !rij[0]) return null;

      return {
        id: parseInt(rij[0].trim()),
        thuisploeg: rij[1]?.trim() || '',
        uitploeg: rij[2]?.trim() || '',
        datum: rij[3]?.trim() || '',
        thuis_score: rij[4] && rij[4].trim() !== '' ? parseInt(rij[4].trim()) : null,
        uit_score: rij[5] && rij[5].trim() !== '' ? parseInt(rij[5].trim()) : null,
        gele_kaarten: rij[6] && rij[6].trim() !== '' ? parseInt(rij[6].trim()) : 0,
        rode_kaarten: rij[7] && rij[7].trim() !== '' ? parseInt(rij[7].trim()) : 0,
        ronde: rij[8]?.trim() || '',
        // DE NIEUWE PENALTY KOLOM (Kolom J of K, afhankelijk van je sheet, index 9)
        winnaar_na_penaltys: rij[9] && rij[9].trim() !== '' ? rij[9].trim() : null
      };
    }).filter(match => match !== null);

    // 4. Stuur alles naar Supabase
    const { error } = await supabase
      .from('matchen')
      .upsert(matchenOmOpTeSlaan, { onConflict: 'id' });

    if (error) throw error;

    return NextResponse.json({ 
      succes: true, 
      bericht: `${matchenOmOpTeSlaan.length} matchen succesvol gesynchroniseerd vanuit Google Sheets!` 
    });

  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: 'Er is iets misgegaan', details: error.message }, { status: 500 });
  }
}
