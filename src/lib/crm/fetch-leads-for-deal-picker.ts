import { createClient } from "@/lib/supabase/server";

export type LeadDealPickerOption = {
  id: string;
  label: string;
  hasDeal: boolean;
  email: string | null;
  name: string | null;
};

/**
 * Leads for the Create deal flow: label + whether a deal already exists (unique per lead).
 */
export async function fetchLeadsForDealPicker(): Promise<LeadDealPickerOption[]> {
  const supabase = await createClient();
  const { data: leads, error } = await supabase
    .from("lead")
    .select("id, name, email")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error || !leads?.length) return [];

  const { data: dealRows } = await supabase.from("deal").select("lead_id");
  const leadIdsWithDeal = new Set(
    (dealRows ?? []).map((r) => r.lead_id as string)
  );

  return leads.map((l) => {
    const name = l.name?.trim() ?? "";
    const email = l.email?.trim() ?? "";
    const label =
      [name, email].filter(Boolean).join(" · ") || "Unnamed lead";
    return {
      id: l.id,
      label,
      hasDeal: leadIdsWithDeal.has(l.id),
      email: l.email,
      name: l.name,
    };
  });
}
