'use client';
import { ResearchScene } from '@/components/research-scene';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useBasin, download } from '@/components/provider';
import { parseRainCsv, type RainSeries } from '@/engine/rainfall';
import { validateScenario, type Scenario } from '@/engine/model';
import type { Investigation, StudyOptions } from '@/engine/watershed';
import proj4 from 'proj4';
import { gridBounds } from '@/lib/geo/grid';

const STORAGE = 'basin-investigation-v1';
export default function Study() {
  const { scenario, setScenario, setRun } = useBasin();
  const [result, setResult] = useState<Investigation | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [footprint, setFootprint] = useState(25 * scenario.cellSize ** 2),
    [capacity, setCapacity] = useState(600);
  const [multiplier, setMultiplier] = useState(1.25),
    [cost, setCost] = useState(''),
    [budget, setBudget] = useState('');
  const [includePermeable, setIncludePermeable] = useState(true);
  const [patchInfiltration, setPatchInfiltration] = useState(40);
  const [rain, setRain] = useState<RainSeries | null>(null),
    [rainSource, setRainSource] = useState(''),
    [notice, setNotice] = useState('');
  const worker = useRef<Worker | null>(null);
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => () => worker.current?.terminate(), []);
  function run(input: Scenario, options: StudyOptions) {
    worker.current?.terminate();
    setBusy(true);
    setError('');
    setResult(null);
    setNotice('');
    const task = new Worker(new URL('../../workers/investigation.ts', import.meta.url));
    worker.current = task;
    task.onmessage = (e: MessageEvent<{ result?: Investigation; error?: string }>) => {
      setBusy(false);
      setResult(e.data.result ?? null);
      setError(e.data.error ?? '');
      task.terminate();
    };
    task.onerror = () => {
      setBusy(false);
      setError('The analysis worker stopped unexpectedly.');
      task.terminate();
    };
    task.postMessage({ scenario: input, options });
  }
  function restore(serialized: string) {
    try {
      const saved: Investigation = JSON.parse(serialized);
      if (!saved.options) throw Error('Invalid investigation file.');
      run(validateScenario(saved.scenario), saved.options);
    } catch {
      setError('The saved investigation could not be opened.');
    }
  }
  function siteLocation(value: Investigation, cell: number) {
    const g = value.scenario.geographic;
    if (!g) return null;
    const { projection } = gridBounds(...g.center, g.cellSize * g.size);
    const [lon, lat] = proj4(projection, 'EPSG:4326', [
      g.projectedBounds[0] + ((cell % g.size) + 0.5) * g.cellSize,
      g.projectedBounds[3] - (Math.floor(cell / g.size) + 0.5) * g.cellSize,
    ]);
    return { lon: lon.toFixed(6), lat: lat.toFixed(6) };
  }
  const recommendedLocation = result?.recommended
    ? siteLocation(result, result.recommended.cell)
    : null;
  function geojson(value: Investigation) {
    const g = value.scenario.geographic;
    if (!g) return;
    const crs = gridBounds(...g.center, g.cellSize * g.size).projection;
    const coordinate = (index: number, dx: number, dy: number) =>
      proj4(crs, 'EPSG:4326', [
        g.projectedBounds[0] + ((index % g.size) + dx) * g.cellSize,
        g.projectedBounds[3] - (Math.floor(index / g.size) + dy) * g.cellSize,
      ]);
    const features = value.grid.catchment.map((index) => ({
      type: 'Feature',
      properties: {
        index,
        area_m2: value.grid.accumulation[index],
        outlet: index === value.grid.outlet,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [0, 1],
            [1, 1],
            [1, 0],
            [0, 0],
          ].map(([x, y]) => coordinate(index, x, y)),
        ],
      },
    }));
    download('basin-catchment.geojson', {
      type: 'FeatureCollection',
      features,
      model: value.model,
      source: g.provenance,
    });
  }
  return (
    <main id="main">
      <ResearchScene
        title={['Watershed', 'study']}
        image="/research/siting.webp"
        caption="BASIN screening example · Spring, Texas"
        description="Choose an area, set your limits, and test where a basin or a permeable surface could slow runoff in two storms."
        action="Set study limits"
        back="/journeys"
      />
      <div className="content-width study-layout">
        <form
          className="optimization-controls study-controls"
          onSubmit={(e) => {
            e.preventDefault();
            run(
              rain
                ? {
                    ...scenario,
                    rainSeries: rain,
                    duration: rain.stepMinutes * rain.rates.length * 60,
                  }
                : scenario,
              {
                includePermeable,
                patchInfiltration,
                maxFootprint: footprint,
                maxCapacity: capacity,
                stormMultiplier: multiplier,
                unitCost: cost === '' ? undefined : Number(cost),
                budget: cost === '' || budget === '' ? undefined : Number(budget),
              },
            );
          }}
        >
          <h2>{scenario.name}</h2>
          <p>
            {scenario.geographic?.provenance.dataset ?? 'Synthetic demonstration'} ·{' '}
            {scenario.cellSize} m cells
          </p>
          <Link className="text-link" href="/earth">
            Change study area ↗
          </Link>
          <label className="field">
            Maximum treatment area (m²)
            <input
              type="number"
              min={1}
              required
              value={footprint}
              onChange={(e) => setFootprint(+e.target.value)}
            />
          </label>
          <label className="field">
            Maximum tested storage (m³)
            <input
              type="number"
              min={1}
              max={5000}
              required
              value={capacity}
              onChange={(e) => setCapacity(+e.target.value)}
            />
          </label>
          <label className="field">
            Second storm intensity multiplier
            <input
              type="number"
              min={1}
              max={2}
              step=".05"
              required
              value={multiplier}
              onChange={(e) => setMultiplier(+e.target.value)}
            />
          </label>
          <label className="field">
            Assumed unit cost per m³ (optional)
            <input type="number" min={0} value={cost} onChange={(e) => setCost(e.target.value)} />
          </label>
          <label className="field">
            Budget in the same currency (optional)
            <input
              type="number"
              min={0}
              value={budget}
              disabled={cost === ''}
              onChange={(e) => setBudget(e.target.value)}
            />
          </label>
          <label className="study-check">
            <input
              type="checkbox"
              checked={includePermeable}
              disabled={cost !== '' && budget !== ''}
              onChange={(e) => setIncludePermeable(e.target.checked)}
            />
            Test permeable surfaces too
          </label>
          {cost !== '' && budget !== '' ? (
            <p>The budget applies to basins. Clear it to compare unpriced permeable surfaces.</p>
          ) : (
            includePermeable && (
              <label className="field">
                New surface infiltration (mm/h)
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={patchInfiltration}
                  onChange={(e) => setPatchInfiltration(+e.target.value)}
                  required
                />
              </label>
            )
          )}
          <details>
            <summary>Use a rainfall CSV</summary>
            <p>
              Use minute,rate_mm_h with equal intervals beginning at minute 0. Limit each event to
              120 minutes.
            </p>
            <label className="field">
              Rainfall source or citation
              <input
                value={rainSource}
                onChange={(e) => {
                  setRainSource(e.target.value);
                  setRain(null);
                }}
                maxLength={450}
              />
            </label>
            <label className="field">
              Rainfall CSV
              <input
                type="file"
                accept=".csv,text/csv"
                disabled={!rainSource.trim()}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (!f) return;
                  try {
                    if (f.size > 32000) throw Error('Rainfall CSV exceeds 32 KB.');
                    setRain(parseRainCsv(await f.text(), rainSource));
                    setError('');
                  } catch (err) {
                    setRain(null);
                    setError((err as Error).message);
                  }
                }}
              />
            </label>
            {rain && (
              <button type="button" className="text-button" onClick={() => setRain(null)}>
                Remove loaded rainfall
              </button>
            )}
          </details>
          <button className="button primary" disabled={busy}>
            {busy ? 'Running storm analysis…' : 'Run watershed study'}
          </button>
          {busy && (
            <button
              type="button"
              className="button"
              onClick={() => {
                worker.current?.terminate();
                setBusy(false);
              }}
            >
              Cancel
            </button>
          )}
          <div className="button-row">
            <button
              type="button"
              className="text-button"
              disabled={busy}
              onClick={() => restore(localStorage.getItem(STORAGE) ?? '')}
            >
              Reopen saved study
            </button>
            <button
              type="button"
              className="text-button"
              disabled={busy}
              onClick={() => file.current?.click()}
            >
              Import study
            </button>
          </div>
          <input
            ref={file}
            type="file"
            hidden
            accept=".json,application/json"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f && f.size < 10000000) restore(await f.text());
              else if (f) setError('Study files must be smaller than 10 MB.');
              e.target.value = '';
            }}
          />
        </form>
        <section aria-label="Study results">
          {notice && <p role="status">{notice}</p>}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {!result && <p>Select a real area or use the synthetic example, then run the study.</p>}
          {result && (
            <>
              <h2>{result.scenario.name}</h2>
              <p>
                {result.model} · {result.scenario.rainSeries?.source ?? 'User-configured rainfall'}{' '}
                · {result.baselineInputs[0].duration / 60} minutes
              </p>
              <p>
                {result.grid.catchment.length} cells drain to boundary cell {result.grid.outlet}.{' '}
                {result.evaluatedRuns} simulations evaluated.
              </p>
              <svg
                className="study-grid"
                viewBox={`0 0 ${result.scenario.size} ${result.scenario.size}`}
                role="img"
                aria-label="Drainage screening grid with the largest catchment and candidate sites highlighted"
              >
                {result.grid.receiver.map((_, i) => (
                  <rect
                    key={i}
                    x={i % result.scenario.size}
                    y={Math.floor(i / result.scenario.size)}
                    width=".94"
                    height=".94"
                    fill={
                      i === result.recommended?.cell
                        ? '#ffffff'
                        : i === result.grid.outlet
                          ? '#fff5a5'
                          : result.candidates.some((c) => c.cell === i)
                            ? '#f3bd8f'
                            : result.grid.outlets[i] === result.grid.outlet
                              ? '#67cdd9'
                              : '#203f51'
                    }
                  />
                ))}
              </svg>
              <p>
                Blue shows the largest catchment, orange shows tested sites, yellow marks its
                outlet, and white marks the best tested option.
              </p>
              <h3>Detention tradeoffs</h3>
              <p className="comparison-status">
                {result.recommended
                  ? `Best tested option: ${result.recommended.intervention.kind === 'detention' ? 'detention basin' : 'permeable surface'} at cell ${result.recommended.cell}. It reduced the modeled peak by at least ${result.recommended.worstPeakReduction.toPrecision(3)} m³/s across both storms.`
                  : 'No tested option reduced the modeled peak in both storms.'}
              </p>
              {recommendedLocation && (
                <p>
                  <a
                    className="text-link"
                    href={`https://www.openstreetmap.org/?mlat=${recommendedLocation.lat}&mlon=${recommendedLocation.lon}#map=17/${recommendedLocation.lat}/${recommendedLocation.lon}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    See the recommended cell on the map ↗
                  </a>
                </p>
              )}
              <p>
                Baseline peak discharge:{' '}
                {result.baseline.map((r) => r.peakDischarge.toFixed(3)).join(' / ')} m³/s. The table
                shows alternatives that trade storage against the smaller reduction across both
                storms.
              </p>
              {result.pareto.length === 0 ? (
                <p>
                  No sites passed the selected constraints. Check the treatment area and budget.
                </p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Site and treatment</th>
                        <th>Storage (m³)</th>
                        <th>Footprint (m²)</th>
                        <th>Peak reduction (m³/s)</th>
                        <th>Assumed cost</th>
                        <th>Inspect</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.pareto.map((c) => (
                        <tr key={c.cell + ':' + c.intervention.kind + ':' + c.capacity}>
                          <td>
                            {c.cell} ·{' '}
                            {c.intervention.kind === 'detention' ? 'Basin' : 'Permeable surface'}
                          </td>
                          <td>{c.intervention.kind === 'detention' ? c.capacity : '—'}</td>
                          <td>{c.footprintArea}</td>
                          <td>{c.peakReduction.map((v) => v.toFixed(3)).join(' / ')}</td>
                          <td>{c.cost?.toFixed(0) ?? 'Unpriced'}</td>
                          <td>
                            <Link
                              href="/lab"
                              onClick={() => {
                                setScenario({
                                  ...result.baselineInputs[0],
                                  interventions: [c.intervention],
                                });
                                setRun(null);
                              }}
                            >
                              In lab ↗
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p>{result.warnings.join(' ')}</p>
              <div className="button-row">
                <button
                  className="button"
                  onClick={() => {
                    try {
                      localStorage.setItem(STORAGE, JSON.stringify(result));
                      setError('');
                      setNotice('Study saved on this device.');
                    } catch {
                      setError('Browser storage is full. Export this study instead.');
                    }
                  }}
                >
                  Save on this device
                </button>
                <button
                  className="button"
                  onClick={() => download('basin-investigation.json', result)}
                >
                  Export investigation
                </button>
                <button
                  className="button"
                  onClick={() => {
                    const rows = ['scenario,storm,seconds,boundary_discharge_m3_s'];
                    const append = (label: string, runs: typeof result.baseline) =>
                      runs.forEach((r, i) =>
                        r.hydrograph.forEach((h) =>
                          rows.push([label, i + 1, h.seconds, h.discharge].join(',')),
                        ),
                      );
                    append('baseline', result.baseline);
                    result.candidates.forEach((c) =>
                      append('cell-' + c.cell + '-storage-' + c.capacity, c.runs),
                    );
                    const url = URL.createObjectURL(
                      new Blob([rows.join('\n')], { type: 'text/csv' }),
                    );
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'basin-hydrographs.csv';
                    link.click();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  }}
                >
                  Export hydrographs CSV
                </button>
                {result.scenario.geographic && (
                  <button className="button" onClick={() => geojson(result)}>
                    Export catchment GeoJSON
                  </button>
                )}
                <Link href="/methodology" className="text-link">
                  Methods ↗
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
