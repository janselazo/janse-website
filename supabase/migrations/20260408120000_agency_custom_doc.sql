-- User-created workspace docs (extend beyond built-in registry).

create table public.agency_custom_doc (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  icon_key text not null default 'file-text',
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create index agency_custom_doc_created_at_idx
  on public.agency_custom_doc (created_at asc);

alter table public.agency_custom_doc enable row level security;

create policy "agency_custom_doc_select"
  on public.agency_custom_doc for select
  using (public.is_agency_staff());

create policy "agency_custom_doc_insert"
  on public.agency_custom_doc for insert
  with check (public.is_agency_staff());

create policy "agency_custom_doc_update"
  on public.agency_custom_doc for update
  using (public.is_agency_staff())
  with check (public.is_agency_staff());

create policy "agency_custom_doc_delete"
  on public.agency_custom_doc for delete
  using (public.is_agency_staff());
