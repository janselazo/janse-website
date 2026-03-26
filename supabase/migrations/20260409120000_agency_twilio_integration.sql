-- Singleton Twilio integration settings for the agency CRM (encrypted auth token at app layer).

create table public.agency_twilio_integration (
  id smallint primary key default 1 check (id = 1),
  account_sid text,
  auth_token_encrypted text,
  from_phone text,
  test_destination_phone text,
  whatsapp_sandbox boolean not null default false,
  whatsapp_from text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

comment on table public.agency_twilio_integration is 'Agency-wide Twilio SMS/WhatsApp credentials; auth_token_encrypted is AES-GCM ciphertext from app.';

insert into public.agency_twilio_integration (id) values (1)
on conflict (id) do nothing;

alter table public.agency_twilio_integration enable row level security;

create policy "agency_staff_twilio_select"
  on public.agency_twilio_integration for select
  using (public.is_agency_staff());

create policy "agency_staff_twilio_insert"
  on public.agency_twilio_integration for insert
  with check (public.is_agency_staff());

create policy "agency_staff_twilio_update"
  on public.agency_twilio_integration for update
  using (public.is_agency_staff())
  with check (public.is_agency_staff());
