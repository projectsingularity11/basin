# Geographic sources v0.2

## Numerical elevation

USGS 3DEP Bare Earth DEM dynamic ImageServer: https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer

Live metadata reports source DEM publication through October 26, 2026 and credit dated October 27, 2026. The service combines variable native resolutions. The output sampling requested by BASIN is not a statement of survey accuracy or native resolution.

The API computes a WGS84 UTM zone from the selected center, projects the center to meters, and requests a 240, 480 or 960 m square Float32 GeoTIFF at 24 or 32 cells per side. USGS performs bilinear resampling. Decoding uses GeoTIFF.js, rejects no-data/nonfinite/out-of-range values, and preserves north-to-south row order. Rainfall and infiltration remain illustrative assumptions. Contiguous U.S. bounds are enforced; missing coverage rejects the request.

Source elevations stay absolute in the engine. Rendering subtracts the minimum only for presentation; default geographic vertical display exaggeration is 3× relative to horizontal scale. Original values survive hypothetical terrain edits. JSON exports retain the source request, values, units, metric bounds, geographic bounds, CRS, retrieval date, processing, license and limitations. Imported provenance is user-supplied metadata, not independently authenticated.

## Reproducible fixture

`tests/fixtures/spring-usgs.json` is an actual retrieved USGS raster for center longitude -95.4187924, latitude 30.0795707, 480 m square, 24 × 24 samples, EPSG:32615. Range at retrieval: 33.8745346069–36.4375381470 m. Full request and timestamp are inside the fixture. Do not conflate this modern region with surveyed library grounds or historical Harvey flood conditions.

## Search and visual map

Photon public service: https://photon.komoot.io/api/ — five results per explicit submission, 10-second timeout, 3–120 character queries, validated point geometry. Based on OpenStreetMap. Service availability is external and not guaranteed.
MapLibre GL JS with OpenFreeMap dark style: https://tiles.openfreemap.org/styles/dark — map attribution remains visible. Tiles and imagery are visual context only; no elevation is extracted from them. No Google credentials, Earth scraping, or billable service is used.

Requests are bounded to at most 1,024 output cells, source response limit 2 MB, a 25-second elevation timeout, fixed upstream hostname, and one concurrent elevation request per UI. Editing selection cancels obsolete requests. API responses use public cache headers and Next's bounded revalidation. There is no durable global rate limiter; provider terms and traffic capacity must be revisited before broad public load.

Native vertical reference varies by source; the contiguous U.S. DEM generally uses NAVD88. BASIN reports this qualification and requires local metadata review before engineering use. No geoid conversion or independent accuracy validation is claimed.
