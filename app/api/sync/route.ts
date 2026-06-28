import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wachtwoord = searchParams.get('code');

  if (wachtwoord !== process.env.SYNC_WACHTWOORD) {
    return NextResponse.json({ error: 'Fout wachtwoord!' }, { status: 401 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const sheetUrl = process.env.GOOGLE_SHEETS_CSV_URL || '';
    const res = await fetch(sheetUrl, { cache: 'no-store' });
    const csvData = await res.text();

    const rijen = csvData.split('\n').map(rij => rij.split(','));
    const rijenZonderHeader = rijen.slice(1);

    const matchenOmOpTeSlaan = rijenZonderHeader.map(rij => {
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
        winnaar_na_penaltys: rij.length > 9 && rij[9].trim() !== '' ? rij[9].trim() : null,
        extra_goals_thuis: rij.length > 10 && rij[10].trim() !== '' ? parseInt(rij[10].trim()) : 0,
        extra_goals_uit: rij.length > 11 && rij[11].trim() !== '' ? parseInt(rij[11].trim()) : 0
      };
    }).filter(match => match !== null);

    const { error } = await supabase
      .from('matchen')
      .upsert(matchenOmOpTeSlaan, { onConflict: 'id' });

    if (error) throw error;

    return NextResponse.json({ 
      succes: true, 
      bericht: `${matchenOmOpTeSlaan.length} matchen succesvol gesynchroniseerd vanuit Google Sheets!` 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
    console.error('Sync Error:', errorMessage);
    return NextResponse.json({ error: 'Er is iets misgegaan', details: errorMessage }, { status: 500 });
  }
}
