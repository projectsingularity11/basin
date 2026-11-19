import {
  makeIntervention,
  patchCells,
  simulate,
  terrain,
  validateScenario,
  type Scenario,
  type Run,
} from './model';

export function drainage(elevations: number[], size: number, cellSize: number) {
  const count = size * size;
  if (
    !Number.isInteger(size) ||
    size < 2 ||
    elevations.length !== count ||
    elevations.some((z) => !Number.isFinite(z)) ||
    !(cellSize > 0)
  )
    throw Error('Invalid terrain grid.');
  const filled = [...elevations],
    receiver = Array<number>(count).fill(-1),
    slope = Array<number>(count).fill(0);
  const visited = new Uint8Array(count),
    frontier: number[] = [],
    order: number[] = [];
  const edges = (i: number) =>
    i < size || i >= count - size || i % size === 0 || i % size === size - 1;
  const neighbors = (i: number) => {
    const x = i % size,
      y = Math.floor(i / size),
      entries: { index: number; distance: number }[] = [];
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++)
        if ((dx || dy) && x + dx >= 0 && x + dx < size && y + dy >= 0 && y + dy < size)
          entries.push({
            index: (y + dy) * size + x + dx,
            distance: Math.hypot(dx, dy) * cellSize,
          });
    return entries;
  };
  for (let i = 0; i < count; i++)
    if (edges(i)) {
      visited[i] = 1;
      frontier.push(i);
    }
  // Priority flood fills local depressions. Parent order resolves flat surfaces without cycles.
  while (frontier.length) {
    frontier.sort((a, b) => filled[b] - filled[a] || b - a);
    const i = frontier.pop()!;
    order.push(i);
    for (const { index: j, distance } of neighbors(i)) {
      slope[i] = Math.max(slope[i], Math.abs(elevations[i] - elevations[j]) / distance);
      if (visited[j]) continue;
      visited[j] = 1;
      filled[j] = Math.max(elevations[j], filled[i]);
      receiver[j] = i;
      frontier.push(j);
    }
  }
  const position = new Int32Array(count);
  order.forEach((i, k) => {
    position[i] = k;
  });
  for (const i of order) {
    if (edges(i)) continue;
    let best = 0;
    for (const { index: j, distance } of neighbors(i)) {
      const gradient = (filled[i] - filled[j]) / distance;
      if (position[j] < position[i] && gradient > best) {
        receiver[i] = j;
        best = gradient;
      }
    }
  }
  const area = cellSize ** 2,
    accumulation = Array<number>(count).fill(area),
    outlets = Array<number>(count).fill(-1);
  for (const i of order) outlets[i] = receiver[i] === -1 ? i : outlets[receiver[i]];
  for (const i of [...order].reverse())
    if (receiver[i] !== -1) accumulation[receiver[i]] += accumulation[i];
  const outlet = order
    .filter(edges)
    .reduce((best, i) => (accumulation[i] > accumulation[best] ? i : best));
  return {
    filled,
    receiver,
    accumulation,
    slope,
    outlets,
    outlet,
    catchment: order.filter((i) => outlets[i] === outlet),
  };
}

