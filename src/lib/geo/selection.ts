import proj4 from 'proj4';
import { gridBounds } from './grid';

export function selectGeoJson(raw: unknown) {
  if (!raw || typeof raw !== 'object')
    throw Error('Choose a WGS84 GeoJSON polygon or multipolygon.');
  const root = raw as { type?: string; geometry?: unknown };
  const geometry = (root.type === 'Feature' ? root.geometry : root) as
    { type?: string; coordinates?: unknown } | undefined;
  if (
    !geometry ||
    !['Polygon', 'MultiPolygon'].includes(geometry.type ?? '') ||
    !Array.isArray(geometry.coordinates)
  )
    throw Error('Choose a single WGS84 Polygon or MultiPolygon feature.');
  const points = geometry.coordinates.flat(geometry.type === 'Polygon' ? 1 : 2);
  if (
    points.length < 4 ||
    points.length > 10000 ||
    points.some(
      (p) =>
        !Array.isArray(p) ||
        typeof p[0] !== 'number' ||
        typeof p[1] !== 'number' ||
        !Number.isFinite(p[0]) ||
        !Number.isFinite(p[1]) ||
        Math.abs(p[0]) > 180 ||
        p[1] < -80 ||
        p[1] > 84,
    )
  )
    throw Error('The polygon has invalid coordinates or exceeds 10,000 vertices.');
  const bounds = points.reduce(
    ([w, s, e, n], [x, y]) => [Math.min(w, x), Math.min(s, y), Math.max(e, x), Math.max(n, y)],
    [180, 90, -180, -90],
  );
  if (bounds[2] - bounds[0] > 1 || bounds[3] - bounds[1] > 1)
    throw Error('Choose a smaller area inside one supported region.');
  const center: [number, number] = [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2];
  const { projection } = gridBounds(...center, 240);
  const [cx, cy] = proj4('EPSG:4326', projection, center);
  const radius = points.reduce((max, [lon, lat]) => {
    const [x, y] = proj4('EPSG:4326', projection, [lon, lat]);
    return Math.max(max, Math.abs(cx - x), Math.abs(cy - y));
  }, 0);
  const side = [960, 1920, 3840].find((width) => width >= 2 * radius);
  if (!side) throw Error('The polygon exceeds the maximum study width of 3.84 km.');
  return { center, side };
}
