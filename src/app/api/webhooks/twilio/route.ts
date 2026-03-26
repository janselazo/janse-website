import type { NextRequest } from "next/server";
import { validateTwilioInboundWebhook } from "@/lib/twilio/validate-inbound-webhook";

export const dynamic = "force-dynamic";

const PATH = "/api/webhooks/twilio";

export async function POST(req: NextRequest) {
  return validateTwilioInboundWebhook(req, PATH);
}
