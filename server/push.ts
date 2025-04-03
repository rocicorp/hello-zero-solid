import { PushProcessor, connectionProvider } from "@rocicorp/zero/pg";
import { must } from "../shared/must";
import { schema } from "../shared/schema";
import { createMutators } from "../shared/mutators";
import { AuthData } from "../shared/auth";
import postgres from "postgres";

const processor = new PushProcessor(
  schema,
  connectionProvider(
    postgres(
      must(
        process.env.ZERO_UPSTREAM_DB as string,
        "required env var ZERO_UPSTREAM_DB"
      )
    )
  )
);

export async function handlePush(
  authData: AuthData | undefined,
  params: unknown,
  body: unknown
) {
  return await processor.process(createMutators(authData), params, body);
}
