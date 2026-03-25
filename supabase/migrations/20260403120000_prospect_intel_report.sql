-- Saved market-intelligence reports from Prospecting → Prospects (optional persistence).

create table if not exists public.prospect_intel_report (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  lead_id uuid references public.lead (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists prospect_intel_report_user_created_idx
  on public.prospect_intel_report (user_id, created_at desc);

alter table public.prospect_intel_report enable row level security;

create policy "agency_all_prospect_intel_report"
  on public.prospect_intel_report for all
  using (public.is_agency_staff())
  with check (public.is_agency_staff());

grant select, insert, update, delete on public.prospect_intel_report to authenticated;
