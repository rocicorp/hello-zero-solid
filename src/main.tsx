/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.tsx";
import "./index.css";
import { schema } from "./schema.ts";
import Cookies from "js-cookie";
import { decodeJwt } from "jose";
import { createZero } from "@rocicorp/zero/solid";

const encodedJWT = Cookies.get("jwt");
const decodedJWT = encodedJWT && decodeJwt(encodedJWT);
const userID = decodedJWT?.sub ? (decodedJWT.sub as string) : "anon";

const z = createZero({
  userID,
  auth: () => encodedJWT,
  server: import.meta.env.VITE_PUBLIC_SERVER,
  schema,
  // This is easier to develop with until we make the persistent state
  // delete itself on schema changes. Just remove to get persistent storage.
  kvStore: "mem",
});

const root = document.getElementById("root");

render(() => <App z={z} />, root!);
