# BASIN flood mitigation study

## Reproduce the Barbara Bush Branch Library study

Open the Hurricane Harvey case study and select **Reproduce the library study**. Run the study with the displayed defaults. BASIN examines the 960 m square around the map point at 30.0123615° N, 95.5096256° W with 24 × 24 cells, a one-hour 60 mm/h storm and a 75 mm/h sensitivity storm. The runoff solver uses 5 mm/h constant infiltration and open edges. Save the study in the browser, or export the JSON to recompute it later. CSV contains both storm hydrographs. GeoJSON contains the modeled catchment cells and outlet indicator.

The map point came from Photon/OpenStreetMap and is an approximate site reference. Harris County Public Library confirms the street address. The 576 cached source values and their retrieval metadata are in `src/data/library-usgs.json`. The case-study page computes the results from those inputs during rendering. The storms are hypothetical. NOAA's Harvey rainfall archive supplies historical context. A USGS legacy instantaneous values request for station 08069000 over August 26–September 1, 2017 returned HTTP 503 in this environment and supplied no model input.

Current limitations include the creek stage, surveyed drainage connections, past terrain, building entry elevations, independent validation observations, and construction constraints. This is a bounded screening study, so its reported combined edge discharge cannot establish whether an intervention would have prevented the library flooding.

## Data and processing

| Source | Access | Role |
| --- | --- | --- |
| USGS 3DEP | Fixed-host ImageServer GeoTIFF request | Preferred bare-earth elevation in the contiguous U.S. |
| Copernicus GLO-30 | Public AWS cloud-optimized GeoTIFF windows | Regional screening outside the contiguous U.S. and explicit alternative within it. DSM includes structures and vegetation. EGM2008 heights. |
| Photon / OpenStreetMap | Place search | Geographic coordinates |
| OpenFreeMap / OpenStreetMap | Interactive visual basemap | Selection context |
| User rainfall CSV | Regular `minute,rate_mm_h` intervals with a source citation | Up to 120 minutes. BASIN preserves supplied values and does not independently authenticate citations. |

Tiles and samples can be absent. The service returns an explicit failure in that case. Supported global locations fall within UTM's latitude range and exclude antimeridian-crossing selections. Model cells are at least 30 m with Copernicus. Study widths are at most 3.84 km and output grids at most 32 × 32. Importing a WGS84 GeoJSON polygon fits the enclosing metric square. The polygon does not mask the solver.

## Computation and interpretation

The application retains the conservative BASIN gridded surface-routing engine. Runs include modeled inputs, solver version, diagnostics, resolution, time step, units through documented fields, and scientific limits. A priority flood fills depressions for screening, then an eight-neighbor drainage network assigns each cell a receiver, slope proxy, and upstream contributing area. An acyclic flood order breaks ties over flats. The largest in-grid catchment is the screening area, while rainfall and routing use the entire raw-elevation square.

Screening visits cells in descending contributing area. Sites exceeding the treatment area limit or a 15% maximum adjacent grade are rejected. Selected sites are spaced at least three cells apart. The worker evaluates up to four sites and two capacities under two storms, plus two baselines. Pareto alternatives trade storage for the smaller peak-discharge reduction across both storms. Unit cost and budget are optional and user supplied. Unpriced options have no cost estimate. These constraints are screening rules. Ownership, capacity feasibility, wetlands, construction, and downstream connections require external evidence.

The browser worker can be canceled. JSON export carries the model inputs, outputs and source manifest. Reopening a saved study reruns its inputs. Browser-local persistence is scoped to that browser and origin. No remote account or paid storage is provisioned.

## Verification and remaining work

- Verified live Copernicus retrieval in Paris and Sydney, plus USGS elevation near the library and in Spring.
- Numerical tests exercise analytical drainage, contributing-area conservation, timed rainfall volumes, and both storms on the retrieved library raster. The original solver tests remain in the suite.
- Remaining work includes hydraulic validation and calibration, EPA SWMM or a 2D hydraulic solver, historical rainfall providers and basin-wide routing, infrastructure and soil ingestion, parcel feasibility, geographic uncertainty, large-area background services and account-backed storage.
- Ocean scenes are generated visual illustrations. Composited wildlife and light are decorative. They use depth-appropriate placement as visual direction and do not represent a measured transect, actual optical simulation, or verified species co-occurrence.
