import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';

export function ResearchScene({
  title,
  description,
  image,
  caption,
  action,
  headingId,
  back,
}: {
  title: [string, string];
  description: string;
  image: string;
  caption?: string;
  action: string;
  headingId?: string;
  back?: string;
}) {
  return (
    <>
      <section className="research-scene">
        <figure className="research-scene-media">
          <div className="research-scene-art">
            <Image alt="" src={image} fill unoptimized loading="eager" fetchPriority="high" />
          </div>
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
        {back && (
          <Link href={back} className="research-scene-back">
            ← All expeditions
          </Link>
        )}
        <div className="research-scene-copy">
          <h1 id={headingId}>
            <span>{title[0]}</span> <span>{title[1]}</span>
          </h1>
          <p>{description}</p>
          <a className="research-scene-cue" href="#scene-content">
            {action}
            <span>
              <ArrowDown size={18} aria-hidden />
            </span>
          </a>
        </div>
      </section>
      <div id="scene-content" tabIndex={-1} />
    </>
  );
}
