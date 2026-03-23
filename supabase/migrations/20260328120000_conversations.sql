-- Unified inbox: conversations + messages (agency staff only via RLS)

create table public.conversation (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null,
  channel text not null default 'other'
    check (channel in (
      'email',
      'whatsapp',
      'sms',
      'facebook_messenger',
      'instagram',
      'linkedin',
      'x',
      'paid_ads',
      'other'
    )),
  lead_id uuid references public.lead (id) on delete set null,
  client_id uuid references public.client (id) on delete set null,
  last_message_at timestamptz not null default now(),
  unread_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_message (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversation (id) on delete cascade,
  kind text not null default 'external'
    check (kind in ('external', 'internal', 'system')),
  direction text not null default 'inbound'
    check (direction in ('inbound', 'outbound')),
  body text,
  sender_name text,
  sender_avatar_url text,
  attachment jsonb,
  created_at timestamptz not null default now()
);

create index conversation_last_message_idx on public.conversation (last_message_at desc);
create index conversation_message_conversation_idx on public.conversation_message (conversation_id, created_at);

alter table public.conversation enable row level security;
alter table public.conversation_message enable row level security;

create policy "agency_all_conversation"
  on public.conversation for all
  using (public.is_agency_staff())
  with check (public.is_agency_staff());

create policy "agency_all_conversation_message"
  on public.conversation_message for all
  using (public.is_agency_staff())
  with check (public.is_agency_staff());

-- Demo threads
insert into public.conversation (id, contact_name, channel, last_message_at, unread_count)
values
  (
    'a0000000-0000-4000-8000-000000000001',
    'Washim Chowdhury',
    'whatsapp',
    now() - interval '5 minutes',
    2
  ),
  (
    'a0000000-0000-4000-8000-000000000002',
    'Wei Chen',
    'email',
    now() - interval '2 hours',
    0
  ),
  (
    'a0000000-0000-4000-8000-000000000003',
    'Acme Corp — Ads',
    'paid_ads',
    now() - interval '1 day',
    1
  );

insert into public.conversation_message (
  conversation_id,
  kind,
  direction,
  body,
  sender_name,
  attachment,
  created_at
)
values
  (
    'a0000000-0000-4000-8000-000000000001',
    'external',
    'inbound',
    'Here is the brief you asked for.',
    'Tony Stark',
    '{"name": "Brief.doc", "size_kb": 178, "url": null}'::jsonb,
    now() - interval '40 minutes'
  ),
  (
    'a0000000-0000-4000-8000-000000000001',
    'external',
    'outbound',
    'Thanks — reviewing now and I will get back by EOD.',
    'You',
    null,
    now() - interval '35 minutes'
  ),
  (
    'a0000000-0000-4000-8000-000000000001',
    'external',
    'inbound',
    '[voice]',
    'Wei Chen',
    null,
    now() - interval '5 minutes'
  ),
  (
    'a0000000-0000-4000-8000-000000000002',
    'external',
    'inbound',
    'Can we reschedule the discovery call to Thursday?',
    'Wei Chen',
    null,
    now() - interval '2 hours'
  ),
  (
    'a0000000-0000-4000-8000-000000000002',
    'internal',
    'outbound',
    'Follow up on pricing — they are comparing two vendors.',
    'Internal',
    null,
    now() - interval '1 hour'
  ),
  (
    'a0000000-0000-4000-8000-000000000003',
    'external',
    'inbound',
    'New lead message from campaign: Summer Promo',
    'Facebook Lead',
    null,
    now() - interval '1 day'
  );
