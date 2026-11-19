'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Mark } from '@/components/logo';
import { OceanLife } from '@/components/ocean-life';
import { OceanSound } from '@/components/ocean-sound';
import { ReefScene } from '@/components/reef-scene';
import { expeditions } from '@/data/expeditions';
import { useOceanScroll } from '@/components/water-motion';

export default function Home() {
  const story = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  useOceanScroll(story, paused);

  useEffect(() => {
    const fallback = window.setTimeout(() => setLoading(false), 1600);
    return () => window.clearTimeout(fallback);
  }, []);

  return (
    <main id="main" className="flood-home cinematic-dive">
      <div className="dive-loader" data-loading={loading} aria-hidden={!loading} inert={!loading}>
        <div className="dive-loader-content">
          <div className="dive-loader-mark">
            <Mark size={52} />
          </div>
          <p role="status">Loading ocean</p>
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
            loading="eager"
            fetchPriority="high"
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
          />
          <div className="ocean-current" />
          <div className="ocean-coral ocean-coral-left" />
          <div className="ocean-coral ocean-coral-right" />
          <div className="ocean-world-shade" />
          <video
            className="ocean-surface-film"
            muted
            loop
            playsInline
            preload="none"
            poster="/dive/open-horizon.webp"
            data-source="/dive/open-horizon.mp4"
            disablePictureInPicture
          />
        </div>
        <div className="ocean-backdrop" aria-hidden="true">
          <OceanLife story={story} paused={paused} />
          <div className="ocean-immersion" />
        </div>
        <section className="flood-hero">
          <div className="dive-intro">
            <h1>BASIN</h1>
            <p>Follow the path of floodwater.</p>
          </div>
          <a className="dive-entry" href="#runoff">
            <span>Begin the dive</span>
            <span className="dive-entry-icon">
              <ArrowDown size={20} />
            </span>
          </a>
          <a href="#expeditions" className="dive-skip">
            Expeditions <ArrowUpRight size={14} />
          </a>
        </section>
        <section id="runoff" className="dive-section dive-reef">
          <ReefScene paused={paused} />
          <div className="dive-copy dive-reveal">
            <h2>Rain follows the shape of the land.</h2>
            <p>
              Runoff collects in low ground. When it arrives faster than it can drain, roads, homes,
              and public buildings can flood.
            </p>
            <a href="#harvey-intro">
              See what happened in Houston <ArrowDown size={16} />
            </a>
          </div>
        </section>
        <section id="harvey-intro" className="dive-section dive-harvey">
          <figure className="dive-evidence dive-reveal">
            <Image
              src="/expeditions/harvey.webp"
              alt="Aerial view of neighborhoods surrounded by floodwater in Houston after Hurricane Harvey"
              width={1200}
              height={760}
              sizes="(max-width: 720px) 90vw, 54vw"
            />
            <figcaption>Houston after Hurricane Harvey, August 2017 · U.S. Air Force</figcaption>
          </figure>
          <div className="dive-copy dive-reveal">
            <h2>After the water rose.</h2>
            <p>
              Harvey closed the Barbara Bush Branch Library in Spring, Texas. Its story shows which
              evidence a local flood investigation needs.
            </p>
            <Link href="/classic/expeditions/harvey">
              Explore the Harvey story <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
        <section className="dive-section dive-abyss">
          <div className="dive-copy dive-reveal">
            <h2>Can we slow the flow?</h2>
            <p>
              Terrain, storm timing, and drainage all matter. See what the evidence tells us about
              one flood, or test how a different setup might change the next one.
            </p>
            <a href="#expeditions">
              Choose an expedition <ArrowDown size={16} />
            </a>
          </div>
        </section>
        <div className="dive-controls">
          <OceanSound story={story} />
          <button
            type="button"
            className="dive-motion-toggle"
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? 'Resume ocean animation' : 'Pause ocean animation'}
            title={paused ? 'Resume ocean animation' : 'Pause ocean animation'}
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        </div>
      </div>
      <section id="expeditions" className="expeditions" aria-labelledby="expeditions-title">
        <header className="expeditions-heading dive-reveal">
          <h2 id="expeditions-title">Choose an expedition</h2>
        </header>
        <div className="expedition-grid">
          {expeditions.map(({ slug, title, label, text, art }) => (
            <article key={slug} className={`expedition-card expedition-${art} dive-reveal`}>
              <Link
                href={`/classic/expeditions/${slug}`}
                className="expedition-link"
                aria-label={`Explore ${title}`}
              >
                <div className="expedition-image" aria-hidden="true" />
                <div className="expedition-copy">
                  <p className="expedition-type">{label}</p>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <span className="expedition-action">
                    Explore expedition <ArrowUpRight size={16} />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
        <Link className="expedition-method" href="/methodology">
          Methods and limitations <ArrowUpRight size={15} />
        </Link>
        <Link className="expedition-method expedition-credits" href="/project-about#media">
          Media credits <ArrowUpRight size={13} />
        </Link>
      </section>
    </main>
  );
}
