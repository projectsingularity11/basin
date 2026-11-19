import { describe, it, expect } from 'vitest';
import { gridBounds, validateElevations } from '../src/lib/geo/grid';
import {
  DEFAULT,
  terrain,
  simulate,
  validateScenario,
  makeIntervention,
  optimize,
} from '../src/engine/model';
import fixture from './fixtures/spring-usgs.json';
import type { GeographicTerrain } from '../src/lib/geo/contracts';
const geographic = fixture as GeographicTerrain;
const s = {
  ...DEFAULT,
  name: 'Spring, Texas',
  size: geographic.size,
  cellSize: geographic.cellSize,
  geographic,
};
describe('real USGS terrain contract', () => {
  it('uses the actual source values without generating substitutes', () => {
    expect(terrain(s)).toEqual(fixture.elevations);
    expect(Math.min(...terrain(s))).toBeCloseTo(33.8745346, 5);
    expect(Math.max(...terrain(s))).toBeCloseTo(36.4375381, 5);
  });
  it('projects a metric square and preserves longitude/latitude ordering', () => {
    const g = gridBounds(-95.4187924, 30.0795707, 480);
    expect(g.epsg).toBe(32615);
    expect(g.extent[2] - g.extent[0]).toBeCloseTo(480, 7);
    expect(g.extent[3] - g.extent[1]).toBeCloseTo(480, 7);
    expect(g.bounds[0]).toBeLessThan(-95.4187924);
    expect(g.bounds[2]).toBeGreaterThan(-95.4187924);
    expect(g.bounds[1]).toBeLessThan(30.0795707);
  });
  it('conserves water on a geographic grid and reproduces every frame', () => {
    const a = simulate(s),
      b = simulate(s);
    expect(a.frames).toEqual(b.frames);
    for (const f of a.frames) {
      expect(Math.abs(f.residual)).toBeLessThan(1e-6);
      expect(f.depths.every((d) => d >= 0 && Number.isFinite(d))).toBe(true);
    }
  });
  it('preserves geographic inputs across export/import and optimizer', () => {
    const restored = validateScenario(JSON.parse(JSON.stringify(s)));
    expect(restored.geographic).toEqual(geographic);
    const result = optimize(restored, 15000, 10000);
    expect(result.best.scenario.geographic).toEqual(geographic);
    expect(result.best.cost).toBeLessThanOrEqual(15000);
  });
  it('keeps source elevations recoverable after hypothetical edits', () => {
    const modified = { ...s, edits: [{ cell: 20, delta: -0.5 }] };
    expect(terrain(modified)[20]).toBe(fixture.elevations[20] - 0.5);
    expect(modified.geographic.elevations[20]).toBe(fixture.elevations[20]);
    const r = simulate({ ...s, interventions: [makeIntervention(s, 420, 'detention', 600)] });
    expect(r.frames.at(-1)!.detention).toBeGreaterThan(0);
  });
  it('rejects no-data, malformed rasters, mismatched grids and unsupported regions', () => {
    expect(() => validateElevations([1, NaN, 3, 4], 2, null)).toThrow();
    expect(() => validateElevations([1, -9999, 3, 4], 2, -9999)).toThrow();
    expect(() =>
      validateScenario({ ...s, geographic: { ...geographic, elevations: [2] } }),
    ).toThrow();
    expect(() => gridBounds(0, 89, 480)).toThrow();
    expect(() => gridBounds(-95, 30, 100000)).toThrow();
  });
});
