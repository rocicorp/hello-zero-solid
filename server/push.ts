import {
  PushProcessor,
  ZQLDatabase,
  PostgresJSConnection,
} from "@rocicorp/zero/pg";
import { must } from "../shared/must";
import { schema } from "../shared/schema";
import { createMutators } from "../shared/mutators";
import { AuthData } from "../shared/auth";
import postgres from "postgres";

const processor = new PushProcessor(
  new ZQLDatabase(
    new PostgresJSConnection(
      postgres(
        must(
          process.env.ZERO_UPSTREAM_DB as string,
          "required env var ZERO_UPSTREAM_DB"
        )
      )
    ),
    schema
  )
);

export async function handlePush(
  authData: AuthData | undefined,
  request: Request
) {
  return await processor.process(createMutators(authData), request);
}
