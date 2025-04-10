// These data structures define your client-side schema.
// They must be equal to or a subset of the server-side schema.
// Note the "relationships" field, which defines first-class
// relationships between tables.
// See https://github.com/rocicorp/mono/blob/main/apps/zbugs/src/domain/schema.ts
// for more complex examples, including many-to-many.

import {
  ANYONE_CAN,
  definePermissions,
  PermissionsConfig,
  Row,
  UpdateValue,
} from "@rocicorp/zero";
import { createZeroSchema } from "drizzle-zero";
import { AuthData } from "./auth";
import * as drizzleRelations from "./drizzle/relations.ts";
import * as drizzleSchema from "./drizzle/schema.ts";

export const schema = createZeroSchema(
  { ...drizzleSchema, ...drizzleRelations },
  {
    tables: {
      user: {
        id: true,
        name: true,
        partner: true,
      },
      medium: {
        id: true,
        name: true,
      },
      message: {
        id: true,
        senderID: true,
        mediumID: true,
        body: true,
        timestamp: true,
      },
    },
  }
);

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
