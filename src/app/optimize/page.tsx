'use client';
import { ResearchScene } from '@/components/research-scene';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, SlidersHorizontal, Play, Check, Download } from 'lucide-react';
import { useBasin, download } from '@/components/provider';
import type { SearchResult } from '@/engine/model';
import { Chart } from '@/components/chart';
export default function Optimize() {
  const { scenario, setScenario, setRun, notify } = useBasin(),
    [budget, setBudget] = useState(15000),
    [space, setSpace] = useState(25 * scenario.cellSize ** 2),
    [busy, setBusy] = useState(false),
    [result, setResult] = useState<SearchResult | null>(null),
    [error, setError] = useState('');
  const worker = useRef<Worker | null>(null);
  useEffect(() => () => worker.current?.terminate(), []);
  function search() {
    setBusy(true);
    setError('');
    setResult(null);
    worker.current?.terminate();
    worker.current = new Worker(new URL('../../workers/optimizer.ts', import.meta.url));
    worker.current.onmessage = (e) => {
      setBusy(false);
      if (e.data.error) setError(e.data.error);
      else setResult(e.data.result);
      worker.current?.terminate();
    };
    worker.current.onerror = () => {
      setBusy(false);
      setError('Search could not complete. Try again or reduce the grid size.');
      worker.current?.terminate();
    };
    worker.current.postMessage({ scenario, budget, space });
  }
  const reduction =
    result && result.baseline.peakOutflow > 0
      ? (1 - result.best.peakOutflow / result.baseline.peakOutflow) * 100
      : 0;
  return (
    <main id="main">
      <ResearchScene
        title={['Detention', 'search']}
        image="/research/siting.webp"
        caption="BASIN screening example · Spring, Texas"
        description="Set budget and space limits to find which tested design reduces peak outflow most."
        action="Set search limits"
      />
      <section className="content-width optimize-layout">
        <aside className="optimization-controls">
          <div className="panel-heading">
            <SlidersHorizontal size={16} />
            SEARCH CONSTRAINTS
          </div>
          <div className="section-body">
            <label className="field">
              Hypothetical budget · USD
              <input
                type="number"
                min="0"
                max="1000000"
                step="1000"
                value={budget}
                onChange={(e) => {
                  setBudget(Math.max(0, Math.min(1000000, +e.target.value)));
                  setResult(null);
                }}
              />
            </label>
            <label className="field">
              Maximum footprint · m²
              <input
                type="number"
                min="0"
                max="100000"
                step="100"
                value={space}
                onChange={(e) => {
                  setSpace(Math.max(0, Math.min(100000, +e.target.value)));
                  setResult(null);
                }}
              />
            </label>
            <div className="data-list">
              <div>
                <span>Objective</span>
                <b>Min. peak outflow</b>
              </div>
              <div>
                <span>Strategy</span>
                <b>Exhaustive search</b>
              </div>
              <div>
                <span>Locations</span>
                <b>3 centerline cells</b>
              </div>
              <div>
                <span>Capacities</span>
                <b>100 / 300 / 600 m³</b>
              </div>
              <div>
                <span>Cost assumption</span>
                <b>$50 / m³</b>
              </div>
            </div>
            <p className="tiny">
              One basin per candidate, with a clipped 5 × 5-cell capture footprint and no outlet.
              Baseline excludes existing interventions. All other current laboratory inputs are
              retained. Footprint is a model assumption, not an engineered basin design.
            </p>
            <button className="button primary full" disabled={busy} onClick={search}>
              <Play size={15} />
              {busy ? 'Evaluating candidates…' : 'Run search'}
            </button>
            {busy && (
              <button
                className="text-button"
                onClick={() => {
                  worker.current?.terminate();
                  setBusy(false);
                }}
              >
                Cancel search
              </button>
            )}
          </div>
        </aside>
        <div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {!result ? (
            <div className="empty-state optimization-empty">
              <span className="search-symbol">∑</span>
              <h2>Evaluate feasible candidates.</h2>
              <p>
                Set a budget and space constraint. BASIN will enumerate feasible detention
                alternatives and compare their simulated peak boundary outflow.
              </p>
              <span className="badge">DETERMINISTIC · NO AI REQUIRED</span>
            </div>
          ) : (
            <>
              <div className="result-banner">
                <div>
                  <span className="eyebrow">BEST IN THE ENUMERATED SET</span>
                  <h2 className="mono">
                    {reduction.toFixed(2)}
                    <small>%</small>
                  </h2>
                  <span>reduction in simulated peak outflow</span>
                </div>
                <Check size={28} />
              </div>
              <div className="optimization-summary">
                <span>
                  {result.evaluated} runs evaluated · {result.feasible} feasible interventions
                </span>
                <strong>${result.best.cost.toLocaleString()} illustrative cost</strong>
                <p>
                  {result.best.cost === 0
                    ? 'No intervention improved the objective within these constraints.'
                    : `Selected ${result.best.scenario.interventions[0].capacity} m³ detention at cell ${result.best.scenario.interventions[0].cell}.`}{' '}
                  Optimal only among the nine enumerated single-basin alternatives and the
                  no-intervention baseline.
                </p>
              </div>
              <Chart
                runs={[
                  {
                    ...result.baseline,
                    scenario: { ...result.baseline.scenario, name: 'No intervention' },
                  },
                  {
                    ...result.best,
                    scenario: { ...result.best.scenario, name: 'Selected candidate' },
                  },
                ]}
                metric="rate"
                title="Simulated outflow rate"
                unit="m³/s"
              />
              <div className="table-wrap">
                <table>
                  <caption>Search evidence</caption>
                  <thead>
                    <tr>
                      <th>Strategy</th>
                      <th>Peak outflow · m³/s</th>
                      <th>Cost · USD</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>No intervention</th>
                      <td>{result.baseline.peakOutflow.toFixed(4)}</td>
                      <td>0</td>
                    </tr>
                    <tr>
                      <th>Cheapest feasible intervention</th>
                      <td>{result.cheapest.peakOutflow.toFixed(4)}</td>
                      <td>{result.cheapest.cost}</td>
                    </tr>
                    <tr>
                      <th>Best enumerated candidate</th>
                      <td>{result.best.peakOutflow.toFixed(4)}</td>
                      <td>{result.best.cost}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="button-row">
                <Link
                  className="button primary"
                  href="/lab"
                  onClick={() => {
                    setScenario({ ...result.best.scenario, name: 'Optimized synthetic catchment' });
                    setRun(null);
                    notify('Selected scenario loaded in the laboratory. Run to inspect.');
                  }}
                >
                  Inspect in laboratory <ArrowRight size={16} />
                </Link>
                <button
                  className="button ghost"
                  onClick={() => download('basin-optimization.json', result)}
                >
                  <Download size={15} />
                  Export search
                </button>
              </div>
            </>
          )}
        </div>
      </section>
      <div className="content-width text-callout">
        <h3>Optimal is a statement about a search space.</h3>
        <p>
          This search does not consider all locations, multiple basins, uncertain soil properties,
          construction feasibility, or real prices. A computed improvement is a hypothesis to
          investigate, not a design recommendation.{' '}
          <Link href="/methodology">
            Read the assumptions <ArrowUpRight size={13} />
          </Link>
        </p>
      </div>
    </main>
  );
}
