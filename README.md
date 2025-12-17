# Zero + Solid + TypeScript + Vite

```bash
git clone https://github.com/rocicorp/hello-zero-solid.git
cd hello-zero-solid
npm install
npm run dev:db-up

# in a second terminal
npm run dev:zero-cache

# in yet another terminal
npm run dev:ui
```

## Vercel dev (native)

This repo builds the UI with Vite, and serves the API from Vercel Functions in `api/`.

To simulate *build-time* env vars locally the same way Vercel does, pull your envs and run:

```bash
vercel env pull .env.local
vercel dev
```

The UI reads `PUBLIC_ZERO_CACHE_URL` (or falls back to `VITE_PUBLIC_ZERO_CACHE_URL`).
