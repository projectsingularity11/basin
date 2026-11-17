# Model methodology

The full reader-facing explanation is `/methodology`; its content is implemented in src/app/methodology/page.tsx. This document summarizes the exact v0.1 algorithm.

## Domain and units

N × N grid, N from 12–32 through validated JSON (UI presets 16, 24, 32). Default cell width w=10 m, area A=w². SI seconds, meters and m³ internally. Rainfall r and infiltration f are entered in mm/h. Duration is 60–7200 s in whole minutes. Terrain is analytical and deterministically seeded; it has no real CRS or datum. Initial surface and detention volumes are zero.

## Each time step (at most 10 seconds)

1. Add r × A × dt / 3,600,000 m³ to every cell. Constant, six-bin pulse and six-bin custom hyetographs are supported. Pulse multipliers: 0.1, 0.5, 1, 1, 0.3, 0.1.
2. Infiltrate min(available volume, f × A × dt / 3,600,000). Track cumulative infiltration.
3. For each detention patch in array order, release min(detained, outlet × dt) to the center cell, then capture min(remaining capacity, available patch surface volume). Proportionally remove captured volume from the clipped 5 × 5 patch. Released water can be recaptured: the outlet is a conceptual transfer, not guaranteed net drainage. Overflow remains on the surface. Overlap is order dependent. Detained water does not contribute to hydraulic head.
4. Freeze surface state. Compute heads H=z+V/A. For every face neighbor pair, propose q*=0.08 m/s × w × abs(head difference) × dt from high head to low head.
5. For open perimeter cells, propose drainage to one external zero-depth cell at the same bed elevation. Closed boundaries propose none.
6. Scale each donor’s outgoing transfers by min(1, 0.45 V / total proposed outgoing volume). Accumulate deltas separately; then apply them simultaneously. Track external removals as cumulative boundary outflow.
7. Track peak outflow rate (step boundary volume/dt), peak total surface volume and maximum cell depth at every solver step. Store output snapshots each minute.

Permeability patches set local f to max(base, patch). Each detention capacity costs an illustrative $50/m³; a permeability patch costs an illustrative $2,500. No actual market or engineering estimate is claimed. Elevation edits directly modify the selected terrain cell.

## Accounting

Initial + rainfall = surface + detention + infiltration + boundary outflow + residual.

The initial term is zero in v0.1. Each output frame asserts |residual| ≤ max(1e-7 m³, rainfall × 1e-9). Non-finite or significantly negative volumes cause errors. Tiny negative roundoff is clamped at zero. Tests check ordinary and extreme supported ranges. The cap preserves nonnegativity but is not a proof of physical accuracy, grid independence, or universal solver stability.

## Comparison and search

Independent runs share exactly the same engine. Input equality is checked after excluding scenario name and interventions; mismatches trigger a warning. Metrics have matching units. Charts show minute snapshots; full-step peaks can be higher than sampled chart peaks.

Search enumerates three centerline cells (25%, 50%, 75% of grid height) × capacities 100/300/600 m³, subject to hypothetical cost and capture-footprint limits. Each candidate has one basin with zero outlet. A no-intervention baseline is included; ties favor lower cost. The cheapest feasible intervention is a simple reference strategy. Optimality is limited to this enumeration. Runs execute in a Web Worker.

## Physical and visualization limits

No shallow-water momentum, sewer networks, buildings, real channels, groundwater, saturation dynamics, evapotranspiration, site geometry or observed rain. Routing coefficient and infiltration are uncalibrated assumptions. Detention capture and footprint are conceptual. Terrain and water meshes interpolate cell values; color clamps above 0.25 m, opacity fades at low depth, and inspector numbers are authoritative. The library illustration is conceptual artwork, not an observed flood extent.

No empirical experiments are preloaded. User-entered experiment/model outflow ratios are explicitly geometry- and time-unmatched, and do not establish validation. Calibration and independent physical validation are future work.

## v0.2 real terrain

The original conceptual hydrology algorithm is preserved. Geographic scenarios additionally use genuine USGS 3DEP Float32 elevation arrays. The selected center is projected from WGS84 longitude/latitude to its local northern-hemisphere WGS84 UTM zone. Side lengths are defined in meters. USGS resamples into the requested square, with north-to-south row order. Missing or invalid values fail the request. All four projected corners are transformed back for the map footprint and encompassing geographic bounds.

Actual absolute elevations are retained in the engine. Display normalization subtracts a local minimum and uses 3× vertical exaggeration for geographic terrain; water display uses the corresponding scale. Inspector values and computed volumes remain SI. Ground widths are in projected meters; UTM scale distortion is small but not zero. No elevation datum conversion or survey-level precision is claimed. USGS source resolution varies; requested output cell spacing is not an accuracy claim.

Full provenance is exported with scenarios. Source metadata in imported external JSON remains user-supplied and is not independently authenticated. Current terrain, even genuine terrain near Spring, does not reconstruct historical Harvey infrastructure, rainfall, drainage or flooding. Historical library claims remain separate from numerical experiments.

For high-relief selections, the renderer reduces the requested 3× vertical exaggeration to fit relief within one quarter of the displayed domain width. The active factor is shown on the legend; elevation values and numerical routing never change. Synthetic demo relief retains its prior display convention.
