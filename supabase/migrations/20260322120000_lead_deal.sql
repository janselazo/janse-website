-- One deal per lead (pipeline fields on lead detail Deal tab)
create table public.deal (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.lead (id) on delete cascade,
  title text,
  company text,
  value numeric(12, 2),
  stage text not null default 'prospect'
    check (stage in ('prospect', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  expected_close date,
  contact_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lead_id)
);

create index deal_lead_id_idx on public.deal (lead_id);

alter table public.deal enable row level security;

create policy "agency_all_deal"
  on public.deal for all
  using (public.is_agency_staff())
  with check (public.is_agency_staff());
