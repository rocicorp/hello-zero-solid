import { defineMutator, defineMutators } from "@rocicorp/zero";
import { must } from "./must";
import z from "zod";
import { Context } from "./context";
import { builder } from "./schema";

export const mutators = defineMutators({
  message: {
    create: defineMutator(
      z.object({
        id: z.string(),
        mediumID: z.string(),
        senderID: z.string(),
        body: z.string(),
        timestamp: z.number(),
      }),
      async ({ tx, args }) => {
        await tx.mutate.message.insert(args);
      }
    ),
    delete: defineMutator(
      z.object({
        id: z.string(),
      }),
      async ({ tx, args: { id }, ctx }) => {
        mustBeLoggedIn(ctx);
        await tx.mutate.message.delete({ id });
      }
    ),
    update: defineMutator(
      z.object({
        message: z.object({
          id: z.string(),
          body: z.string(),
        }),
      }),
      async ({ tx, args: { message }, ctx }) => {
        mustBeLoggedIn(ctx);
        const prev = await tx.run(
          builder.message.where("id", message.id).one()
        );
        if (!prev) {
          return;
        }
        if (prev.senderID !== ctx.userID) {
          throw new Error("Must be sender of message to edit");
        }
        await tx.mutate.message.update(message);
      }
    ),
  },
});

function mustBeLoggedIn(ctx: Context): asserts ctx {
  must(ctx, "Must be logged in");
}
