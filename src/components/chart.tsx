'use client';
import { useState } from 'react';
import type { Run, Frame } from '@/engine/model';
export function Chart({
  runs,
  metric = 'surface',
  title = 'Surface storage',
  unit = 'm³',
  cursor,
}: {
  runs: Run[];
  metric?: keyof Pick<Frame, 'surface' | 'outflow' | 'infiltrated' | 'rate' | 'detention'>;
  title?: string;
  unit?: string;
  cursor?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const colors = ['#71c6e6', '#bdcda2', '#e8bb79'],
    all = runs.flatMap((r) => r.frames.map((f) => f[metric])),
    max = Math.max(...all, 1),
    duration = Math.max(...runs.map((r) => r.scenario.duration), 60),
    idx = hover ?? cursor;
  return (
    <div className="chart">
      <div className="chart-title">
        <span>{title}</span>
        <span className="mono">
          {idx !== undefined && idx !== null
            ? runs
                .map((r) => r.frames[Math.min(idx, r.frames.length - 1)]?.[metric].toFixed(1))
                .join(' / ')
            : max.toFixed(1)}{' '}
          {unit}
        </span>
      </div>
      <svg
        viewBox="0 0 600 140"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${title} versus elapsed minutes. ${runs.map((r) => r.scenario.name).join(' and ')}. Maximum ${max.toFixed(2)} ${unit}.`}
        onMouseMove={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          setHover(
            Math.max(
              0,
              Math.min(
                runs[0].frames.length - 1,
                Math.round(((e.clientX - box.left) / box.width) * (runs[0].frames.length - 1)),
              ),
            ),
          );
        }}
        onMouseLeave={() => setHover(null)}
      >
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1="0"
            x2="600"
            y1={10 + i * 38}
            y2={10 + i * 38}
            stroke="#263239"
            strokeDasharray="3 5"
          />
        ))}
        {runs.map((r, i) => {
          const pts = r.frames
            .map((f) => `${(f.time / duration) * 600},${124 - (f[metric] / max) * 110}`)
            .join(' ');
          return (
            <g key={i}>
              {i === 0 && (
                <polygon points={`0,124 ${pts} 600,124`} fill={colors[i]} opacity=".08" />
              )}
              <polyline
                points={pts}
                fill="none"
                stroke={colors[i % 3]}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              {idx != null && r.frames[Math.min(idx, r.frames.length - 1)] && (
                <circle
                  cx={(r.frames[Math.min(idx, r.frames.length - 1)].time / duration) * 600}
                  cy={124 - (r.frames[Math.min(idx, r.frames.length - 1)][metric] / max) * 110}
                  r="3.5"
                  fill={colors[i % 3]}
                />
              )}
            </g>
          );
        })}
      </svg>
      <div className="chart-axis">
        <span>0 min</span>
        <span>{(duration / 120).toFixed(0)} min</span>
        <span>{duration / 60} min</span>
      </div>
      {runs.length > 1 && (
        <div className="chart-legend">
          {runs.map((r, i) => (
            <span key={i}>
              <i style={{ background: colors[i % 3] }} />
              {r.scenario.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
