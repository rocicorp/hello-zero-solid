import { defineConfig } from "@rocicorp/zero/config";
import { Message, schema, type Schema } from "./src/schema.js";

// The contents of your decoded JWT.
type AuthData = {
  sub: string;
};

export default defineConfig<AuthData, Schema>(schema, (query) => {
  const allowIfLoggedIn = (authData: AuthData) =>
    query.user.where("id", "=", authData.sub);

  const allowIfMessageSender = (authData: AuthData, row: Message) => {
    return query.message
      .where("id", row.id)
      .where("senderID", "=", authData.sub);
  };

  return {
    upstreamDBConnStr: must(process.env.ZSTART_SOLID_DB),
    cvrDBConnStr: must(process.env.ZSTART_SOLID_DB),
    changeDBConnStr: must(process.env.ZSTART_SOLID_DB),
    replicaDBFile: must(process.env.ZSTART_SOLID_REPLICA_DB_FILE),
    jwtSecret: must(process.env.JWT_SECRET),

    numSyncWorkers: undefined, // this means numCores - 1

    log: {
      level: "debug",
      format: "text",
    },

    authorization: {
      // Nobody can write to the medium or user tables -- they are populated
      // and fixed by seed.sql
      medium: {
        table: {
          insert: [],
          update: [],
          delete: [],
        },
      },
      user: {
        table: {
          insert: [],
          update: [],
          delete: [],
        },
      },
      message: {
        row: {
          // anyone can insert
          insert: undefined,
          // only sender can edit their own messages
          update: [allowIfMessageSender],
          // must be logged in to delete
          delete: [allowIfLoggedIn],
        },
      },
    },
  };
});

function must(val) {
  if (!val) {
    throw new Error("Expected value to be defined");
  }
  return val;
}
