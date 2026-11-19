# BASIN v0.2

An immersive water experience and geographically grounded, experimental stormwater laboratory.

Production alias: https://basin-sigma.vercel.app/
Source: https://github.com/projectsingularity11/basin

## Run

Node.js 24 LTS, npm:

```sh
npm ci
npm run dev
```

No API keys, paid map account, database, or sign-in are required. The geographic workflow depends on public USGS, Photon and OpenFreeMap services. If your execution environment requires an outbound proxy, Node 24 supports `NODE_USE_ENV_PROXY=1`; no proxy credentials are stored in this repository.

## Use

Open `/earth`, search a U.S. place, and click to position a 240 / 480 / 960 m region. Choose a 24 / 32-cell grid and load genuine USGS elevation. In `/lab`, set a storm, run, replay, add a hypothetical intervention, and compare independent runs. The source drawer exposes retrieval, resolution, CRS, vertical-reference qualifications, and original request. Synthetic demo mode remains explicit. Saved scenarios and experiment records are local to the browser; export JSON before clearing browser storage.

The homepage uses an animated Three.js ocean, pointer refraction, scroll-linked underwater transition, computed terrain demonstration, and a short sourced historical introduction. It is visual artwork, not an ocean-physics solver. The custom mark and favicon combine a basin boundary and B. Navigation is a keyboard-accessible dialog. The laboratory uses contextual panels instead of permanent dashboard sidebars.

## Routes

`/` ocean experience · `/earth` real-region selection · `/lab` simulation · `/compare` independent scenarios · `/optimize` constrained detention search · `/case-study` Harvey/library evidence · `/methodology` equations and limits · `/experiments` measured records · `/about` project context.

`GET /api/places?q=...` proxies a bounded, validated Photon search. `GET /api/elevation?lon=...&lat=...&side=...&size=...&name=...` acquires a small USGS Float32 raster in local metric UTM coordinates. Errors are explicit, with no fabricated terrain fallback.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`BASE_URL` runs browser tests against an existing deployment. Numerical tests include a provenance-bearing, genuinely retrieved Spring, Texas elevation fixture. Browser tests exercise a separate live-provider workflow. External service failures must be reported separately from fixture results.

## Scientific limits

Real elevation does not validate a simplified runoff solver. Rainfall, constant infiltration, routing coefficient, capture footprint, intervention capacity and costs are assumptions. No pipes, buildings, channel hydraulics, soil saturation, groundwater, historical Harvey terrain or validated flood forecasts are implemented. No empirical measurements are preloaded. See `/methodology`, `docs/METHODOLOGY.md`, `docs/DATA_SOURCES.md` and `docs/VALIDATION.md`.

## Design, performance and delivery

See `docs/DESIGN_REFERENCES.md`, `docs/COPY_AUDIT.md`, `docs/PERFORMANCE.md`, `THIRD_PARTY.md` and `public/licenses`. The cursor is a bounded ripple/refraction effect, not a full fluid solver. 60 FPS is a target requiring hardware profiling, not a universal achieved result. WebGL failure preserves a CSS ocean fallback and selectable 2D terrain.

Deploy to the existing `basin` Vercel project in Project Singularity, linked to GitHub `main`, with Node 24. Local builds alone do not establish deployment success; verify the actual production commit and live geographic journey.

## Flood mitigation study

The [watershed study](https://basin-sigma.vercel.app/study) traces drainage and compares modeled detention alternatives across two storms. The [Harvey case study](https://basin-sigma.vercel.app/case-study) includes a reproducible screening study based on USGS terrain near the Barbara Bush Branch Library. Copernicus GLO-30 adds terrain screening where public tiles are available. See [methods and limits](docs/FLOOD_STUDY.md).
