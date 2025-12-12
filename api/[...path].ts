// @ts-expect-error - Built output will be available at deploy time
import handler from "../dist/server/index.js";

export const config = {
  runtime: "nodejs",
};

export default handler;
