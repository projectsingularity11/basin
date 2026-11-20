import { ResearchScene } from '@/components/research-scene';
export const metadata = { title: 'Media credits' };

export default function Credits() {
  return (
    <main id="main">
      <ResearchScene
        title={['Media', 'credits']}
        image="/dive/surface.webp"
        description="Imagery, elevation and sound used in BASIN’s flood studies."
        action="See credits"
        headingId="media"
      />
      <section className="article-layout content-width">
        <article className="prose">
          <ul>
            <li>
              <a href="https://www.pexels.com/video/beautiful-ocean-horizon-with-blue-sky-34863578/">
                Ocean horizon by Marianna Sigov
              </a>
              , Pexels. Cropped and trimmed.
            </li>
            <li>
              <a href="https://github.com/gretzke/open-alarm/blob/main/OpenAlarm/Resources/Ringtones/SOURCES.md">
                Ocean waves, Kalundborg Fjord by Luftrum
              </a>
              , <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>. Trimmed,
              leveled and looped.
            </li>
            <li>
              <a href="https://freesound.org/s/482167/">Underwater Ambience by Tim_Verberne</a>,
              CC0. Found through the{' '}
              <a href="https://github.com/EssekerDev/cozywave-assets">CozyWave GitHub credits</a>{' '}
              and edited into a loop.
            </li>
            <li>
              <a href="https://commons.wikimedia.org/wiki/File:170831-F-KA253-0647_(36959990702).jpg">
                Hurricane Harvey flooding in Houston, August 31, 2017
              </a>
              . U.S. Air Force photo by Tech. Sgt. Larry E. Reid Jr.
            </li>
          </ul>
          <p>
            Terrain frames use USGS 3DEP elevation around the Barbara Bush Branch Library. The
            runoff and siting frames show BASIN’s example simulations for that same area.
          </p>
        </article>
      </section>
    </main>
  );
}
