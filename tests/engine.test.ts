import { describe, it, expect } from 'vitest';
import {
  DEFAULT,
  simulate,
  terrain,
  makeIntervention,
  optimize,
  validateScenario,
} from '../src/engine/model';
const end = (r: ReturnType<typeof simulate>) => r.frames.at(-1)!;
describe('conservative conceptual model', () => {
  it('converts rainfall units exactly on a closed impermeable plane', () => {
    const r = simulate({ ...DEFAULT, terrain: 'flat', infiltration: 0, boundary: 'closed' });
    expect(end(r).rainfall).toBeCloseTo(0.06 * 57600, 7);
    expect(end(r).surface).toBeCloseTo(end(r).rainfall, 7);
    expect(end(r).maxDepth).toBeCloseTo(0.06, 9);
  });
  it('has zero water for zero rain', () => {
    const r = simulate({ ...DEFAULT, rain: 0 });
    expect(end(r).surface).toBe(0);
    expect(end(r).outflow).toBe(0);
  });
  it('conserves mass in every frame with routing, capture, release and infiltration', () => {
    const it = makeIntervention(DEFAULT, 300, 'detention');
    it.outlet = 0.01;
    const r = simulate({ ...DEFAULT, interventions: [it] });
    for (const f of r.frames) {
      expect(Math.abs(f.residual)).toBeLessThan(1e-7);
      expect(f.depths.every((x) => x >= 0 && Number.isFinite(x))).toBe(true);
      expect(f.detention).toBeLessThanOrEqual(200 + 1e-8);
    }
  });
  it('caps infiltration by available water', () => {
    const f = end(simulate({ ...DEFAULT, infiltration: 200 }));
    expect(f.surface).toBe(0);
    expect(f.infiltrated).toBeCloseTo(f.rainfall, 6);
  });
  it('is deterministic and seeded', () => {
    expect(terrain(DEFAULT)).toEqual(terrain(DEFAULT));
    expect(terrain(DEFAULT)).not.toEqual(terrain({ ...DEFAULT, seed: 43 }));
    expect(simulate(DEFAULT)).toEqual(simulate(DEFAULT));
  });
  it('counts open-boundary outflow and retains closed-boundary water', () => {
    expect(end(simulate(DEFAULT)).outflow).toBeGreaterThan(0);
    expect(end(simulate({ ...DEFAULT, boundary: 'closed' })).outflow).toBe(0);
  });
  it('captures water and changes independently computed results', () => {
    const a = simulate(DEFAULT),
      b = simulate({
        ...DEFAULT,
        interventions: [makeIntervention(DEFAULT, 420, 'detention', 600)],
      });
    expect(end(b).detention).toBeGreaterThan(0);
    expect(end(b).outflow).toBeLessThan(end(a).outflow);
    expect(b.peakOutflow).toBeLessThan(a.peakOutflow);
  });
  it('permeability increases infiltration', () => {
    const a = end(simulate(DEFAULT)),
      b = end(
        simulate({ ...DEFAULT, interventions: [makeIntervention(DEFAULT, 300, 'permeable')] }),
      );
    expect(b.infiltrated).toBeGreaterThan(a.infiltrated);
  });
  it('remains finite at supported rainfall extremes', () => {
    for (const boundary of ['open', 'closed'] as const) {
      const r = simulate({ ...DEFAULT, rain: 200, infiltration: 0, boundary, duration: 7200 });
      expect(Math.abs(end(r).residual)).toBeLessThan(1e-6);
      expect(r.maxDepth).toBeGreaterThan(0);
    }
  });
  it('enforces optimization budget and footprint including zero feasible candidates', () => {
    const r = optimize(DEFAULT, 15000, 2500);
    expect(r.best.cost).toBeLessThanOrEqual(15000);
    expect(r.evaluated).toBe(7);
    expect(r.best.peakOutflow).toBeLessThanOrEqual(r.baseline.peakOutflow);
    expect(optimize(DEFAULT, 0, 0).evaluated).toBe(1);
  });
  it('rejects malformed / nonfinite / excessive imported data', () => {
    for (const value of [
      null,
      {},
      { ...DEFAULT, rain: NaN },
      { ...DEFAULT, size: 24.5 },
      { ...DEFAULT, customRain: [1] },
      { ...DEFAULT, interventions: [{ ...makeIntervention(DEFAULT, 0, 'detention'), cell: 9999 }] },
    ])
      expect(() => validateScenario(value)).toThrow();
  });
});
