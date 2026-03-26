import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import twilio from "twilio";
import { getAgencyTwilioCredentials } from "@/lib/twilio/agency-credentials";
import { getPublicOriginFromRequest } from "@/lib/site-public-url";

/**
 * Validates Twilio signature and returns 200 plain text on success.
 * @param pathname - Must match the path Twilio posts to (e.g. /api/webhooks/twilio).
 */
export async function validateTwilioInboundWebhook(
  req: NextRequest,
  pathname: string,
): Promise<NextResponse> {
  const creds = await getAgencyTwilioCredentials();
  if (!creds) {
    return NextResponse.json({ error: "Twilio integration not configured" }, { status: 503 });
  }

  const body = await req.text();
  const params = Object.fromEntries(new URLSearchParams(body));
  const signature = req.headers.get("x-twilio-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 403 });
  }

  const origin = getPublicOriginFromRequest(req);
  const url = `${origin}${pathname}`;

  const valid = twilio.validateRequest(creds.authToken, signature, url, params);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  return new NextResponse("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
