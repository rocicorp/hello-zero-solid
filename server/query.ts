import { handleQueryRequest } from "@rocicorp/zero/server";
import { mustGetQuery } from "@rocicorp/zero";
import { queries } from "../shared/queries";
import { schema } from "../shared/schema";
import { getUserID } from "./login";
import { Context } from "hono";

export async function handleQuery(c: Context) {
  const userID = await getUserID(c);
  const ctx = userID ? { userID } : undefined;
  return handleQueryRequest({
    handler: (name, args) => {
      const query = mustGetQuery(queries, name);
      return query.fn({ args, ctx });
    },
    schema,
    request: c.req.raw,
    userID: userID ?? null,
  });
}
