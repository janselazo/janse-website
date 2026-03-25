import type { LucideIcon } from "lucide-react";
import {
  Award,
  Compass,
  Eye,
  Flag,
  Hash,
  Heart,
  KeyRound,
  Map as MapIcon,
  Search,
  Target,
  UserCircle,
} from "lucide-react";

export type AgencyDocSlug =
  | "icp"
  | "market-research"
  | "keywords"
  | "vision"
  | "mission"
  | "purpose"
  | "values"
  | "tools-passwords"
  | "buyer-persona"
  | "customer-journey"
  | "unique-value-proposition";

export type AgencyDocDefinition = {
  slug: AgencyDocSlug;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Default body when nothing is stored in the database yet. */
  placeholderParagraphs: string[];
};

export const AGENCY_DOCS: readonly AgencyDocDefinition[] = [
  {
    slug: "icp",
    title: "ICP",
    description:
      "Ideal customer profile — firmographics, triggers, and who you say no to.",
    icon: Target,
    placeholderParagraphs: [
      "Define the companies or segments you serve best: size, industry, geography, tech stack, and budget signals.",
      "List disqualifiers so the team aligns on who is out of scope.",
      "Edit below; content syncs to the database for your team.",
    ],
  },
  {
    slug: "market-research",
    title: "Market Research",
    description:
      "Landscape, competitors, trends, and evidence that informs positioning.",
    icon: Search,
    placeholderParagraphs: [
      "Capture market size, growth, key players, and whitespace you are targeting.",
      "Link or summarize primary research, interviews, and third-party sources.",
      "Use this as the single place the team checks before messaging or pricing changes.",
    ],
  },
  {
    slug: "keywords",
    title: "Keywords",
    description:
      "SEO and paid search themes — priority terms, intent clusters, and notes.",
    icon: Hash,
    placeholderParagraphs: [
      "Group keywords by intent: brand, commercial, informational, and competitor.",
      "Note priority, difficulty, and which pages or campaigns they map to.",
      "Keep short-lived experiments separate from evergreen targets.",
    ],
  },
  {
    slug: "vision",
    title: "Vision",
    description:
      "Where the agency is headed — the long-term picture you are building toward.",
    icon: Eye,
    placeholderParagraphs: [
      "State the future you are creating for clients and the business in one clear narrative.",
      "Revisit quarterly; vision should be stable but not frozen.",
    ],
  },
  {
    slug: "mission",
    title: "Mission",
    description:
      "What you do every day — the work that advances the vision.",
    icon: Flag,
    placeholderParagraphs: [
      "Mission is operational: who you serve, how you deliver, and what makes your approach distinct.",
      "Keep it concrete enough that hiring and prioritization decisions can reference it.",
    ],
  },
  {
    slug: "purpose",
    title: "Purpose",
    description:
      "Why the agency exists — the underlying reason beyond revenue.",
    icon: Compass,
    placeholderParagraphs: [
      "Purpose answers why this work matters to you, the team, and clients.",
      "Use it in onboarding and storytelling; it complements vision and mission.",
    ],
  },
  {
    slug: "values",
    title: "Values",
    description:
      "Principles and behaviors that define how you work together and with clients.",
    icon: Heart,
    placeholderParagraphs: [
      "List values with short definitions and examples of “in practice / not in practice.”",
      "Values should be debatable and memorable, not generic filler.",
    ],
  },
  {
    slug: "tools-passwords",
    title: "Tools & Passwords",
    description:
      "Stack inventory and access — treat as sensitive; prefer a vault for secrets.",
    icon: KeyRound,
    placeholderParagraphs: [
      "Inventory subscriptions, owners, renewal dates, and where credentials live.",
      "For real secrets, use a dedicated password manager or encrypted store — not plain text in a doc long term.",
    ],
  },
  {
    slug: "buyer-persona",
    title: "Buyer Persona",
    description:
      "Named archetypes — goals, pains, objections, and buying process.",
    icon: UserCircle,
    placeholderParagraphs: [
      "One primary persona per doc section: role, KPIs, day-in-the-life, and decision criteria.",
      "Align with ICP; personas are the people inside those accounts.",
    ],
  },
  {
    slug: "customer-journey",
    title: "Customer Journey",
    description:
      "Stages from awareness to renewal — touchpoints, content, and handoffs.",
    icon: MapIcon,
    placeholderParagraphs: [
      "Map stages horizontally: awareness, consideration, decision, onboarding, expansion.",
      "Note agency responsibilities vs. client-side at each step.",
    ],
  },
  {
    slug: "unique-value-proposition",
    title: "Unique Value Proposition",
    description:
      "The differentiated promise — who it’s for, what you deliver, and why you.",
    icon: Award,
    placeholderParagraphs: [
      "One tight statement plus proof points: case studies, metrics, and methodology.",
      "Test variants in sales calls; fold learnings back here.",
    ],
  },
] as const;

const bySlug = new Map<AgencyDocSlug, AgencyDocDefinition>(
  AGENCY_DOCS.map((d) => [d.slug, d])
);

/** Built-in slugs; custom docs must not use these. */
export const RESERVED_REGISTRY_SLUGS: ReadonlySet<string> = new Set(
  AGENCY_DOCS.map((d) => d.slug as string)
);

export function getAllAgencyDocs(): readonly AgencyDocDefinition[] {
  return AGENCY_DOCS;
}

export function getAgencyDocBySlug(
  slug: string
): AgencyDocDefinition | undefined {
  return bySlug.get(slug as AgencyDocSlug);
}

export function isAgencyDocSlug(slug: string): slug is AgencyDocSlug {
  return bySlug.has(slug as AgencyDocSlug);
}

/** Plain-text body: paragraphs separated by blank lines (shown/edited in the doc editor). */
export function defaultBodyFromDefinition(doc: AgencyDocDefinition): string {
  return doc.placeholderParagraphs.join("\n\n");
}
