// These data structures define your client-side schema.
// They must be equal to or a subset of the server-side schema.
// Note the "relationships" field, which defines first-class
// relationships between tables.
// See https://github.com/rocicorp/mono/blob/main/apps/zbugs/src/domain/schema.ts
// for more complex examples, including many-to-many.

import {
  createSchema,
  definePermissions,
  Row,
  ANYONE_CAN,
  table,
  string,
  boolean,
  relationships,
  PermissionsConfig,
  UpdateValue,
  number,
} from "@rocicorp/zero";
import { AuthData } from "./auth";

const user = table("user")
  .columns({
    id: string(),
    name: string(),
    partner: boolean(),
  })
  .primaryKey("id");

const medium = table("medium")
  .columns({
    id: string(),
    name: string(),
  })
  .primaryKey("id");

const message = table("message")
  .columns({
    id: string(),
    senderID: string().from("sender_id"),
    mediumID: string().from("medium_id"),
    body: string(),
    timestamp: number(),
  })
  .primaryKey("id");

const messageRelationships = relationships(message, ({ one }) => ({
  sender: one({
    sourceField: ["senderID"],
    destField: ["id"],
    destSchema: user,
  }),
  medium: one({
    sourceField: ["mediumID"],
    destField: ["id"],
    destSchema: medium,
  }),
}));

export const schema = createSchema({
  tables: [user, medium, message],
  relationships: [messageRelationships],
});

export type Schema = typeof schema;
export type Message = Row<typeof schema.tables.message>;
export type MessageUpdate = UpdateValue<typeof schema.tables.message>;
export type Medium = Row<typeof schema.tables.medium>;
export type User = Row<typeof schema.tables.user>;

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
  return {
    medium: {
      row: {
        select: ANYONE_CAN,
      },
    },
    user: {
      row: {
        select: ANYONE_CAN,
      },
    },
    message: {
      row: {
        select: ANYONE_CAN,
      },
    },
  } satisfies PermissionsConfig<AuthData, Schema>;
});

export default {
  schema,
  permissions,
};
