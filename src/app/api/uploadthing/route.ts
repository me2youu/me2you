import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Resolve a valid UPLOADTHING_TOKEN.
// 1. Use UPLOADTHING_TOKEN if it decodes to valid JSON
// 2. Otherwise, construct from legacy UPLOADTHING_SECRET + UPLOADTHING_APP_ID
function resolveToken(): string | undefined {
  const raw = process.env.UPLOADTHING_TOKEN;
  if (raw) {
    // Strip accidental 'UPLOADTHING_TOKEN=' prefix or surrounding quotes
    const cleaned = raw
      .replace(/^UPLOADTHING_TOKEN\s*=\s*/, "")
      .replace(/^['"]|['"]$/g, "")
      .trim();
    try {
      JSON.parse(Buffer.from(cleaned, "base64").toString("utf-8"));
      return cleaned; // Valid token
    } catch {
      console.warn("[UploadThing] UPLOADTHING_TOKEN could not be decoded, trying legacy env vars");
    }
  }

  // Fallback: build from legacy env vars
  const secret = process.env.UPLOADTHING_SECRET;
  const appId = process.env.UPLOADTHING_APP_ID;
  if (secret && appId) {
    const payload = JSON.stringify({ apiKey: secret, appId, regions: ["fra1"] });
    return Buffer.from(payload).toString("base64");
  }

  return undefined;
}

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: resolveToken(),
  },
});
