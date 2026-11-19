'use client';

import { useEffect, useRef, type RefObject } from 'react';

type Creature = {
  image: string;
  x: number;
  y: number;
  width: number;
  opacity: number;
  flow: number;
  faceRight?: boolean;
  pulse?: boolean;
  lure?: boolean;
  cetacean?: boolean;
};

const inhabitants: Creature[] = [
  {
    image: '/wildlife-school.webp',
    x: 0.7,
    y: 0.2,
    width: 0.38,
    opacity: 0.84,
    flow: 0.1,
    faceRight: true,
  },
  { image: '/dive/life-clown.webp', x: 0.72, y: 0.24, width: 0.065, opacity: 0.91, flow: -0.06 },
  {
    image: '/dive/life-gramma.webp',
    x: 0.78,
    y: 0.254,
    width: 0.058,
    opacity: 0.95,
    flow: 0.08,
    faceRight: true,
  },
  { image: '/dive/life-clown.webp', x: 0.84, y: 0.271, width: 0.046, opacity: 0.78, flow: -0.06 },
  {
    image: '/dive/life-gramma.webp',
    x: 0.7,
    y: 0.28,
    width: 0.04,
    opacity: 0.7,
    flow: 0.09,
    faceRight: true,
  },
  {
    image: '/wildlife-whale.webp',
    x: 0.3,
    y: 0.386,
    width: 0.6,
    opacity: 0.83,
    flow: 0.14,
    faceRight: true,
    cetacean: true,
  },
  {
    image: '/dive/life-orca.webp',
    x: 0.58,
    y: 0.433,
    width: 0.34,
    opacity: 0.52,
    flow: 0.15,
    faceRight: true,
    cetacean: true,
  },
  { image: '/wildlife-shark.webp', x: 0.72, y: 0.503, width: 0.39, opacity: 0.62, flow: -0.16 },
  { image: '/dive/life-tiger.webp', x: 0.65, y: 0.556, width: 0.35, opacity: 0.71, flow: -0.17 },
  {
    image: '/dive/life-jelly.webp',
    x: 0.26,
    y: 0.625,
    width: 0.18,
    opacity: 0.82,
    flow: 0.07,
    pulse: true,
  },
  {
    image: '/dive/life-jelly.webp',
    x: 0.42,
    y: 0.66,
    width: 0.09,
    opacity: 0.53,
    flow: -0.08,
    pulse: true,
  },
  {
    image: '/dive/life-jelly.webp',
    x: 0.67,
    y: 0.7,
    width: 0.08,
    opacity: 0.37,
    flow: 0.07,
    pulse: true,
  },
  {
    image: '/wildlife-angler.webp',
    x: 0.76,
    y: 0.846,
    width: 0.32,
    opacity: 0.87,
    flow: -0.08,
    lure: true,
  },
];

const particles = Array.from({ length: 172 }, (_, index) => ({
  x: ((index * 61) % 173) / 173,
  y: ((index * 101) % 173) / 173,
  size: 0.45 + (index % 5) * 0.27,
}));

