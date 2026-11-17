import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 3 || q.length > 120)
    return NextResponse.json(
      { error: { code: 'INVALID_QUERY', message: 'Enter 3–120 characters.' } },
      { status: 400 },
    );
  try {
    const res = await fetch(
      'https://photon.komoot.io/api/?' + new URLSearchParams({ q, limit: '5', lang: 'en' }),
      {
        signal: AbortSignal.timeout(10000),
        next: { revalidate: 3600 },
        headers: {
          'User-Agent': 'BASIN research prototype (github.com/projectsingularity11/basin)',
        },
      },
    );
    if (!res.ok) throw Error('Place search is unavailable. Select directly on the map.');
    const json = await res.json();
    if (!Array.isArray(json.features)) throw Error('Invalid search response.');
    const places = json.features.flatMap(
      (f: { geometry?: { coordinates?: number[] }; properties?: Record<string, string> }) => {
        const c = f.geometry?.coordinates,
          p = f.properties;
        if (!c || c.length !== 2 || !c.every(Number.isFinite) || !p || typeof p.name !== 'string')
          return [];
        return [
          {
            name: [p.name, p.city, p.state, p.country]
              .filter((s, i, a) => s && a.indexOf(s) === i)
              .join(', ')
              .slice(0, 160),
            longitude: c[0],
            latitude: c[1],
          },
        ];
      },
    );
    return NextResponse.json(
      { data: places },
      { headers: { 'Cache-Control': 'public, s-maxage=3600' } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: { code: 'SEARCH_UNAVAILABLE', message: (e as Error).message } },
      { status: 502 },
    );
  }
}
