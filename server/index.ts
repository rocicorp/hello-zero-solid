import "dotenv/config";
import { Hono } from "hono";
import { validator } from "hono/validator";
import { handle } from "hono/vercel";
import { handleLogin } from "./login";
import { handlePush } from "./push";
import { validateAndDecodeAuthData } from "../shared/auth";
import { must } from "../shared/must";

export const app = new Hono().basePath("/api");

const secretKey = new TextEncoder().encode(
  must(process.env.ZERO_AUTH_SECRET, "required env var ZERO_AUTH_SECRET")
);

app.get("/login", (c) => handleLogin(c, secretKey));
app.post(
  "/push",
  validator("header", (v) => {
    const auth = v["authorization"];
    if (!auth) {
      return undefined;
    }
    const parts = /^Bearer (.+)$/.exec(auth);
    if (!parts) {
      throw new Error(
        "Invalid Authorization header - should start with 'Bearer '"
      );
    }
    const [, jwt] = parts;
    return validateAndDecodeAuthData(jwt, secretKey);
  }),
  async (c) => {
    return await c.json(
      await handlePush(c.req.valid("header"), c.req.query(), await c.req.json())
    );
  }
);

export default handle(app);
