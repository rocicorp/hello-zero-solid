/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.tsx";
import "./index.css";
import { schema } from "../shared/schema.ts";
import Cookies from "js-cookie";
import { ZeroProvider } from "@rocicorp/zero/solid";
import { mutators } from "../shared/mutators.ts";

const signedCookie = Cookies.get("auth");
const userID = signedCookie ? signedCookie.split(".")[0] : "anon";
const context = signedCookie ? { userID } : undefined;

const root = document.getElementById("root");

render(
  () => (
    <ZeroProvider
      {...{
        server: import.meta.env.VITE_PUBLIC_SERVER,
        schema,
        userID,
        context,
        mutators,
      }}
    >
      <App />
    </ZeroProvider>
  ),
  root!
);
