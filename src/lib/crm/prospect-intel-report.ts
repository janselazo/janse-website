/**
 * Rule-based market intel (software / AI / growth) from public signals.
 * No LLM — extend later with optional OpenAI over extracted text.
 */

export type IntelSignals = {
  name?: string | null;
  hasWebsite: boolean;
  websiteUrl?: string | null;
  https?: boolean;
  pageTitle?: string | null;
  metaDescription?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  placeTypes?: string[] | null;
  formattedAddress?: string | null;
};

export type MarketIntelReport = {
  software: string[];
  aiAutomations: string[];
  productGrowth: string[];
  summary: string;
};

function nonEmpty(s: string | null | undefined): boolean {
  return Boolean(s && s.trim().length > 0);
}

export function buildMarketIntelReport(signals: IntelSignals): MarketIntelReport {
  const software: string[] = [];
  const aiAutomations: string[] = [];
  const productGrowth: string[] = [];

  if (!signals.hasWebsite) {
    software.push(
      "No public website listed — a modern site or web app is a clear project entry point."
    );
    productGrowth.push(
      "Digital presence gap: first-party site improves trust, SEO, and conversion tracking."
    );
  } else {
    if (signals.https === false) {
      software.push(
        "Site not served over HTTPS — security, SEO, and browser trust all suffer; migration is straightforward."
      );
    }
    if (nonEmpty(signals.metaDescription) && signals.metaDescription!.trim().length < 80) {
      productGrowth.push(
        "Meta description is thin — better positioning copy can lift organic CTR and clarify the offer."
      );
    }
    if (!nonEmpty(signals.pageTitle)) {
      software.push(
        "Weak or missing page title — technical SEO and sharing previews need clean title/meta."
      );
    }
  }

  if (
    signals.reviewCount != null &&
    signals.reviewCount < 20 &&
    signals.rating != null &&
    signals.rating >= 3.5
  ) {
    productGrowth.push(
      "Review volume is modest — systematic follow-up and automation can increase reviews without extra headcount."
    );
  }

  if (signals.rating != null && signals.rating < 4) {
    productGrowth.push(
      "Rating headroom — operations + comms tooling (ticketing, SMS, email sequences) can improve CX and scores."
    );
  }

  const types = (signals.placeTypes ?? []).map((t) => t.toLowerCase());
  const localService =
    types.some((t) =>
      /restaurant|store|gym|salon|repair|plumber|electrician|dentist|doctor|lawyer|real_estate/.test(
        t
      )
    );
  if (localService) {
    aiAutomations.push(
      "Local service businesses often win with booking reminders, missed-call SMS, and review requests — good AI/automation fit."
    );
    software.push(
      "Consider a simple customer portal or booking flow if they still rely on phone-only scheduling."
    );
  }

  if (software.length === 0) {
    software.push(
      "Explore custom software or site hardening: performance, accessibility, and maintainable stacks reduce long-term cost."
    );
  }
  if (aiAutomations.length === 0) {
    aiAutomations.push(
      "Map repetitive workflows (intake, quoting, follow-ups) — AI-assisted drafts and workflow automation are common wins."
    );
  }
  if (productGrowth.length === 0) {
    productGrowth.push(
      "Instrumentation (analytics, funnels) and experiment cadence — product-led growth starts with measurable baselines."
    );
  }

  const name = signals.name?.trim() || "This business";
  const summary = `${name}: prioritize ${signals.hasWebsite ? "iterating on the current digital experience" : "establishing a strong web presence"}, tighten operations with automation where manual work repeats, and align growth levers with measurable funnel data.`;

  return { software, aiAutomations, productGrowth, summary };
}
