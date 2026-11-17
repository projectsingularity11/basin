'use client';
import { useState } from 'react';
import { FlaskConical, Plus, Download, Trash2 } from 'lucide-react';
import { useBasin, download } from '@/components/provider';
import { useLocalArray } from '@/lib/local-store';
import { Footer } from '@/components/shell';
import { simulate, type Run } from '@/engine/model';
type Experiment = {
  id: string;
  name: string;
  geometry: string;
  area: number;
  input: number;
  duration: number;
  initial: string;
  output: number;
  timing: number;
  uncertainty: string;
  notes: string;
  source: string;
};
const blank = {
  name: '',
  geometry: '',
  area: 0,
  input: 0,
  duration: 0,
  initial: '',
  output: 0,
  timing: 0,
  uncertainty: '',
  notes: '',
  source: '',
};
function validExperiment(value: unknown): Experiment {
  if (!value || typeof value !== 'object') throw Error();
  const r = value as Experiment;
  if (
    typeof r.name !== 'string' ||
    ['geometry', 'initial', 'uncertainty', 'notes', 'source', 'id'].some(
      (k) => typeof r[k as keyof Experiment] !== 'string',
    ) ||
    [r.area, r.input, r.duration, r.output, r.timing].some((x) => !Number.isFinite(x) || x < 0) ||
    r.area === 0 ||
    r.duration === 0
  )
    throw Error();
  return r;
}
export default function Experiments() {
  const { scenario, notify } = useBasin(),
    [form, setForm] = useState(blank),
    [show, setShow] = useState(false),
    [model, setModel] = useState<Run | null>(null),
    [error, setError] = useState('');
  const {
    records,
    error: storageError,
    persist: writeRecords,
  } = useLocalArray('basin-experiments', validExperiment);
  function persist(next: Experiment[]) {
    try {
      writeRecords(next);
      return true;
    } catch {
      setError('Browser storage is unavailable. Export records before leaving.');
      return false;
    }
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.name.trim() ||
      !form.geometry.trim() ||
      !form.source.trim() ||
      form.area <= 0 ||
      form.duration <= 0
    ) {
      setError('Name, geometry, positive area and duration, and provenance are required.');
      return;
    }
    if (!persist([...records, { ...form, id: crypto.randomUUID() }])) return;
    setForm(blank);
    setShow(false);
    notify('User-entered measurement saved locally. It has not been independently verified.');
  }
  return (
    <main id="main">
      <section className="page-heading">
        <div className="eyebrow">07 / EXPERIMENT VALIDATION</div>
        <h1>
          Bring the model
          <br />
          <span>back to the bench.</span>
        </h1>
        <p>
          Record measurements. Preserve provenance.
          <br />
          Find out where the model disagrees with the world.
        </p>
      </section>
      <section className="content-width">
        <div className="section-toolbar">
          <div>
            <h2>Experiment records</h2>
            <span className="tiny">
              Local to this browser · user-entered measurements · independently unverified
            </span>
          </div>
          <div className="button-row">
            <button
              className="button ghost compact"
              disabled={!records.length}
              onClick={() => download('basin-experiments.json', records)}
            >
              <Download size={14} />
              Export records
            </button>
            <button className="button primary compact" onClick={() => setShow(!show)}>
              <Plus size={15} />
              {show ? 'Close form' : 'Add record'}
            </button>
          </div>
        </div>
        {(error || storageError) && (
          <p role="alert" className="error">
            {error || storageError}
          </p>
        )}
        {show && (
          <form className="experiment-form" onSubmit={submit}>
            {[
              ['name', 'Experiment name'],
              ['geometry', 'Watershed geometry description'],
              ['initial', 'Initial conditions'],
              ['uncertainty', 'Measurement uncertainty (with units)'],
              ['source', 'Source / provenance'],
              ['notes', 'Notes'],
            ].map(([key, label]) => (
              <label className="field" key={key}>
                {label}
                <input
                  required={['name', 'geometry', 'source'].includes(key)}
                  maxLength={2000}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
            {[
              ['area', 'Catchment area · m²', 0.000001],
              ['input', 'Water input · m³', 0],
              ['duration', 'Input duration · s', 1],
              ['output', 'Measured outflow volume · m³', 0],
              ['timing', 'Measured peak-runoff time · s', 0],
            ].map(([key, label, min]) => (
              <label className="field" key={key}>
                {label}
                <input
                  type="number"
                  required
                  min={min}
                  step="any"
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: +e.target.value })}
                />
              </label>
            ))}
            <button className="button primary" type="submit">
              Save measurement
            </button>
          </form>
        )}
        {records.length === 0 ? (
          <div className="empty-state">
            <FlaskConical size={38} />
            <h2>No experimental results. Yet.</h2>
            <p>
              There are no real measurements preloaded in BASIN.
              <br />
              Start with a measured catchment, a known water input, and repeatable outflow
              collection. Add your first record when evidence is available.
            </p>
            <span className="badge amber">PHYSICAL VALIDATION IS PLANNED</span>
          </div>
        ) : (
          <div className="experiment-records">
            {records.map((r) => (
              <article key={r.id}>
                <div>
                  <h3>{r.name}</h3>
                  <button
                    className="icon-button"
                    aria-label={`Delete experiment ${r.name}`}
                    onClick={() => persist(records.filter((i) => i.id !== r.id))}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <p>{r.geometry}</p>
                <dl>
                  <div>
                    <dt>Input</dt>
                    <dd>
                      {r.input} m³ / {r.duration} s
                    </dd>
                  </div>
                  <div>
                    <dt>Area</dt>
                    <dd>{r.area} m²</dd>
                  </div>
                  <div>
                    <dt>Measured outflow</dt>
                    <dd>{r.output} m³</dd>
                  </div>
                  <div>
                    <dt>Peak-runoff time</dt>
                    <dd>{r.timing} s</dd>
                  </div>
                  <div>
                    <dt>Uncertainty</dt>
                    <dd>{r.uncertainty || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt>Initial state</dt>
                    <dd>{r.initial || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt>Provenance</dt>
                    <dd>{r.source}</dd>
                  </div>
                </dl>
                {r.notes && <p>{r.notes}</p>}
                {model && (
                  <div className="comparison-status">
                    <p>
                      Measured outflow / input:{' '}
                      {r.input > 0 ? (r.output / r.input).toFixed(3) : 'undefined (zero input)'}
                      <br />
                      Current model outflow / rainfall:{' '}
                      {model.frames.at(-1)!.rainfall > 0
                        ? (model.frames.at(-1)!.outflow / model.frames.at(-1)!.rainfall).toFixed(3)
                        : 'undefined (zero rain)'}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
        <div className="text-callout">
          <h3>Compare carefully.</h3>
          <p>
            Run the current lab scenario to view its outflow-to-input ratio alongside your
            measurements. This normalized comparison does not align geometry, soil, rainfall
            distribution, or time scale, and cannot establish validation. Model initial storage is
            zero. Do not infer a fit without matching the physical setup and uncertainty.
          </p>
          <button
            className="button compact"
            onClick={() => {
              try {
                setModel(simulate(scenario));
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            Compute current model ratio
          </button>
          {model && (
            <p className="mono">
              Model outflow / rainfall:{' '}
              {model.frames.at(-1)!.rainfall > 0
                ? (model.frames.at(-1)!.outflow / model.frames.at(-1)!.rainfall).toFixed(4)
                : 'undefined (zero rainfall)'}
            </p>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
