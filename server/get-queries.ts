import { handleGetQueriesRequest } from "@rocicorp/zero/server";
import { withValidation } from "@rocicorp/zero";
import { queries } from "../shared/queries";
import { schema } from "../shared/schema";
import { ReadonlyJSONValue } from "@rocicorp/zero";

const validated = Object.fromEntries(
  Object.values(queries).map((q) => [q.queryName, withValidation(q)])
);

export async function handleGetQueries(request: Request) {
  return await handleGetQueriesRequest(getQuery, schema, request);
}

function getQuery(name: string, args: readonly ReadonlyJSONValue[]) {
  const q = validated[name];
  if (!q) {
    throw new Error(`No such query: ${name}`);
  }
  return {
    query: q(undefined, ...args),
  };
}
