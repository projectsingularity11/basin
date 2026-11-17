# v0.2 roadmap

Implemented: cinematic ocean and underwater transition; pointer refraction in shared renderer; custom mark/icons; floating modal navigation; task-based lab; MapLibre real-region selection; bounded Photon search; genuine USGS Float32 elevation pipeline; metric projection and provenance; retained conservative solver, intervention editing, comparison, Worker optimization, local persistence and JSON roundtrips; explicit synthetic and failure modes.

Highest priorities:

1. Hardware profiling on integrated-GPU laptops and real mobile devices. Software WebGL measurements do not establish a universal 60 FPS claim.
2. Physical watershed experiments with measured geometry, calibrated rainfall, timed outflow, uncertainty and repeated trials. Preserve independent holdouts and report disagreement.
3. Mentor review of conceptual routing, grid/time-step sensitivity, constant infiltration, detention capture and downstream assumptions before any site-specific interpretation.
4. Provider capacity monitoring, durable rate limiting and alternative terrain providers before high traffic. Expand coverage only with verified CRS/datum handling.
5. Improve the visual and numerical distinction among buildings, terrain, channels and drainage infrastructure if suitable verified data and modeling methods are added.

Not implemented: Google Earth photorealistic tiles, paid APIs, global elevation coverage, full fluid cursor solver, certified flood predictions, empirically calibrated forecasts, pipe/channel hydraulic models, or physical validation outcomes. No such feature should be presented as completed.
