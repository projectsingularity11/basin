'use client';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowRight,
  MoveUpRight,
  FlaskConical,
  Layers,
  GitCompareArrows,
  ScanLine,
} from 'lucide-react';
import { useMemo } from 'react';
import Terrain from '@/components/terrain-view';
import { DEFAULT, simulate } from '@/engine/model';
import { Footer, disclaimer } from '@/components/shell';
export default function Home() {
  const run = useMemo(() => simulate(DEFAULT), []);
  return (
    <main id="main">
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-top mono">
          <span>
            <i className="status-dot" /> AN OPEN LABORATORY FOR A CHANGING CLIMATE
          </span>
          <span>MODEL 01 / SYNTHETIC CATCHMENT</span>
        </div>
        <div className="hero-copy">
          <div className="eyebrow">EXPLORE. INTERVENE. UNDERSTAND.</div>
          <h1>
            Understand
            <br />
            where <span>water</span>
            <br />
            goes<span className="period">.</span>
          </h1>
          <p>
            Every landscape tells a water story.
            <br />
            Explore the forces behind runoff—and test
            <br className="desktop-break" /> what happens when we change the terrain.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/lab">
              Launch laboratory <ArrowUpRight size={19} />
            </Link>
            <Link className="text-link" href="/case-study">
              The story behind BASIN <ArrowRight size={16} />
            </Link>
          </div>
          <div className="hero-note">
            <FlaskConical size={15} />
            <span>
              Real calculations. Transparent assumptions.
              <br />
              An experimental research prototype.
            </span>
          </div>
        </div>
        <div className="hero-scene">
          <Terrain scenario={DEFAULT} frame={run.frames[40]} hero />
          <div className="scene-tag mono">
            <span className="cross">+</span> VALLEY CATCHMENT{' '}
            <small>SYNTHETIC DEMONSTRATION DATA</small>
          </div>
          <div className="scene-coordinate mono">
            240 × 240 m <span>/</span> 576 COMPUTATIONAL CELLS
          </div>
          <div className="hero-depth">
            <i />
            <span>
              SURFACE WATER <b>Simulated estimates</b>
            </span>
            <ScanLine size={21} />
          </div>
        </div>
        <div className="hero-bottom">
          <span className="mono">01 — THE LANDSCAPE IS THE LABORATORY</span>
          <span>
            Drag to orbit <span className="muted">/</span> Scroll to zoom
          </span>
          <Link href="/methodology">
            See how the model works <MoveUpRight size={14} />
          </Link>
        </div>
      </section>
      <section className="intro-strip">
        <div>
          <span className="eyebrow">A QUESTION WORTH EXPLORING</span>
          <h2>
            What if we could
            <br />
            make room for water?
          </h2>
        </div>
        <p>
          BASIN brings rainfall, terrain, and stormwater interventions into one explorable
          environment. Change a variable. Run the model. Follow the water—and the evidence.
        </p>
        <Link className="round-link" href="/lab" aria-label="Explore the laboratory">
          <ArrowUpRight />
        </Link>
      </section>
      <section className="pathways">
        {[
          {
            n: '01',
            icon: Layers,
            title: 'Read the landscape',
            text: 'Watch a conservative numerical model route rainfall across a synthetic watershed.',
            href: '/lab',
            link: 'Enter the laboratory',
          },
          {
            n: '02',
            icon: GitCompareArrows,
            title: 'Test a different future',
            text: 'Add hypothetical storage or permeable surfaces. Compare the actual computed outcomes.',
            href: '/compare',
            link: 'Compare scenarios',
          },
          {
            n: '03',
            icon: FlaskConical,
            title: 'Question every result',
            text: 'Inspect water balance, understand the assumptions, and see what still needs validation.',
            href: '/methodology',
            link: 'Explore the methodology',
          },
        ].map((p) => (
          <Link className="pathway" href={p.href} key={p.n}>
            <div className="pathway-top">
              <span className="mono">{p.n}</span>
              <p.icon size={22} />
            </div>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
            <span className="text-link">
              {p.link}
              <ArrowUpRight size={16} />
            </span>
          </Link>
        ))}
      </section>
      <div className="disclaimer home-disclaimer">
        <FlaskConical size={18} />
        <p>{disclaimer}</p>
        <span className="mono">KNOW THE LIMITS.</span>
      </div>
      <Footer />
    </main>
  );
}
