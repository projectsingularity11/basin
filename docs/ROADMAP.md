# Research roadmap

## Implemented v0.1

Deterministic synthetic terrain; conservative rainfall/infiltration/routing; explicit boundaries and mass balance; detention and permeability patches; local elevation edits; 3D and 2D cell selection; computed playback/charts; local scenario storage and JSON interchange; independent comparison; constrained nine-candidate search in a worker; historical research and methodology; local experiment records with honest empty state and normalized-ratio comparison.

## Highest priorities before submission

1. Review the numerical model and limitations with a qualified hydrology mentor. Test time-step/grid sensitivity and route coefficient sensitivity; evaluate whether a better conceptual or hydraulic solver is needed.
2. Build a measured tabletop catchment with known initial conditions and replace all visual/material assumptions with measured dimensions. Verify the water-delivery rate and calibrate collection vessels. Record input losses and collection uncertainty.
3. Measure outlet flow in timed intervals and photograph/document repeatable geometry. Compare a baseline to one detention/permeability change, holding rainfall, geometry, and initial conditions fixed. Repeat at least three times per condition. Preserve raw observations without invented fill-ins.
4. Compare model volume, hydrograph timing, peak and storage to measurements with uncertainty. Calibrate on separate runs and retain independent holdout trials. Report disagreement and limitations.
5. Have an educator review accessibility, source claims and the complete demonstration journey. Avoid claiming geographic forecast accuracy or engineered protection.

## Later, conditional on evidence

Official elevation/rainfall adapters with validated CRS/datum handling; surveyed site geometry and downstream boundaries; stage–storage detention, dynamic infiltration, uncertainty ensembles, pipe/channel coupling, sensor ingestion and camera measurement. None are implemented in v0.1.
