import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { expeditions } from '@/data/expeditions';

export const metadata = { title: 'Flood expeditions' };

export default function Explore() {
  return (
    <main id="main">
      <section className="page-heading">
        <h1>Flood expeditions</h1>
        <p>Follow runoff, investigate Hurricane Harvey, and test ways to hold stormwater.</p>
      </section>
      <section className="content-width route-expeditions" aria-label="Choose an expedition">
        {expeditions.map(({ slug, title, text, art }) => (
          <Link key={slug} href={`/explore/${slug}`} className="route-expedition">
            <Image
              src={`/expeditions/${art}.webp`}
              alt=""
              fill
              sizes="(max-width: 720px) 90vw, 32vw"
            />
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
            <ArrowUpRight aria-hidden size={23} />
          </Link>
        ))}
      </section>
    </main>
  );
}
