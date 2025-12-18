import { mustGetMutator } from "@rocicorp/zero";
import { handleMutateRequest } from "@rocicorp/zero/server";
import { zeroPostgresJS } from "@rocicorp/zero/server/adapters/postgresjs";
import { type Context } from "hono";
import postgres from "postgres";
import { must } from "../shared/must.ts";
import { mutators } from "../shared/mutators.ts";
import { schema } from "../shared/schema.ts";
import { getUserID } from "./login.ts";

const dbProvider = zeroPostgresJS(
  schema,
  postgres(
    must(
      process.env.ZERO_UPSTREAM_DB as string,
      "required env var ZERO_UPSTREAM_DB"
    )
  )
);

export async function handleMutate(c: Context) {
  const userID = await getUserID(c);
  const ctx = userID ? { userID } : undefined;
  return handleMutateRequest(
    dbProvider,
    (transact) => {
      return transact((tx, name, args) => {
        const mutator = mustGetMutator(mutators, name);
        return mutator.fn({ tx, args, ctx });
      });
    },
    c.req.raw
  );
}
