-- Settings profile fields (safe if a prior migration rolled back before these ran)
alter table public.profiles
  add column if not exists phone text;

alter table public.profiles
  add column if not exists avatar_url text;
