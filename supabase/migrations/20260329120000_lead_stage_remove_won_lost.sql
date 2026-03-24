-- Retire lead stages won/lost (use deal closed_won / closed_lost for outcomes).
-- Map existing rows into the four-stage lead pipeline.
update public.lead
set stage = 'qualified'
where lower(trim(stage)) = 'won';

update public.lead
set stage = 'not_qualified'
where lower(trim(stage)) = 'lost';
