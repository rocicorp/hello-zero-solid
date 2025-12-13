export type Context =
  | {
      userID: string;
    }
  | undefined;

declare module "@rocicorp/zero" {
  interface DefaultTypes {
    context: Context;
  }
}
