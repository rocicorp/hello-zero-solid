import { mustGetQuery } from "@rocicorp/zero";
import { handleQueryRequest } from "@rocicorp/zero/server";
import { type Context } from "hono";
import { queries } from "../shared/queries.ts";
import { schema } from "../shared/schema.ts";
import { getUserID } from "./login.ts";

export async function handleQuery(c: Context) {
  const userID = await getUserID(c);
  const ctx = userID ? { userID } : undefined;
  return handleQueryRequest(
    (name, args) => {
      const query = mustGetQuery(queries, name);
      return query.fn({ args, ctx });
    },
    schema,
    c.req.raw
  );
}
