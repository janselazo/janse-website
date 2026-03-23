import type { SupabaseClient } from "@supabase/supabase-js";

/** Latest message snippet per conversation for inbox list (batch). */
export async function conversationPreviewById(
  supabase: SupabaseClient,
  conversationIds: string[]
): Promise<Record<string, string>> {
  if (conversationIds.length === 0) return {};

  const { data } = await supabase
    .from("conversation_message")
    .select("conversation_id, body, attachment, created_at")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });

  const seen = new Set<string>();
  const out: Record<string, string> = {};

  for (const row of data ?? []) {
    const cid = row.conversation_id as string;
    if (seen.has(cid)) continue;
    seen.add(cid);

    let text = String(row.body ?? "").trim();
    if (text === "[voice]") text = "Voice message";
    const att = row.attachment as { name?: string } | null;
    if (!text && att?.name) text = `Attachment: ${att.name}`;
    if (!text) text = "Message";
    out[cid] = text;
  }

  return out;
}
