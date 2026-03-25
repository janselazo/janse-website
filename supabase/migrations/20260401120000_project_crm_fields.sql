-- CRM project fields: align Postgres with Projects UI (website, budget, plan board, type, team display).

alter table public.project
  add column if not exists website text;

alter table public.project
  add column if not exists budget numeric(12, 2);

alter table public.project
  add column if not exists plan_stage text not null default 'pipeline'
    check (plan_stage in ('pipeline', 'planning', 'mvp', 'growth'));

alter table public.project
  add column if not exists project_type text;

alter table public.project
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists project_client_id_created_at_idx
  on public.project (client_id, created_at desc);
