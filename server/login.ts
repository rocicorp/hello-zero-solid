import { randomInt } from "crypto";
import { type Context } from "hono";
import { getSignedCookie, setSignedCookie } from "hono/cookie";
import { must } from "../shared/must.ts";

// See seed.sql
// In real life you would of course authenticate the user however you like.
const userIDs = [
  "6z7dkeVLNm",
  "ycD76wW4R2",
  "IoQSaxeVO5",
  "WndZWmGkO4",
  "ENzoNm7g4E",
  "dLKecN3ntd",
  "7VoEoJWEwn",
  "enVvyDlBul",
  "9ogaDuDNFx",
];

const secretKey = must(process.env.AUTH_SECRET, "required env var AUTH_SECRET");

export async function handleLogin(c: Context) {
  // Pick a random user ID from the userIDs array
  const userID = userIDs[randomInt(userIDs.length)];
  await setSignedCookie(c, "auth", userID, secretKey);
  return c.text("ok");
}

export async function getUserID(c: Context) {
  const cookie = await getSignedCookie(c, secretKey, "auth");
  if (!cookie) {
    return undefined;
  }
  return cookie;
}
