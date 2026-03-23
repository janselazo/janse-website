import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import SettingsPageView from "@/components/crm/SettingsPageView";

export default async function SettingsPage() {
  const configured = isSupabaseConfigured();
  let email: string | null = null;
  let fullName: string | null = null;
  let phone: string | null = null;
  let role: string | null = null;
  let avatarUrl: string | null = null;
  let profileError: string | null = null;

  if (configured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
    if (user) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, role, phone, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (error) profileError = error.message;
      else if (profile) {
        fullName = profile.full_name;
        role = profile.role;
        phone = profile.phone ?? null;
        avatarUrl = profile.avatar_url ?? null;
      }
    }
  }

  return (
    <div className="p-8">
      <SettingsPageView
        initial={{
          configured,
          email,
          fullName,
          phone,
          role,
          avatarUrl,
          profileError,
        }}
      />
    </div>
  );
}
