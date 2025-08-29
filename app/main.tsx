/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.tsx";
import "./index.css";
import { schema } from "../shared/schema.ts";
import Cookies from "js-cookie";
import { ZeroProvider } from "@rocicorp/zero/solid";
import { createMutators } from "../shared/mutators.ts";
import { decodeAuthData } from "../shared/auth.ts";

const encodedJWT = Cookies.get("jwt");
const authData = decodeAuthData(encodedJWT);
const userID = authData?.sub ?? "anon";

const zeroOptions = {
  userID,
  auth: encodedJWT,
  server: import.meta.env.VITE_PUBLIC_SERVER,
  schema,
  mutators: createMutators(authData),
  enableLegacyMutators: false,
  enableLegacyQueries: false,
};

const root = document.getElementById("root");

render(
  () => (
    <ZeroProvider {...zeroOptions}>
      <App />
    </ZeroProvider>
  ),
  root!
);
