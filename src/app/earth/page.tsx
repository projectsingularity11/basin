'use client';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowRight, ArrowUpRight, LocateFixed, LoaderCircle, X } from 'lucide-react';
import { useBasin } from '@/components/provider';
import { DEFAULT } from '@/engine/model';
import type { Place, GeographicTerrain } from '@/lib/geo/contracts';
const Map = dynamic(() => import('@/components/earth-map'), {
  ssr: false,
  loading: () => <div className="map-loading">Loading map…</div>,
});
export default function Earth() {
  const router = useRouter(),
    { setScenario, setRun } = useBasin(),
    [center, setCenter] = useState<[number, number]>([-95.4187924, 30.0795707]),
    [name, setName] = useState('Spring, Texas'),
    [query, setQuery] = useState(''),
    [places, setPlaces] = useState<Place[]>([]),
    [side, setSide] = useState(480),
    [size, setSize] = useState(24),
    [searching, setSearching] = useState(false),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(''),
    [mapError, setMapError] = useState('');
  const request = useRef<AbortController | null>(null),
    searchRequest = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      request.current?.abort();
      searchRequest.current?.abort();
    },
    [],
  );
  function choose(c: [number, number], label?: string) {
    request.current?.abort();
    setLoading(false);
    setCenter(c);
    setName(label || `${c[1].toFixed(4)}, ${c[0].toFixed(4)}`);
    setError('');
    setPlaces([]);
  }
  async function search(e: React.FormEvent) {
    e.preventDefault();
    searchRequest.current?.abort();
    const controller = new AbortController();
    searchRequest.current = controller;
    setSearching(true);
    setError('');
    try {
      const res = await fetch('/api/places?q=' + encodeURIComponent(query), {
        signal: controller.signal,
      });
      const body = await res.json();
      if (!res.ok) throw Error(body.error.message);
      setPlaces(body.data);
      if (!body.data.length) setError('No places found. Try another name or enter coordinates.');
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError((e as Error).message);
    } finally {
      if (searchRequest.current === controller) setSearching(false);
    }
  }
  async function load() {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        '/api/elevation?' +
          new URLSearchParams({
            lon: String(center[0]),
            lat: String(center[1]),
            side: String(side),
            size: String(size),
            name: name.slice(0, 100),
          }),
        { signal: controller.signal },
      );
      const body = await res.json();
      if (!res.ok) throw Error(body.error.message);
      const g = body.data as GeographicTerrain;
      setScenario({
        ...DEFAULT,
        name: g.name,
        size: g.size,
        cellSize: g.cellSize,
        geographic: g,
        interventions: [],
        edits: [],
      });
      setRun(null);
      router.push('/lab');
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError((e as Error).message);
    } finally {
      if (request.current === controller) setLoading(false);
    }
  }
  return (
    <main id="main" className="earth-page">
      <Map center={center} side={side} onSelect={choose} onError={setMapError} />
      <div className="earth-heading">
        <span className="step-label">1. Place</span>
        <h1>
          Where are
          <br />
          we testing?
        </h1>
        <p>Search, then click the map to position your region.</p>
        <form onSubmit={search} className="place-search">
          <Search size={18} />
          <input
            aria-label="Search for a place"
            placeholder="City, address, or landmark"
            minLength={3}
            maxLength={120}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
          <button aria-label="Search" disabled={searching}>
            {searching ? <LoaderCircle className="spin" size={18} /> : <ArrowRight size={18} />}
          </button>
        </form>
        {places.length > 0 && (
          <div className="place-results">
            {places.map((p, i) => (
              <button key={i} onClick={() => choose([p.longitude, p.latitude], p.name)}>
                <LocateFixed size={14} />
                {p.name}
                <ArrowUpRight size={13} />
              </button>
            ))}
          </div>
        )}
      </div>
      <section className="region-card">
        <div className="region-card-title">
          <LocateFixed size={17} />
          <h2>{name}</h2>
        </div>
        <div className="coordinate-fields">
          <label>
            Latitude
            <input
              aria-label="Latitude"
              type="number"
              step=".0001"
              value={center[1]}
              onChange={(e) => choose([center[0], +e.target.value])}
            />
          </label>
          <label>
            Longitude
            <input
              aria-label="Longitude"
              type="number"
              step=".0001"
              value={center[0]}
              onChange={(e) => choose([+e.target.value, center[1]])}
            />
          </label>
        </div>
        <div className="region-options">
          <label>
            Region width
            <select
              aria-label="Region width"
              value={side}
              onChange={(e) => {
                request.current?.abort();
                setLoading(false);
                setSide(+e.target.value);
              }}
            >
              <option value={240}>240 m</option>
              <option value={480}>480 m</option>
              <option value={960}>960 m</option>
            </select>
          </label>
          <label>
            Model grid
            <select
              aria-label="Elevation grid"
              value={size}
              onChange={(e) => {
                request.current?.abort();
                setLoading(false);
                setSize(+e.target.value);
              }}
            >
              <option value={24}>24 × 24</option>
              <option value={32}>32 × 32</option>
            </select>
          </label>
        </div>
        <p className="region-detail">
          {side / size} m output cells · USGS 3DEP
          <br />
          U.S. coverage · source resolution varies
        </p>
        {error && (
          <div role="alert" className="geo-error">
            {error}
          </div>
        )}
        {loading ? (
          <div className="elevation-loading">
            <LoaderCircle size={16} className="spin" />
            Retrieving elevation…
            <button
              aria-label="Cancel elevation request"
              onClick={() => {
                request.current?.abort();
                setLoading(false);
              }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button className="button primary full" onClick={load}>
            Load terrain <ArrowRight size={17} />
          </button>
        )}
        <Link
          className="synthetic-link"
          href="/lab"
          onClick={() => {
            setScenario(structuredClone(DEFAULT));
            setRun(null);
          }}
        >
          Use synthetic demo instead
        </Link>
      </section>
      <div className="map-caption">
        Click to move region. Drag to explore.{mapError && <p>{mapError}</p>}
      </div>
      <a
        className="map-data-link"
        href="https://www.usgs.gov/3d-elevation-program"
        target="_blank"
        rel="noreferrer"
      >
        Elevation: USGS 3DEP ↗
      </a>
    </main>
  );
}
