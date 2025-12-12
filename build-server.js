import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['./server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: './dist/server/index.js',
  external: ['postgres', '@rocicorp/zero', 'dotenv', 'hono'],
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
