import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: varchar().primaryKey().notNull(),
  name: varchar().notNull(),
  partner: boolean().notNull(),
});

export const message = pgTable(
  "message",
  {
    id: varchar().primaryKey().notNull(),
    senderID: varchar("sender_id").notNull(),
    mediumID: varchar("medium_id").notNull(),
    body: varchar().notNull(),
    timestamp: timestamp({ mode: "string" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.senderID],
      foreignColumns: [user.id],
      name: "message_sender_id_fkey",
    }),
    foreignKey({
      columns: [table.mediumID],
      foreignColumns: [medium.id],
      name: "message_medium_id_fkey",
    }),
  ]
);

export const medium = pgTable("medium", {
  id: varchar().primaryKey().notNull(),
  name: varchar().notNull(),
});

export const messageRelations = relations(message, ({ one }) => ({
  sender: one(user, { fields: [message.senderID], references: [user.id] }),
  medium: one(medium, { fields: [message.mediumID], references: [medium.id] }),
}));
