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
      {
        source: '/journeys/marine-protected-areas',
        destination: '/journeys/runoff',
        permanent: true,
      },
      {
        source: '/journeys/sustainable-fisheries',
        destination: '/journeys/harvey',
        permanent: true,
      },
      {
        source: '/journeys/blue-carbon-habitats',
        destination: '/journeys/detention',
        permanent: true,
      },
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