export function OceanLife({
  story,
  paused,
}: {
  story: RefObject<HTMLDivElement | null>;
  paused: boolean;
}) {
  const surface = useRef<HTMLCanvasElement>(null);
  const control = useRef<(paused: boolean) => void>(null);

  useEffect(() => {
    const canvas = surface.current;
    const element = story.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !element || !context) return;

    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const images = new Map<string, HTMLImageElement>();
    const sprite = document.createElement('canvas');
    const warp = sprite.getContext('2d');
    if (!warp) return;
    const swimTimes = inhabitants.map(() => 0);
    let width = 1;
    let height = 1;
    let worldHeight = 1;
    let worldTop = 0;
    let frame = 0;
    let stopped = false;
    let time = 0;
    let lastTime = 0;
    let scale = 1;
    let active = true;
    const schedule = () => {
      if (active && !frame && !document.hidden) frame = requestAnimationFrame(render);
    };

    function render(now: number) {
      frame = 0;
      if (!context || !active || document.hidden) return;
      const offset = Math.max(0, scrollY - worldTop);
      const visible = offset < worldHeight && scrollY + height > worldTop;
      const moving = !stopped && !motion.matches;
      const elapsed = moving && lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0;
      time += elapsed;
      lastTime = moving ? now : 0;
      context.clearRect(0, 0, width, height);
      if (!visible) {
        lastTime = 0;
        return;
      }

      context.fillStyle = '#a9e6ff';
      particles.forEach((p, index) => {
        if (p.y < 0.105) return;
        const y = p.y * worldHeight - offset * (0.96 + p.size * 0.024) - (time % 500) * p.size;
        if (y < 0 || y > height) return;
        const x = p.x * width + Math.sin(time * 0.13 + index) * 10;
        context.globalAlpha = 0.1 + p.size * 0.105;
        context.beginPath();
        context.arc(x, y, p.size, 0, Math.PI * 2);
        context.fill();
      });

      inhabitants.forEach((animal, index) => {
        const cruise = swimTimes[index];
        const glide = cruise * (animal.cetacean ? 0.36 : 0.62) + index;
        const y = animal.y * worldHeight - offset + Math.sin(glide) * (animal.cetacean ? 28 : 11);
        if (y < -height * 0.7 || y > height * 2.1) return;

        let image = images.get(animal.image);
        if (!image) {
          image = new window.Image();
          image.decoding = 'async';
          image.onload = schedule;
          image.src = animal.image;
          images.set(animal.image, image);
        }
        if (!image.complete || !image.naturalWidth || y > height + 300) return;

        const size = Math.min(width * animal.width * (width < 700 ? 1.34 : 1), 850);
        const length = size * (animal.pulse ? 1 + Math.sin(time * 1.7 + index) * 0.04 : 1);
        const tall = (size * image.naturalHeight) / image.naturalWidth;
        if (y > -tall && y < height + tall) swimTimes[index] += elapsed;
        const margin = length / width / 2 + 0.07;
        const span = 1 + margin * 2;
        const pace = animal.flow * (cruise * 0.28 + Math.sin(cruise * 0.6) * 0.11);
        const track = (animal.x + margin + pace) % span;
        const heading = ((track + span) % span) - margin;
        const drift = animal.x + Math.sin(glide * 0.46) * 0.04;
        const x = (animal.pulse || animal.lure ? drift : heading) * width - length / 2;
        const top = y - tall / 2;
        context.globalAlpha = animal.opacity;
        if (x + length < -4 || x > width + 4) return;

        if (animal.lure) {
          const lightX = x + length * 0.055;
          const lightY = top + tall * 0.15;
          const glow = 0.88 + Math.sin(time * 1.72) * 0.12;
          const pool = context.createRadialGradient(
            lightX,
            y + tall * 0.56,
            0,
            lightX,
            y + tall * 0.56,
            size * 0.65,
          );
          pool.addColorStop(0, 'rgba(124,255,221,.56)');
          pool.addColorStop(0.28, 'rgba(71,182,185,.18)');
          pool.addColorStop(1, 'rgba(41,127,160,0)');
          context.save();
          context.globalCompositeOperation = 'screen';
          context.globalAlpha = glow;
          context.fillStyle = pool;
          context.fillRect(lightX - size, y - tall, size * 2, size * 2);
          context.restore();
          context.filter = 'brightness(.58) saturate(.9)';
          drawAnimal();
          context.filter = 'none';
          context.globalAlpha = glow;
          const halo = context.createRadialGradient(lightX, lightY, 0, lightX, lightY, size * 0.17);
          halo.addColorStop(0, '#e9fff8');
          halo.addColorStop(0.035, '#effffa');
          halo.addColorStop(0.12, 'rgba(136,255,228,.78)');
          halo.addColorStop(0.36, 'rgba(85,222,218,.18)');
          halo.addColorStop(1, 'rgba(61,210,234,0)');
          context.fillStyle = halo;
          context.fillRect(lightX - size * 0.2, lightY - size * 0.2, size * 0.4, size * 0.4);
        } else {
          drawAnimal();
        }

        function drawAnimal() {
          if (!context || !image) return;
          if (animal.pulse) {
            context.drawImage(
              image,
              x,
              top,
              length,
              tall * (1 + Math.cos(time * 1.7 + index) * 0.06),
            );
            return;
          }

          if (!warp) return;
          const margin = tall * 0.15;
          warp.resetTransform();
          warp.clearRect(0, 0, Math.ceil(length) + 2, Math.ceil(tall + margin * 2) + 2);
          const strips = 14;
          const source = image.naturalWidth / strips;
          const step = length / strips;
          const bend = (band: number) => {
            const position = (animal.faceRight ? strips - band : band) / strips;
            const frequency = animal.cetacean ? 1.82 : 2.9;
            const bend = Math.sin(cruise * frequency - position * 3.3 + index);
            const power = animal.cetacean ? 3.5 : 2;
            return bend * tall * (animal.cetacean ? 0.19 : 0.11) * position ** power;
          };

          // Join the bands with the same bend at each shared edge.
          for (let band = 0; band < strips; band++) {
            const start = bend(band);
            const slope = (bend(band + 1) - start) / step;
            const cutoff = band === strips - 1 ? 0 : 1;
            warp.setTransform(1, slope, 0, 1, band * step, margin + start);
            warp.drawImage(
              image,
              band * source,
              0,
              source + cutoff,
              image.naturalHeight,
              0,
              0,
              step + (cutoff * step) / source,
              tall,
            );
          }
          const spriteWidth = Math.ceil(length) + 2;
          const spriteHeight = Math.ceil(tall + margin * 2) + 2;
          context.save();
          if (animal.cetacean) {
            context.translate(x + length / 2, y);
            context.rotate(Math.cos(glide) * 0.052);
            context.translate(-x - length / 2, -y);
          }
          context.drawImage(
            sprite,
            0,
            0,
            spriteWidth,
            spriteHeight,
            x,
            top - margin,
            spriteWidth,
            spriteHeight,
          );
          context.restore();
        }
      });
      context.globalAlpha = 1;
      if (moving) schedule();
    }

    const measure = () => {
      width = canvas.clientWidth;
      sprite.width = 854;
      sprite.height = 590;
      height = canvas.clientHeight;
      scale = Math.min(1.5, devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      context.setTransform(scale, 0, 0, scale, 0, 0);
      worldHeight = element.clientHeight;
      worldTop = element.getBoundingClientRect().top + scrollY;
      schedule();
    };
    control.current = (value) => {
      stopped = value;
      schedule();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    addEventListener('resize', measure);
    addEventListener('scroll', schedule, { passive: true });
    motion.addEventListener('change', schedule);
    document.addEventListener('visibilitychange', schedule);
    return () => {
      active = false;
      control.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      removeEventListener('resize', measure);
      removeEventListener('scroll', schedule);
      motion.removeEventListener('change', schedule);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, [story]);

  useEffect(() => control.current?.(paused), [paused]);

  return <canvas ref={surface} className="ocean-life" />;
}
