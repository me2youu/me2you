import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// UploadThing v7 requires UPLOADTHING_TOKEN (base64 JSON).
// If only the legacy UPLOADTHING_SECRET + UPLOADTHING_APP_ID are set,
// construct the token on the fly so both old and new env configs work.
function getToken(): string | undefined {
  if (process.env.UPLOADTHING_TOKEN) return process.env.UPLOADTHING_TOKEN;
  const secret = process.env.UPLOADTHING_SECRET;
  const appId = process.env.UPLOADTHING_APP_ID;
  if (secret && appId) {
    const payload = JSON.stringify({ apiKey: secret, appId, regions: ["dub1"] });
    return Buffer.from(payload).toString("base64");
  }
  return undefined;
}

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: getToken(),
  },
});
