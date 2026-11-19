'use client';
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export function WaterMotion() {
  const surface = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = surface.current,
      context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = matchMedia('(pointer: fine)');
    const ripples: { x: number; y: number; time: number; strength: number }[] = [];
    let frame = 0,
      last = 0;
    const resize = () => {
      canvas.width = Math.round(innerWidth * 0.75);
      canvas.height = Math.round(innerHeight * 0.75);
    };
    function move(event: PointerEvent) {
      if (motion.matches || !pointer.matches || event.pointerType === 'touch') return;
      const time = performance.now();
      if (time - last < 36) return;
      last = time;
      ripples.push({
        x: event.clientX * 0.75,
        y: event.clientY * 0.75,
        time,
        strength: Math.min(1, Math.hypot(event.movementX, event.movementY) / 16 + 0.15),
      });
      if (ripples.length > 12) ripples.shift();
      if (!frame) frame = requestAnimationFrame(draw);
    }
    function draw(now: number) {
      frame = 0;
      if (!canvas || !context || document.hidden || (!ripples.length && !last)) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (motion.matches || !pointer.matches) ripples.length = 0;
      while (ripples.length && now - ripples[0].time > 900) ripples.shift();
      if (!ripples.length) {
        last = 0;
        return;
      }
      frame = requestAnimationFrame(draw);
      for (const ripple of ripples) {
        const progress = Math.max(0, (now - ripple.time) / 900);
        for (let ring = 0; ring < 2; ring++) {
          const radius = 3 + progress * 75 - ring * 6;
          if (radius <= 0) continue;
          context.strokeStyle = `rgba(161,235,255,${((1 - progress) ** 2 * ripple.strength * 0.42) / (ring + 1)})`;
          context.lineWidth = 1.3;
          context.beginPath();
          context.ellipse(ripple.x, ripple.y, radius, radius * 0.69, -0.2, 0, Math.PI * 2);
          context.stroke();
        }
      }
    }
    resize();
    addEventListener('resize', resize);
    addEventListener('pointermove', move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('resize', resize);
      removeEventListener('pointermove', move);
    };
  }, []);
  return <canvas className="water-pointer" ref={surface} aria-hidden="true" />;
}

export function useOceanScroll(story: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const element = story.current;
    if (!element) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | undefined;
    let frame = 0;
    const update = () => {
      const height = element.clientHeight - innerHeight;
      const depth = Math.max(
        0,
        Math.min(3, (-element.getBoundingClientRect().top / Math.max(1, height)) * 3),
      );
      const set = (key: string, value: number) => element.style.setProperty(key, String(value));
      for (let i = 1; i <= 3; i++) {
        const progress = Math.max(0, Math.min(1, (depth - i + 0.86) / 0.73));
        set('--layer-' + i, progress * progress * (3 - 2 * progress));
      }
      set('--descent', depth);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      lenis?.destroy();
      lenis = preference.matches
        ? undefined
        : new Lenis({ lerp: 0.072, smoothWheel: true, anchors: true });
      if (lenis) {
        const tick = (time: number) => {
          lenis?.raf(time);
          frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      }
      update();
    };
    start();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    preference.addEventListener('change', start);
    return () => {
      cancelAnimationFrame(frame);
      lenis?.destroy();
      removeEventListener('scroll', update);
      removeEventListener('resize', update);
      preference.removeEventListener('change', start);
    };
  }, [story]);
}