export type StudyOptions = {
  maxFootprint: number;
  maxCapacity: number;
  unitCost?: number;
  budget?: number;
  stormMultiplier: number;
};
export const STUDY_MODEL = 'BASIN surface routing v1 / screening v1';
export function investigate(input: Scenario, options: StudyOptions) {
  const scenario = validateScenario(input);
  const { maxFootprint, maxCapacity, unitCost, budget, stormMultiplier } = options;
  if (
    !Number.isFinite(maxFootprint) ||
    maxFootprint <= 0 ||
    !Number.isFinite(maxCapacity) ||
    maxCapacity <= 0 ||
    maxCapacity > 5000 ||
    !Number.isFinite(stormMultiplier) ||
    stormMultiplier < 1 ||
    stormMultiplier > 2 ||
    (unitCost !== undefined &&
      (!Number.isFinite(unitCost) || unitCost < 0 || unitCost * maxCapacity > 1e6)) ||
    (budget !== undefined && (unitCost === undefined || !Number.isFinite(budget) || budget < 0))
  )
    throw Error('Check the footprint, capacity, storm multiplier and optional cost inputs.');
  const grid = drainage(terrain(scenario), scenario.size, scenario.cellSize);
  const ranked = grid.catchment
    .filter((i) => grid.receiver[i] >= 0)
    .sort(
      (a, b) =>
        grid.accumulation[b] - grid.accumulation[a] || grid.slope[a] - grid.slope[b] || a - b,
    );
  const sites: number[] = [];
  const rejected = { footprint: 0, slope: 0, spacing: 0, budget: 0 };
  for (const i of ranked) {
    if (patchCells(scenario, i).length * scenario.cellSize ** 2 > maxFootprint) {
      rejected.footprint++;
      continue;
    }
    if (grid.slope[i] > 0.15) {
      rejected.slope++;
      continue;
    }
    if (
      sites.some(
        (j) =>
          Math.hypot(
            (i % scenario.size) - (j % scenario.size),
            Math.floor(i / scenario.size) - Math.floor(j / scenario.size),
          ) < 3,
      )
    ) {
      rejected.spacing++;
      continue;
    }
    sites.push(i);
    if (sites.length === 4) break;
  }
  const stronger = {
    ...scenario,
    rain: scenario.rain * stormMultiplier,
    customRain: scenario.customRain.map((v) => v * stormMultiplier),
    ...(scenario.rainSeries
      ? {
          rainSeries: {
            ...scenario.rainSeries,
            source: scenario.rainSeries.source + ' (scaled sensitivity scenario)',
            rates: scenario.rainSeries.rates.map((v) => v * stormMultiplier),
          },
        }
      : {}),
  };
  if (
    (
      scenario.rainSeries?.rates ??
      (scenario.profile === 'custom' ? scenario.customRain : [scenario.rain])
    ).some((v) => v * stormMultiplier > 200)
  )
    throw Error('The second storm exceeds 200 mm/h. Reduce the multiplier.');
  if (scenario.profile !== 'custom') stronger.customRain = scenario.customRain;
  if (scenario.profile === 'custom' || scenario.rainSeries) stronger.rain = scenario.rain;
  const baselineInputs = [scenario, stronger].map((s) => ({ ...s, interventions: [] }));
  const summarize = (run: Run) => {
    const final = run.frames.at(-1)!;
    return {
      peakDischarge: run.peakOutflow,
      outflow: final.outflow,
      peakDepth: run.maxDepth,
      rainfall: final.rainfall,
      detention: final.detention,
      residual: final.residual,
      hydrograph: run.frames.map((f) => ({ seconds: f.time, discharge: f.rate })),
    };
  };
  const baseline = baselineInputs.map((s) => summarize(simulate(s)));
  const candidates = sites.flatMap((cell) =>
    [maxCapacity / 2, maxCapacity].flatMap((capacity) => {
      const cost = unitCost === undefined ? null : capacity * unitCost;
      if (budget !== undefined && cost !== null && cost > budget) {
        rejected.budget++;
        return [];
      }
      const footprint = patchCells(scenario, cell),
        intervention = {
          ...makeIntervention(scenario, cell, 'detention', capacity),
          cost: cost ?? 0,
        };
      const runs = baselineInputs.map((s) =>
        summarize(simulate({ ...s, interventions: [intervention] })),
      );
      const peakReduction = runs.map((r, i) => baseline[i].peakDischarge - r.peakDischarge);
      return [
        {
          cell,
          capacity,
          cost,
          footprint,
          footprintArea: footprint.length * scenario.cellSize ** 2,
          contributingArea: grid.accumulation[cell],
          slope: grid.slope[cell],
          intervention,
          runs,
          peakReduction,
          worstPeakReduction: Math.min(...peakReduction),
        },
      ];
    }),
  );
  const pareto = candidates.filter(
    (c) =>
      !candidates.some(
        (other) =>
          other.worstPeakReduction >= c.worstPeakReduction &&
          other.capacity <= c.capacity &&
          (other.worstPeakReduction > c.worstPeakReduction || other.capacity < c.capacity),
      ),
  );
  return {
    model: STUDY_MODEL,
    scenario,
    options,
    grid,
    baseline,
    baselineInputs,
    candidates,
    pareto,
    rejected,
    evaluatedRuns: 2 + 2 * candidates.length,
    validity: 'exploratory',
    units: {
      area: 'm²',
      volume: 'm³',
      discharge: 'm³/s',
      depth: 'm',
      time: 's',
      solverStep: 10,
      outputInterval: 60,
    },
    warnings: [
      'Drainage paths terminate at the study boundary. The largest in-grid catchment is a screening result.',
      'The solver runs on the full selected square using original elevations. Depression filling only informs site screening.',
      'Peak discharge combines all open edge cells. Neither storm is calibrated and sensitivity runs are not probability intervals.',
      'Footprints are treatment areas. Land ownership, wetlands, construction, culverts and downstream connectivity are unverified.',
    ],
  };
}
export type Investigation = ReturnType<typeof investigate>;
