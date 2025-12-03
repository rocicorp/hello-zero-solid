/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.tsx";
import "./index.css";
import { schema } from "../shared/schema.ts";
import Cookies from "js-cookie";
import { ZeroProvider } from "@rocicorp/zero/solid";
import { createMutators } from "../shared/mutators.ts";

const signedCookie = Cookies.get("auth");
const userID = signedCookie ? signedCookie.split(".")[0] : "anon";

const zeroOptions = {
  userID,
  server: import.meta.env.VITE_PUBLIC_SERVER,
  schema,
  mutators: createMutators(userID),
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
