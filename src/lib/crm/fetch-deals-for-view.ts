import { createClient } from "@/lib/supabase/server";
import type { DealStage, MockDeal } from "@/lib/crm/mock-data";

const DEAL_STAGES: DealStage[] = [
  "prospect",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
];

function parseStage(raw: string | null): DealStage {
  if (raw && DEAL_STAGES.includes(raw as DealStage)) return raw as DealStage;
  return "prospect";
}

/**
 * Loads `deal` rows with linked `lead` for the Deals CRM view.
 */
export async function fetchDealsForDealsView(): Promise<MockDeal[]> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("deal")
    .select(
      "id, lead_id, title, company, value, stage, expected_close, contact_email, created_at"
    )
    .order("updated_at", { ascending: false });

  if (error || !rows?.length) return [];

  const leadIds = [...new Set(rows.map((r) => r.lead_id))];
  const { data: leads } = await supabase
    .from("lead")
    .select("id, name, email")
    .in("id", leadIds);

  const byLead = new Map((leads ?? []).map((l) => [l.id, l]));

  return rows.map((row) => {
    const lead = byLead.get(row.lead_id);
    const value =
      row.value != null && row.value !== ""
        ? Number(row.value)
        : 0;
    return {
      id: row.id,
      leadId: row.lead_id,
      title: (row.title?.trim() || "Untitled deal") as string,
      company: row.company?.trim() ?? "",
      value: Number.isFinite(value) ? value : 0,
      stage: parseStage(row.stage),
      contactName: lead?.name?.trim() ?? "",
      contactEmail:
        row.contact_email?.trim() || lead?.email?.trim() || "",
      createdAt: row.created_at
        ? new Date(row.created_at).toISOString().slice(0, 10)
        : "",
      expectedClose: row.expected_close
        ? String(row.expected_close).slice(0, 10)
        : "",
    };
  });
}
