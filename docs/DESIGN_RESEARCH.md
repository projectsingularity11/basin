# Design and engineering research

Retrieved November 15, 2026. References inform original design decisions; they are not hydrological evidence or copied templates.

## Visual references

- https://www.awwwards.com/ — editorial composition and the documented WebGL/interaction categories motivated restrained type, strong spatial hierarchy, and short paths into the tool.
- https://lusion.co/ — its 3D storytelling emphasis informed a dominant interactive terrain rather than small dashboard decoration.
- https://unseen.co/ — its exploration interface informed drag-to-orbit with an explicit interaction hint. BASIN avoids entry/audio gates.
- https://activetheory.com/ (redirects to https://activetheory.net/) — returned a JavaScript-only page to the research fetch. No unsupported claim of visual inspection is made.
- https://observablehq.com/ — emphasis on explorable, connected data views informed charts driven directly by the same computed snapshots as terrain.
- https://docs.mapbox.com/mapbox-gl-js/example/ — camera/layer interface references were inspected; no Mapbox API or paid map tiles are used.

Research retrieval establishes page content, not a claim that all interactive reference experiences were exercised. Actual BASIN desktop/mobile screenshots are inspected separately during QA.

## Open-source evaluation

Official README files retrieved for pmndrs/react-three-fiber, pmndrs/drei, mrdoob/three.js, maplibre/maplibre-gl-js, visgl/deck.gl, observablehq/plot, and d3/d3. Official docs retrieved for shadcn/ui, Radix Primitives, Lucide, and React Three Fiber. Motion docs returned HTTP 403. Decisions:

- Use Three.js + React Three Fiber for continuous terrain geometry and computed water depth. Use Drei OrbitControls/Line rather than custom camera input.
- Defer MapLibre and deck.gl until coordinate-aware real datasets exist.
- Implement small SVG charts rather than include an entire plotting library for basic time series.
- Native range inputs, selects, details, semantic labels and focus rules provide the required interactions without importing a full UI template.
- Locally bundle Geist and IBM Plex Mono fonts. Use Lucide icons with license notices.
- No borrowed artwork, satellite imagery, historical flood overlay, photorealistic claim, or copied site code.

Full installed license texts for significant dependencies are retained in public/licenses. See THIRD_PARTY.md.
