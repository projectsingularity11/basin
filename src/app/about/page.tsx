import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
export const metadata = { title: 'About the research' };
export default function About() {
  return (
    <main id="main">
      <section className="page-heading">
        <h1>About BASIN</h1>
        <p>
          A student research project for exploring flood mitigation with measurable terrain and
          repeatable storm scenarios.
        </p>
      </section>
      <section className="article-layout content-width">
        <aside className="article-aside">
          <span className="eyebrow">THE RESEARCH QUESTION</span>
          <p>
            Can an accessible, simplified, physically testable stormwater model help compare
            interventions under cost and space constraints?
          </p>
        </aside>
        <article className="prose">
          <h2>What BASIN does</h2>
          <p>
            BASIN is a student research prototype being developed toward Samsung Solve for Tomorrow.
            Its purpose is to make the relationship between rainfall, terrain, and stormwater
            interventions explorable and open to scrutiny. No competition award, official
            affiliation, institutional endorsement, or empirical validation is claimed.
          </p>
          <p>
            The project begins with a synthetic watershed and a real community-infrastructure
            question motivated by Hurricane Harvey’s disruption of the Barbara Bush Branch Library.
            It invites users to make a hypothesis, change the landscape, and inspect the calculated
            consequences.
          </p>
          <h2>What still needs testing</h2>
          <div className="roadmap-row">
            <span className="mono">01</span>
            <div>
              <span className="badge">IMPLEMENTED</span>
              <h3>The computational laboratory</h3>
              <p>
                A conservative rainfall–runoff engine, interactive terrain, hypothetical
                interventions, independently calculated comparisons, exhaustive discrete search,
                local records, and transparent methods.
              </p>
            </div>
          </div>
          <div className="roadmap-row">
            <span className="mono">02</span>
            <div>
              <span className="badge amber">PLANNED</span>
              <h3>A physical watershed</h3>
              <p>
                Build a small catchment with measured geometry. Calibrate applied rainfall and
                collected outflow, quantify measurement uncertainty, and repeat controlled baseline
                and intervention experiments.
              </p>
            </div>
          </div>
          <div className="roadmap-row">
            <span className="mono">03</span>
            <div>
              <span className="badge muted">PLANNED</span>
              <h3>From synthetic terrain to real context</h3>
              <p>
                Evaluate additional elevation and rainfall sources. Verify coordinate systems and
                vertical datums. Establish a suitable hydraulic method and independent observations
                before making location-specific predictions.
              </p>
            </div>
          </div>
          <h2 id="media">Media credits</h2>
          <ul>
            <li>
              <a href="https://www.pexels.com/video/beautiful-ocean-horizon-with-blue-sky-34863578/">
                Ocean horizon by Marianna Sigov
              </a>
              , Pexels. Cropped and trimmed.
            </li>
            <li>
              <a href="https://github.com/gretzke/open-alarm/blob/main/OpenAlarm/Resources/Ringtones/SOURCES.md">
                Ocean waves, Kalundborg Fjord by Luftrum
              </a>
              , <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>. Trimmed,
              leveled and looped.
            </li>
            <li>
              <a href="https://freesound.org/s/482167/">Underwater Ambience by Tim_Verberne</a>,
              CC0. Found through the{' '}
              <a href="https://github.com/EssekerDev/cozywave-assets">CozyWave GitHub credits</a>{' '}
              and edited into a loop.
            </li>
            <li>
              <a href="https://commons.wikimedia.org/wiki/File:170831-F-KA253-0647_(36959990702).jpg">
                Hurricane Harvey flooding in Houston, August 31, 2017
              </a>
              . U.S. Air Force photo by Tech. Sgt. Larry E. Reid Jr.
            </li>
          </ul>
          <p>
            The terrain image uses USGS 3DEP elevation data. The mitigation image shows a BASIN
            screening result.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/lab">
              Launch laboratory <ArrowRight size={15} />
            </Link>
            <a
              className="button ghost"
              href="https://github.com/projectsingularity11/basin"
              target="_blank"
              rel="noreferrer"
            >
              View source code <ArrowUpRight size={15} />
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}
