import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
/**
 * Loads persisted doc body. No row → use `fallback`. Row with empty string → returns "".
 */
export async function loadAgencyWorkspaceDocBody(
  slug: string,
  fallback: string
): Promise<string> {
  if (!isSupabaseConfigured()) return fallback;

  try {
    const supabase = await createClient();
    const { data: row, error } = await supabase
      .from("agency_workspace_doc")
      .select("body")
      .eq("slug", slug)
      .maybeSingle();

    if (error || row == null) return fallback;
    return row.body;
  } catch {
    return fallback;
  }
}
