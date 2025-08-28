import { syncedQuery, escapeLike } from "@rocicorp/zero";
import z from "zod";
import { builder } from "./schema";

export const queries = {
  users: syncedQuery("user", z.tuple([]), () => builder.user),

  mediums: syncedQuery("medium", z.tuple([]), () => builder.medium),

  messages: syncedQuery("messages", z.tuple([]), () =>
    builder.message.orderBy("timestamp", "desc")
  ),

  filteredMessages: syncedQuery(
    "filteredMessages",
    z.tuple([
      z.object({
        senderID: z.string(),
        mediumID: z.string(),
        body: z.string(),
        timestamp: z.string(),
      }),
    ]),
    ({ senderID, mediumID, body, timestamp }) => {
      let q = builder.message
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
};
