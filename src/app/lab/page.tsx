'use client';
import { ResearchScene } from '@/components/research-scene';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Save,
  Plus,
  X,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowRight,
  CloudRain,
  Layers,
  Droplets,
  Check,
} from 'lucide-react';
import { useBasin, download } from '@/components/provider';
import Terrain from '@/components/terrain-view';
import { Chart } from '@/components/chart';
import { terrainHeightScale } from '@/lib/terrain-display';
import {
  DEFAULT,
  simulate,
  terrain,
  validateScenario,
  makeIntervention,
  patchCells,
  type Scenario,
  type Intervention,
} from '@/engine/model';
function clock(time: number) {
  const seconds = Math.floor(time);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function Range({
  label,
  value,
  change,
  min = 0,
  max = 200,
  step = 1,
  unit,
}: {
  label: string;
  value: number;
  change: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit: string;
}) {
  return (
    <label className="lab-range">
      <span>
        {label}
        <b>
          {value} <small>{unit}</small>
        </b>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => change(+e.target.value)}
      />
    </label>
  );
}
export default function Lab() {
  const { scenario: s, setScenario, run, setRun, saved, save, notify } = useBasin(),
    [panel, setPanel] = useState<'storm' | 'intervene' | 'results' | 'saved' | 'source' | null>(
      null,
    ),
    [index, setIndex] = useState(0),
    [playing, setPlaying] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [selected, setSelected] = useState(420),
    [selectedIntervention, setSelectedIntervention] = useState<string>(),
    [view, setView] = useState<'iso' | 'top' | '2d'>('iso'),
    [cameraKey, setCameraKey] = useState(0),
    [water, setWater] = useState(true),
    [wire, setWire] = useState(false),
    [advanced, setAdvanced] = useState(false),
    [speed, setSpeed] = useState(1),
    [name, setName] = useState('Baseline');
  const input = useRef<HTMLInputElement>(null);
  const drawer = useRef<HTMLElement>(null);
  const panelTrigger = useRef<HTMLElement>(null);
  const focusPanel = useRef(false);

  useEffect(() => {
    if (!panel || !focusPanel.current) return;
    focusPanel.current = false;
    drawer.current?.querySelector('h2')?.focus({ preventScroll: true });
    if (matchMedia('(max-width: 980px)').matches) {
      drawer.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }, [panel]);

  const cell = Math.min(selected, s.size * s.size - 1),
    z = terrain(s),
    frame = run?.frames[Math.min(index, run.frames.length - 1)],
    active =
      s.interventions.find((i) => i.cell === cell && i.id === selectedIntervention) ??
      s.interventions.find((i) => i.cell === cell);
  function update(p: Partial<Scenario>) {
    setScenario({
      ...s,
      ...(p.duration !== undefined ||
      p.rain !== undefined ||
      p.profile !== undefined ||
      p.customRain !== undefined
        ? { rainSeries: undefined }
        : {}),
      ...p,
    });
    setRun(null);
    setIndex(0);
    setPlaying(false);
    setError('');
  }
  const atEnd = !!run && index >= run.frames.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying || !run) return;
    const id = setInterval(() => {
      setIndex((i) => Math.min(i + 1, run.frames.length - 1));
    }, 250 / speed);
    return () => clearInterval(id);
  }, [isPlaying, run, speed]);

  function start() {
    if (run) {
      if (atEnd) setIndex(0);
      setPlaying(true);
      return;
    }
    setBusy(true);
    setError('');
    setTimeout(() => {
      try {
        setRun(simulate(s));
        setIndex(0);
        setPlaying(true);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy(false);
      }
    }, 25);
  }
  function add(kind: Intervention['kind']) {
    if (s.interventions.length >= 12) {
      notify('Maximum 12 interventions.');
      return;
    }
    if (s.interventions.some((i) => i.cell === cell && i.kind === kind)) {
      notify('This intervention already exists at that cell.');
      return;
    }
    const intervention = { ...makeIntervention(s, cell, kind), id: crypto.randomUUID() };
    update({ interventions: [...s.interventions, intervention] });
    setSelectedIntervention(intervention.id);
  }
  function edit(id: string, p: Partial<Intervention>) {
    update({ interventions: s.interventions.map((i) => (i.id === id ? { ...i, ...p } : i)) });
  }
  async function load(file?: File) {
    if (!file) return;
    try {
      if (file.size > 10000000) throw Error('File exceeds 10 MB.');
      const value = JSON.parse(await file.text());
      setScenario(validateScenario(value.scenario ?? value));
      setRun(null);
      setIndex(0);
      setPlaying(false);
      notify('Scenario imported.');
    } catch (e) {
      setError((e as Error).message);
    }
    if (input.current) input.current.value = '';
  }
  function closePanel() {
    setPanel(null);
    panelTrigger.current?.focus();
  }
  function toggle(p: Exclude<typeof panel, null>, trigger: HTMLElement) {
    if (panel === p) {
      closePanel();
      return;
    }
    panelTrigger.current = trigger;
    focusPanel.current = true;
    setPanel(p);
  }
  return (
    <main id="main" className="new-lab">
      <ResearchScene
        title={['Experiment', 'runner']}
        image="/dive/deep.webp"
        description="Set a storm, watch water move across the terrain, and test what changes the flow."
        action="Open experiment controls"
      />
      <div className="lab-title">
        <div>
          <h2>{s.name}</h2>
        </div>
        <button
          className="source-chip"
          aria-expanded={panel === 'source'}
          onClick={(event) => toggle('source', event.currentTarget)}
        >
          {s.geographic
            ? s.geographic.provenance.provider === 'USGS'
              ? 'USGS 3DEP'
              : s.geographic.provenance.provider
            : 'Synthetic demo'}
          <span> · </span>
          {s.size * s.cellSize} × {s.size * s.cellSize} m
        </button>
      </div>
      <div className="task-rail" aria-label="Model workflow">
        <Link href="/earth">Choose terrain</Link>
        <button
          aria-expanded={panel === 'storm'}
          className={panel === 'storm' ? 'active' : ''}
          onClick={(event) => toggle('storm', event.currentTarget)}
        >
          <CloudRain size={16} /> Storm
        </button>
        <button
          aria-expanded={panel === 'intervene'}
          className={panel === 'intervene' ? 'active' : ''}
          onClick={(event) => toggle('intervene', event.currentTarget)}
        >
          <Droplets size={16} /> Intervene
        </button>
        <Link href="/study">
          Find relief sites <ArrowUpRight size={12} />
        </Link>
        <Link href="/compare">
          Compare
          <ArrowUpRight size={12} />
        </Link>
      </div>
      <div className="lab-workspace" data-panel={panel ?? undefined}>
        <div className="lab-stage">
          <div className="lab-viewport">
            <div className="lab-world">
              <Terrain
                scenario={s}
                frame={frame}
                selected={panel === 'intervene' ? cell : undefined}
                onSelect={(i) => {
                  setSelected(i);
                  setSelectedIntervention(undefined);
                  setPanel('intervene');
                }}
                view={view}
                cameraKey={cameraKey}
                water={water}
                wire={wire}
              />
            </div>
            <div className="lab-camera">
              <div className="camera-options" role="group" aria-label="Camera view">
                {(['iso', 'top', '2d'] as const).map((v) => (
                  <button
                    aria-pressed={view === v}
                    className={view === v ? 'active' : ''}
                    key={v}
                    onClick={() => setView(v)}
                  >
                    {v === 'iso' ? '3D' : v === 'top' ? 'Top' : '2D'}
                  </button>
                ))}
                <button aria-label="Reset camera" onClick={() => setCameraKey((k) => k + 1)}>
                  <RotateCcw size={13} />
                </button>
              </div>
              <button
                className="camera-save"
                aria-label="Saved scenarios"
                aria-expanded={panel === 'saved'}
                onClick={(event) => toggle('saved', event.currentTarget)}
              >
                <Save size={16} />
              </button>
            </div>
            <div className="lab-legend">
              <span>Water depth · m</span>
              <i />
              <div>
                <span>0</span>
                <span>0.125</span>
                <span>≥ 0.25</span>
              </div>
              <small>
                {s.geographic
                  ? `Terrain height shown at ${terrainHeightScale(s).toFixed(1)}× scale`
                  : 'Synthetic elevation'}{' '}
                · lighter = higher
              </small>
            </div>
          </div>
          {error && (
            <div className="lab-error" role="alert">
              {error}
              <button aria-label="Dismiss error" onClick={() => setError('')}>
                <X size={14} />
              </button>
            </div>
          )}
          <div className="lab-bottom">
            <div className="run-summary">
              <span>
                <CloudRain size={15} />
                {s.rainSeries
                  ? 'Imported rainfall'
                  : s.profile === 'custom'
                    ? 'Custom rain'
                    : `${s.rain} mm/h`}
              </span>
              {frame && (
                <span>
                  Surface water <b>{frame.surface.toFixed(1)} m³</b>
                </span>
              )}
            </div>
            <div className="transport">
              <button
                className="run-button"
                disabled={busy}
                onClick={() => (isPlaying ? setPlaying(false) : start())}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                {busy ? 'Computing…' : isPlaying ? 'Pause' : run ? 'Play' : 'Run simulation'}
              </button>
              <button
                className="icon-button"
                aria-label="Reset simulation"
                disabled={busy}
                onClick={() => {
                  setRun(null);
                  setIndex(0);
                  setPlaying(false);
                }}
              >
                <RotateCcw size={16} />
              </button>
              <input
                aria-label="Simulation timeline"
                type="range"
                min={0}
                max={run ? run.frames.length - 1 : 60}
                value={index}
                disabled={!run}
                onChange={(e) => {
                  setIndex(+e.target.value);
                  setPlaying(false);
                }}
              />
              <span className="transport-time">
                {clock(frame?.time ?? 0)} <small>/ {clock(s.duration)}</small>
              </span>
              <select
                aria-label="Playback speed"
                value={speed}
                onChange={(e) => setSpeed(+e.target.value)}
              >
                <option value={1}>1×</option>
                <option value={2}>2×</option>
                <option value={4}>4×</option>
              </select>
              <button
                className="results-button"
                aria-expanded={panel === 'results'}
                onClick={(event) => toggle('results', event.currentTarget)}
              >
                Results <Layers size={15} />
              </button>
            </div>
            <div className="lab-status">
              <span className={frame ? 'balanced' : ''}>
                <Check size={11} />
                {frame
                  ? `Mass balance accounted · ${frame.residual.toExponential(1)} m³ residual`
                  : 'Ready to simulate'}
              </span>
              <Link href="/methodology">
                Experimental model · limits <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>
        </div>
        {panel && (
          <section
            ref={drawer}
            id="lab-configuration"
            className={`lab-drawer ${panel === 'results' ? 'wide' : ''}`}
            aria-label={`${panel} panel`}
          >
            <div className="drawer-top">
              <h2 tabIndex={-1}>
                {panel === 'storm'
                  ? 'Set the storm'
                  : panel === 'intervene'
                    ? 'Change a location'
                    : panel === 'results'
                      ? 'Computed results'
                      : panel === 'source'
                        ? 'Terrain source'
                        : 'Your scenarios'}
              </h2>
              <button className="icon-button" aria-label="Close panel" onClick={closePanel}>
                <X size={18} />
              </button>
            </div>
            <div className="drawer-content">
              {panel === 'storm' && (
                <>
                  <div className="storm-presets">
                    <button onClick={() => update({ rain: 100, duration: 1800, profile: 'pulse' })}>
                      Intense<span>100 mm/h peak · 30 min</span>
                    </button>
                    <button
                      onClick={() => update({ rain: 15, duration: 7200, profile: 'constant' })}
                    >
                      Gentle<span>15 mm/h · 2 h</span>
                    </button>
                  </div>
                  <Range
                    label={s.profile === 'pulse' ? 'Peak rainfall' : 'Rainfall intensity'}
                    value={s.rain}
                    unit="mm/h"
                    change={(rain) => update({ rain })}
                  />
                  <Range
                    label="Duration"
                    value={s.duration / 60}
                    min={5}
                    max={120}
                    step={5}
                    unit="min"
                    change={(v) => update({ duration: v * 60 })}
                  />
                  <label className="field">
                    Surface infiltration
                    <select
                      aria-label="Surface infiltration"
                      value={s.infiltration}
                      onChange={(e) => update({ infiltration: +e.target.value })}
                    >
                      <option value={0}>Impermeable · 0 mm/h</option>
                      <option value={5}>Low · 5 mm/h</option>
                      <option value={15}>Moderate · 15 mm/h</option>
                      <option value={40}>High · 40 mm/h</option>
                    </select>
                  </label>
                  <p className="drawer-note">
                    Storm and infiltration settings are assumptions, not observations.
                  </p>
                  <button
                    className="advanced-toggle"
                    aria-expanded={advanced}
                    onClick={() => setAdvanced(!advanced)}
                  >
                    <SlidersHorizontal size={15} />
                    Advanced settings <Plus size={14} />
                  </button>
                  {advanced && (
                    <>
                      <label className="field">
                        Rainfall profile
                        <select
                          value={s.profile}
                          onChange={(e) =>
                            update({ profile: e.target.value as Scenario['profile'] })
                          }
                        >
                          <option value="constant">Constant</option>
                          <option value="pulse">Six-bin pulse</option>
                          <option value="custom">Custom hyetograph</option>
                        </select>
                      </label>
                      {s.profile === 'custom' && (
                        <div className="rain-bins">
                          {s.customRain.map((r, i) => (
                            <label key={i}>
                              Bin {i + 1}
                              <input
                                aria-label={`Rainfall bin ${i + 1}`}
                                type="number"
                                min={0}
                                max={200}
                                value={r}
                                onChange={(e) =>
                                  update({
                                    customRain: s.customRain.map((v, k) =>
                                      i === k ? Math.max(0, Math.min(200, +e.target.value)) : v,
                                    ),
                                  })
                                }
                              />
                            </label>
                          ))}
                        </div>
                      )}
                      <Range
                        label="Infiltration capacity"
                        value={s.infiltration}
                        unit="mm/h"
                        max={100}
                        change={(infiltration) => update({ infiltration })}
                      />
                      <label className="field">
                        Boundary condition
                        <select
                          value={s.boundary}
                          onChange={(e) =>
                            update({ boundary: e.target.value as Scenario['boundary'] })
                          }
                        >
                          <option value="open">Open · perimeter drains freely</option>
                          <option value="closed">Closed · retain all water</option>
                        </select>
                      </label>
                      <div className="layer-options">
                        <label>
                          <input
                            type="checkbox"
                            checked={water}
                            onChange={(e) => setWater(e.target.checked)}
                          />
                          Water layer
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={wire}
                            onChange={(e) => setWire(e.target.checked)}
                          />
                          Terrain grid
                        </label>
                      </div>
                      {!s.geographic && (
                        <>
                          <label className="field">
                            Terrain seed
                            <input
                              aria-label="Terrain seed"
                              type="number"
                              min={0}
                              max={4294967295}
                              value={s.seed}
                              onChange={(e) =>
                                update({
                                  seed: Math.max(
                                    0,
                                    Math.min(4294967295, Math.floor(+e.target.value)),
                                  ),
                                })
                              }
                            />
                          </label>
                          <label className="field">
                            Synthetic terrain
                            <select
                              value={s.terrain}
                              onChange={(e) =>
                                update({
                                  terrain: e.target.value as Scenario['terrain'],
                                  name:
                                    e.target.value === 'valley'
                                      ? 'Valley Catchment'
                                      : e.target.value === 'urban'
                                        ? 'Urban Slope'
                                        : 'Flat Test Plane',
                                  edits: [],
                                })
                              }
                            >
                              <option value="valley">Valley Catchment</option>
                              <option value="urban">Urban Slope</option>
                              <option value="flat">Flat Test Plane</option>
                            </select>
                          </label>
                          <label className="field">
                            Grid
                            <select
                              value={s.size}
                              onChange={(e) => {
                                setSelected(0);
                                update({ size: +e.target.value, edits: [], interventions: [] });
                              }}
                            >
                              <option value={16}>16 × 16</option>
                              <option value={24}>24 × 24</option>
                              <option value={32}>32 × 32</option>
                            </select>
                          </label>
                        </>
                      )}
                      <Link className="text-link" href="/methodology">
                        Solver assumptions ↗
                      </Link>
                    </>
                  )}
                  <button
                    className="button primary full"
                    onClick={() => {
                      setPanel(null);
                      start();
                    }}
                  >
                    Run this storm <ArrowRight size={16} />
                  </button>
                </>
              )}
              {panel === 'intervene' && (
                <>
                  <p className="drawer-note">
                    Click the terrain or select a cell. Added interventions are hypothetical.
                  </p>
                  <label className="field">
                    Selected cell
                    <input
                      aria-label="Selected cell"
                      type="number"
                      min={0}
                      max={s.size * s.size - 1}
                      value={cell}
                      onChange={(e) =>
                        setSelected(
                          Math.max(0, Math.min(s.size * s.size - 1, Math.floor(+e.target.value))),
                        )
                      }
                    />
                  </label>
                  <div className="cell-readout">
                    <span>
                      Elevation<b>{z[cell].toFixed(2)} m</b>
                    </span>
                    <span>
                      Water depth<b>{(frame?.depths[cell] ?? 0).toFixed(4)} m</b>
                    </span>
                  </div>
                  <div className="add-interventions">
                    <button onClick={() => add('detention')}>
                      <Droplets size={20} />
                      <span>
                        Add detention<small>Capture and store water</small>
                      </span>
                      <Plus size={16} />
                    </button>
                    <button onClick={() => add('permeable')}>
                      <Layers size={20} />
                      <span>
                        Add permeability<small>Increase local infiltration</small>
                      </span>
                      <Plus size={16} />
                    </button>
                  </div>
                  {s.interventions.length > 0 && (
                    <div className="patch-list">
                      {s.interventions.map((i) => (
                        <div key={i.id}>
                          <button
                            aria-pressed={i.id === active?.id}
                            onClick={() => {
                              setSelected(i.cell);
                              setSelectedIntervention(i.id);
                            }}
                          >
                            {i.kind} · cell {i.cell}
                          </button>
                          <button
                            aria-label={`Remove ${i.kind} at ${i.cell}`}
                            onClick={() =>
                              update({
                                interventions: s.interventions.filter((v) => v.id !== i.id),
                              })
                            }
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {active && (
                    <div className="active-intervention">
                      <h3>{active.kind === 'detention' ? 'Detention' : 'Permeable patch'}</h3>
                      {active.kind === 'detention' ? (
                        <>
                          <Range
                            label="Storage capacity"
                            value={active.capacity}
                            max={1000}
                            step={50}
                            unit="m³"
                            change={(capacity) =>
                              edit(active.id, { capacity, cost: capacity * 50 })
                            }
                          />
                          <Range
                            label="Controlled outlet"
                            value={active.outlet}
                            max={0.1}
                            step={0.005}
                            unit="m³/s"
                            change={(outlet) => edit(active.id, { outlet })}
                          />
                        </>
                      ) : (
                        <Range
                          label="Patch infiltration"
                          value={active.infiltration}
                          max={100}
                          unit="mm/h"
                          change={(infiltration) => edit(active.id, { infiltration })}
                        />
                      )}
                      <p className="drawer-note">
                        {patchCells(s, cell).length * s.cellSize ** 2} m² capture footprint · $
                        {active.cost.toLocaleString()} hypothetical cost
                      </p>
                    </div>
                  )}
                  <details className="terrain-edit">
                    <summary>Edit terrain elevation</summary>
                    <p className="drawer-note">
                      Changes are hypothetical. Original source values remain recoverable.
                    </p>
                    <div className="button-row">
                      <button
                        className="button compact"
                        disabled={s.edits.length >= 100}
                        onClick={() => update({ edits: [...s.edits, { cell, delta: -0.5 }] })}
                      >
                        −0.5 m
                      </button>
                      <button
                        className="button compact"
                        disabled={s.edits.length >= 100}
                        onClick={() => update({ edits: [...s.edits, { cell, delta: 0.5 }] })}
                      >
                        +0.5 m
                      </button>
                      <button
                        className="text-button"
                        onClick={() => update({ edits: s.edits.filter((e) => e.cell !== cell) })}
                      >
                        Restore cell
                      </button>
                    </div>
                  </details>
                  <button
                    className="button primary full"
                    onClick={() => {
                      setPanel(null);
                      start();
                    }}
                  >
                    Run modified scenario <Play size={15} />
                  </button>
                </>
              )}
              {panel === 'results' && (
                <>
                  {run && frame ? (
                    <>
                      <p className="drawer-note">
                        Simulated estimates · {frame.time / 60} min of {s.duration / 60} min
                      </p>
                      <div className="result-grid">
                        {[
                          ['Rainfall', frame.rainfall],
                          ['Infiltrated', frame.infiltrated],
                          ['Surface water', frame.surface],
                          ['Boundary outflow', frame.outflow],
                          ['Detained water', frame.detention],
                        ].map(([label, v]) => (
                          <div key={label}>
                            <span>{label}</span>
                            <b>
                              {Number(v).toFixed(1)} <small>m³</small>
                            </b>
                          </div>
                        ))}
                        <div>
                          <span>Peak outflow · full run</span>
                          <b>
                            {run.peakOutflow.toFixed(3)} <small>m³/s</small>
                          </b>
                        </div>
                      </div>
                      <div className="result-charts">
                        <Chart runs={[run]} cursor={index} />
                        <Chart
                          runs={[run]}
                          metric="rate"
                          title="Boundary outflow rate"
                          unit="m³/s"
                          cursor={index}
                        />
                      </div>
                      <details>
                        <summary>Water balance table</summary>
                        <table>
                          <tbody>
                            {run.frames
                              .filter((_, i) => i % 5 === 0)
                              .map((f) => (
                                <tr key={f.time}>
                                  <th>{f.time / 60} min</th>
                                  <td>{f.rainfall.toFixed(1)} m³ rain</td>
                                  <td>{f.surface.toFixed(1)} m³ surface</td>
                                  <td>{f.outflow.toFixed(1)} m³ outflow</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </details>
                      <div className="button-row">
                        <Link className="button primary" href="/compare">
                          Compare runs <ArrowUpRight size={15} />
                        </Link>
                        <button
                          className="button"
                          onClick={() => {
                            setPanel('saved');
                          }}
                        >
                          Save scenario <Save size={14} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="drawer-empty">
                      <CloudRain size={30} />
                      <h3>No run yet.</h3>
                      <p>Set a storm, then run the model.</p>
                      <button className="button primary" onClick={() => setPanel('storm')}>
                        Set storm
                      </button>
                    </div>
                  )}
                </>
              )}
              {panel === 'saved' && (
                <>
                  <label className="field">
                    Scenario name
                    <input
                      aria-label="Scenario name"
                      value={name}
                      maxLength={100}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>
                  <button
                    className="button primary full"
                    onClick={() => save(name.trim() || s.name)}
                  >
                    Save scenario <Save size={15} />
                  </button>
                  <div className="button-row file-actions">
                    <button
                      className="button"
                      onClick={() =>
                        download('basin-scenario.json', {
                          scenario: s,
                          ...(run ? { results: run } : {}),
                          classification: s.geographic
                            ? `${s.geographic.provenance.provider} elevation; experimental simulated estimates`
                            : 'Synthetic demonstration data',
                        })
                      }
                    >
                      <Download size={15} />
                      Export
                    </button>
                    <button className="button" onClick={() => input.current?.click()}>
                      <Upload size={15} />
                      Import
                    </button>
                  </div>
                  <input
                    ref={input}
                    hidden
                    type="file"
                    accept="application/json,.json"
                    onChange={(e) => load(e.target.files?.[0])}
                  />
                  {saved.map((v) => (
                    <button
                      className="saved-item"
                      key={v.id}
                      onClick={() => {
                        setScenario(v.scenario);
                        setRun(null);
                        setIndex(0);
                        setPlaying(false);
                        setPanel(null);
                      }}
                    >
                      {v.scenario.name}
                      <ArrowUpRight size={14} />
                    </button>
                  ))}
                  <button
                    className="text-button"
                    onClick={() => {
                      setScenario(structuredClone(DEFAULT));
                      setRun(null);
                      setIndex(0);
                      setPlaying(false);
                      setPanel(null);
                    }}
                  >
                    Restore synthetic defaults
                  </button>
                </>
              )}
              {panel === 'source' && (
                <>
                  {s.geographic ? (
                    <>
                      <span className="source-type">
                        Real elevation · experimental runoff model
                      </span>
                      <h3>{s.geographic.provenance.dataset}</h3>
                      <dl className="source-details">
                        <dt>Provider</dt>
                        <dd>{s.geographic.provenance.provider}</dd>
                        <dt>Retrieved</dt>
                        <dd>{s.geographic.provenance.retrievedAt}</dd>
                        <dt>Grid</dt>
                        <dd>
                          {s.size} × {s.size}, {s.cellSize} m cells
                        </dd>
                        <dt>Horizontal reference</dt>
                        <dd>{s.geographic.crs}</dd>
                        <dt>Vertical reference</dt>
                        <dd>{s.geographic.provenance.verticalDatum}</dd>
                        <dt>Processing</dt>
                        <dd>{s.geographic.provenance.processing}</dd>
                        <dt>Source resolution</dt>
                        <dd>{s.geographic.provenance.resolution}</dd>
                        <dt>Usage</dt>
                        <dd>{s.geographic.provenance.license}</dd>
                      </dl>
                      <p className="drawer-note">{s.geographic.provenance.limitations}</p>
                      <a
                        className="text-link"
                        href={s.geographic.provenance.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Original elevation request ↗
                      </a>
                    </>
                  ) : (
                    <>
                      <h3>Synthetic demonstration terrain</h3>
                      <p className="drawer-note">
                        Deterministic generated elevation. This is not a real location or a
                        Hurricane Harvey reconstruction.
                      </p>
                      <Link className="button primary" href="/earth">
                        Choose a real place <ArrowUpRight size={15} />
                      </Link>
                    </>
                  )}
                  <p className="drawer-note">
                    {s.edits.length} hypothetical elevation edits. Real elevation does not validate
                    the hydrological model.
                  </p>
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
