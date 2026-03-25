-- Editable agency workspace docs (body text; titles/descriptions stay in app registry).

create table public.agency_workspace_doc (
  slug text primary key,
  body text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create index agency_workspace_doc_updated_at_idx
  on public.agency_workspace_doc (updated_at desc);

alter table public.agency_workspace_doc enable row level security;

create policy "agency_workspace_doc_select"
  on public.agency_workspace_doc for select
  using (public.is_agency_staff());

create policy "agency_workspace_doc_insert"
  on public.agency_workspace_doc for insert
  with check (public.is_agency_staff());

create policy "agency_workspace_doc_update"
  on public.agency_workspace_doc for update
  using (public.is_agency_staff())
  with check (public.is_agency_staff());

create policy "agency_workspace_doc_delete"
  on public.agency_workspace_doc for delete
  using (public.is_agency_staff());
