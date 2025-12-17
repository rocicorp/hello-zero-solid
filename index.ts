import { Hono } from "hono";
import type { IncomingMessage, ServerResponse } from "node:http";
import { handleLogin } from "./server/login.js";
import { handleMutate } from "./server/mutate.js";
import { handleQuery } from "./server/query.js";

export const app = new Hono().basePath("/api");

app.get("/login", (c) => handleLogin(c));

app.post("/mutate", async (c) => {
  return await c.json(await handleMutate(c));
});

app.post("/query", async (c) => {
  return await c.json(await handleQuery(c));
});

function toHeaders(incoming: IncomingMessage): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(incoming.headers)) {
    if (typeof value === "undefined") {
      continue;
    }
    if (Array.isArray(value)) {
      for (const v of value) {
        headers.append(key, v);
      }
    } else {
      headers.append(key, value);
    }
  }
  return headers;
}

function normalizeBody(body: unknown): Buffer {
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (body instanceof Uint8Array) {
    return Buffer.from(body);
  }
  if (typeof body === "string") {
    return Buffer.from(body, "utf8");
  }
  if (typeof body === "object" && body !== null) {
    return Buffer.from(JSON.stringify(body), "utf8");
  }
  return Buffer.from(String(body ?? ""), "utf8");
}

async function readBody(incoming: IncomingMessage): Promise<Buffer> {
  const anyIncoming = incoming as IncomingMessage & {
    body?: unknown;
    rawBody?: unknown;
    _body?: unknown;
  };

  // Some dev servers / runtimes (including `vercel dev`) may pre-read the body
  // and attach it. If we try to re-wrap the original stream, undici can throw
  // "Response body object should not be disturbed or locked".
  if (typeof anyIncoming.rawBody !== "undefined") {
    return normalizeBody(anyIncoming.rawBody);
  }
  if (typeof anyIncoming.body !== "undefined") {
    return normalizeBody(anyIncoming.body);
  }
  if (typeof anyIncoming._body !== "undefined") {
    return normalizeBody(anyIncoming._body);
  }

  const chunks: Buffer[] = [];
  for await (const chunk of incoming) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  const method = req.method ?? "GET";
  const headers = toHeaders(req);

  const host = headers.get("host") ?? "localhost";
  const proto =
    headers.get("x-forwarded-proto") ??
    ((req.socket as { encrypted?: boolean }).encrypted ? "https" : "http");

  const url = new URL(req.url ?? "/", `${proto}://${host}`);

  const init: RequestInit = { method, headers };
  if (!(method === "GET" || method === "HEAD")) {
    init.body = await readBody(req);
  }

  const response = await app.fetch(new Request(url, init), {});

  res.statusCode = response.status;

  const headersAny = response.headers as unknown as {
    getSetCookie?: (this: Headers) => string[];
  };
  const setCookie =
    typeof headersAny.getSetCookie === "function"
      ? headersAny.getSetCookie.call(response.headers)
      : undefined;
  if (Array.isArray(setCookie) && setCookie.length > 0) {
    res.setHeader("set-cookie", setCookie);
  }

  for (const [key, value] of response.headers) {
    if (key.toLowerCase() === "set-cookie") {
      continue;
    }
    res.setHeader(key, value);
  }

  if (method === "HEAD") {
    res.end();
    return;
  }

  if (!response.body) {
    res.end();
    return;
  }

  const body = Buffer.from(await response.arrayBuffer());
  res.end(body);
}
