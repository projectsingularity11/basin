'use client';
import { useRef, useEffect } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map as MapType } from 'maplibre-gl';
import { gridBounds } from '@/lib/geo/grid';
export default function EarthMap({
  center,
  side,
  onSelect,
  onError,
}: {
  center: [number, number];
  side: number;
  onSelect: (c: [number, number]) => void;
  onError: (s: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null),
    map = useRef<MapType | null>(null),
    select = useRef(onSelect),
    error = useRef(onError);
  useEffect(() => {
    select.current = onSelect;
    error.current = onError;
  }, [onSelect, onError]);
  useEffect(() => {
    if (!host.current) return;
    let m: MapType;
    try {
      maplibregl.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');
      m = new maplibregl.Map({
        container: host.current,
        style: 'https://tiles.openfreemap.org/styles/dark',
        center: [-95.4187924, 30.0795707],
        zoom: 13,
        pitch: 35,
        maxPitch: 60,
        attributionControl: { compact: true },
      });
    } catch {
      error.current(
        'The interactive map needs WebGL. Coordinates and elevation retrieval below remain available.',
      );
      return;
    }
    map.current = m;
    m.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');
    m.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');
    m.on('idle', () => {
      const count = m.queryRenderedFeatures().filter((f) => f.source !== 'selection').length;
      if (host.current) host.current.dataset.mapFeatures = String(count);
      if (count > 0) error.current('');
    });
    m.on('click', (e) => select.current([e.lngLat.lng, e.lngLat.lat]));
    m.on('error', () =>
      error.current(
        'Some map tiles could not load. You can still select a location by search or coordinates.',
      ),
    );
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    let polygon: number[][];
    try {
      polygon = gridBounds(...center, side).polygon;
    } catch {
      return;
    }
    const draw = () => {
      const data: GeoJSON.Feature<GeoJSON.Polygon> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [polygon],
        },
      };
      const source = m.getSource('selection') as maplibregl.GeoJSONSource | undefined;
      if (source) source.setData(data);
      else {
        m.addSource('selection', { type: 'geojson', data });
        m.addLayer({
          id: 'selection-fill',
          type: 'fill',
          source: 'selection',
          paint: { 'fill-color': '#a6f2d4', 'fill-opacity': 0.16 },
        });
        m.addLayer({
          id: 'selection-line',
          type: 'line',
          source: 'selection',
          paint: { 'line-color': '#bafbe0', 'line-width': 2 },
        });
      }
      m.easeTo({ center, duration: 600, zoom: Math.max(m.getZoom(), 13) });
    };
    if (m.isStyleLoaded()) draw();
    else m.once('load', draw);
    return () => {
      m.off('load', draw);
    };
  }, [center, side]);
  return (
    <div
      ref={host}
      className="earth-map"
      aria-label="Map. Click to center the selected elevation region."
      role="region"
    />
  );
}
