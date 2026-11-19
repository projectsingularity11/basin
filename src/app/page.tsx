'use client';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Mark } from '@/components/logo';
import { OceanLife } from '@/components/ocean-life';
import { Footer } from '@/components/shell';
import { useOceanScroll } from '@/components/water-motion';

const chapters = [
  {
    clip: 'reef',
    title: 'Follow the rain.',
    text: 'Runoff follows slopes and collects in low ground. Choose a real study area and load elevation to see how terrain shapes the routes water can take.',
    href: '/earth',
    action: 'Choose a study area',
  },
  {
    clip: 'whale',
    title: 'Build a storm scenario.',
    text: 'Set rainfall and soil infiltration, then watch modeled runoff move across the terrain. Pavement, saturated ground, and steep slopes can all change how quickly water reaches a low point.',
    href: '/lab',
    action: 'Open the laboratory',
  },
  {
    clip: 'shark',
    title: 'Test ways to slow runoff.',
    text: 'Detention stores water for later release. Infiltration gives it time to soak into the ground. Compare both against a baseline under the same storm.',
    href: '/study',
    action: 'Compare mitigation options',
  },
  {
    clip: 'deep',
    title: 'Measure what changes.',
    text: 'A lower peak discharge can ease pressure downstream. Compare the peak, its timing, and the total runoff volume to see where a scenario helps and where it falls short.',
    href: '/compare',
    action: 'Compare scenarios',
  },
  {
    clip: 'floor',
    title: 'Hurricane Harvey in Spring, Texas.',
    text: 'Flooding closed the Barbara Bush Branch Library. The case study traces what happened and what local rainfall, drainage, and flood records would be needed to evaluate mitigation.',
    href: '/case-study',
    action: 'Read the Harvey case study',
  },
] as const;

export default function Home() {
  const story = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  useOceanScroll(story);

  useEffect(() => {
    const fallback = window.setTimeout(() => setLoading(false), 1500);
    return () => window.clearTimeout(fallback);
  }, []);

  return (
    <main id="main" className="flood-home">
      <div className="dive-loader" data-loading={loading} aria-hidden={!loading} inert={!loading}>
        <div className="dive-loader-content">
          <Mark size={52} />
          <p role="status">Loading ocean</p>
          <span className="dive-loader-track" aria-hidden="true" />
          <button onClick={() => setLoading(false)}>Continue to BASIN</button>
        </div>
      </div>
      <div ref={story} className="ocean-descent" data-paused={paused}>
        <div className="ocean-world" aria-hidden="true">
          <Image
            className="ocean-world-image"
            src="/ocean-world.webp"
            alt=""
            fill
            unoptimized
            fetchPriority="high"
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
          />
          <div className="ocean-current" />
          <div className="ocean-world-shade" />
        </div>
        <div className="ocean-backdrop" aria-hidden="true">
          <OceanLife story={story} paused={paused} />
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
        {chapters.map(({ clip, title, text, href, action }, index) => (
          <section
            id={index === 0 ? 'runoff' : undefined}
            className={`dive-section dive-${clip}${index % 2 ? ' dive-right' : ''}`}
            data-dive-chapter=""
            key={clip}
          >
            <div className="dive-copy">
              <h2>{title}</h2>
              <p>{text}</p>
              <Link href={href}>
                {action} <ArrowUpRight size={16} />
              </Link>
            </div>
          </section>
        ))}
        <section className="dive-section dive-final">
          <div className="dive-copy">
            <h2>What the model can tell you.</h2>
            <p>
              BASIN can compare runoff scenarios under shared assumptions. Decisions about a real
              site require local drainage data, observed floods, and professional review.
            </p>
            <Link href="/methodology">
              Read the methods and limitations <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
        <div className="dive-controls">
          <div className="dive-instrument" aria-hidden="true">
            <span>Dive progress</span>
            <span className="dive-percent" data-dive-percent>
              0%
            </span>
            <div className="dive-progress">
              <div />
            </div>
          </div>
          <button
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? 'Resume ocean animation' : 'Pause ocean animation'}
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        </div>
      </div>
      <Footer />
    </main>
  );
}
