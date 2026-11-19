import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowDown, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { expeditions } from '@/data/expeditions';
import { LibraryStudy } from '@/components/library-study';
import library from '@/data/library-usgs.json';
import type { GeographicTerrain } from '@/lib/geo/contracts';

export function generateStaticParams() {
  return expeditions.map(({ slug }) => ({ slug }));
}

type ExpeditionPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ExpeditionPageProps) {
  const { slug } = await params;
  const expedition = expeditions.find((item) => item.slug === slug);
  return { title: expedition?.title, description: expedition?.text };
}

export default async function ExpeditionPage({ params }: ExpeditionPageProps) {
  const { slug } = await params;
  const expedition = expeditions.find((item) => item.slug === slug);
  if (!expedition) notFound();

  return (
    <main id="main" className={`expedition-landing expedition-${expedition.art}`}>
      <section className="expedition-opening">
        <div className="expedition-opening-content">
          <Link className="expedition-back" href="/classic#expeditions">
            <ArrowLeft size={15} /> All expeditions
          </Link>
          <p className="expedition-type">{expedition.label}</p>
          <h1>{expedition.title}</h1>
          <p className="expedition-lead">{expedition.lead}</p>
          <a className="flood-action" href="#field-guide">
            Explore the study <ArrowDown size={16} />
          </a>
        </div>
      </section>
      <section id="field-guide" className="expedition-guide">
        <div className="expedition-guide-intro">
          <h2>What you’ll explore</h2>
          <p>{expedition.text}</p>
          {slug === 'detention' && <LibraryStudy geographic={library as GeographicTerrain} />}
          <Link className="flood-action" href={expedition.href}>
            {expedition.action} <ArrowUpRight size={16} />
          </Link>
        </div>
        <ol className="expedition-steps">
          {expedition.steps.map(([title, text]) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
