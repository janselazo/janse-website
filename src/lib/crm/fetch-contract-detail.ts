import { createClient } from "@/lib/supabase/server";
import { type ContractDetail, parseContractStatus } from "@/lib/crm/proposal-types";

function lineTotal(q: number, p: number): number {
  return Math.round(q * p * 100) / 100;
}

export async function fetchContractDetail(
  contractId: string
): Promise<ContractDetail | null> {
  const supabase = await createClient();
  const { data: c, error } = await supabase
    .from("contract")
    .select(
      "id, proposal_id, status, terms_snapshot, signed_at, signer_name"
    )
    .eq("id", contractId)
    .maybeSingle();

  if (error || !c) return null;

  const proposalId = c.proposal_id as string;
  const { data: p } = await supabase
    .from("proposal")
    .select(
      "id, client_id, title, proposal_number, issued_at, valid_until, discount_amount"
    )
    .eq("id", proposalId)
    .maybeSingle();

  if (!p) return null;

  const clientId = p.client_id as string;
  const [{ data: client }, { data: lineItems }] = await Promise.all([
    supabase.from("client").select("name, email, company").eq("id", clientId).maybeSingle(),
    supabase
      .from("proposal_line_item")
      .select("quantity, unit_price")
      .eq("proposal_id", proposalId),
  ]);

  let sub = 0;
  for (const row of lineItems ?? []) {
    const q = Number(row.quantity) || 0;
    const up = Number(row.unit_price) || 0;
    sub += lineTotal(q, up);
  }
  const disc = Number(p.discount_amount) || 0;
  const total = Math.max(0, Math.round((sub - disc) * 100) / 100);

  const clientName =
    client?.name?.trim() ||
    client?.company?.trim() ||
    client?.email?.trim() ||
    "Client";

  return {
    id: c.id as string,
    proposalId,
    status: parseContractStatus(c.status as string),
    termsSnapshot: (c.terms_snapshot as string) ?? null,
    signedAt: (c.signed_at as string) ?? null,
    signerName: (c.signer_name as string) ?? null,
    proposalNumber: Number(p.proposal_number) || 0,
    proposalTitle: (p.title as string)?.trim() || "Untitled",
    clientName,
    total,
    issuedAt: p.issued_at ? String(p.issued_at).slice(0, 10) : "",
  };
}
