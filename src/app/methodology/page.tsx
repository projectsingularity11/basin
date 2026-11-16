import Link from 'next/link';
import { ArrowUpRight, ArrowRight, FlaskConical } from 'lucide-react';
import { Footer, disclaimer } from '@/components/shell';
export const metadata = { title: 'Methods & limitations' };
const sections = [
  ['purpose', '01', 'A model you can inspect'],
  ['conservation', '02', 'Account for every drop'],
  ['rainfall', '03', 'Rainfall & infiltration'],
  ['routing', '04', 'Conservative surface routing'],
  ['detention', '05', 'Interventions & boundaries'],
  ['validation', '06', 'What the tests establish'],
  ['optimization', '07', 'A bounded search'],
  ['provenance', '08', 'Data, uncertainty & next steps'],
];
export default function Methodology() {
  return (
    <main id="main">
      <section className="page-heading">
        <div className="eyebrow">05 / METHODS & LIMITATIONS</div>
        <h1>
          The mathematics.
          <br />
          <span>And its boundaries.</span>
        </h1>
        <p>
          A useful model should explain itself.
          <br />
          Here is what BASIN calculates, assumes, and has yet to prove.
        </p>
      </section>
      <section className="article-layout content-width">
        <aside className="article-aside method-toc">
          <span className="eyebrow">IN THIS DOCUMENT</span>
          {sections.map(([id, num, title]) => (
            <a href={`#${id}`} key={id}>
              <span className="mono">{num}</span>
              {title}
            </a>
          ))}
          <Link className="button compact" href="/experiments">
            <FlaskConical size={14} />
            Experiment records
          </Link>
        </aside>
        <article className="prose">
          <section id="purpose">
            <span className="eyebrow">01 / MODEL SCOPE</span>
            <h2>A model you can inspect.</h2>
            <p>
              BASIN is a deterministic conceptual rainfall–runoff and storage model on a rectangular
              grid. It explores how defined inputs and hypothetical interventions affect simulated
              storage and perimeter outflow. It is not a full shallow-water solver, a pipe-network
              model, a certified flood map, or an operational forecast.
            </p>
            <div className="disclaimer">
              <p>{disclaimer}</p>
            </div>
            <p>
              The engine uses SI units internally: seconds, meters, square meters, and cubic meters.
              The default grid has 24 × 24 cells, each 10 × 10 m, covering 57,600 m². Configurable
              16- and 32-cell grids change the domain extent while retaining 10 m cells.
            </p>
            <p>
              The terrain is a deterministic analytical surface. Valley and slope presets include a
              seeded linear-congruential perturbation of less than 0.08 m. The flat test plane has
              exactly zero elevation. Elevation edits add specified offsets to individual cells.
              These are synthetic values without a geographic coordinate reference system or real
              vertical datum.
            </p>
          </section>
          <section id="conservation">
            <span className="eyebrow">02 / CONSERVATION</span>
            <h2>Account for every drop.</h2>
            <div className="equation">V₀ + P = S + D + I + Q + ε</div>
            <p>
              Initial storage V₀ is zero in v0.1. P is cumulative rainfall input, S surface storage,
              D detention storage, I cumulative infiltration, Q cumulative boundary outflow, and ε
              the numerical residual. All terms have units m³. Internal transfers cancel because the
              same volume is subtracted from one cell and added to the other.
            </p>
            <p>
              Each run checks every output frame. A residual above max(10⁻⁷ m³, 10⁻⁹ × P) raises an
              error. The interface shows the residual; it does not replace it with a fabricated
              zero. Floating-point summation introduces tiny residuals even in a conservative
              algorithm.
            </p>
          </section>
          <section id="rainfall">
            <span className="eyebrow">03 / SOURCES & SINKS</span>
            <h2>Rainfall & infiltration.</h2>
            <div className="equation">
              ΔVᵣ = r A Δt / 3,600,000
              <br />
              ΔVᵢ = min(V, f A Δt / 3,600,000)
            </div>
            <p>
              Rainfall intensity r and infiltration capacity f are entered in mm/h; A is cell area
              in m², and Δt is the time step in seconds. One millimeter is 0.001 m. Rainfall is
              added to every cell, then infiltration removes at most the available water.
            </p>
            <p>
              The pulse profile uses six equal-duration bins with intensity multipliers [0.1, 0.5,
              1, 1, 0.3, 0.1]. Its specified intensity is the peak, so total rainfall differs from a
              constant storm at that intensity. The editable profile specifies six actual mm/h
              intensities. Storms and the 0, 5, 15, and 40 mm/h infiltration presets are
              illustrative assumptions, not measured soil parameters or Harvey observations.
            </p>
            <p>
              Infiltration capacity is constant in time. There is no soil-moisture state,
              groundwater, evapotranspiration, saturation recovery, or subsurface return flow.
              Infiltrated water leaves the modeled surface system.
            </p>
          </section>
          <section id="routing">
            <span className="eyebrow">04 / NUMERICAL METHOD</span>
            <h2>Conservative surface routing.</h2>
            <div className="equation">
              Hᵢ = zᵢ + Vᵢ / A<br />
              q*ᵢⱼ = k w max(Hᵢ − Hⱼ, 0) Δt
              <br />
              qᵢⱼ = q*ᵢⱼ min(1, 0.45 Vᵢ / Σⱼ q*ᵢⱼ)
            </div>
            <p>
              H is water-surface elevation, z terrain elevation, w cell width, and k an illustrative
              routing coefficient of 0.08 m/s. Neighbor pairs are evaluated once. Flow follows
              decreasing head across four face-connected neighbors. All heads and proposed transfers
              use the same frozen pre-routing state.
            </p>
            <p>
              Each donor’s total outgoing transfer is capped at 45% of its available water.
              Transfers accumulate in a separate delta buffer, then apply simultaneously. This
              avoids order-dependent double counting and prevents negative storage. Steps are at
              most 10 seconds. No incoming water can leave its receiving cell during that same
              routing step.
            </p>
            <p>
              The limiter ensures nonnegativity; it does not establish physical accuracy, spatial
              convergence, or stability for arbitrary coefficients and resolutions. Supported UI
              ranges are bounded and tested for finite values. The routing coefficient, grid
              dependence, and limiter require sensitivity analysis and calibration. Momentum, flow
              inertia, friction laws, hydraulic jumps, and wetting-front dynamics are not resolved.
            </p>
            <p>
              Metrics such as peak outflow, peak total surface storage, and maximum cell depth are
              tracked at every solver step. Charts and playback sample the calculated state every
              minute, so charted peak rates can differ from full-run peak metrics. Playback is a
              replay of computed snapshots; pause stops the replay. Editing inputs invalidates the
              prior run.
            </p>
          </section>
          <section id="detention">
            <span className="eyebrow">05 / INTERVENTIONS</span>
            <h2>Storage with explicit rules.</h2>
            <p>
              A detention intervention captures surface water from a clipped 5 × 5-cell patch
              centered on the selected cell. After rainfall and infiltration, stored detention water
              first releases at up to the configured outlet rate into the center cell. Then the
              patch captures up to its remaining capacity, proportionally from available cell
              volumes. A release can be recaptured during the same step; the outlet therefore does
              not guarantee net drainage. Overlapping interventions process in array order. These
              are explicit conceptual simplifications, not a physical basin design.
            </p>
            <p>
              Detained volume has separate accounting and does not affect surface hydraulic head.
              Uncaptured overflow stays on the surface and routes normally. The model does not
              excavate a basin or simulate stage–storage curves. A permeable patch increases local
              infiltration to the greater of the base and patch capacities. Overlapping permeability
              patches use the maximum capacity.
            </p>
            <p>
              Illustrative cost is $50 per m³ of detention capacity and $2,500 per permeable patch.
              These are hypothetical comparison inputs with no claim to construction pricing or site
              feasibility. The 5 × 5 capture footprint does not imply a feasible depth, grading, or
              land requirement.
            </p>
            <h3>Open versus closed boundaries</h3>
            <p>
              Closed boundaries permit no external transfer. Open boundaries connect each perimeter
              cell to one external cell at the same bed elevation with zero water depth. The same
              routing formula and outgoing limiter apply. The removed volume is accumulated as
              boundary outflow. This is free drainage, not a river stage, sewer inlet, or calibrated
              downstream condition.
            </p>
            <h3>How the picture relates to the model</h3>
            <p>
              Water colors encode computed cell depths from 0 to 0.25 m, clamped above that range.
              The 3D terrain interpolates neighboring elevation samples for legibility while the
              engine uses cell elevations. The water surface interpolates cell depths; opacity fades
              below 0.035 m to preserve terrain legibility. Use the cell inspector for exact depth.
              The model includes no building geometry. The 2D alternative shows selectable cells
              with the same numerical values.
            </p>
          </section>
          <section id="validation">
            <span className="eyebrow">06 / EVIDENCE</span>
            <h2>What the tests establish.</h2>
            <div className="status-list">
              <div>
                <span className="badge">IMPLEMENTED</span>
                <p>
                  Rainfall, infiltration, conservative routing, open and closed boundaries,
                  detention, permeability, local terrain edits, serialization, comparison, and
                  bounded optimization.
                </p>
              </div>
              <div>
                <span className="badge teal">TESTED MATHEMATICALLY</span>
                <p>
                  Automated tests check rainfall conversion, zero-rain behavior, a closed-plane
                  analytical result, available-water limits, mass balance, nonnegative finite
                  storage, determinism, intervention effects, constrained search, and invalid input
                  rejection. The repository validation log records actual executions.
                </p>
              </div>
              <div>
                <span className="badge amber">EXPERIMENTAL</span>
                <p>
                  All hydrological predictions. Mathematical invariants establish code properties,
                  not agreement with a real watershed or Hurricane Harvey.
                </p>
              </div>
              <div>
                <span className="badge muted">PLANNED</span>
                <p>
                  Physical calibration, observed-event validation, surveyed terrain ingestion, error
                  bars from parameter ensembles, and more appropriate hydraulic routing.
                </p>
              </div>
            </div>
            <p>
              No empirical records are preloaded. The experiment interface accepts user measurements
              and displays an explicitly uncalibrated model comparison. A comparison alone is not
              validation.
            </p>
          </section>
          <section id="optimization">
            <span className="eyebrow">07 / SEARCH</span>
            <h2>A bounded search.</h2>
            <p>
              The objective is minimum peak boundary outflow. The optimizer evaluates the
              no-intervention baseline and feasible combinations of one detention basin at three
              centerline locations with three capacities: 100, 300, or 600 m³. Each candidate must
              meet the hypothetical budget and capture-footprint constraints.
            </p>
            <p>
              All nine possible interventions use the same model with identical nonintervention
              inputs. Ties favor lower cost. The selected result is globally best only within this
              tiny enumerated set. The cheapest feasible intervention provides a simple reference
              strategy; equal-cost ties use enumeration order. There is no AI, continuous
              optimization, or claim of globally optimal infrastructure.
            </p>
          </section>
          <section id="provenance">
            <span className="eyebrow">08 / PROVENANCE & NEXT STEPS</span>
            <h2>Keep the evidence attached.</h2>
            <p>
              All model inputs are synthetic demonstration data or user-entered assumptions.
              Historical source metadata lives separately in the source registry. A typed
              dataset-provenance interface records provider, retrieval date, units, coordinate
              reference system, horizontal resolution, vertical datum, processing, license, and
              limitations for future adapters. No geographic dataset is integrated today.
            </p>
            <p>
              The model omits real topography, floodplain hydraulics, channel conveyance, drainage
              networks, buildings, levees, sediment, changing infiltration, and uncertain downstream
              conditions. Present runs are deterministic estimates without prediction intervals. Do
              not use them for emergency response or engineering design.
            </p>
            <p>
              Next, build a measured tabletop catchment, quantify rainfall input and collection
              losses, measure outflow through time, repeat at least three times, and report
              measurement uncertainty. Hold out experiments for evaluation after calibration.
              Compare hydrograph timing, volume, peak flow, and closure; publish failures as well as
              successes.
            </p>
            <div className="button-row">
              <Link className="button primary" href="/experiments">
                Record an experiment <ArrowRight size={15} />
              </Link>
              <Link className="button ghost" href="/case-study#sources">
                Research sources <ArrowUpRight size={15} />
              </Link>
            </div>
          </section>
        </article>
      </section>
      <Footer />
    </main>
  );
}
