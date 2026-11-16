import Link from 'next/link';
import { ArrowUpRight, BookOpen, Waves, ArrowRight } from 'lucide-react';
import { Footer } from '@/components/shell';
import { sources } from '@/data/sources';
export const metadata = { title: 'Hurricane Harvey case study' };
export default function CaseStudy() {
  return (
    <main id="main">
      <section className="case-hero">
        <div className="eyebrow">04 / THE HUMAN CONTEXT</div>
        <div className="case-columns">
          <div>
            <h1>
              More than
              <br />a building.
              <br />
              <span>
                A community
                <br />
                resource.
              </span>
            </h1>
            <p>
              Barbara Bush Branch Library
              <br />
              Spring, Texas · Hurricane Harvey, 2017
            </p>
          </div>
          <div className="case-graphic" aria-hidden="true">
            <div className="library-illustration">
              <BookOpen strokeWidth={0.7} />
              <span>
                BARBARA BUSH
                <br />
                BRANCH LIBRARY
              </span>
              <Waves strokeWidth={0.6} />
            </div>
            <span className="mono">CONCEPTUAL ILLUSTRATION · NOT A FLOOD RECORD</span>
          </div>
        </div>
      </section>
      <section className="article-layout content-width">
        <aside className="article-aside">
          <span className="eyebrow">HISTORICAL CONTEXT</span>
          <p>Evidence before inference.</p>
          <a className="text-link" href="#sources">
            View the source registry <ArrowUpRight size={13} />
          </a>
        </aside>
        <article className="prose">
          <h2>When water interrupts everyday life.</h2>
          <p>
            Hurricane Harvey brought severe flooding to the Houston region in 2017. NOAA’s rainfall
            archive documents the regional event. Those regional measurements are context; they are
            not a measurement of rainfall at this library.{' '}
            <a href={sources[2].url} target="_blank" rel="noreferrer">
              [NOAA / WPC ↗]
            </a>
          </p>
          <p>
            The Barbara Bush Branch Library in Spring was severely damaged during Harvey. A May 14,
            2018 KPRC report described the library’s reopening following the storm-related closure.
            BASIN uses this documented disruption as a motivation for studying public infrastructure
            resilience.{' '}
            <a href={sources[0].url} target="_blank" rel="noreferrer">
              [KPRC, May 2018 ↗]
            </a>
          </p>
          <h2>Access is part of resilience.</h2>
          <p>
            A library connects people with books, computers, information, and shared space. American
            Libraries’ coverage of Harvey describes Harris County library branches supporting
            residents with internet access and recovery paperwork. Flood disruption therefore raises
            a question beyond property damage: how can essential community services remain
            accessible?{' '}
            <a href={sources[1].url} target="_blank" rel="noreferrer">
              [American Libraries ↗]
            </a>
          </p>
          <blockquote>
            Can a transparent, accessible model help people explore the trade-offs of making room
            for stormwater?
          </blockquote>
          <h2>Historical motivation. Synthetic experiment.</h2>
          <p>
            The BASIN laboratory is an illustrative watershed experiment, not a validated
            reconstruction of the historical event. It uses no surveyed library elevations, building
            coordinates, observed flood boundary, or site-specific rainfall series. The model cannot
            establish whether any proposed intervention would have protected this library.
          </p>
          <div className="text-callout">
            <h3>What the evidence does not establish</h3>
            <p>
              This prototype does not report a measured library flood depth, a damage estimate, an
              engineering remedy, or a calibrated Harvey simulation. These would require
              site-specific primary records, field data, and a suitable validated model. No
              first-person experience or community interviews are claimed.
            </p>
          </div>
          <h2>From a real question to a testable model.</h2>
          <p>
            Start with a synthetic catchment. Keep rainfall and terrain fixed. Add hypothetical
            detention or permeability. Measure the computed change, inspect conservation, and ask
            which assumptions matter. The next research step is a repeatable physical watershed
            experiment.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/lab">
              Explore the laboratory <ArrowRight size={15} />
            </Link>
            <Link className="button ghost" href="/experiments">
              Experiment validation <ArrowUpRight size={15} />
            </Link>
          </div>
        </article>
      </section>
      <section className="content-width source-section" id="sources">
        <div className="eyebrow">SOURCE REGISTRY</div>
        <h2>Trace every claim.</h2>
        <p className="muted">
          Retrieved November 15, 2026. External source data is not used as simulation input.
        </p>
        {sources.map((s, i) => (
          <a href={s.url} key={s.id} className="source-row" target="_blank" rel="noreferrer">
            <span className="mono">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <span className="eyebrow">
                {s.provider} · {s.date}
              </span>
              <h3>{s.title}</h3>
              <p>{s.note}</p>
            </div>
            <ArrowUpRight size={18} />
          </a>
        ))}
      </section>
      <Footer />
    </main>
  );
}
