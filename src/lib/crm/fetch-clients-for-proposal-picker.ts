import { createClient } from "@/lib/supabase/server";

export type ProposalClientOption = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
};

export async function fetchClientsForProposalPicker(): Promise<
  ProposalClientOption[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client")
    .select("id, name, email, company")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error || !data) return [];

  return data.map((c) => ({
    id: c.id as string,
    name:
      c.name?.trim() ||
      c.company?.trim() ||
      c.email?.trim() ||
      "Unnamed",
    email: c.email ?? null,
    company: c.company ?? null,
  }));
}
