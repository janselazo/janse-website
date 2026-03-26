import type { NextRequest } from "next/server";
import { headers } from "next/headers";

/**
 * Public origin for webhook URLs shown in the UI and for Twilio signature checks.
 * Prefer PUBLIC_APP_URL in production when proxies strip or misreport Host.
 */
export function getPublicOriginFromRequest(request: NextRequest): string {
  const fixed = process.env.PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fixed) return fixed;
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function getPublicOriginFromHeaders(): Promise<string> {
  const fixed = process.env.PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fixed) return fixed;
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}
