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
