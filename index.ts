import { Hono } from "hono";
import { handleLogin } from "./server/login.ts";
import { handleMutate } from "./server/mutate.ts";
import { handleQuery } from "./server/query.ts";

const app = new Hono().basePath("/api");

app.get("/login", handleLogin);

app.post("/mutate", async (c) => c.json(await handleMutate(c)));

app.post("/query", async (c) => c.json(await handleQuery(c)));

export default app;
