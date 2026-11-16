'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Save,
  ChevronDown,
  ChevronRight,
  Layers,
  CloudRain,
  Droplets,
  Plus,
  X,
  SlidersHorizontal,
  Focus,
  ArrowUpRight,
  Check,
  Info,
} from 'lucide-react';
import { useBasin, download } from '@/components/provider';
import Terrain from '@/components/terrain-view';
import { Chart } from '@/components/chart';
import {
  DEFAULT,
  simulate,
  terrain,
  validateScenario,
  makeIntervention,
  patchCells,
  type Scenario,
} from '@/engine/model';
import { disclaimer } from '@/components/shell';
function Section({
  title,
  icon: Icon,
  children,
  open = true,
}: {
  title: string;
  icon: typeof Layers;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details className="control-section" open={open}>
      <summary>
        <Icon size={15} />
        {title}
        <ChevronDown size={13} />
      </summary>
      <div className="section-body">{children}</div>
    </details>
  );
}
function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 200,
  step = 1,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit: string;
}) {
  return (
    <label className="slider-label">
      <span>
        {label}
        <b className="mono">
          {value} <small>{unit}</small>
        </b>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
    </label>
  );
}
export default function Lab() {
  const { scenario: s, setScenario, run, setRun, saved, save, notify } = useBasin();
  const [index, setIndex] = useState(0),
    [playing, setPlaying] = useState(false),
    [busy, setBusy] = useState(false),
    [selected, setSelected] = useState(420),
    [view, setView] = useState<'iso' | 'top' | '2d'>('iso'),
    [cameraKey, setCameraKey] = useState(0),
    [water, setWater] = useState(true),
    [wire, setWire] = useState(false),
    [controls, setControls] = useState(false),
    [speed, setSpeed] = useState(1),
    [name, setName] = useState('Baseline'),
    [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const z = useMemo(() => terrain(s), [s]),
    frame = run?.frames[Math.min(index, run.frames.length - 1)],
    last = run?.frames.at(-1);
  const cell = Math.min(selected, s.size * s.size - 1),
    active = s.interventions.find((i) => i.cell === cell);
  function update(patch: Partial<Scenario>) {
    setScenario({ ...s, ...patch });
    setRun(null);
    setIndex(0);
    setPlaying(false);
    setError('');
  }
  useEffect(() => {
    if (!playing || !run) return;
    const id = setInterval(() => {
      setIndex((i) => {
        if (i >= run.frames.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 250 / speed);
    return () => clearInterval(id);
  }, [playing, run, speed]);
  function start() {
    if (run) {
      if (index >= run.frames.length - 1) setIndex(0);
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
  function add(kind: 'detention' | 'permeable') {
    if (s.interventions.length >= 12) {
      notify('A scenario supports up to 12 interventions.');
      return;
    }
    if (s.interventions.some((i) => i.kind === kind && i.cell === cell)) {
      notify('This cell already has that intervention. Edit it in the inspector.');
      return;
    }
    update({ interventions: [...s.interventions, makeIntervention(s, cell, kind)] });
    notify(
      `${kind === 'detention' ? 'Detention' : 'Permeable patch'} added at cell ${cell}. Run to calculate its effect.`,
    );
  }
  async function load(file?: File) {
    if (!file) return;
    try {
      if (file.size > 10000000) throw Error('Scenario file exceeds 10 MB.');
      const data = JSON.parse(await file.text());
      setScenario(validateScenario(data.scenario ?? data));
      setRun(null);
      setIndex(0);
      setPlaying(false);
      notify('Scenario imported. Run to compute results.');
    } catch (e) {
      setError((e as Error).message);
    }
    if (input.current) input.current.value = '';
  }
  return (
    <main id="main" className="lab">
      <div className="workspace-bar">
        <div>
          <span className="eyebrow">THE SIMULATION LABORATORY</span>
          <h1>
            {s.name}
            <span className="badge">SYNTHETIC</span>
          </h1>
        </div>
        <div className="workspace-actions">
          <button className="button ghost compact" onClick={() => input.current?.click()}>
            <Upload size={14} />
            <span>Import</span>
          </button>
          <input
            type="file"
            hidden
            accept="application/json,.json"
            ref={input}
            onChange={(e) => load(e.target.files?.[0])}
          />
          <button
            className="button ghost compact"
            onClick={() =>
              download('basin-scenario.json', {
                scenario: s,
                ...(run ? { results: run } : {}),
                dataClassification:
                  'Synthetic demonstration data; outputs are simulated estimates.',
              })
            }
          >
            <Download size={14} />
            <span>Export</span>
          </button>
          <Link href="/compare" className="button compact">
            Compare runs <ArrowUpRight size={15} />
          </Link>
          <button
            className="icon-button mobile-controls"
            onClick={() => setControls(!controls)}
            aria-expanded={controls}
            aria-label="Toggle model controls"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <div className="lab-grid">
        <aside className={`controls ${controls ? 'visible' : ''}`} aria-label="Model parameters">
          <div className="panel-heading">
            <span className="mono">SCENARIO SETTINGS</span>
            <button
              className="icon-button mobile-controls"
              onClick={() => setControls(false)}
              aria-label="Close controls"
            >
              <X size={16} />
            </button>
          </div>
          <Section title="Landscape" icon={Layers}>
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
            <div className="field-pair">
              <label className="field">
                Grid
                <select
                  value={s.size}
                  onChange={(e) => {
                    setSelected(0);
                    update({ size: +e.target.value, interventions: [], edits: [] });
                  }}
                >
                  <option value="16">16 × 16</option>
                  <option value="24">24 × 24</option>
                  <option value="32">32 × 32</option>
                </select>
              </label>
              <label className="field">
                Seed
                <input
                  aria-label="Terrain seed"
                  type="number"
                  min="0"
                  max="4294967295"
                  value={s.seed}
                  onChange={(e) =>
                    update({ seed: Math.max(0, Math.min(4294967295, +e.target.value)) })
                  }
                />
              </label>
            </div>
            <span className="tiny mono">
              {s.size * s.cellSize} × {s.size * s.cellSize} m · {s.cellSize} m / CELL
            </span>
          </Section>
          <Section title="Rainfall" icon={CloudRain}>
            <label className="field">
              Storm profile
              <select
                value={s.profile}
                onChange={(e) => update({ profile: e.target.value as Scenario['profile'] })}
              >
                <option value="constant">Constant intensity</option>
                <option value="pulse">Short intense pulse</option>
                <option value="custom">Editable hyetograph</option>
              </select>
            </label>
            <div className="preset-row">
              <button onClick={() => update({ rain: 100, duration: 1800, profile: 'pulse' })}>
                Intense · 30m
              </button>
              <button onClick={() => update({ rain: 15, duration: 7200, profile: 'constant' })}>
                Gentle · 2h
              </button>
            </div>
            {s.profile !== 'custom' ? (
              <Slider
                label={s.profile === 'pulse' ? 'Peak rainfall' : 'Rainfall intensity'}
                value={s.rain}
                unit="mm/h"
                onChange={(rain) => update({ rain })}
              />
            ) : (
              <div className="rain-bins">
                {s.customRain.map((r, i) => (
                  <label key={i}>
                    <span>{i + 1}</span>
                    <input
                      aria-label={`Rainfall bin ${i + 1} mm per hour`}
                      type="number"
                      min="0"
                      max="200"
                      value={r}
                      onChange={(e) =>
                        update({
                          customRain: s.customRain.map((v, k) =>
                            k === i ? Math.max(0, Math.min(200, +e.target.value)) : v,
                          ),
                        })
                      }
                    />
                  </label>
                ))}
                <small>Six equal-duration bins · mm/h</small>
              </div>
            )}
            <Slider
              label="Duration"
              min={5}
              max={120}
              step={5}
              value={s.duration / 60}
              unit="min"
              onChange={(v) => update({ duration: v * 60 })}
            />
            <p className="control-note">
              Illustrative storms. No historical rainfall observations.
            </p>
          </Section>
          <Section title="Soil & boundaries" icon={Droplets}>
            <label className="field">
              Infiltration preset
              <select
                value={[0, 5, 15, 40].includes(s.infiltration) ? s.infiltration : 'custom'}
                onChange={(e) => {
                  if (e.target.value !== 'custom') update({ infiltration: +e.target.value });
                }}
              >
                <option value="0">Impermeable · 0 mm/h</option>
                <option value="5">Low · 5 mm/h</option>
                <option value="15">Moderate · 15 mm/h</option>
                <option value="40">High · 40 mm/h</option>
                <option value="custom">Custom capacity</option>
              </select>
            </label>
            <Slider
              label="Infiltration capacity"
              value={s.infiltration}
              unit="mm/h"
              max={100}
              onChange={(infiltration) => update({ infiltration })}
            />
            <label className="field">
              Boundary condition
              <select
                value={s.boundary}
                onChange={(e) => update({ boundary: e.target.value as Scenario['boundary'] })}
              >
                <option value="open">Open · free perimeter drainage</option>
                <option value="closed">Closed · retain water</option>
              </select>
            </label>
            <p className="control-note">Capacity values are illustrative assumptions.</p>
          </Section>
          <Section title="Interventions" icon={Plus}>
            <p className="control-note">
              Select a cell in the terrain or inspector, then add a hypothetical intervention.
            </p>
            <button className="intervention-button" onClick={() => add('detention')}>
              <span className="intervention-icon">▱</span>
              <span>
                Detention basin<small>Capture surface water</small>
              </span>
              <Plus size={15} />
            </button>
            <button className="intervention-button" onClick={() => add('permeable')}>
              <span className="intervention-icon green">▦</span>
              <span>
                Permeable patch<small>Increase local infiltration</small>
              </span>
              <Plus size={15} />
            </button>
            {s.interventions.length > 0 && (
              <div className="intervention-list">
                {s.interventions.map((it) => (
                  <div key={it.id}>
                    <button onClick={() => setSelected(it.cell)}>
                      {it.kind} · cell {it.cell}
                    </button>
                    <button
                      aria-label={`Remove ${it.kind} at ${it.cell}`}
                      onClick={() =>
                        update({ interventions: s.interventions.filter((i) => i.id !== it.id) })
                      }
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="tiny">All costs are hypothetical planning assumptions.</p>
          </Section>
          <Section title="Saved scenarios" icon={Save} open={false}>
            <label className="field">
              Save as
              <input maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <button className="button compact full" onClick={() => save(name.trim() || s.name)}>
              <Save size={14} />
              Save scenario
            </button>
            {saved.map((v) => (
              <button
                className="saved-item"
                key={v.id}
                onClick={() => {
                  setScenario(v.scenario);
                  setRun(null);
                  setIndex(0);
                  setPlaying(false);
                }}
              >
                {v.scenario.name}
                <ChevronRight size={12} />
              </button>
            ))}
          </Section>
        </aside>
        <section className="stage-column">
          <div className="terrain-stage">
            <div className="stage-heading mono">
              <span>
                <i className="status-dot" />{' '}
                {busy
                  ? 'COMPUTING'
                  : playing
                    ? 'PLAYING COMPUTED RUN'
                    : run
                      ? 'COMPUTED RUN'
                      : 'READY TO SIMULATE'}
              </span>
              <span>EXPERIMENTAL MODEL</span>
            </div>
            <Terrain
              scenario={s}
              frame={frame}
              selected={cell}
              onSelect={setSelected}
              view={view}
              cameraKey={cameraKey}
              water={water}
              wire={wire}
            />
            <div className="view-tools" role="group" aria-label="Camera view">
              {(['iso', 'top', '2d'] as const).map((v) => (
                <button key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)}>
                  {v === 'iso' ? '3D' : v === 'top' ? 'Top' : '2D'}
                </button>
              ))}
              <button onClick={() => setCameraKey((k) => k + 1)} aria-label="Reset camera">
                <Focus size={15} />
              </button>
            </div>
            <div className="terrain-caption">
              <span className="mono">
                {s.size * s.cellSize} m <span className="scale-line" />
              </span>
              <span>Light terrain = higher · Drag to orbit · scroll to zoom</span>
            </div>
            <div className="depth-legend">
              <span className="mono">WATER DEPTH · m</span>
              <i />
              <span>
                0 <span>0.125</span> ≥ 0.25
              </span>
            </div>
            <div className="layer-switches">
              <label>
                <input
                  type="checkbox"
                  checked={water}
                  onChange={(e) => setWater(e.target.checked)}
                />{' '}
                Water
              </label>
              <label>
                <input type="checkbox" checked={wire} onChange={(e) => setWire(e.target.checked)} />{' '}
                Grid
              </label>
            </div>
          </div>
          <div className="playback">
            <button
              className="run-button"
              disabled={busy}
              onClick={() => (playing ? setPlaying(false) : start())}
            >
              {playing ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
              {busy ? 'Computing…' : playing ? 'Pause' : run ? 'Play' : 'Run simulation'}
            </button>
            <button
              className="icon-button"
              aria-label="Reset simulation"
              onClick={() => {
                setPlaying(false);
                setRun(null);
                setIndex(0);
              }}
            >
              <RotateCcw size={15} />
            </button>
            <input
              type="range"
              aria-label="Simulation timeline"
              min="0"
              max={run ? run.frames.length - 1 : 60}
              value={index}
              disabled={!run}
              onChange={(e) => {
                setIndex(+e.target.value);
                setPlaying(false);
              }}
            />
            <span className="time mono">
              {((frame?.time ?? 0) / 60).toFixed(0).padStart(2, '0')}
              <small> / {s.duration / 60} min</small>
            </span>
            <select
              aria-label="Playback speed"
              value={speed}
              onChange={(e) => setSpeed(+e.target.value)}
            >
              <option value="1">1×</option>
              <option value="2">2×</option>
              <option value="4">4×</option>
            </select>
          </div>
          <div className="analysis">
            <div className="analysis-heading">
              <h2>Follow the water</h2>
              <span className="tiny mono">SIMULATED ESTIMATES</span>
            </div>
            <div className="metric-strip">
              {[
                ['Rainfall input', frame?.rainfall, 'm³'],
                ['Surface storage', frame?.surface, 'm³'],
                ['Infiltrated', frame?.infiltrated, 'm³'],
                ['Boundary outflow', frame?.outflow, 'm³'],
              ].map(([label, value, unit]) => (
                <div key={String(label)}>
                  <span>{label}</span>
                  <b className="mono">
                    {typeof value === 'number' ? value.toFixed(1) : '—'}
                    <small>{unit}</small>
                  </b>
                </div>
              ))}
            </div>
            {run ? (
              <div className="chart-pair">
                <Chart runs={[run]} cursor={index} />
                <Chart
                  runs={[run]}
                  metric="rate"
                  title="Boundary outflow rate"
                  unit="m³/s"
                  cursor={index}
                />
              </div>
            ) : (
              <div className="chart-empty">
                <CloudRain size={21} />
                <span>
                  Your landscape is ready.
                  <small>Run a storm to calculate storage, infiltration, and outflow.</small>
                </span>
              </div>
            )}
            <div
              className={`mass-check ${frame && Math.abs(frame.residual) > 1e-7 ? 'warning' : ''}`}
            >
              <Check size={14} />
              <span>Mass balance {frame ? 'accounted' : 'awaiting simulation'}</span>
              <b className="mono">
                {frame ? `${frame.residual.toExponential(2)} m³ residual` : '—'}
              </b>
              <Link href="/methodology#conservation">
                View equation <ArrowUpRight size={11} />
              </Link>
            </div>
          </div>
        </section>
        <aside className="inspector">
          <div className="panel-heading mono">
            CELL INSPECTOR <span className="amber-dot" />
          </div>
          <div className="inspector-body">
            <span className="eyebrow">SELECTED LOCATION</span>
            <h2>Cell {cell.toString().padStart(3, '0')}</h2>
            <label className="field">
              Select cell number
              <input
                aria-label="Selected cell"
                type="number"
                min="0"
                max={s.size * s.size - 1}
                value={cell}
                onChange={(e) =>
                  setSelected(
                    Math.max(0, Math.min(s.size * s.size - 1, Math.floor(+e.target.value))),
                  )
                }
              />
            </label>
            <div className="data-list">
              <div>
                <span>Grid position</span>
                <b className="mono">
                  {cell % s.size}, {Math.floor(cell / s.size)}
                </b>
              </div>
              <div>
                <span>Elevation</span>
                <b className="mono">{z[cell].toFixed(2)} m</b>
              </div>
              <div>
                <span>Water depth</span>
                <b className="mono blue">{(frame?.depths[cell] ?? 0).toFixed(4)} m</b>
              </div>
              <div>
                <span>Cell area</span>
                <b className="mono">{s.cellSize ** 2} m²</b>
              </div>
            </div>
            <div className="inspector-sub">
              <span className="eyebrow">TERRAIN EDITING</span>
              <p className="tiny">Change the selected cell elevation.</p>
              <div className="preset-row">
                <button
                  disabled={s.edits.length >= 100}
                  onClick={() => update({ edits: [...s.edits, { cell, delta: -0.5 }] })}
                >
                  −0.5 m
                </button>
                <button
                  disabled={s.edits.length >= 100}
                  onClick={() => update({ edits: [...s.edits, { cell, delta: 0.5 }] })}
                >
                  +0.5 m
                </button>
              </div>
              <button
                className="text-button"
                onClick={() => update({ edits: s.edits.filter((e) => e.cell !== cell) })}
              >
                Restore cell elevation
              </button>
            </div>
            {active ? (
              <div className="inspector-sub">
                <span className="eyebrow">HYPOTHETICAL INTERVENTION</span>
                <h3>{active.kind === 'detention' ? 'Detention basin' : 'Permeable patch'}</h3>
                {active.kind === 'detention' ? (
                  <>
                    <Slider
                      label="Storage capacity"
                      value={active.capacity}
                      max={1000}
                      step={50}
                      unit="m³"
                      onChange={(capacity) =>
                        update({
                          interventions: s.interventions.map((i) =>
                            i.id === active.id ? { ...i, capacity, cost: capacity * 50 } : i,
                          ),
                        })
                      }
                    />
                    <Slider
                      label="Controlled outlet"
                      value={active.outlet}
                      max={0.1}
                      step={0.005}
                      unit="m³/s"
                      onChange={(outlet) =>
                        update({
                          interventions: s.interventions.map((i) =>
                            i.id === active.id ? { ...i, outlet } : i,
                          ),
                        })
                      }
                    />
                    <div className="data-list">
                      <div>
                        <span>Currently detained</span>
                        <b className="mono">
                          {(frame?.detentionVolumes[s.interventions.indexOf(active)] ?? 0).toFixed(
                            1,
                          )}{' '}
                          m³
                        </b>
                      </div>
                    </div>
                  </>
                ) : (
                  <Slider
                    label="Patch infiltration"
                    value={active.infiltration}
                    max={100}
                    unit="mm/h"
                    onChange={(infiltration) =>
                      update({
                        interventions: s.interventions.map((i) =>
                          i.id === active.id ? { ...i, infiltration } : i,
                        ),
                      })
                    }
                  />
                )}
                <p className="tiny">
                  Footprint: {patchCells(s, cell).length * s.cellSize ** 2} m²
                  <br />
                  Illustrative cost: ${active.cost.toLocaleString()}
                </p>
                <button
                  className="text-button"
                  onClick={() =>
                    update({ interventions: s.interventions.filter((i) => i.id !== active.id) })
                  }
                >
                  Remove intervention
                </button>
              </div>
            ) : (
              <div className="inspector-tip">
                <Plus size={18} />
                <p>
                  A small change.
                  <br />A testable difference.
                </p>
                <span className="tiny">Add detention or permeability using the controls.</span>
              </div>
            )}
            <div className="inspector-sub">
              <span className="eyebrow">RUN SUMMARY</span>
              <div className="data-list">
                <div>
                  <span>Peak outflow</span>
                  <b className="mono">{run?.peakOutflow.toFixed(3) ?? '—'} m³/s</b>
                </div>
                <div>
                  <span>Maximum depth</span>
                  <b className="mono">{run?.maxDepth.toFixed(3) ?? '—'} m</b>
                </div>
                <div>
                  <span>Final detention</span>
                  <b className="mono">{last?.detention.toFixed(1) ?? '—'} m³</b>
                </div>
              </div>
              <label className="field">
                Scenario name
                <input
                  aria-label="Scenario name"
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <button className="button full compact" onClick={() => save(name.trim() || s.name)}>
                <Save size={13} />
                Save scenario
              </button>
            </div>
            <button
              className="text-button"
              onClick={() => {
                setScenario(structuredClone(DEFAULT));
                setRun(null);
                setPlaying(false);
                setIndex(0);
                setSelected(420);
              }}
            >
              Restore all defaults
            </button>
          </div>
        </aside>
      </div>
      <div className="lab-disclaimer">
        <Info size={14} />
        <p>{disclaimer}</p>
        <Link href="/methodology">
          Methods <ArrowUpRight size={12} />
        </Link>
      </div>
    </main>
  );
}
