'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, GitCompareArrows, Download, Play, Info, Trash2 } from 'lucide-react';
import { useBasin, download } from '@/components/provider';
import { simulate, type Run } from '@/engine/model';
import { Chart } from '@/components/chart';
export default function Compare() {
  const { scenario, saved, remove } = useBasin(),
    [a, setA] = useState('baseline'),
    [b, setB] = useState('current'),
    [runs, setRuns] = useState<Run[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  function calculate() {
    setBusy(true);
    setError('');
    setTimeout(() => {
      try {
        const resolve = (id: string) =>
          id === 'baseline'
            ? { ...scenario, name: 'Without interventions', interventions: [] }
            : id === 'current'
              ? { ...scenario, name: 'Current scenario' }
              : saved.find((x) => x.id === id)!.scenario;
        setRuns([simulate(resolve(a)), simulate(resolve(b))]);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy(false);
      }
    }, 20);
  }
  const comparable =
    runs.length === 2 &&
    JSON.stringify({ ...runs[0].scenario, name: '', interventions: [] }) ===
      JSON.stringify({ ...runs[1].scenario, name: '', interventions: [] });
  const metrics: [string, (r: Run) => number, string][] = [
    ['Total rainfall input', (r) => r.frames.at(-1)!.rainfall, 'm³'],
    ['Cumulative infiltration', (r) => r.frames.at(-1)!.infiltrated, 'm³'],
    ['Cumulative boundary outflow', (r) => r.frames.at(-1)!.outflow, 'm³'],
    ['Peak total surface storage', (r) => r.peakSurface, 'm³'],
    ['Maximum cell depth', (r) => r.maxDepth, 'm'],
    ['Peak boundary outflow', (r) => r.peakOutflow, 'm³/s'],
    ['Final detention storage', (r) => r.frames.at(-1)!.detention, 'm³'],
    ['Mass-balance residual', (r) => r.frames.at(-1)!.residual, 'm³'],
    ['Illustrative intervention cost', (r) => r.cost, 'USD'],
  ];
  return (
    <main id="main">
      <section className="page-heading">
        <h1>Compare scenarios</h1>
        <p>Run two scenarios side by side with the same model.</p>
      </section>
      <section className="content-width">
        <div className="compare-controls">
          <label className="field">
            <span className="eyebrow">SCENARIO A</span>
            <select
              aria-label="Scenario A"
              value={a}
              onChange={(e) => {
                setA(e.target.value);
                setRuns([]);
              }}
            >
              <option value="baseline">Current inputs · no interventions</option>
              <option value="current">Current lab scenario</option>
              {saved.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.scenario.name}
                </option>
              ))}
            </select>
          </label>
          <GitCompareArrows size={23} />
          <label className="field">
            <span className="eyebrow">SCENARIO B</span>
            <select
              aria-label="Scenario B"
              value={b}
              onChange={(e) => {
                setB(e.target.value);
                setRuns([]);
              }}
            >
              <option value="current">Current lab scenario</option>
              <option value="baseline">Current inputs · no interventions</option>
              {saved.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.scenario.name}
                </option>
              ))}
            </select>
          </label>
          <button className="button primary" disabled={busy} onClick={calculate}>
            <Play size={15} />
            {busy ? 'Calculating…' : 'Run comparison'}
          </button>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {runs.length === 0 ? (
          <div className="empty-state">
            <GitCompareArrows size={34} />
            <h2>Choose two scenarios.</h2>
            <p>
              Add a hypothetical intervention in the laboratory, then run both scenarios here.
              <br />
              Saved scenarios are also available in the selectors.
            </p>
            <Link className="button" href="/lab">
              Open laboratory <ArrowUpRight size={15} />
            </Link>
          </div>
        ) : (
          <>
            <div className="comparison-status">
              <Info size={17} />
              <p>
                {comparable
                  ? 'Rainfall, terrain, soil, boundaries, and duration are identical. Only intervention settings may differ.'
                  : 'These runs have different model inputs. Differences cannot be attributed solely to interventions.'}{' '}
                {runs[1].scenario.interventions.length === 0 &&
                  'Scenario B has no interventions; identical inputs produce identical outputs.'}
              </p>
            </div>
            <div className="result-banner">
              <div>
                <span className="eyebrow">PEAK BOUNDARY OUTFLOW · B MINUS A</span>
                <h2 className="mono">
                  {(runs[1].peakOutflow - runs[0].peakOutflow).toFixed(4)} <small>m³/s</small>
                </h2>
              </div>
              <p>
                Computed difference over the full run.
                <br />
                Simulated estimates on synthetic terrain.
              </p>
              <button
                className="button ghost compact"
                onClick={() =>
                  download('basin-comparison.json', {
                    runs,
                    comparable,
                    classification: 'Simulated estimates',
                  })
                }
              >
                <Download size={14} />
                Export results
              </button>
            </div>
            <div className="compare-charts">
              <Chart runs={runs} />
              <Chart runs={runs} metric="rate" title="Boundary outflow rate" unit="m³/s" />
              <Chart runs={runs} metric="infiltrated" title="Cumulative infiltration" />
              <Chart runs={runs} metric="detention" title="Detention storage" />
            </div>
            <div className="table-wrap">
              <table>
                <caption>Computed metrics · simulated estimates</caption>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>{runs[0].scenario.name} (A)</th>
                    <th>{runs[1].scenario.name} (B)</th>
                    <th>B − A</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map(([name, get, unit]) => (
                    <tr key={name}>
                      <th>{name}</th>
                      <td className="mono">
                        {get(runs[0]).toFixed(name.includes('residual') ? 8 : 3)}{' '}
                        <small>{unit}</small>
                      </td>
                      <td className="mono">
                        {get(runs[1]).toFixed(name.includes('residual') ? 8 : 3)}{' '}
                        <small>{unit}</small>
                      </td>
                      <td className="mono">
                        {(get(runs[1]) - get(runs[0])).toFixed(name.includes('residual') ? 8 : 3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="tiny">
              Peaks are measured at every ≤10-second solver step; charts show one-minute snapshots.
              Maximum cell depth is the greatest cell depth at any solver step. Cost values are
              hypothetical assumptions.
            </p>
          </>
        )}
        {saved.length > 0 && (
          <section className="saved-library">
            <h2>On this device</h2>
            {saved.map((s) => (
              <div key={s.id}>
                <span>
                  {s.scenario.name}
                  <small>
                    {s.scenario.interventions.length} interventions · {s.scenario.rain} mm/h setting
                  </small>
                </span>
                <button
                  className="icon-button"
                  aria-label={`Delete saved ${s.scenario.name}`}
                  onClick={() => {
                    remove(s.id);
                    if (a === s.id) setA('baseline');
                    if (b === s.id) setB('current');
                    setRuns([]);
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
