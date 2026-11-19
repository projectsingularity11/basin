import { defineConfig, globalIgnores } from 'eslint/config';
import next from 'eslint-config-next/core-web-vitals';
import ts from 'eslint-config-next/typescript';
export default defineConfig([
  ...next,
  ...ts,
  globalIgnores([
    '.next/**',
    'test-results/**',
    'playwright-report/**',
    'public/maplibre/**',
    'public/reference/scripts/{jquery.min,manifest,vendor,theme}.js',
    'public/reference-assets/{basis,draco}/**',
  ]),
]);
