import { redirect } from "next/navigation";
import { loadTwilioIntegrationPage } from "@/app/(crm)/actions/twilio-integration";
import { getPublicOriginFromHeaders } from "@/lib/site-public-url";
import TwilioIntegrationSettings from "@/components/crm/TwilioIntegrationSettings";

export const dynamic = "force-dynamic";

export default async function TwilioIntegrationPage() {
  const result = await loadTwilioIntegrationPage();
  if (result.status === "no_user") {
    redirect("/login");
  }
  if (result.status === "forbidden") {
    return (
      <div className="p-8">
        <p className="text-sm text-text-secondary dark:text-zinc-400">
          This page is only available to agency staff.
        </p>
      </div>
    );
  }

  const webhookOrigin = await getPublicOriginFromHeaders();

  return (
    <div className="p-8">
      <TwilioIntegrationSettings initial={result.initial} webhookOrigin={webhookOrigin} />
    </div>
  );
}
