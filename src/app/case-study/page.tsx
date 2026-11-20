import { ResearchScene } from '@/components/research-scene';
import Link from 'next/link';
import { LibraryStudy } from '@/components/library-study';
import { sources } from '@/data/sources';
import library from '@/data/library-usgs.json';
import { DEFAULT } from '@/engine/model';
import { investigate } from '@/engine/watershed';
import type { GeographicTerrain } from '@/lib/geo/contracts';
export const metadata = { title: 'Hurricane Harvey and the Barbara Bush Branch Library' };
export default function CaseStudy() {
  const result = investigate(
    {
      ...DEFAULT,
      name: 'Barbara Bush Branch Library',
      geographic: library as GeographicTerrain,
      size: 24,
      cellSize: 40,
    },
    { maxFootprint: 40000, maxCapacity: 600, stormMultiplier: 1.25 },
  );
  return (
    <main id="main">
      <ResearchScene
        title={['Hurricane Harvey', 'and the Barbara Bush Branch Library']}
        image="/expeditions/harvey.webp"
        caption="Houston, August 31, 2017 · U.S. Air Force"
        description="Spring, Texas · August 2017"
        action="Read the case"
        back="/journeys"
      />
      <section className="article-layout content-width">
        <aside className="article-aside">
          <a href="#analysis">Runoff study ↗</a>
          <br />
          <a href="#sources">Sources ↗</a>
        </aside>
        <article className="prose">
          <h2>Flooding interrupted library services</h2>
          <p>
            Harvey flooded parts of the Houston region and damaged the Barbara Bush Branch Library.
            The branch reopened in May 2018. BASIN uses the site to illustrate how detention
            candidates can be compared on measured terrain.
          </p>
          <p>
            <a href={sources[0].url}>KPRC, May 2018 ↗</a> ·{' '}
            <a href={sources[3].url}>NOAA storm report ↗</a> ·{' '}
            <a href={sources[2].url}>NOAA rainfall archive ↗</a>
          </p>
          <p className="tiny">
            The cover photo shows flooding in the wider Houston area on August 31, 2017.
            <a href="https://commons.wikimedia.org/wiki/File:170831-F-KA253-0647_(36959990702).jpg">
              {' '}
              U.S. Air Force photo credit ↗
            </a>
          </p>
          <h2 id="analysis">Screening detention near the library</h2>
          <p>
            The study uses 576 USGS 3DEP elevation samples on a 960 m square around 6817 Cypresswood
            Drive. The map point comes from OpenStreetMap via Photon. The two model storms apply
            uniform rainfall at 60 and 75 mm/h for one hour with assumed infiltration of 5 mm/h and
            open model edges.
          </p>
          <p>
            The largest drainage area inside the square covers{' '}
            {((result.grid.catchment.length * 1600) / 10000).toFixed(1)} hectares. The solver
            evaluates the entire square. {result.evaluatedRuns} runs cover the two baselines and{' '}
            {result.candidates.length} detention configurations. Combined boundary peak discharge
            for the two baselines is{' '}
            {result.baseline.map((r) => r.peakDischarge.toFixed(3)).join(' and ')} m³/s.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Site cell</th>
                  <th>Storage (m³)</th>
                  <th>Peak change, 60 mm/h (m³/s)</th>
                  <th>Peak change, 75 mm/h (m³/s)</th>
                </tr>
              </thead>
              <tbody>
                {result.pareto.map((c) => (
                  <tr key={c.cell + ':' + c.capacity}>
                    <td>{c.cell}</td>
                    <td>{c.capacity}</td>
                    <td>{(-c.peakReduction[0]).toFixed(3)}</td>
                    <td>{(-c.peakReduction[1]).toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            A negative change indicates a lower modeled peak. The results apply to the selected
            square and the stated storms. Historical hourly rainfall, surveyed drainage connections,
            creek stages, building entry elevations, and validation observations are needed to
            assess library flood impacts.
          </p>
          <div className="button-row">
            <LibraryStudy geographic={library as GeographicTerrain} />
            <Link className="button" href="/methodology">
              Model methods
            </Link>
          </div>
          <h2 id="sources">Sources</h2>
          <ul>
            <li>
              <a href="https://hcpl.net/locations/cc/">
                Harris County Public Library branch address
              </a>
            </li>
            <li>
              <a href="https://photon.komoot.io/api/?q=Barbara%20Bush%20Branch%20Library">
                Photon place record
              </a>
            </li>
            <li>
              <a href={library.provenance.sourceUrl}>USGS elevation request</a>
            </li>
            <li>
              <a href="https://www.hcfcd.org/">Harris County Flood Control District</a>
            </li>
            {sources.slice(0, 4).map((s) => (
              <li key={s.id}>
                <a href={s.url}>{s.title}</a>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
