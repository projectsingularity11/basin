import { terrain, type Scenario } from '@/engine/model';
/** Fit steep real relief without changing any numerical elevations. */
export function terrainHeightScale(s: Scenario) {
  if (!s.geographic) return 9;
  const z = terrain(s),
    range = Math.max(...z) - Math.min(...z);
  return Math.min(3, (s.size * 0.25 * s.cellSize) / Math.max(1, range));
}
