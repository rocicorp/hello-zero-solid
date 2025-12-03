import { handleTransformRequest } from "@rocicorp/zero/server";
import { mustGetQuery } from "@rocicorp/zero";
import { queries } from "../shared/queries";
import { schema } from "../shared/schema";
import { getUserID } from "./login";
import { Context } from "hono";

export async function handleGetQueries(c: Context) {
  const userID = await getUserID(c);
  const ctx = userID ? { userID } : undefined;
  return handleTransformRequest(
    (name, args) => {
      const query = mustGetQuery(queries, name);
      return query(args).toQuery(ctx);
    },
    schema,
    c.req.raw
  );
}
