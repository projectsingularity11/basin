# Third-party notices

Dependency licenses were inspected from installed packages on November 15, 2026. Full direct dependency notices are retained in public/licenses; transitive licenses remain in their distributed packages and are covered by their own terms. package-lock.json fixes the resolved dependency tree.

| Package                   | Installed version | License    | Notice                                                  |
| ------------------------- | ----------------- | ---------- | ------------------------------------------------------- |
| next                      | 16.4.6            | MIT        | [license](public/licenses/next.txt)                     |
| react                     | 19.3.1            | MIT        | [license](public/licenses/react.txt)                    |
| react-dom                 | 19.3.1            | MIT        | [license](public/licenses/react-dom.txt)                |
| three                     | 0.181.2           | MIT        | [license](public/licenses/three.txt)                    |
| @react-three/fiber        | 9.8.2             | MIT        | [license](public/licenses/react-three-fiber.txt)        |
| @react-three/drei         | 10.7.9            | MIT        | [license](public/licenses/react-three-drei.txt)         |
| lucide-react              | 0.553.0           | ISC        | [license](public/licenses/lucide-react.txt)             |
| @fontsource/geist         | 5.3.0             | OFL-1.1    | [license](public/licenses/fontsource-geist.txt)         |
| @fontsource/ibm-plex-mono | 5.3.0             | OFL-1.1    | [license](public/licenses/fontsource-ibm-plex-mono.txt) |
| typescript                | 5.9.3             | Apache-2.0 | [license](public/licenses/typescript.txt)               |
| vitest                    | 4.1.12            | MIT        | [license](public/licenses/vitest.txt)                   |
| eslint                    | 9.39.5            | MIT        | [license](public/licenses/eslint.txt)                   |
| @playwright/test          | 1.65.1            | Apache-2.0 | [license](public/licenses/playwright-test.txt)          |
| @axe-core/playwright      | 4.14.0            | MPL-2.0    | [license](public/licenses/axe-core-playwright.txt)      |
| prettier                  | 3.10.1            | MIT        | [license](public/licenses/prettier.txt)                 |

Geist © Geist Project Authors and IBM Plex Mono © IBM Corp are self-hosted, unmodified fonts under SIL OFL 1.1. Lucide includes Feather-derived MIT portions under its ISC notice. Icons retain the packaged notice. Terrain, shaders, charts, and the library conceptual illustration are original procedural code; no third-party photographs, satellite images, elevation tiles, or artwork are used. No reference-site layout or proprietary assets were copied.

## References evaluated, not incorporated

React Three Fiber and Drei documentation informed the declarative mesh, OrbitControls, buffer-geometry lifecycle, and renderer setup; no external example source was copied. Three.js underlies rendering. MapLibre (BSD-3-Clause) and deck.gl (MIT) were evaluated but not installed because there is no real geospatial dataset. D3 (ISC) and Observable Plot (ISC) were evaluated; lightweight SVG charts suffice. shadcn/ui (MIT), Radix (MIT), and Motion (MIT) were considered; native form controls, details, CSS transitions, and reduced-motion rules avoid unnecessary dependencies. Motion docs retrieval returned 403. Documentation research is recorded in docs/DESIGN_RESEARCH.md.

## v0.2 additions

| Dependency             | Installed version | License                                                                                              |
| ---------------------- | ----------------- | ---------------------------------------------------------------------------------------------------- |
| MapLibre GL JS         | 6.18.0            | BSD-3-Clause                                                                                         |
| GeoTIFF.js             | 3.0.5             | MIT                                                                                                  |
| Proj4js                | 2.23.0            | MIT                                                                                                  |
| Lenis                  | 1.3.27            | MIT                                                                                                  |
| GSAP                   | 3.15.1            | GSAP Standard no-charge license, https://gsap.com/standard-license/ (not an open-source MIT license) |
| Syne via Fontsource    | 5.3.0             | SIL OFL 1.1                                                                                          |
| Manrope via Fontsource | 5.3.0             | SIL OFL 1.1                                                                                          |

Installed notices are retained in public/licenses. Three.js Water and Sky are imported from its MIT-licensed example modules; their code supplies the reflection, sun-scattering and normal-sampling foundation. Original shader additions and normal texture are implemented in ocean.tsx. No proprietary ocean video, historical photograph or restricted Google imagery was copied. The custom logo is original SVG geometry.

OpenFreeMap/OpenMapTiles and OpenStreetMap credits remain visible on the map. Numerical elevation is USGS 3DEP public-domain data, separately attributed and provenance-bearing. Photon search is OSM-derived. These external providers have independent availability and usage conditions; they do not validate BASIN's hydrology. See docs/DATA_SOURCES.md and docs/DESIGN_REFERENCES.md.

MapLibre v6's official worker bundle is self-hosted unmodified at public/maplibre/maplibre-gl-worker.mjs, with its embedded BSD notice and full license in public/licenses/maplibre-gl.txt. This avoids bundler-relative worker URL failures and external executable CDN dependencies. Update the worker together with MapLibre if upgrading the locked dependency.

Instrument Serif is distributed under the SIL Open Font License in public/licenses/fontsource-instrument-serif.txt. The ocean plates and animal artwork were generated for BASIN and are artistic illustrations. Copernicus GLO-30 attribution is retained in the source manifest and in the terrain details.

## Ocean footage

The homepage uses these trimmed, muted 1920×1080 excerpts. Color and framing are adjusted in the browser.

- [Waves of the sea](https://commons.wikimedia.org/wiki/File:Waves_of_the_sea_(Video).webm) by Amada44, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The trimmed, muted video and its poster retain this license.
- [Coral reef](https://www.pexels.com/video/underwater-school-of-fish-swimming-in-coral-reef-33009956/) by JUN HO LEE, [Pexels License](https://www.pexels.com/license/).
- [Humpbacks](https://www.pexels.com/video/view-from-above-on-humpbacks-11279748/) by Stockfilm.com, [Pexels License](https://www.pexels.com/license/).
- [Swimming with a whale shark](https://commons.wikimedia.org/wiki/File:Swimming_with_a_whale_shark_(Rhincodon_typus)_(no_audio).webm) by David Rojo, [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).
- [Deepwater Exploration of the Marianas jellyfish](https://commons.wikimedia.org/wiki/File:Jellyfish_-_Deepwater_Exploration_of_the_Marianas_expedition_-_April_24,_2016.webm) by NOAA Ocean Exploration, [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
- [Poisson et fonds abyssaux](https://commons.wikimedia.org/wiki/File:Poisson_et_fonds_abyssaux_(Ifremer_00701-81286).webm) from Ifremer, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

The anglerfish and its illumination are an animated composite. Pointer waves adapt the traveling-wave shader from the project owner's Sakuga site.

## Continuous ocean scene

The current homepage uses original generated ocean and wildlife artwork composited and animated in the browser. The earlier video excerpts listed above were used by the previous homepage.
