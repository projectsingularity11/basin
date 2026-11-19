'use client';

import { useEffect, useRef } from 'react';

export function ReefScene({ paused }: { paused: boolean }) {
  const film = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = film.current;
    if (!video) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const update = () => {
      if (visible && !paused && !reduced.matches && !document.hidden) {
        if (!video.hasAttribute('src')) video.src = '/dive/reef.mp4';
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { threshold: 0.12 },
    );
    observer.observe(video);
    reduced.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      reduced.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
      video.pause();
    };
  }, [paused]);

  return (
    <video
      ref={film}
      className="reef-film"
      muted
      loop
      playsInline
      preload="none"
      poster="/dive/reef.webp"
      aria-hidden="true"
    />
  );
}
