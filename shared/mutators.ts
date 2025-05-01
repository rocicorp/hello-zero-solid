import { CustomMutatorDefs } from "@rocicorp/zero";
import { AuthData } from "./auth";
import { schema, Message, MessageUpdate } from "./schema";

export function createMutators(authData: AuthData | undefined) {
  return {
    message: {
      async create(tx, message: Message) {
        await tx.mutate.message.insert(message);
      },
      async delete(tx, id: string) {
        mustBeLoggedIn(authData);
        await tx.mutate.message.delete({ id });
      },
      async update(tx, message: MessageUpdate) {
        const auth = mustBeLoggedIn(authData);
        const prev = await tx.query.message.where("id", message.id).one();
        if (!prev) {
          return;
        }
        if (prev.senderID !== auth.sub) {
          throw new Error("Must be sender of message to edit");
        }
        await tx.mutate.message.update(message);
      },
    },
  } as const satisfies CustomMutatorDefs<typeof schema>;
}

function mustBeLoggedIn(authData: AuthData | undefined): AuthData {
  if (authData === undefined) {
    throw new Error("Must be logged in");
  }
  return authData;
}

export type Mutators = ReturnType<typeof createMutators>;
