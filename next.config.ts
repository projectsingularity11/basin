import type { NextConfig } from 'next';

const config: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [{ source: '/', destination: '/reference/index.html' }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default config;
