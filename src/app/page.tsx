'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, ArrowRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import Terrain from '@/components/terrain-view';
import { DEFAULT, simulate, makeIntervention } from '@/engine/model';
import { Footer } from '@/components/shell';
const Ocean = dynamic(() => import('@/components/ocean'), { ssr: false });
export default function Home() {
  const [intervention, setIntervention] = useState(false);
  const runs = useMemo(
      () => [
        simulate(DEFAULT),
        simulate({ ...DEFAULT, interventions: [makeIntervention(DEFAULT, 420, 'detention', 600)] }),
      ],
      [],
    ),
    run = runs[intervention ? 1 : 0];
  return (
    <main id="main" className="immersive-home">
      <div id="ocean-story">
        <Ocean />
        <section className="ocean-hero">
          <div className="ocean-wordmark">
            <h1>BASIN</h1>
            <p>Model the movement of water.</p>
            <Link href="/earth" className="ocean-enter">
              Enter laboratory <ArrowUpRight size={18} />
            </Link>
          </div>
          <a href="#beneath" className="scroll-cue">
            Scroll to explore <ArrowDown size={14} />
          </a>
        </section>
        <section id="beneath" className="underwater-section">
          <div>
            <span className="scene-number">01 / WATER</span>
            <h2>
              Rainfall.
              <br />
              Storage.
              <br />
              <em>Outflow.</em>
            </h2>
            <p>Rain becomes infiltration, stored water, or outflow.</p>
          </div>
          <div className="depth-rule">
            <i />
            <span>Below the surface</span>
          </div>
        </section>
        <section className="terrain-reveal">
          <div className="reveal-title">
            <span className="scene-number">02 / LAND</span>
            <h2>
              Terrain
              <br />
              shapes <em>flow.</em>
            </h2>
            <p>Elevation changes the path water takes.</p>
          </div>
          <div className="reveal-terrain">
            <Terrain scenario={run.scenario} frame={run.frames[60]} />
            <span>Synthetic terrain · computed water depth</span>
          </div>
          <div className="intervention-demo">
            <button aria-pressed={intervention} onClick={() => setIntervention(!intervention)}>
              <span className={intervention ? 'switch active' : 'switch'} />
              {intervention ? 'With detention' : 'Add 600 m³ detention'}
              <ArrowRight size={15} />
            </button>
            <p>
              Peak outflow <strong>{run.peakOutflow.toFixed(3)} m³/s</strong>
            </p>
            <Link href="/lab">
              Try the simulation <ArrowUpRight size={14} />
            </Link>
          </div>
        </section>
      </div>
      <section className="earth-invitation">
        <div className="earth-orbit" aria-hidden="true">
          <div className="earth-sphere" />
          <i />
          <i />
        </div>
        <div>
          <span className="scene-number">03 / YOUR LOCATION</span>
          <h2>
            Select
            <br />
            <em>a region.</em>
          </h2>
          <p>
            Choose a region. Load USGS elevation.
            <br />
            Test a storm on the resulting terrain.
          </p>
          <Link className="button primary" href="/earth">
            Choose a place <ArrowUpRight size={18} />
          </Link>
          <small>U.S. elevation coverage · experimental runoff model</small>
        </div>
      </section>
      <section className="harvey-preview">
        <span className="harvey-year">2017</span>
        <div>
          <span className="scene-number">HURRICANE HARVEY / SPRING, TEXAS</span>
          <h2>
            Barbara Bush
            <br />
            Branch Library.
          </h2>
          <p>Flood damage closed the library during Hurricane Harvey.</p>
          <Link className="text-link" href="/case-study">
            Read the case study <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
      <div className="home-method">
        <p>Real terrain. Experimental model.</p>
        <Link href="/methodology">
          What the model can—and cannot—tell you <ArrowUpRight size={15} />
        </Link>
      </div>
      <Footer />
    </main>
  );
}
