# Verification record

## Numerical evidence

Executed November 15, 2026: `npm test` — 11 tests passed. Tests cover analytical rainfall/unit conversion and closed flat-plane storage; zero rain; conservation in every reported frame with routing, detention and controlled release; infiltration available-water cap; deterministic terrain and simulation; open/closed boundaries; actual detention and permeability effects; finite nonnegative behavior at 200 mm/h / 120 minutes; optimization budget/space constraints; malformed import rejection.

The analytical closed-plane case adds 0.06 m of rain over 57,600 m² = 3,456 m³. Tests require near-zero mass residual (1e-7–1e-6 m³ depending on case). The infiltration-only test uses 1e-6 m³ comparison tolerance because repeated summation of 207,360 cell substeps differs by approximately 1.6e-8 m³. No physical accuracy conclusion follows from these mathematical tests.

## Software checks

Initial production build and strict TypeScript checks passed. Initial lint identified effect-driven storage hydration; replaced with useSyncExternalStore rather than suppressing the rule. Initial browser tests exposed an export/import size mismatch and an ARIA role omission in the canvas wrapper; corrected. Visual inspection identified cell-box intersections on the interpolated terrain; replaced with a continuous depth-derived water mesh.

Final verification results are appended after execution. Browser screenshots are QA artifacts generated from actual application state, not empirical observations.

## Not established

No physical calibration or validation, no observed-event replay, no Hurricane Harvey reconstruction, no cross-browser/browser-device accessibility certification, no mathematical convergence proof. Chromium software WebGL tests establish rendering and user flow in the tested environment only. Local numerical and browser evidence does not itself establish deployment success.

## Physical plan

See ROADMAP.md: measured geometry, calibrated rainfall input, timed outflow samples, uncertainty records, three or more repetitions, independent holdouts, and published model disagreement. The application starts with zero real experimental records.

## Final local run

- `npm run typecheck`: passed.
- `npm run lint`: passed with no errors or warnings.
- `npm test`: 11/11 numerical tests passed (Vitest separated from Playwright via vitest.config.mts).
- `npm run build`: passed; all eight application routes prerendered successfully.
- `npm run test:e2e`: 4/4 Chromium tests passed, 39.5 seconds. Covered the full baseline/intervention/compare/optimizer/import journey; all eight routes at 1440, 1024, 768 and 390 px without document overflow; home/lab automated WCAG A/AA scans; local experiment records; and selectable 2D fallback with WebGL explicitly unavailable.
- Home and laboratory desktop/mobile screenshots inspected. The water mesh reflects simulated snapshots; no historical flood data appears on synthetic terrain.

The overlapping browser runs described during development were terminated; the final four-test result above used one Playwright worker and one server. No statement of manual keyboard-only audit, full WCAG conformance, empirical validation, or non-Chromium testing is made.

The final production build also passed after the terrain legend clarification. The complete user journey was rerun with both browser console-error and uncaught page-error listeners: passed in 14.1 seconds with neither error list populated.

# v0.2 verification

The v0.1 results above are historical. The current suite preserves the original eleven numerical tests and adds six geographic tests (17 total): actual retrieved cell values, local metric projection and coordinate ordering, conservation/determinism on the real grid, geographic serialization and optimizer retention, recoverable source elevations after hypothetical edits, no-data and malformed-grid rejection.

Live local API checks separately returned five Photon search results and 576 USGS cells for Spring, Texas. The browser live-provider journey successfully searched Spring, retrieved a fresh valid raster, ran the model, added detention and compared independent runs. These are integration results, not hydrological validation.

The first browser suite exposed decorative navigation numbers in accessible link names; fixed with aria-hidden. A later error-path assertion collided with Next.js's route-announcer alert; narrowed to the actual elevation error. Explicit service failures remain in the Earth UI and never switch to synthetic data silently. Final execution counts are appended after QA.

Final local gates: TypeScript, lint, all 17 numerical tests and production build passed. The final four-test Playwright suite passed in about one minute. It checked actual non-selection map features (not only a canvas), live Photon and USGS services, real-terrain run/intervention/comparison, synthetic save/export/import and Worker optimization, responsive overflow at 1440/1024/768/390 pixels, keyboard modal/Escape focus behavior, a WCAG A/AA automated scan of the mobile controls, icon serving, reduced-motion rendering, explicit provider error handling and WebGL-unavailable SVG fallback. No manual WCAG certification or physical validation is claimed.

MapLibre 6 initially failed to load its bundled relative worker URL. The official matching worker is now self-hosted, and the strengthened rendered-feature test passed. Public provider availability was tested live, separately from the saved numerical fixture.

The final ocean changes were followed by another successful production build and a targeted visual/navigation/mobile/accessibility test. Performance is separately measured and remains below the 60 FPS target on the available software renderer; see PERFORMANCE.md. This limitation is not hidden by the passing functional tests.
