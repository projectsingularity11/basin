import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { Footer } from '@/components/shell';
export const metadata = { title: 'About the research' };
export default function About() {
  return (
    <main id="main">
      <section className="page-heading">
        <div className="eyebrow">06 / AN OPEN RESEARCH PROJECT</div>
        <h1>
          A laboratory for
          <br />
          <span>better questions.</span>
        </h1>
        <p>
          BASIN · Stormwater Intelligence Laboratory
          <br />
          v0.1 — Working research prototype
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
          <h2>Engineering curiosity into a tool.</h2>
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
          <h2>A clear path from prototype to evidence.</h2>
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
                Evaluate official elevation and rainfall sources. Verify coordinate systems and
                vertical datums. Establish a suitable hydraulic method and independent observations
                before making location-specific predictions.
              </p>
            </div>
          </div>
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
      <Footer />
    </main>
  );
}
