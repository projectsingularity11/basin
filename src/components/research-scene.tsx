import Link from 'next/link';
import { ArrowDown } from 'lucide-react';

export function ResearchScene({
  title,
  description,
  image,
  action,
  headingId,
  back,
}: {
  title: [string, string];
  description: string;
  image: string;
  action: string;
  headingId?: string;
  back?: string;
}) {
  return (
    <>
      <section className="research-scene">
        <div
          className="research-scene-art"
          style={{ backgroundImage: 'url(' + image + ')' }}
          aria-hidden="true"
        />
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
        </div>
        <a className="research-scene-cue" href="#scene-content">
          {action}
          <span>
            <ArrowDown size={19} aria-hidden />
          </span>
        </a>
      </section>
      <div id="scene-content" tabIndex={-1} />
    </>
  );
}
