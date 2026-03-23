"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const ROLE_LABELS: Record<string, string> = {
  agency_admin: "Agency admin",
  agency_member: "Agency member",
  client: "Client",
};

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const full_name = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: full_name || null,
      phone: phone || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { ok: true as const };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { ok: true as const };
}

export async function removeAvatar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const url = profile?.avatar_url;
  if (url) {
    let path: string | undefined;
    if (url.includes("/object/public/avatars/")) {
      path = url.split("/object/public/avatars/")[1]?.split("?")[0];
    } else if (url.includes("/avatars/")) {
      path = url.split("/avatars/")[1]?.split("?")[0];
    }
    if (path) {
      await supabase.storage
        .from("avatars")
        .remove([decodeURIComponent(path)]);
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { ok: true as const };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const file = formData.get("avatar") as File | null;
  if (!file || !(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "Image must be 5MB or smaller." };
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const allowed = ["jpg", "jpeg", "png", "webp"];
  if (!allowed.includes(ext)) {
    return { error: "Use JPG, PNG, or WebP." };
  }

  const path = `${user.id}/avatar.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (upErr) return { error: upErr.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error: dbErr } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (dbErr) return { error: dbErr.message };
  revalidatePath("/settings");
  return { ok: true as const, url: publicUrl };
}

export { ROLE_LABELS };
