import ProposalsListView from "@/components/crm/ProposalsListView";
import { fetchProposalsForList } from "@/lib/crm/fetch-proposals-for-list";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="p-8">
        <h1 className="heading-display text-2xl font-bold">Proposals</h1>
        <p className="mt-2 text-text-secondary">
          Configure Supabase to load proposals.
        </p>
      </div>
    );
  }

  const { rows, kpis } = await fetchProposalsForList();

  return (
    <div className="p-8">
      <ProposalsListView rows={rows} kpis={kpis} />
    </div>
  );
}
