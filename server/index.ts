import { Hono } from "hono";
import { getRequestListener } from "@hono/node-server";
import { handleLogin } from "./login.js";
import { handleMutate } from "./mutate.js";
import { handleQuery } from "./query.js";

export const app = new Hono().basePath("/api");

app.get("/login", (c) => handleLogin(c));

app.post("/mutate", async (c) => {
  return await c.json(await handleMutate(c));
});

app.post("/query", async (c) => {
  return await c.json(await handleQuery(c));
});

export default getRequestListener((req) => app.fetch(req, {}));
