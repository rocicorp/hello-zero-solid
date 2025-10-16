import "dotenv/config";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { handleLogin } from "./login";
import { handleMutate } from "./mutate";
import { handleGetQueries } from "./get-queries";

export const app = new Hono().basePath("/api");

app.get("/login", (c) => handleLogin(c));

app.post("/mutate", async (c) => {
  return await c.json(await handleMutate(c));
});

app.post("/get-queries", async (c) => {
  return await c.json(await handleGetQueries(c.req.raw));
});

export default handle(app);
