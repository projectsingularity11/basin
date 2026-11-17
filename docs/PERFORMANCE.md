# Performance v0.2

Target: responsive 60 Hz desktop experience, not a universal achieved-frame-rate claim.

Architecture: one homepage ocean renderer shared with pointer ripples; static Three Sky cached once into a 128-pixel cube target; sky-probe reflection without a dynamic scene pass; ocean geometry bounded at 48 × 48 segments; one GSAP ticker also drives Lenis; no React state per frame. DPR adapts downward when measured callback pacing is below 45 FPS. Eight bounded pointer ripples avoid a separate full-screen fluid solver. Invisible ocean rendering stops after the terrain transition and when the document is hidden. Terrain rendering uses React Three Fiber demand mode. Numeric optimization remains in a Worker.

The initial uncached 1440 × 1000 software-WebGL pass measured approximately 4.2 FPS. This exposed a real bottleneck; the static sky was then cached and adaptive resolution added. Final measurements are recorded after browser QA. Software WebGL is not representative of a discrete GPU; it must not be reported as proof of 60 FPS on consumer hardware.

Reduced motion disables smooth scrolling and pointer disturbance; touch disables pointer disturbance and limits DPR. WebGL failure has a CSS ocean fallback and a selectable SVG numerical terrain. Map failure leaves search/coordinate selection and elevation retrieval available. Three renderer disposal and context release occur on route exit.

Remaining measurement requirements: real integrated-GPU laptop and mobile-device profiling; memory/thermal testing across longer sessions; percentile frame times rather than only average cadence. No hardware-device 60 FPS certification is claimed.

## Executed benchmark

Headless Chromium, ANGLE/Vulkan SwiftShader software device, 1440 × 1000 viewport, 8-second warmup and 6-second requestAnimationFrame sample: approximately **7.0 FPS**, p95 frame interval **216.7 ms**, adaptive DPR **0.65**. Full measurement is in performance-measurement.json. This does **not** meet the requested 60 FPS target in the available environment.

Final rendering removes a redundant dynamic mirror pass: the open ocean has no reflected objects beyond its sky, so the adapted Water shader samples the cached sky probe directly. The mesh is 48 × 48 segments. Expired pointer ripples skip shader work, the underwater pass is invisible outside its scene, and reduced-motion rendering changes only on scroll/resize. Physical-GPU performance remains unmeasured. These changes improve the architecture but do not justify claiming the target is met.
