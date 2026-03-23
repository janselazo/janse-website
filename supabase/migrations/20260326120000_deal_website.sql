-- Website URL for deal (lead detail Deal tab)
alter table public.deal
  add column if not exists website text;
