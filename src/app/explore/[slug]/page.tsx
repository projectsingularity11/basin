import { ResearchScene } from '@/components/research-scene';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { expeditions } from '@/data/expeditions';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [...expeditions.map(({ slug }) => ({ slug })), { slug: 'about' }];
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return {
    title:
      slug === 'about' ? 'About BASIN' : expeditions.find((entry) => entry.slug === slug)?.title,
  };
}

export default async function Expedition({ params }: Props) {
  const { slug } = await params;
  if (slug === 'about') {
    return (
      <main id="main">
        <ResearchScene
          title={['About', 'BASIN']}
          image="/research/about-flood.webp"
          description="A student research project that explores flood mitigation using elevation data and repeatable storm scenarios."
          caption="Houston after Hurricane Harvey · August 31, 2017"
          action="Read about BASIN"
        />
        <section className="article-layout content-width">
          <article className="prose">
            <h2>What can the model help us test?</h2>
            <p>
              Compare how runoff responds to changes in rainfall, infiltration and detention on a
              defined grid. Inspect the terrain source and water balance before interpreting a
              result.
            </p>
            <div className="button-row">
              <Link href="/methodology" className="button primary">
                Model methods
              </Link>
              <Link href="/credits" className="button">
                Media credits
              </Link>
            </div>
          </article>
        </section>
      </main>
    );
  }
  const expedition = expeditions.find((entry) => entry.slug === slug);
  if (!expedition) notFound();

  return (
    <main id="main">
      <ResearchScene
        title={[expedition.title.split(' ')[0], expedition.title.split(' ').slice(1).join(' ')]}
        image={'/expeditions/' + expedition.art + '.webp'}
        description={expedition.lead}
        action="Read the expedition"
        back="/explore"
      />
      <section className="article-layout content-width">
        <aside className="article-aside">
          <Link href={expedition.href} className="button primary">
            {expedition.action} <ArrowUpRight size={16} />
          </Link>
        </aside>
        <article className="prose">
          {expedition.steps.map(([title, description]) => (
            <section key={title}>
              <h2>{title}</h2>
              <p>{description}</p>
            </section>
          ))}
        </article>
      </section>
    </main>
  );
}
