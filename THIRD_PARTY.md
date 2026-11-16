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
