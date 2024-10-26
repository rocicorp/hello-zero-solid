import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { getRequestListener } from "@hono/node-server";
import { app } from "./api/index.js";

export default defineConfig({
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
      name: "api-server",
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
