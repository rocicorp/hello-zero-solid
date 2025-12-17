import { Hono } from "hono";
import type { IncomingMessage, ServerResponse } from "node:http";
import { handleLogin } from "./server/login.js";
import { handleMutate } from "./server/mutate.js";
import { handleQuery } from "./server/query.js";

export const app = new Hono().basePath("/api");

app.get("/login", handleLogin);

app.post("/mutate", async (c) => c.json(await handleMutate(c)));

app.post("/query", async (c) => c.json(await handleQuery(c)));

function toHeaders(req: IncomingMessage): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "undefined") continue;
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
    else headers.append(key, value);
  }
  return headers;
}

function toBodyBuffer(value: unknown): Buffer {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (typeof value === "string") return Buffer.from(value, "utf8");
  if (value && typeof value === "object") return Buffer.from(JSON.stringify(value), "utf8");
  return Buffer.from(String(value ?? ""), "utf8");
}

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const anyReq = req as IncomingMessage & { rawBody?: unknown; body?: unknown; _body?: unknown };
  if (typeof anyReq.rawBody !== "undefined") return toBodyBuffer(anyReq.rawBody);
  if (typeof anyReq.body !== "undefined") return toBodyBuffer(anyReq.body);
  if (typeof anyReq._body !== "undefined") return toBodyBuffer(anyReq._body);

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const method = req.method ?? "GET";
  const headers = toHeaders(req);

  const host = headers.get("x-forwarded-host") ?? headers.get("host") ?? "localhost";
  const proto =
    headers.get("x-forwarded-proto") ??
    ((req.socket as { encrypted?: boolean }).encrypted ? "https" : "http");

  const url = new URL(req.url ?? "/", `${proto}://${host}`);
  const init: RequestInit = { method, headers };
  if (!(method === "GET" || method === "HEAD")) init.body = await readBody(req);

  const response = await app.fetch(new Request(url, init), {});
  res.statusCode = response.status;

  const setCookie = (response.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.();
  if (setCookie?.length) res.setHeader("set-cookie", setCookie);

  for (const [key, value] of response.headers) {
    if (key.toLowerCase() === "set-cookie") continue;
    res.setHeader(key, value);
  }

  if (method === "HEAD") return void res.end();
  if (!response.body) return void res.end();
  res.end(Buffer.from(await response.arrayBuffer()));
}
