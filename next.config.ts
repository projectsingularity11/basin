import type { NextConfig } from 'next';

const routes = {
  '/': 'index',
  '/journeys': 'journeys',
  '/expeditions': 'journeys',
  '/about': 'about',
  '/expeditions/runoff': 'runoff',
  '/expeditions/harvey': 'harvey',
  '/expeditions/detention': 'detention',
  '/journeys/runoff': 'runoff',
  '/journeys/harvey': 'harvey',
  '/journeys/detention': 'detention',
};

const config: NextConfig = {
  async redirects() {
    return [
      { source: '/classic', destination: '/explore', permanent: true },
      { source: '/classic/expeditions/:slug', destination: '/explore/:slug', permanent: true },
      { source: '/project-about', destination: '/about', permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: Object.entries(routes).map(([source, page]) => ({
        source,
        destination: `/reference/${page}.html`,
      })),
      afterFiles: [],
      fallback: [],
    };
  },
};

export default config;
