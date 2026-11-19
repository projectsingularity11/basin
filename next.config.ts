import type { NextConfig } from 'next';

const routes = {
  '/': 'index',
  '/journeys': 'journeys',
  '/expeditions': 'journeys',
  '/about': 'about',
  '/expeditions/runoff': 'runoff',
  '/expeditions/harvey': 'harvey',
  '/expeditions/detention': 'detention',
  '/journeys/marine-protected-areas': 'runoff',
  '/journeys/sustainable-fisheries': 'harvey',
  '/journeys/blue-carbon-habitats': 'detention',
};

const config: NextConfig = {
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
