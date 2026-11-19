'use client';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { useRef } from 'react';
import { Footer } from '@/components/shell';
import { useOceanScroll } from '@/components/water-motion';

export default function Home() {
  const story = useRef<HTMLDivElement>(null);
  useOceanScroll(story);
  return (
    <main id="main" className="flood-home">
      <div ref={story} className="ocean-descent">
        <div className="ocean-backdrop" aria-hidden="true">
          <div className="ocean-art ocean-day" />
          <div className="ocean-art ocean-shallow">
            <i className="swimmer school" />
          </div>
          <div className="ocean-art ocean-pelagic">
            <i className="swimmer whale" />
            <i className="swimmer shark" />
          </div>
          <div className="ocean-art ocean-deep">
            <i className="angler-light" />
            <i className="swimmer angler" />
          </div>
          <div className="ocean-film" />
        </div>
        <section className="flood-hero">
          <div>
            <h1>BASIN</h1>
            <p>Model runoff. Test ways to reduce flooding.</p>
            <Link className="flood-action" href="/earth">
              Start a flood study <ArrowUpRight size={17} />
            </Link>
          </div>
          <a href="#runoff" className="dive-link" aria-label="Scroll to flood modeling">
            <ArrowDown size={22} />
          </a>
        </section>
        <section id="runoff" className="dive-section">
          <div>
            <h2>
              Where does
              <br />
              the rain go?
            </h2>
            <p>
              Choose a location and load elevation to see where rainfall collects and where it
              drains.
            </p>
            <Link href="/earth">
              Choose a study area <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
        <section className="dive-section dive-right">
          <div>
            <h2>
              Test ways to
              <br />
              slow the runoff.
            </h2>
            <p>
              Compare how detention and infiltration change the modeled peak discharge during a
              storm.
            </p>
            <Link href="/study">
              Compare detention options <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
        <section className="dive-section dive-final">
          <div>
            <h2>
              Hurricane Harvey
              <br />
              in Spring, Texas.
            </h2>
            <p>
              Flooding closed the Barbara Bush Branch Library. The case study documents what
              happened and what evidence a local mitigation study would need.
            </p>
            <Link href="/case-study">
              Read the case study <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
