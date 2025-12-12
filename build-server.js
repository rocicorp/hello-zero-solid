import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['./server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: './api/server-bundle.js',
  external: [
    'postgres',
    '@rocicorp/zero',
    'hono',
    'hono/cookie',
    'hono/vercel'
  ],
  banner: {
    js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
`
  }
});
