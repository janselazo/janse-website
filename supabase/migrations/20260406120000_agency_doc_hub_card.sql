-- Hub card metadata: custom title/description and soft-hide from the docs grid.

create table public.agency_doc_hub_card (
  slug text primary key,
  hidden boolean not null default false,
  title_override text,
  description_override text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.agency_doc_hub_card enable row level security;

create policy "agency_doc_hub_card_select"
  on public.agency_doc_hub_card for select
  using (public.is_agency_staff());

create policy "agency_doc_hub_card_insert"
  on public.agency_doc_hub_card for insert
  with check (public.is_agency_staff());

create policy "agency_doc_hub_card_update"
  on public.agency_doc_hub_card for update
  using (public.is_agency_staff())
  with check (public.is_agency_staff());

create policy "agency_doc_hub_card_delete"
  on public.agency_doc_hub_card for delete
  using (public.is_agency_staff());
