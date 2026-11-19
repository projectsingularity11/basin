'use client';
import { useEffect, useRef, type RefObject } from 'react';
import Lenis from 'lenis';

const vertex = `attribute vec2 position;
void main() { gl_Position = vec4(position, 0., 1.); }`;

// Traveling wave and displacement adapted from Sakuga's WaterSurface.
const fragment = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 size;
uniform float time;
uniform vec4 drops[8];
void main() {
  vec2 p = vec2(gl_FragCoord.x, size.y - gl_FragCoord.y);
  vec2 shift = vec2(0.);
  float light = 0.;
  for (int i = 0; i < 8; i++) {
    float age = time - drops[i].z;
    vec2 offset = p - drops[i].xy;
    float d = length(offset);
    if (drops[i].w > 0. && age >= 0. && age < 2.2) {
      float envelope = exp(-age * 2.) * exp(-abs(d - age * 100.) * .018);
      float wave = sin(d * .09 - age * 11.) * envelope * drops[i].w;
      shift += normalize(offset + vec2(.01)) * wave * 18.;
      light += wave;
    }
  }
  vec2 uv = (p + shift) / size;
  float glint = .65 + .35 * sin(uv.x * 25. - uv.y * 32.);
  vec3 color = light > 0. ? vec3(.61, .88, 1.) : vec3(.02, .13, .23);
  gl_FragColor = vec4(color, min(abs(light) * .27 * glint, .24));
}`;

export function WaterMotion() {
  const surface = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = surface.current;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(pointer: fine)');
    if (!canvas || !fine.matches || preference.matches) return;
    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    const shaders = [
      [gl.VERTEX_SHADER, vertex],
      [gl.FRAGMENT_SHADER, fragment],
    ] as const;
    if (!program || !buffer) return;
    for (const [kind, source] of shaders) {
      const shader = gl.createShader(kind);
      if (!shader) return;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
      gl.deleteShader(shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      return;
    }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const size = gl.getUniformLocation(program, 'size');
    const time = gl.getUniformLocation(program, 'time');
    const dropUniform = gl.getUniformLocation(program, 'drops[0]');
    const drops = new Float32Array(32);
    const origin = performance.now();
    let frame = 0;
    let last = -Infinity;
    let index = 0;
    let until = 0;

    function draw(now: number) {
      frame = 0;
      if (!gl || document.hidden || gl.isContextLost()) return;
      gl.uniform1f(time, (now - origin) / 1000);
      gl.uniform4fv(dropUniform, drops);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (now < until && !preference.matches) frame = requestAnimationFrame(draw);
    }

    function disturb(event: PointerEvent) {
      if (!canvas || event.pointerType === 'touch' || preference.matches) return;
      const now = performance.now();
      if (event.type === 'pointermove' && now - last < 55) return;
      last = now;
      until = now + 2200;
      drops.set(
        [
          (event.clientX * canvas.width) / innerWidth,
          (event.clientY * canvas.height) / innerHeight,
          (now - origin) / 1000,
          event.type === 'pointerdown' ? 1.9 : 0.8,
        ],
        index * 4,
      );
      index = (index + 1) % 8;
      if (!frame) frame = requestAnimationFrame(draw);
    }

    const resize = () => {
      const scale = Math.min(0.8, 1200 / innerWidth, 1000 / innerHeight);
      canvas.width = Math.max(1, Math.round(innerWidth * scale));
      canvas.height = Math.max(1, Math.round(innerHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(size, canvas.width, canvas.height);
    };
    resize();
    addEventListener('resize', resize);
    addEventListener('pointermove', disturb, { passive: true });
    addEventListener('pointerdown', disturb, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('resize', resize);
      removeEventListener('pointermove', disturb);
      removeEventListener('pointerdown', disturb);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas className="water-pointer" ref={surface} aria-hidden="true" />;
}

export function useOceanScroll(story: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const element = story.current;
    if (!element) return;
    const readout = element.querySelector('[data-dive-percent]');
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | undefined;
    let animationFrame = 0;
    let scrollFrame = 0;
    let storyTop = 0;
    let travel = 1;
    let previousPercent = -1;

    const update = () => {
      scrollFrame = 0;
      const depth = Math.min(1, Math.max(0, (scrollY - storyTop) / travel));
      const percent = Math.round(depth * 100);
      element.style.setProperty('--dive-progress', String(depth));
      if (readout && percent !== previousPercent) readout.textContent = `${percent}%`;
      previousPercent = percent;
    };
    const schedule = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(update);
    };
    const measure = () => {
      storyTop = element.getBoundingClientRect().top + scrollY;
      travel = Math.max(1, element.offsetHeight - innerHeight);
      schedule();
    };
    const configureScroll = () => {
      cancelAnimationFrame(animationFrame);
      lenis?.destroy();
      lenis = undefined;
      if (preference.matches) return;
      lenis = new Lenis({
        lerp: 0.075,
        wheelMultiplier: 0.88,
        smoothWheel: true,
        anchors: true,
        prevent: (node) => Boolean(node.closest('dialog')),
      });
      const tick = (time: number) => {
        lenis?.raf(time);
        animationFrame = requestAnimationFrame(tick);
      };
      animationFrame = requestAnimationFrame(tick);
    };

    configureScroll();
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', measure);
    preference.addEventListener('change', configureScroll);
    return () => {
      cancelAnimationFrame(animationFrame);
      cancelAnimationFrame(scrollFrame);
      lenis?.destroy();
      observer.disconnect();
      removeEventListener('scroll', schedule);
      removeEventListener('resize', measure);
      preference.removeEventListener('change', configureScroll);
    };
  }, [story]);
}
