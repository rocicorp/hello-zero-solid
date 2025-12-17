import { escapeLike, defineQueries, defineQuery } from "@rocicorp/zero";
import z from "zod";
import { zql } from "./schema.js";

export const queries = defineQueries({
  user: {
    all: defineQuery(() => zql.user),
  },
  medium: {
    all: defineQuery(() => zql.medium),
  },
  message: {
    all: defineQuery(() => zql.message.orderBy("timestamp", "desc")),
    filtered: defineQuery(
      z.object({
        senderID: z.string(),
        mediumID: z.string(),
        body: z.string(),
        timestamp: z.string(),
      }),
      ({ args: { senderID, mediumID, body, timestamp } }) => {
        let q = zql.message
          .related("medium", (q) => q.one())
          .related("sender", (q) => q.one())
          .orderBy("timestamp", "desc");

        if (senderID) {
          q = q.where("senderID", senderID);
        }
        if (mediumID) {
          q = q.where("mediumID", mediumID);
        }
        if (body) {
          q = q.where("body", "LIKE", `%${escapeLike(body)}%`);
        }
        if (timestamp) {
          q = q.where(
            "timestamp",
            ">=",
            timestamp ? new Date(timestamp).getTime() : 0
          );
        }

        return q;
      }
    ),
  },
});
