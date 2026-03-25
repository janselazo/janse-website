-- Custom order for docs on the Agency hub grid.

alter table public.agency_doc_hub_card
  add column if not exists sort_order integer;

comment on column public.agency_doc_hub_card.sort_order is
  'Lower values appear first on the hub. Null falls back to registry order.';
