-- Paste into the Supabase SQL editor (runs as the owner).
select jsonb_pretty(public.playtest_report());
-- Since a date:
-- select jsonb_pretty(public.playtest_report('2026-11-20'));
