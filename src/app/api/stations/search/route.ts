import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/cache';

function scoreStation(s: any, query: string): number {
  let score = 0;
  const q = query.trim().toUpperCase();
  const code = (s.code || '').toUpperCase();
  const name = (s.name || '').toUpperCase();
  const city = (s.city || '').toUpperCase();

  // Exact code match
  if (code === q) score += 1000;
  else if (code.startsWith(q)) score += 500;

  // Exact city or station name match
  if (city === q || name === q) score += 400;
  else if (city.startsWith(q) || name.startsWith(q)) score += 250;

  // Major railway junctions and termini
  if (name.includes('CENTRAL') || code === 'CNB' || code === 'NDLS' || code === 'MMCT' || code === 'MAS' || code === 'SBC') {
    score += 300;
  }
  if (name.includes(' JN') || name.includes(' JUNCTION')) score += 200;
  if (name.includes('TERMINUS') || name.includes('TERMINAL') || code === 'CSMT' || code === 'HWH') score += 150;
  if (name.includes('CANTT') || name.includes('CANTONMENT')) score += 100;

  // Popularity points if returned by API
  if (typeof s.popularity === 'number') {
    score += s.popularity * 5;
  }

  // Active status
  if (s.isActive !== false) score += 50;

  return score;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const cacheKey = `stn:search:v2:${query.toLowerCase()}`;
    const cached = getCached<any[]>(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached });
    }

    const apiKey = process.env.RAILRADAR_API_KEY || '';
    const res = await fetch(
      `https://api.railradar.in/v1/lookup/search/stations?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'x-api-key': apiKey,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ success: true, data: [] });
    }

    const json = await res.json();
    const rawStations = Array.isArray(json.data) ? json.data : [];

    // Sort by smart hub score
    const sorted = [...rawStations]
      .filter((s: any) => s.isActive !== false)
      .sort((a, b) => scoreStation(b, query) - scoreStation(a, query));

    const stations = sorted.slice(0, 10).map((s: any) => ({
      code: s.code,
      name: s.name,
      city: s.city || s.name,
    }));

    setCache(cacheKey, stations, 3600); // 1 hour cache
    return NextResponse.json({ success: true, data: stations });
  } catch (error) {
    console.error('Station search API error:', error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

