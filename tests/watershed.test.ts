import { describe, it, expect } from 'vitest';
import { drainage, investigate } from '../src/engine/watershed';
import { DEFAULT, simulate } from '../src/engine/model';
import { parseRainCsv } from '../src/engine/rainfall';
import { gridBounds } from '../src/lib/geo/grid';
import { tileUrl } from '../src/lib/geo/copernicus';
import library from '../src/data/library-usgs.json';
import type { GeographicTerrain } from '../src/lib/geo/contracts';

describe('drainage and mitigation screening', () => {
  it('routes through the known outlet and conserves contributing area', () => {
    const grid = drainage([9, 9, 9, 9, 0, 9, 9, 2, 9], 3, 10);
    expect(grid.filled[4]).toBe(2);
    expect(grid.receiver[4]).toBe(7);
    expect(grid.accumulation[7]).toBe(200);
    expect(grid.catchment.sort()).toEqual([4, 7]);
    expect(
      grid.accumulation.filter((_, i) => grid.receiver[i] === -1).reduce((a, b) => a + b),
    ).toBe(900);
  });
  it('validates the imported timing and balances the analytical rainfall volume', () => {
    const series = parseRainCsv('minute,rate_mm_h\n0,60\n10,120', 'Analytical test fixture');
    expect(() => parseRainCsv('minute,rate_mm_h\n0,60\n10,20\n22,20', 'Fixture')).toThrow();
    const run = simulate({
      ...DEFAULT,
      rainSeries: series,
      duration: 1200,
      infiltration: 0,
      boundary: 'closed',
    });
    expect(run.frames.at(-1)?.rainfall).toBeCloseTo(
      0.03 * DEFAULT.size ** 2 * DEFAULT.cellSize ** 2,
    );
  });
  it('models two storms against retrieved library terrain and enforces constraints', () => {
    const geographic = library as GeographicTerrain;
    const scenario = { ...DEFAULT, geographic, cellSize: 40, size: 24 };
    const options = { maxFootprint: 40000, maxCapacity: 600, stormMultiplier: 1.25 };
    const result = investigate(scenario, options);
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.evaluatedRuns).toBe(2 + result.candidates.length * 2);
    expect(result.candidates.every((c) => c.cost === null && c.footprintArea <= 40000)).toBe(true);
    expect(result.baseline[1].rainfall / result.baseline[0].rainfall).toBeCloseTo(1.25);
    expect(result.candidates.every((c) => c.runs.every((r) => Math.abs(r.residual) < 1e-5))).toBe(
      true,
    );
    expect(investigate(scenario, { ...options, unitCost: 10, budget: 1 }).candidates).toHaveLength(
      0,
    );
    expect(
      result.pareto.every(
        (c) =>
          !result.candidates.some(
            (d) => d.capacity <= c.capacity && d.worstPeakReduction > c.worstPeakReduction,
          ),
      ),
    ).toBe(true);
  });
  it('compares both treatments and recommends only improvements in both storms', () => {
    const result = investigate(DEFAULT, {
      maxFootprint: 2500,
      maxCapacity: 400,
      stormMultiplier: 1.25,
      includePermeable: true,
      patchInfiltration: 65,
    });
    expect(new Set(result.candidates.map((c) => c.intervention.kind))).toEqual(
      new Set(['detention', 'permeable']),
    );
    expect(result.recommended?.worstPeakReduction).toBeGreaterThan(0);
    expect(result.recommended?.worstPeakReduction).toBe(
      Math.max(...result.candidates.map((c) => c.worstPeakReduction)),
    );
  });
  it('projects polar regions and names the wrapped dateline tile', () => {
    expect(gridBounds(0, 89, 960).epsg).toBe(32661);
    expect(gridBounds(0, -89, 960).epsg).toBe(32761);
    expect(gridBounds(180, 0, 960).extent.every(Number.isFinite)).toBe(true);
    expect(tileUrl(180, 0)).toContain('W180');
  });
  it('selects the southern UTM zone and correctly names southwest tile coordinates', () => {
    expect(gridBounds(151.2, -33.8, 960).epsg).toBe(32756);
    expect(tileUrl(-1.5, -33.8)).toContain('S34_00_W002_00');
  });
});
