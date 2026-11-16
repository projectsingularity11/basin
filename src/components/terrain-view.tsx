'use client';
import dynamic from 'next/dynamic';
const Terrain = dynamic(() => import('./terrain'), {
  ssr: false,
  loading: () => <div className="terrain-loading">Loading terrain viewer…</div>,
});
export default Terrain;
