import { validateRainSeries, type RainSeries } from './rainfall';
import type { GeographicTerrain } from '../lib/geo/contracts';
/** BASIN conceptual surface-routing model. SI internally; illustrative, uncalibrated. */
export type TerrainKind = 'valley' | 'urban' | 'flat';
export type Intervention = {
  id: string;
  kind: 'detention' | 'permeable';
  cell: number;
  capacity: number;
  outlet: number;
  infiltration: number;
  cost: number;
};
export type Scenario = {
  version: 1;
  geographic?: GeographicTerrain;
  rainSeries?: RainSeries;
  name: string;
  terrain: TerrainKind;
  seed: number;
  size: number;
  cellSize: number;
  rain: number;
  duration: number;
  infiltration: number;
  boundary: 'open' | 'closed';
  profile: 'constant' | 'pulse' | 'custom';
  customRain: number[];
  interventions: Intervention[];
  edits: { cell: number; delta: number }[];
};
export type Frame = {
  time: number;
  surface: number;
  detention: number;
  rainfall: number;
  infiltrated: number;
  outflow: number;
  rate: number;
  maxDepth: number;
  residual: number;
  depths: number[];
  detentionVolumes: number[];
};
export type Run = {
  modelVersion: string;
  diagnostics: {
    status: 'completed';
    solverStepSeconds: number;
    snapshotSeconds: number;
    cellSizeMeters: number;
    rainfallSource: string;
    terrainSource: string;
    limitations: string[];
  };
  scenario: Scenario;
  elevations: number[];
  frames: Frame[];
  peakOutflow: number;
  peakSurface: number;
  maxDepth: number;
  cost: number;
};
export const DEFAULT: Scenario = {
  version: 1,
  name: 'Valley Catchment',
  terrain: 'valley',
  seed: 42,
  size: 24,
  cellSize: 10,
  rain: 60,
  duration: 3600,
  infiltration: 5,
  boundary: 'open',
  profile: 'constant',
  customRain: [10, 30, 70, 90, 40, 10],
  interventions: [],
  edits: [],
};
export const sum = (a: ArrayLike<number>) => Array.from(a).reduce((s, v) => s + v, 0);
export function terrain(s: Scenario): number[] {
  if (s.geographic)
    return s.geographic.elevations.map(
      (v, i) => v + s.edits.filter((e) => e.cell === i).reduce((sum, e) => sum + e.delta, 0),
    );
  let seed = s.seed >>> 0;
  const random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  return Array.from({ length: s.size * s.size }, (_, i) => {
    const x = ((i % s.size) / (s.size - 1)) * 2 - 1,
      y = Math.floor(i / s.size) / (s.size - 1);
    const z =
      s.terrain === 'flat'
        ? 0
        : s.terrain === 'valley'
          ? 3.8 * x * x + 2.3 * (1 - y) + 0.3 * Math.sin(y * 9 + x * 2)
          : 2.2 * (1 - y) + 1.2 * Math.sin(x * 4) ** 2 + 0.4 * Math.cos(y * 7);
    return (
      z +
      (s.terrain === 'flat' ? 0 : random() * 0.08) +
      s.edits.filter((e) => e.cell === i).reduce((v, e) => v + e.delta, 0)
    );
  });
}
export function rainAt(s: Scenario, time: number) {
  if (s.rainSeries)
    return s.rainSeries.rates[Math.floor(time / (s.rainSeries.stepMinutes * 60))] ?? 0;
  if (s.profile === 'constant') return s.rain;
  const phase = Math.min(5, Math.floor((time / s.duration) * 6));
  return s.profile === 'custom' ? s.customRain[phase] : s.rain * [0.1, 0.5, 1, 1, 0.3, 0.1][phase];
}
export function patchCells(s: Scenario, cell: number, radius = 2) {
  const x = cell % s.size,
    y = Math.floor(cell / s.size),
    cells: number[] = [];
  for (let dy = -radius; dy <= radius; dy++)
    for (let dx = -radius; dx <= radius; dx++)
      if (x + dx >= 0 && x + dx < s.size && y + dy >= 0 && y + dy < s.size)
        cells.push((y + dy) * s.size + x + dx);
  return cells;
}
export function simulate(input: Scenario): Run {
  const s = validateScenario(input),
    z = terrain(s),
    n = z.length,
    area = s.cellSize ** 2;
  const v = new Float64Array(n),
    detained = new Float64Array(s.interventions.length),
    inf = new Float64Array(n).fill(s.infiltration);
  const patches = s.interventions.map((it) => patchCells(s, it.cell));
  s.interventions.forEach((it, k) => {
    if (it.kind === 'permeable')
      patches[k].forEach((i) => {
        inf[i] = Math.max(inf[i], it.infiltration);
      });
  });
  let rainfall = 0,
    infiltrated = 0,
    outflow = 0,
    peakOutflow = 0,
    peakSurface = 0,
    maxDepth = 0;
  const frames: Frame[] = [];
  function snapshot(time: number, rate: number) {
    const surface = sum(v),
      detention = sum(detained),
      depth = Array.from(v, (x) => x / area);
    const frame = {
      time,
      surface,
      detention,
      rainfall,
      infiltrated,
      outflow,
      rate,
      maxDepth: Math.max(...depth),
      residual: rainfall - surface - detention - infiltrated - outflow,
      depths: depth,
      detentionVolumes: Array.from(detained),
    };
    if (
      !Number.isFinite(frame.residual) ||
      Math.abs(frame.residual) > Math.max(1e-7, rainfall * 1e-9)
    )
      throw new Error('Mass balance failed. Check model parameters.');
    frames.push(frame);
  }
  snapshot(0, 0);
  // Fixed <=10-second substeps; outgoing fluxes use frozen pre-transfer heads.
  for (let t = 0; t < s.duration;) {
    const dt = Math.min(10, s.duration - t),
      rain = ((rainAt(s, t) * dt) / 3600000) * area;
    rainfall += rain * n;
    for (let i = 0; i < n; i++) {
      v[i] += rain;
      const f = Math.min(v[i], ((inf[i] * dt) / 3600000) * area);
      v[i] -= f;
      infiltrated += f;
    }
    s.interventions.forEach((it, k) => {
      if (it.kind !== 'detention') return;
      const release = Math.min(detained[k], it.outlet * dt);
      detained[k] -= release;
      v[it.cell] += release;
      const available = patches[k].reduce((a, i) => a + v[i], 0),
        capture = Math.min(Math.max(0, it.capacity - detained[k]), available);
      if (available > 0)
        patches[k].forEach((i) => {
          v[i] -= (capture * v[i]) / available;
        });
      detained[k] += capture;
    });
    const transfers: { from: number; to: number; volume: number }[] = [],
      outgoing = new Float64Array(n);
    function edge(a: number, b: number) {
      const dh = z[a] + v[a] / area - z[b] - v[b] / area;
      if (dh === 0) return;
      const from = dh > 0 ? a : b,
        to = dh > 0 ? b : a;
      const volume = 0.08 * s.cellSize * Math.abs(dh) * dt;
      transfers.push({ from, to, volume });
      outgoing[from] += volume;
    }
    for (let i = 0; i < n; i++) {
      if (i % s.size < s.size - 1) edge(i, i + 1);
      if (i < n - s.size) edge(i, i + s.size);
      if (
        s.boundary === 'open' &&
        (i % s.size === 0 || i % s.size === s.size - 1 || i < s.size || i >= n - s.size)
      ) {
        // Free drainage into an external zero-depth cell at the same bed elevation.
        const volume = 0.08 * s.cellSize * (v[i] / area) * dt;
        transfers.push({ from: i, to: -1, volume });
        outgoing[i] += volume;
      }
    }
    const delta = new Float64Array(n);
    let stepOut = 0;
    for (const tr of transfers) {
      const q =
        tr.volume *
        Math.min(1, outgoing[tr.from] > 0 ? (v[tr.from] * 0.45) / outgoing[tr.from] : 0);
      delta[tr.from] -= q;
      if (tr.to < 0) stepOut += q;
      else delta[tr.to] += q;
    }
    for (let i = 0; i < n; i++) {
      v[i] += delta[i];
      if (v[i] < -1e-10 || !Number.isFinite(v[i])) throw new Error('Invalid cell volume');
      if (v[i] < 0) v[i] = 0;
      maxDepth = Math.max(maxDepth, v[i] / area);
    }
    outflow += stepOut;
    peakOutflow = Math.max(peakOutflow, stepOut / dt);
    peakSurface = Math.max(peakSurface, sum(v));
    t += dt;
    if (t % 60 === 0 || t === s.duration) snapshot(t, stepOut / dt);
  }
  return {
    modelVersion: 'BASIN surface routing v1',
    diagnostics: {
      status: 'completed',
      solverStepSeconds: 10,
      snapshotSeconds: 60,
      cellSizeMeters: s.cellSize,
      rainfallSource: s.rainSeries?.source ?? 'User-configured or default scenario',
      terrainSource: s.geographic?.provenance.dataset ?? 'Synthetic demonstration',
      limitations: [
        'Constant infiltration assumptions.',
        'Open boundaries represent free discharge at the grid edge.',
        'No calibration or uncertainty intervals.',
      ],
    },
    scenario: s,
    elevations: z,
    frames,
    peakOutflow,
    peakSurface,
    maxDepth,
    cost: s.interventions.reduce((a, i) => a + i.cost, 0),
  };
}
function numeric(x: unknown, min: number, max: number, label: string): number {
  if (typeof x !== 'number' || !Number.isFinite(x) || x < min || x > max)
    throw new Error(`Invalid ${label}: expected ${min}–${max}.`);
  return x;
}
function record(x: unknown): Record<string, unknown> {
  if (!x || typeof x !== 'object' || Array.isArray(x))
    throw new Error('Expected a scenario object.');
  return x as Record<string, unknown>;
}
export function validateScenario(value: unknown): Scenario {
  const s = record(value);
  if (s.version !== 1) throw new Error('Unsupported scenario version.');
  if (typeof s.name !== 'string' || s.name.length < 1 || s.name.length > 100)
    throw new Error('Scenario name must be 1–100 characters.');
  if (
    !['valley', 'urban', 'flat'].includes(String(s.terrain)) ||
    !['constant', 'pulse', 'custom'].includes(String(s.profile)) ||
    !['open', 'closed'].includes(String(s.boundary))
  )
    throw new Error('Unknown terrain, rainfall profile, or boundary.');
  const size = numeric(s.size, 12, 32, 'grid size');
  if (!Number.isInteger(size)) throw new Error('Grid size must be an integer.');
  const duration = numeric(s.duration, 60, 7200, 'duration');
  const rainSeries = s.rainSeries === undefined ? undefined : validateRainSeries(s.rainSeries);
  if (rainSeries && duration !== rainSeries.stepMinutes * rainSeries.rates.length * 60)
    throw Error('Rainfall intervals must span the full event.');
  if (duration % 60 !== 0) throw new Error('Duration must use whole minutes.');
  const cell = (v: unknown) => {
    const n = numeric(v, 0, size * size - 1, 'cell');
    if (!Number.isInteger(n)) throw new Error('Cell must be an integer.');
    return n;
  };
  if (!Array.isArray(s.customRain) || s.customRain.length !== 6)
    throw new Error('Rainfall profile requires six values.');
  if (
    !Array.isArray(s.interventions) ||
    s.interventions.length > 12 ||
    !Array.isArray(s.edits) ||
    s.edits.length > 100
  )
    throw new Error('Too many or invalid interventions / edits.');
  const interventions = s.interventions.map((v) => {
    const i = record(v);
    if (typeof i.id !== 'string' || !['detention', 'permeable'].includes(String(i.kind)))
      throw new Error('Invalid intervention.');
    return {
      id: i.id.slice(0, 100),
      kind: i.kind as Intervention['kind'],
      cell: cell(i.cell),
      capacity: numeric(i.capacity, 0, 5000, 'capacity'),
      outlet: numeric(i.outlet, 0, 1, 'outlet'),
      infiltration: numeric(i.infiltration, 0, 200, 'patch infiltration'),
      cost: numeric(i.cost, 0, 1000000, 'cost'),
    };
  });
  if (new Set(interventions.map((i) => i.id)).size !== interventions.length)
    throw new Error('Duplicate intervention IDs.');
  let geographic: GeographicTerrain | undefined;
  if (s.geographic !== undefined) {
    const g = record(s.geographic),
      p = record(g.provenance);
    if (
      g.size !== size ||
      g.cellSize !== s.cellSize ||
      !Array.isArray(g.elevations) ||
      g.elevations.length !== size * size
    )
      throw Error('Geographic terrain must match the model grid.');
    const coords = (v: unknown, len: number) => {
      if (!Array.isArray(v) || v.length !== len) throw Error('Invalid geographic coordinates.');
      return v.map((x) => numeric(x, -1e8, 1e8, 'coordinate'));
    };
    const str = (v: unknown, max = 3000) => {
      if (typeof v !== 'string' || v.length > max) throw Error('Invalid provenance metadata.');
      return v;
    };
    geographic = {
      elevations: g.elevations.map((x) => numeric(x, -500, 9000, 'elevation')),
      size,
      cellSize: Number(s.cellSize),
      center: coords(g.center, 2) as [number, number],
      bounds: coords(g.bounds, 4) as [number, number, number, number],
      projectedBounds: coords(g.projectedBounds, 4) as [number, number, number, number],
      crs: str(g.crs),
      name: str(g.name, 100),
      provenance: {
        provider: str(p.provider),
        dataset: str(p.dataset),
        retrievedAt: str(p.retrievedAt),
        sourceUrl: str(p.sourceUrl),
        units: 'm',
        verticalDatum: str(p.verticalDatum),
        resolution: str(p.resolution),
        processing: str(p.processing),
        license: str(p.license),
        limitations: str(p.limitations),
      },
    };
  }
  return {
    version: 1,
    ...(geographic ? { geographic } : {}),
    ...(rainSeries ? { rainSeries } : {}),
    name: s.name,
    terrain: s.terrain as TerrainKind,
    seed: numeric(s.seed, 0, 4294967295, 'seed'),
    size,
    cellSize: numeric(s.cellSize, 5, 160, 'cell size'),
    rain: numeric(s.rain, 0, 200, 'rainfall'),
    duration,
    infiltration: numeric(s.infiltration, 0, 200, 'infiltration'),
    boundary: s.boundary as Scenario['boundary'],
    profile: s.profile as Scenario['profile'],
    customRain: s.customRain.map((v) => numeric(v, 0, 200, 'rainfall bin')),
    interventions,
    edits: s.edits.map((v) => {
      const e = record(v);
      return { cell: cell(e.cell), delta: numeric(e.delta, -5, 5, 'terrain delta') };
    }),
  };
}
export function makeIntervention(
  s: Scenario,
  cell: number,
  kind: Intervention['kind'],
  capacity = 200,
): Intervention {
  return {
    id: `${kind}-${cell}-${s.interventions.length}`,
    kind,
    cell,
    capacity: kind === 'detention' ? capacity : 0,
    outlet: 0,
    infiltration: 40,
    cost: kind === 'detention' ? capacity * 50 : 2500,
  };
}
export type SearchResult = {
  best: Run;
  baseline: Run;
  cheapest: Run;
  evaluated: number;
  feasible: number;
  candidates: Run[];
};
export function optimize(s: Scenario, budget: number, space: number): SearchResult {
  numeric(budget, 0, 1000000, 'budget');
  numeric(space, 0, 100000, 'footprint');
  const base = { ...s, interventions: [] },
    baseline = simulate(base),
    candidates: Run[] = [baseline];
  const options = [0.25, 0.5, 0.75].flatMap((y) =>
    [100, 300, 600].map((cap) =>
      makeIntervention(
        base,
        Math.floor(s.size * y) * s.size + Math.floor(s.size / 2),
        'detention',
        cap,
      ),
    ),
  );
  for (const it of options) {
    const footprint = patchCells(s, it.cell).length * s.cellSize ** 2;
    if (it.cost <= budget && footprint <= space)
      candidates.push(simulate({ ...base, interventions: [it] }));
  }
  const best = [...candidates].sort((a, b) => a.peakOutflow - b.peakOutflow || a.cost - b.cost)[0];
  const cheapest =
    [...candidates].filter((r) => r.cost > 0).sort((a, b) => a.cost - b.cost)[0] ?? baseline;
  return {
    best,
    baseline,
    cheapest,
    evaluated: candidates.length,
    feasible: candidates.length - 1,
    candidates,
  };
}
