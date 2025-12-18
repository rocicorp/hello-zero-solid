import { getRequestListener } from "@hono/node-server";
import "dotenv/config";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import app from "./index.ts";

export default defineConfig({
  // Allow Vercel-style public env vars without forcing a VITE_ prefix.
  // These still get baked at build time (as Vite intends).
  envPrefix: ["VITE_", "PUBLIC_"],
  optimizeDeps: {
    esbuildOptions: {
      supported: {
        "top-level-await": true,
      },
    },
  },
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  plugins: [
    solid(),
    {
      name: "server",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith("/api")) {
            return next();
          }
          getRequestListener(async (request) => {
            return await app.fetch(request, {});
          })(req, res);
        });
      },
    },
  ],
});
