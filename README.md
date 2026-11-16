# BASIN

Stormwater Intelligence Laboratory · v0.1 working research prototype.

An account-free Next.js / TypeScript instrument for exploring rainfall, conservative surface-water routing, infiltration, hypothetical interventions, and constrained scenario search. The numerical model is deterministic, synthetic, and uncalibrated. It is not validated for flood forecasting, emergency decisions, or engineering design.

## Run locally

Node.js 24 LTS and npm are recommended.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No environment variables, API keys, paid services, or database are required. Fonts and procedural visuals are bundled locally. Scenario and experiment storage lives in the current browser; clearing browser storage removes it. Export JSON for portability. Scenarios include versioned input validation; exported runs can be reimported through their scenario field.

## Routes and demonstration

- `/` — project introduction and interactive synthetic terrain
- `/lab` — terrain selection/editing, rainfall profiles, infiltration, boundaries, detention/permeability, playback, scientific charts, mass accounting, local scenario save, JSON import/export
- `/compare` — two independent runs, matching-input warning, time-series overlays, summary table, results export
- `/optimize` — exhaustive search of nine single-basin candidates subject to budget and capture-footprint constraints; runs in a Web Worker
- `/case-study` — researched Harvey/library context, explicit separation from synthetic experiments, source registry
- `/methodology` — equations, algorithms, numerical assumptions and limitations
- `/experiments` — empty-by-default local measurement records, provenance, uncertainty, export and cautious ratio comparison
- `/about` — project scope and research roadmap

Demo: launch laboratory → run Valley Catchment → pause/scrub → save baseline → add detention at selected cell → run → compare → optimize with budget/footprint → inspect selected scenario → export → read methods. All model results come from `src/engine/model.ts`, never randomized chart data.

## Verification

```sh
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright starts a local production server if needed. `BASE_URL` targets an existing deployment. Tests cover the user journey, WebGL canvas initialization, 2D fallback selection, pause/reset, rainfall changes, local persistence, import/export, comparison, worker optimization, historical-source links, experiment entry, automated accessibility, and responsive overflow at 1440 / 1024 / 768 / 390 px. See `docs/VALIDATION.md` for executed results and limits.

## Architecture

Pure TypeScript numerical engine → computed snapshots → React state → dynamic Three.js terrain and SVG charts. Next.js prerenders all routes. Browser storage is accessed through `useSyncExternalStore`; imported data is bounded and validated. No user measurements are transmitted to a server. See `docs/ARCHITECTURE.md` and `docs/METHODOLOGY.md`.

## Delivery

Intended source: https://github.com/projectsingularity11/basin, branch `main`. Vercel project: `basin` in Project Singularity. Deploy through the connected repository or Vercel with Next.js detection, Node 24, `npm run build`, no environment variables. A successful local build is not proof of deployment. See `docs/DELIVERY.md` for actual delivery status.

## Scientific limits

Synthetic terrain, illustrative storms and soil capacities, hypothetical costs, and an uncalibrated routing coefficient. No real elevation or rainfall observations are ingested. No pipes, buildings, channel hydraulics, momentum, groundwater, or dynamic soil-moisture state. Constant infiltration and conceptual detention may differ substantially from physical systems. Model invariants are tested; real flood predictions are not validated. The Harvey case study motivates the question and is not reconstructed by the simulation.

See `THIRD_PARTY.md` for dependencies, licenses, and assets; `docs/SOURCES.md` for research; `docs/ROADMAP.md` for the physical validation plan.
