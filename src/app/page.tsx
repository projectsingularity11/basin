'use client';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react';
import { useRef, useState } from 'react';
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

const clips = ['surface', ...chapters.map(({ clip }) => clip)];

export default function Home() {
  const story = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  useOceanScroll(story, paused);

  return (
    <main id="main" className="flood-home">
      <div ref={story} className="ocean-descent">
        <div className="ocean-backdrop" aria-hidden="true">
          {clips.map((clip, index) => (
            <div className={`ocean-scene ocean-${clip}`} data-ocean-scene key={clip}>
              <video
                muted
                loop
                playsInline
                poster={`/dive/${clip}.webp`}
                src={index === 0 ? '/dive/surface.mp4' : undefined}
                data-source={`/dive/${clip}.mp4`}
                preload={index === 0 ? 'metadata' : 'none'}
                disablePictureInPicture
              />
              {clip === 'floor' && (
                <div className="angler-rig">
                  <div className="angler-spill" />
                  <div className="angler-wildlife" />
                  <div className="angler-lure" />
                </div>
              )}
            </div>
          ))}
          <div className="ocean-surface-glare" />
          <div className="ocean-film" />
          <div className="ocean-silt" />
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
            data-dive-chapter
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
          <div className="dive-progress" aria-hidden="true">
            <div />
          </div>
          <button
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? 'Play ocean footage' : 'Pause ocean footage'}
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        </div>
      </div>
      <section className="dive-credits" aria-label="Ocean footage credits">
        <details>
          <summary>Ocean footage credits</summary>
          <ul>
            <li>
              <a href="https://commons.wikimedia.org/wiki/File:Waves_of_the_sea_(Video).webm">
                Ocean waves · Amada44
              </a>
              {' · '}
              <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>
            </li>
            <li>
              <a href="https://www.pexels.com/video/underwater-school-of-fish-swimming-in-coral-reef-33009956/">
                Coral reef · JUN HO LEE
              </a>
            </li>
            <li>
              <a href="https://www.pexels.com/video/view-from-above-on-humpbacks-11279748/">
                Humpbacks · Stockfilm.com
              </a>
            </li>
            <li>
              <a href="https://commons.wikimedia.org/wiki/File:Swimming_with_a_whale_shark_(Rhincodon_typus)_(no_audio).webm">
                Whale shark · David Rojo
              </a>{' '}
              · <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>
            </li>
            <li>
              <a href="https://commons.wikimedia.org/wiki/File:Jellyfish_-_Deepwater_Exploration_of_the_Marianas_expedition_-_April_24,_2016.webm">
                Mariana Islands jellyfish · NOAA Ocean Exploration
              </a>
            </li>
            <li>
              <a href="https://commons.wikimedia.org/wiki/File:Poisson_et_fonds_abyssaux_(Ifremer_00701-81286).webm">
                Abyssal footage · Ifremer
              </a>{' '}
              · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
            </li>
          </ul>
          <p>
            Footage excerpts are trimmed, muted and color graded. The anglerfish and its light are
            animated illustrations composited over seabed footage.
          </p>
        </details>
      </section>
      <Footer />
    </main>
  );
}
