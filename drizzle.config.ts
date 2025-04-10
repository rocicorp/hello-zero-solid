import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./shared/drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.ZERO_UPSTREAM_DB!,
  },
});
