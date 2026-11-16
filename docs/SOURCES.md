# Research sources and provenance

Research retrieval date: November 15, 2026 (America/Chicago client date). Historical evidence is separated from model inputs. All v0.1 model inputs are synthetic or user-entered assumptions.

1. KPRC / Click2Houston, May 14, 2018: https://www.click2houston.com/news/2018/05/14/barbara-bush-library-to-reopen-for-first-time-since-hurricane-harvey/
   Retrieved full page. Supports severe Harvey damage and reopening in Spring. No site-specific measured flood depth, rain total, damage estimate, or hydraulic reconstruction is claimed.
2. American Libraries / American Library Association, November 1, 2017: https://americanlibrariesmagazine.org/2017/11/01/hurricanes-harvey-irma-libraries/
   Search index retrieved; full article returned 403. Excerpt supports library internet/recovery-paperwork services. Exact quantities and unverified details omitted.
3. NOAA Weather Prediction Center, Harvey rainfall archive: https://www.wpc.ncep.noaa.gov/tropical/rain/harvey2017.html
   Search index retrieved. Supports regional rainfall context only. No rainfall observations imported.
4. NOAA National Hurricane Center, Tropical Cyclone Report: https://www.nhc.noaa.gov/data/tcr/AL092017_Harvey.pdf
   Search index retrieved. Official regional storm context, not site-level calibration. No report figures are assigned to the library.
5. US EPA SWMM: https://www.epa.gov/water-research/storm-water-management-model-swmm
   Retrieved full page. Background on established runoff and drainage analysis. BASIN neither implements SWMM nor claims equivalent hydraulic capability or validation.
6. USGS 3DEP: https://www.usgs.gov/3d-elevation-program
   Future data source from supplied directive, not an ingested or experimentally evaluated dataset.

## Dataset status

There are zero external geographic datasets or empirical rainfall/experimental observations in the initial application. Synthetic elevation units: m; default horizontal resolution 10 m; CRS and vertical datum: none (synthetic local reference). No coordinate transformation is performed. User measurements retain their entered provenance and uncertainty. Model outputs are simulated estimates; interventions and costs are hypothetical.

The future adapter metadata interface in src/lib/provenance.ts requires dataset name, provider, retrieval date, units, CRS, resolution, vertical datum, license, processing steps and limitations. Real data requires compatible reference frames and independent validation; visualizing measured elevation alone does not validate flood behavior.
