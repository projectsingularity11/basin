'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
/** Ocean art direction uses Three.js MIT Water/Sky. This is visual art, not the runoff solver. */
export default function Ocean() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const current = host.current;
    if (!current) return;
    const el: HTMLDivElement = current;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance',
      });
    } catch {
      el.dataset.fallback = 'true';
      return;
    }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches,
      coarse = matchMedia('(pointer: coarse)').matches;
    renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.25 : 1.6));
    renderer.setSize(innerWidth, innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.7;
    renderer.domElement.setAttribute('aria-label', 'Animated ocean horizon');
    renderer.domElement.setAttribute('role', 'img');
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(54, innerWidth / innerHeight, 0.1, 20000);
    camera.position.set(0, 8, 35);
    const sky = new Sky();
    sky.scale.setScalar(10000);
    const su = sky.material.uniforms;
    su.turbidity.value = 5;
    su.rayleigh.value = 1.7;
    su.mieCoefficient.value = 0.004;
    su.mieDirectionalG.value = 0.85;
    const sun = new THREE.Vector3().setFromSphericalCoords(
      1,
      THREE.MathUtils.degToRad(86),
      THREE.MathUtils.degToRad(190),
    );
    su.sunPosition.value.copy(sun);
    const skyScene = new THREE.Scene();
    skyScene.add(sky);
    const skyTarget = new THREE.WebGLCubeRenderTarget(128);
    new THREE.CubeCamera(0.1, 20000, skyTarget).update(renderer, skyScene);
    scene.background = skyTarget.texture;
    const pixels = new Uint8Array(256 * 256 * 4);
    for (let y = 0; y < 256; y++)
      for (let x = 0; x < 256; x++) {
        let nx = 0,
          ny = 0;
        for (let k = 1; k <= 6; k++) {
          const a = k * 2.399,
            phase = ((x * Math.cos(a) + y * Math.sin(a)) * Math.PI * 2 * (k + 1)) / 64;
          nx += (Math.cos(phase) * Math.cos(a)) / k;
          ny += (Math.cos(phase) * Math.sin(a)) / k;
        }
        const n = new THREE.Vector3(nx * 0.35, ny * 0.35, 1).normalize(),
          i = (y * 256 + x) * 4;
        pixels[i] = (n.x * 0.5 + 0.5) * 255;
        pixels[i + 1] = (n.y * 0.5 + 0.5) * 255;
        pixels[i + 2] = n.z * 255;
        pixels[i + 3] = 255;
      }
    const normal = new THREE.DataTexture(pixels, 256, 256);
    normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
    normal.needsUpdate = true;
    normal.magFilter = THREE.LinearFilter;
    normal.minFilter = THREE.LinearFilter;
    const water = new Water(new THREE.PlaneGeometry(4000, 4000, 48, 48), {
      textureWidth: 256,
      textureHeight: 256,
      waterNormals: normal,
      sunDirection: sun.clone().normalize(),
      sunColor: 0xffedcf,
      waterColor: 0x004d62,
      distortionScale: 3.4,
      fog: false,
    });
    // Open ocean reflects only the sky: sample its cached probe instead of a redundant scene pass.
    water.onBeforeRender = () => {};
    water.material.uniforms.skyProbe = { value: skyTarget.texture };
    water.material.fragmentShader = water.material.fragmentShader
      .replace(
        'uniform sampler2D mirrorSampler;',
        'uniform sampler2D mirrorSampler; uniform samplerCube skyProbe;',
      )
      .replace(
        'vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );',
        'vec3 reflectionSample = textureCube(skyProbe,reflect(-eyeDirection,surfaceNormal)).rgb;',
      );
    water.rotation.x = -Math.PI / 2;
    scene.add(water);
    water.material.uniforms.size.value = 3;
    // Add bounded directional swells to Three's reflection shader.
    water.material.vertexShader = water.material.vertexShader
      .replace(
        'void main() {',
        'void main() { vec3 p=position; p.z+=sin(p.x*.035+time*.7)*.65+sin(p.y*.052-time*.55)*.4;',
      )
      .replaceAll('vec4( position, 1.0 )', 'vec4( p, 1.0 )');
    const pointer = new THREE.Vector2(),
      target = new THREE.Vector2(),
      ripples = Array.from({ length: 8 }, () => new THREE.Vector4(-10, -10, -100, 0));
    let rippleIndex = 0,
      lastPointer = 0;
    // Cursor refraction shares the ocean canvas; no extra fluid framebuffer or overlay intercepts input.
    water.material.uniforms.pointerRipples = { value: ripples };
    water.material.fragmentShader = water.material.fragmentShader.replace(
      'uniform float alpha;',
      'uniform float alpha; uniform vec4 pointerRipples[8]; uniform vec2 screenSize;',
    );
    water.material.uniforms.screenSize = {
      value: new THREE.Vector2(renderer.domElement.width, renderer.domElement.height),
    };
    water.material.fragmentShader = water.material.fragmentShader.replace(
      'vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );',
      `vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );
 for(int i=0;i<8;i++){vec2 delta=(gl_FragCoord.xy/screenSize-pointerRipples[i].xy)*vec2(screenSize.x/screenSize.y,1.0);float age=time-pointerRipples[i].z;if(age<0.0||age>2.5||pointerRipples[i].w<=0.0)continue;float radius=length(delta);float ring=sin(90.0*radius-age*7.0)*exp(-abs(radius-age*.05)*25.0)*exp(-age*1.7)*pointerRipples[i].w;surfaceNormal.xz+=normalize(delta+vec2(.0001))*ring*.25;}`,
    );
    const underwater = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: { progress: { value: 0 }, time: { value: 0 } },
        vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.0);}',
        fragmentShader:
          'varying vec2 vUv;uniform float progress;uniform float time;void main(){float rays=pow(max(0.,sin(vUv.x*22.+sin(vUv.y*3.+time*.18))*.5+.5),7.);vec3 c=mix(vec3(.005,.025,.065),vec3(.015,.24,.28),vUv.y)+rays*.055*vUv.y;gl_FragColor=vec4(c,progress);}',
      }),
    );
    underwater.renderOrder = 10;
    scene.add(underwater);
    gsap.registerPlugin(ScrollTrigger);
    let progress = 0,
      dirty = true;
    const trigger = ScrollTrigger.create({
      trigger: '#ocean-story',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progress = reduced ? 0 : self.progress;
        dirty = true;
        document.documentElement.style.setProperty('--journey', String(progress));
      },
    });
    const lenis = reduced ? null : new Lenis({ duration: 1.15, smoothWheel: true, anchors: true });
    lenis?.on('scroll', ScrollTrigger.update);
    const clock = new THREE.Clock();
    let frames = 0,
      last = performance.now(),
      samples: number[] = [];
    function tick(time: number) {
      lenis?.raf(time * 1000);
      if (document.hidden || (reduced && !dirty)) return;
      dirty = false;
      const t = reduced ? 0 : clock.getElapsedTime();
      water.material.uniforms.time.value = t;
      pointer.lerp(target, 0.04);
      camera.position.x = pointer.x * 1.7;
      water.material.uniforms.eye.value.copy(camera.position);
      camera.position.y = 8 - Math.min(progress / 0.5, 1) * 12;
      camera.lookAt(pointer.x * 0.8, progress < 0.12 ? 2 : -2, -160);
      const under =
        THREE.MathUtils.smoothstep(progress, 0.28, 0.45) *
        (1 - THREE.MathUtils.smoothstep(progress, 0.74, 0.92));
      (underwater.material as THREE.ShaderMaterial).uniforms.progress.value = under;
      (underwater.material as THREE.ShaderMaterial).uniforms.time.value = t;
      el.style.opacity = String(1 - THREE.MathUtils.smoothstep(progress, 0.82, 1.0));
      underwater.visible = under > 0.001;
      water.visible = under < 0.999;
      if (progress < 1) renderer.render(scene, camera);
      frames++;
      const now = performance.now();
      if (now - last > 1000) {
        samples.push((frames * 1000) / (now - last));
        samples = samples.slice(-20);
        if (samples.length < 5 && samples.at(-1)! < 45 && renderer.getPixelRatio() > 0.65) {
          renderer.setPixelRatio(Math.max(0.65, renderer.getPixelRatio() * 0.75));
          el.dataset.quality = renderer.getPixelRatio().toFixed(2);
          water.material.uniforms.screenSize.value.set(
            renderer.domElement.width,
            renderer.domElement.height,
          );
        }
        el.dataset.fps = (samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(1);
        frames = 0;
        last = now;
      }
    }
    const onPointer = (e: PointerEvent) => {
      if (coarse || reduced) return;
      target.set((e.clientX / innerWidth - 0.5) * 2, (e.clientY / innerHeight - 0.5) * 2);
      const now = performance.now();
      if (now - lastPointer > 45) {
        ripples[rippleIndex++ % 8].set(
          e.clientX / innerWidth,
          1 - e.clientY / innerHeight,
          clock.getElapsedTime(),
          Math.min(1.3, 0.2 + Math.hypot(e.movementX, e.movementY) / 35),
        );
        lastPointer = now;
      }
    };
    const resize = () => {
      dirty = true;
      renderer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      water.material.uniforms.screenSize.value.set(
        renderer.domElement.width,
        renderer.domElement.height,
      );
    };
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      trigger.kill();
      lenis?.destroy();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      skyTarget.dispose();
      normal.dispose();
      water.material.uniforms.mirrorSampler.value?.dispose();
      water.geometry.dispose();
      water.material.dispose();
      sky.geometry.dispose();
      sky.material.dispose();
      underwater.geometry.dispose();
      underwater.material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      document.documentElement.style.removeProperty('--journey');
    };
  }, []);
  return <div ref={host} className="ocean-canvas" aria-hidden="true" />;
}
