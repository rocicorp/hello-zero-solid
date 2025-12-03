import postgres from "postgres";
import { PushProcessor } from "@rocicorp/zero/pg";
import { zeroPostgresJS } from "@rocicorp/zero/server/adapters/postgresjs";
import { must } from "../shared/must";
import { schema } from "../shared/schema";
import { createMutators } from "../shared/mutators";
import { Context } from "hono";
import { getUserID } from "./login";

const processor = new PushProcessor(
  zeroPostgresJS(
    schema,
    postgres(
      must(
        process.env.ZERO_UPSTREAM_DB as string,
        "required env var ZERO_UPSTREAM_DB"
      )
    )
  )
);

export async function handleMutate(c: Context) {
  const userID = await getUserID(c);
  return await processor.process(createMutators(userID), c.req.raw);
}
