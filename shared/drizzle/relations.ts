import { relations } from "drizzle-orm/relations";
import { medium, message, user } from "./schema";

export const messageRelations = relations(message, ({ one }) => ({
  user: one(user, {
    fields: [message.senderID],
    references: [user.id],
  }),
  medium: one(medium, {
    fields: [message.mediumID],
    references: [medium.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  messages: many(message),
}));

export const mediumRelations = relations(medium, ({ many }) => ({
  messages: many(message),
}));
