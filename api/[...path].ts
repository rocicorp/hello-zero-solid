// @ts-expect-error - Built output will be available at deploy time
import handler from "./server-bundle.js";

export const config = {
  runtime: "nodejs",
};

export default handler;
