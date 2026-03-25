import { notFound } from "next/navigation";
import ProposalBuilderView from "@/components/crm/ProposalBuilderView";
import { fetchClientsForProposalPicker } from "@/lib/crm/fetch-clients-for-proposal-picker";
import { fetchProposalDetail } from "@/lib/crm/fetch-proposal-detail";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <div className="p-8">
        <h1 className="heading-display text-2xl font-bold">Proposal</h1>
        <p className="mt-2 text-text-secondary">Configure Supabase first.</p>
      </div>
    );
  }

  const [detail, clientOptions] = await Promise.all([
    fetchProposalDetail(id),
    fetchClientsForProposalPicker(),
  ]);
  if (!detail) notFound();

  return (
    <ProposalBuilderView
      key={detail.id}
      initial={detail}
      clientOptions={clientOptions}
    />
  );
}
