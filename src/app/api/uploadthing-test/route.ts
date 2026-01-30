import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.UPLOADTHING_TOKEN;
  const secret = process.env.UPLOADTHING_SECRET;
  const appId = process.env.UPLOADTHING_APP_ID;

  let decoded: any = null;
  if (token) {
    try {
      decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
      // Redact the API key for safety
      if (decoded.apiKey) decoded.apiKey = decoded.apiKey.slice(0, 12) + "...";
    } catch (e: any) {
      decoded = { error: "Failed to decode token: " + e.message };
    }
  }

  return NextResponse.json({
    hasToken: !!token,
    tokenLength: token?.length ?? 0,
    tokenPreview: token ? token.slice(0, 20) + "..." : null,
    decoded,
    hasLegacySecret: !!secret,
    hasLegacyAppId: !!appId,
    appIdValue: appId || null,
    nodeEnv: process.env.NODE_ENV,
  });
}
