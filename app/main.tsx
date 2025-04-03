/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.tsx";
import "./index.css";
import { schema } from "../shared/schema.ts";
import Cookies from "js-cookie";
import { createZero } from "@rocicorp/zero/solid";
import { createMutators } from "../shared/mutators.ts";
import { decodeAuthData } from "../shared/auth.ts";

const encodedJWT = Cookies.get("jwt");
const authData = decodeAuthData(encodedJWT);
const userID = authData?.sub ?? "anon";

const z = createZero({
  userID,
  auth: encodedJWT,
  server: import.meta.env.VITE_PUBLIC_SERVER,
  schema,
  mutators: createMutators(authData),
  kvStore: "idb",
});

// For debugging and inspection.
(window as any)._zero = z;

const root = document.getElementById("root");

render(() => <App z={z} />, root!);
