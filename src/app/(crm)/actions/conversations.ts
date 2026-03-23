"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MAX_BODY = 1000;

export async function sendConversationMessage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const conversationId = String(formData.get("conversation_id") ?? "").trim();
  const rawBody = String(formData.get("body") ?? "");
  const kindRaw = String(formData.get("kind") ?? "external").trim();
  const kind = kindRaw === "internal" ? "internal" : "external";

  if (!conversationId) return { error: "Missing conversation." };

  const body = rawBody.slice(0, MAX_BODY).trim();
  if (!body) return { error: "Write a message first." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const senderName =
    profile?.full_name?.trim() || user.email?.split("@")[0] || "You";

  const { error: msgErr } = await supabase.from("conversation_message").insert({
    conversation_id: conversationId,
    kind,
    direction: "outbound",
    body,
    sender_name: senderName,
  });

  if (msgErr) return { error: msgErr.message };

  const { error: convErr } = await supabase
    .from("conversation")
    .update({
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (convErr) return { error: convErr.message };

  revalidatePath("/conversations");
  revalidatePath(`/conversations/${conversationId}`);
  return { ok: true as const };
}

export async function markConversationRead(conversationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("conversation")
    .update({ unread_count: 0 })
    .eq("id", conversationId);

  if (error) return { error: error.message };

  revalidatePath("/conversations");
  revalidatePath(`/conversations/${conversationId}`);
  return { ok: true as const };
}
