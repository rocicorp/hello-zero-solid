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
  table,
  string,
  boolean,
  relationships,
  UpdateValue,
  number,
  createBuilder,
} from "@rocicorp/zero";

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
  enableLegacyMutators: false,
  enableLegacyQueries: true,
});

export type Schema = typeof schema;
export type Message = Row<typeof schema.tables.message>;
export type MessageUpdate = UpdateValue<typeof schema.tables.message>;
export type Medium = Row<typeof schema.tables.medium>;
export type User = Row<typeof schema.tables.user>;

// TODO: Zero requires an empty permissions object even if we're not using them :(
export const permissions = definePermissions<unknown, Schema>(schema, () => {
  return {};
});

export const builder = createBuilder(schema);
