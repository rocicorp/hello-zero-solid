export const config = {
  runtime: "nodejs",
};

export default async function handler(req: Request) {
  try {
    // @ts-expect-error - Built output will be available at deploy time
    const module = await import("./server-bundle.js");

    console.log("Module loaded:", {
      hasDefault: !!module.default,
      hasApp: !!module.app,
      appType: typeof module.app,
      routes: module.app?.routes,
      routesLength: module.app?.routes?.length
    });

    if (!module.default) {
      return new Response("Error: No default export from server bundle", { status: 500 });
    }

    return await module.default(req);
  } catch (error) {
    console.error("Error loading or executing handler:", error);
    return new Response(`Error: ${error instanceof Error ? error.message : String(error)}\n${error instanceof Error ? error.stack : ''}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
