import { decodeJwt, jwtVerify } from "jose";
import { z } from "zod";

// The contents of your decoded JWT.
export const authDataSchema = z.object({
  sub: z.string().nullable(),
});

export type AuthData = z.infer<typeof authDataSchema>;

export async function validateAndDecodeAuthData(
  jwt: string,
  secret: Uint8Array
): Promise<AuthData> {
  const result = await jwtVerify(jwt, secret);
  return authDataSchema.parse(result.payload);
}

export function decodeAuthData(jwt: string | undefined): AuthData | undefined {
  if (!jwt) {
    return undefined;
  }
  return authDataSchema.parse(decodeJwt(jwt));
}
