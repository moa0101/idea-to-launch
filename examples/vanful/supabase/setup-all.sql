-- Vanful: full database setup (migrations 0001 + 0002). Paste into the Supabase SQL editor and Run.
-- Safe to run more than once.

-- Vanful email waitlist. The public (anon) key can INSERT only: nobody can read the list from the browser.
create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  email text not null unique check (char_length(email) <= 254 and email ~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'),
  source text not null default 'unknown' check (char_length(source) <= 32),
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

drop policy if exists "anyone can join the waitlist" on public.waitlist;
create policy "anyone can join the waitlist" on public.waitlist
  for insert to anon with check (true);
-- No select/update/delete policies: reading the list needs the service role (dashboard or server).

-- Duplicate emails return HTTP 409 to the client, which the game shows as "already on the list".

-- Vanful playtest data: anonymous play events + in-game feedback.
-- Browser (anon) access is INSERT-ONLY on named columns. Nothing is readable from the browser.
-- Results come from playtest_report(), executable only with the service role (owner's machine).

-- ── play events ────────────────────────────────────────────────────────────────
create table if not exists public.play_events (
  id bigint generated always as identity primary key,
  device uuid not null,          -- random id stored in the player's browser; no personal data
  session uuid not null,         -- random id per page load
  event text not null check (event in (
    'shift_start','tutorial_start','tutorial_step','tutorial_done','tutorial_skip','pack_done',
    'route_set','round_done','shift_over','play_again','copy_score','undo','daily_start',
    'daily_done','paint_select','supporter_unlock','email_join','feedback_sent')),
  props jsonb not null default '{}'::jsonb check (jsonb_typeof(props) = 'object' and pg_column_size(props) <= 1024),
  app_version text not null default 'unknown' check (char_length(app_version) <= 16),
  client_ts timestamptz,         -- when the event happened in the browser (for durations)
  created_at timestamptz not null default now()
);
create index if not exists play_events_device_idx on public.play_events (device, event);

-- ── feedback (one per device) ──────────────────────────────────────────────────
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  device uuid not null unique,
  door_rule text not null check (door_rule in ('yes', 'sort_of', 'no')),
  fun smallint not null check (fun between 1 and 5),
  play_tomorrow text not null check (play_tomorrow in ('yes', 'maybe', 'no')),
  comment text check (char_length(comment) <= 500),
  app_version text not null default 'unknown' check (char_length(app_version) <= 16),
  created_at timestamptz not null default now()
);

-- ── permissions: insert-only, named columns, for the public key ────────────────
alter table public.play_events enable row level security;
alter table public.feedback enable row level security;
alter table public.waitlist enable row level security;

revoke all on public.play_events, public.feedback, public.waitlist from anon, authenticated;
grant insert (device, session, event, props, app_version, client_ts) on public.play_events to anon, authenticated;
grant insert (device, door_rule, fun, play_tomorrow, comment, app_version) on public.feedback to anon, authenticated;
grant insert (email, source) on public.waitlist to anon, authenticated;

drop policy if exists "players can add events" on public.play_events;
create policy "players can add events" on public.play_events for insert to anon, authenticated
  with check (client_ts is null or client_ts between now() - interval '1 day' and now() + interval '5 minutes');
drop policy if exists "players can add feedback" on public.feedback;
create policy "players can add feedback" on public.feedback for insert to anon, authenticated with check (true);
drop policy if exists "anyone can join the waitlist" on public.waitlist;
create policy "anyone can join the waitlist" on public.waitlist for insert to anon, authenticated with check (true);

-- ── owner report (service role only) ───────────────────────────────────────────
create or replace function public.playtest_report(since timestamptz default '-infinity')
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with ev as (select * from public.play_events where created_at >= since),
  fb as (select * from public.feedback where created_at >= since),
  tut as (
    select device,
           min(coalesce(client_ts, created_at)) filter (where event = 'tutorial_start') as started,
           min(coalesce(client_ts, created_at)) filter (where event = 'tutorial_done') as done
    from ev group by device
  ),
  shifts as (
    select device, count(*) filter (where event = 'shift_start') as starts,
           count(*) filter (where event = 'shift_over') as overs
    from ev group by device
  ),
  daily as (
    select device, count(distinct (coalesce(client_ts, created_at) at time zone 'utc')::date) as days
    from ev where event = 'daily_done' group by device
  )
  select jsonb_build_object(
    'devices', (select count(distinct device) from ev),
    'tutorial_completion', jsonb_build_object(
      'started', (select count(*) from tut where started is not null),
      'completed', (select count(*) from tut where started is not null and done is not null)),
    'tutorial_seconds_median', (
      select percentile_cont(0.5) within group (order by extract(epoch from done - started))
      from tut where started is not null and done is not null and done > started),
    'played_again', jsonb_build_object(
      'finished_a_shift', (select count(*) from shifts where overs >= 1),
      'started_another', (select count(*) from shifts where overs >= 1 and starts >= 2)),
    'daily_return', jsonb_build_object(
      'played_daily', (select count(*) from daily),
      'returned_another_day', (select count(*) from daily where days >= 2)),
    'feedback', jsonb_build_object(
      'responses', (select count(*) from fb),
      'door_rule_yes', (select count(*) from fb where door_rule = 'yes'),
      'fun_avg', (select round(avg(fun)::numeric, 2) from fb),
      'play_tomorrow_yes', (select count(*) from fb where play_tomorrow = 'yes'),
      'comments', (select coalesce(jsonb_agg(comment order by created_at), '[]'::jsonb) from fb where comment is not null and comment <> '')),
    'waitlist', (select count(*) from public.waitlist where created_at >= since)
  );
$$;

revoke all on function public.playtest_report(timestamptz) from public, anon, authenticated;
grant execute on function public.playtest_report(timestamptz) to service_role;
