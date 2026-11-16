'use client';
import { useMemo, Suspense, useEffect, Component, type ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { terrain, patchCells, type Scenario, type Frame } from '@/engine/model';
type Props = {
  scenario: Scenario;
  frame?: Frame;
  selected?: number;
  onSelect?: (n: number) => void;
  water?: boolean;
  wire?: boolean;
  view?: 'iso' | 'top' | '2d';
  cameraKey?: number;
  hero?: boolean;
};
function Surface({ scenario: s, frame, selected, onSelect, water = true, wire = false }: Props) {
  const z = useMemo(() => terrain(s), [s]),
    n = s.size;
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry(),
      vertices: number[] = [],
      colors: number[] = [],
      indices: number[] = [];
    const min = Math.min(...z),
      max = Math.max(...z);
    for (let y = 0; y <= n; y++)
      for (let x = 0; x <= n; x++) {
        const neighbors = [
          z[Math.min(n - 1, y) * n + Math.min(n - 1, x)],
          z[Math.max(0, y - 1) * n + Math.max(0, x - 1)],
        ];
        const h = (neighbors[0] + neighbors[1]) / 2;
        vertices.push(x - n / 2, h * 0.9, y - n / 2);
        const t = (h - min) / Math.max(1, max - min);
        const color = new THREE.Color().setHSL(0.26 - t * 0.08, 0.13 + t * 0.08, 0.21 + t * 0.17);
        colors.push(color.r, color.g, color.b);
      }
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const a = y * (n + 1) + x,
          b = a + 1,
          c = a + n + 1,
          d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, [n, z]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const waterGeometry = useMemo(() => {
    const g = geometry.clone(),
      pos = g.getAttribute('position'),
      colors: number[] = [],
      depths: number[] = [];
    for (let y = 0; y <= n; y++)
      for (let x = 0; x <= n; x++) {
        const a = Math.min(n - 1, y) * n + Math.min(n - 1, x),
          b = Math.max(0, y - 1) * n + Math.max(0, x - 1);
        const depth = water ? ((frame?.depths[a] ?? 0) + (frame?.depths[b] ?? 0)) / 2 : 0;
        const i = y * (n + 1) + x;
        pos.setY(i, pos.getY(i) + depth * 0.9 + 0.012);
        const c = new THREE.Color().setHSL(
          0.542 + Math.min(depth / 0.25, 1) * 0.069,
          0.65,
          0.6 - Math.min(depth / 0.25, 1) * 0.3,
        );
        colors.push(c.r, c.g, c.b);
        depths.push(depth);
      }
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    g.setAttribute('waterDepth', new THREE.Float32BufferAttribute(depths, 1));
    return g;
  }, [geometry, n, frame, water]);
  useEffect(() => () => waterGeometry.dispose(), [waterGeometry]);
  const skirt = useMemo(() => {
    const vertices: number[] = [],
      indices: number[] = [],
      pos = geometry.getAttribute('position');
    const edge: number[] = [];
    for (let x = 0; x <= n; x++) edge.push(x);
    for (let y = 1; y <= n; y++) edge.push(y * (n + 1) + n);
    for (let x = n - 1; x >= 0; x--) edge.push(n * (n + 1) + x);
    for (let y = n - 1; y > 0; y--) edge.push(y * (n + 1));
    edge.forEach((i, k) => {
      vertices.push(pos.getX(i), pos.getY(i), pos.getZ(i), pos.getX(i), -0.8, pos.getZ(i));
      const j = k * 2,
        next = ((k + 1) % edge.length) * 2;
      indices.push(j, next, j + 1, j + 1, next, next + 1);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, [geometry, n]);
  useEffect(() => () => skirt.dispose(), [skirt]);
  const contours = useMemo(() => {
    const vertices: number[] = [],
      pos = geometry.getAttribute('position'),
      idx = geometry.getIndex()!;
    for (let level = 0.45; level < Math.max(...z) * 0.9; level += 0.45) {
      for (let i = 0; i < idx.count; i += 3) {
        const hits: THREE.Vector3[] = [];
        const tri = [idx.getX(i), idx.getX(i + 1), idx.getX(i + 2)];
        for (let e = 0; e < 3; e++) {
          const a = tri[e],
            b = tri[(e + 1) % 3],
            ya = pos.getY(a),
            yb = pos.getY(b);
          if ((ya < level && yb >= level) || (yb < level && ya >= level)) {
            const t = (level - ya) / (yb - ya);
            hits.push(
              new THREE.Vector3(
                pos.getX(a) + (pos.getX(b) - pos.getX(a)) * t,
                level + 0.008,
                pos.getZ(a) + (pos.getZ(b) - pos.getZ(a)) * t,
              ),
            );
          }
        }
        if (hits.length === 2) vertices.push(...hits[0].toArray(), ...hits[1].toArray());
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return g;
  }, [geometry, z]);
  useEffect(() => () => contours.dispose(), [contours]);
  return (
    <group>
      <mesh
        geometry={geometry}
        receiveShadow
        onPointerDown={(e) => {
          e.stopPropagation();
          const p = e.point;
          const x = Math.max(0, Math.min(n - 1, Math.floor(p.x + n / 2))),
            y = Math.max(0, Math.min(n - 1, Math.floor(p.z + n / 2)));
          onSelect?.(y * n + x);
        }}
      >
        <meshStandardMaterial vertexColors roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={contours} raycast={() => {}}>
        <lineBasicMaterial color="#e1e5bc" transparent opacity={0.2} />
      </lineSegments>
      {wire && (
        <mesh geometry={geometry}>
          <meshBasicMaterial color="#b8d0b0" wireframe transparent opacity={0.12} />
        </mesh>
      )}
      <mesh geometry={waterGeometry} raycast={() => {}}>
        <shaderMaterial
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          vertexShader={`attribute vec3 color; attribute float waterDepth; varying vec3 vColor; varying float vDepth; void main(){vColor=color;vDepth=waterDepth;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
          fragmentShader={`varying vec3 vColor; varying float vDepth; void main(){float alpha=smoothstep(0.001,0.035,vDepth)*0.84;if(alpha<0.01)discard;gl_FragColor=vec4(vColor,alpha);\n#include <tonemapping_fragment>
#include <colorspace_fragment>}`}
        />
      </mesh>
      <mesh geometry={skirt}>
        <meshStandardMaterial color="#344038" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.45, 0]}>
        <boxGeometry args={[n, 0.7, n]} />
        <meshStandardMaterial color="#202b27" />
      </mesh>
      <mesh position={[0, -0.85, 0]}>
        <boxGeometry args={[n + 0.12, 0.1, n + 0.12]} />
        <meshStandardMaterial color="#43504a" />
      </mesh>
      {s.interventions.map((it) => {
        const x = (it.cell % n) - n / 2 + 0.5,
          y = Math.floor(it.cell / n) - n / 2 + 0.5;
        return (
          <group key={it.id}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, z[it.cell] * 0.9 + 0.09, y]}>
              <ringGeometry args={[1.8, 2.05, 32]} />
              <meshBasicMaterial
                color={it.kind === 'detention' ? '#83bfff' : '#b0df9a'}
                side={THREE.DoubleSide}
              />
            </mesh>
            <Line
              points={[
                [x, z[it.cell] * 0.9, y],
                [x, z[it.cell] * 0.9 + 2.8, y],
              ]}
              color="#a8d2e8"
              lineWidth={1}
            />
            <mesh position={[x, z[it.cell] * 0.9 + 2.8, y]}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshBasicMaterial color="#c0e4f7" />
            </mesh>
          </group>
        );
      })}
      {selected !== undefined && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[
            (selected % n) - n / 2 + 0.5,
            z[selected] * 0.9 + 0.1,
            Math.floor(selected / n) - n / 2 + 0.5,
          ]}
        >
          <ringGeometry args={[0.4, 0.5, 4]} />
          <meshBasicMaterial color="#f5d59c" side={THREE.DoubleSide} />
        </mesh>
      )}
      <gridHelper args={[70, 35, '#283a3d', '#1a2a2d']} position={[0, -1.1, 0]} />
    </group>
  );
}
function Camera({ view, cameraKey }: { view: Props['view']; cameraKey?: number }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(
      ...((view === 'top' ? [0, 43, 0.01] : [30, 24, 32]) as [number, number, number]),
    );
    camera.lookAt(0, 1, 0);
    camera.updateProjectionMatrix();
  }, [camera, view, cameraKey]);
  return null;
}
class Boundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function Flat(p: Props) {
  const z = terrain(p.scenario),
    n = p.scenario.size,
    max = Math.max(...z, 1),
    patches = p.scenario.interventions.flatMap((i) => patchCells(p.scenario, i.cell));
  return (
    <svg
      className="terrain-flat"
      viewBox={`-2 -2 ${n + 4} ${n + 4}`}
      role="img"
      aria-label="Selectable 2D synthetic terrain. Lighter cells are higher; blue cells contain simulated water."
    >
      {z.map((h, i) => {
        const d = p.water !== false ? (p.frame?.depths[i] ?? 0) : 0;
        return (
          <rect
            key={i}
            x={i % n}
            y={Math.floor(i / n)}
            width=".98"
            height=".98"
            fill={
              d > 0.00001
                ? `hsl(${195 + Math.min(d / 0.25, 1) * 25} 65% ${60 - Math.min(d / 0.25, 1) * 30}%)`
                : `hsl(86 15% ${22 + (h / max) * 25}%)`
            }
            stroke={p.selected === i ? '#f5d59c' : patches.includes(i) ? '#95cdf2' : 'none'}
            strokeWidth=".1"
            onClick={() => p.onSelect?.(i)}
          />
        );
      })}
    </svg>
  );
}
export default function Terrain(p: Props) {
  const supported = useMemo(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      const ok = !!gl;
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
      return ok;
    } catch {
      return false;
    }
  }, []);
  const fallback = <Flat {...p} />;
  if (p.view === '2d' || supported === false) return fallback;
  return (
    <Boundary fallback={fallback}>
      <Canvas
        frameloop="demand"
        camera={{ position: [30, 24, 32], fov: 39 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        role="img"
        aria-label="Interactive synthetic watershed. Drag to orbit; scroll to zoom."
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[-10, 24, 8]} intensity={3} color="#e4edce" />
        <directionalLight position={[15, 5, -10]} intensity={1.4} color="#9cc9df" />
        <Suspense fallback={null}>
          <Surface {...p} />
        </Suspense>
        <Camera view={p.view} cameraKey={p.cameraKey} />
        <OrbitControls
          makeDefault
          target={[0, 1.4, 0]}
          minDistance={14}
          maxDistance={70}
          maxPolarAngle={Math.PI / 2.08}
          enableDamping={false}
        />
        <fog attach="fog" args={['#0c1418', 65, 120]} />
      </Canvas>
    </Boundary>
  );
}
