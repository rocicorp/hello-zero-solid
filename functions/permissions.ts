import postgres from "postgres";
import fs from "node:fs";

export async function deploy() {
  const sql = postgres(process.env.ZERO_UPSTREAM_DB!);
  const perms = fs.readFileSync(".permissions.sql", "utf8");
  await sql.unsafe(perms);
}
