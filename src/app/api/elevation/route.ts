import { NextRequest, NextResponse } from 'next/server';
import { usgs } from '@/lib/geo/usgs';
export const maxDuration = 30;
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  try {
    const lon = Number(p.get('lon')),
      lat = Number(p.get('lat')),
      side = Number(p.get('side')),
      size = Number(p.get('size'));
    if (!p.has('lon') || !p.has('lat')) throw Error('Choose a location first.');
    const data = await usgs.load(
      [lon, lat],
      side,
      size,
      (p.get('name') || 'Selected region').slice(0, 100),
      AbortSignal.any([req.signal, AbortSignal.timeout(25000)]),
    );
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'public, s-maxage=86400' } });
  } catch (e) {
    return NextResponse.json(
      { error: { code: 'ELEVATION_UNAVAILABLE', message: (e as Error).message } },
      { status: 422 },
    );
  }
}
