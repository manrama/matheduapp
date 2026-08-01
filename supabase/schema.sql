-- Mathketeers — Phase 4 persistence schema
-- Run this in the Supabase SQL editor (or `supabase db` migration) to create
-- the table the app reads/writes via createSupabaseAdapter().
--
-- One row per player, keyed by the device-scoped UUID the client generates
-- (see src/lib/persistence/playerId.js). No login required.

create table if not exists public.mathketeers_progress (
  player_id        text primary key,
  score            integer     not null default 0,
  correct_count    integer     not null default 0,
  total_answered   integer     not null default 0,
  best_streak      integer     not null default 0,
  level            integer     not null default 1,
  unlocked_hero_ids jsonb      not null default '[]'::jsonb,
  selected_hero_id text,
  updated_at       timestamptz not null default now()
);

alter table public.mathketeers_progress enable row level security;

-- NOTE ON SECURITY
-- This app has no auth, so these policies let the anon (public) key read and
-- upsert rows keyed by a client-generated id. That is fine for a single-player
-- kids' learning demo, but it is effectively an open table. For production /
-- multi-device sync, switch to Supabase Anonymous Auth (or full auth) and scope
-- the policies to `auth.uid() = player_id::uuid` instead of the blanket rules
-- below.

drop policy if exists "anon can read own-ish progress" on public.mathketeers_progress;
create policy "anon can read own-ish progress"
  on public.mathketeers_progress
  for select
  to anon
  using (true);

drop policy if exists "anon can upsert progress" on public.mathketeers_progress;
create policy "anon can insert progress"
  on public.mathketeers_progress
  for insert
  to anon
  with check (true);

create policy "anon can update progress"
  on public.mathketeers_progress
  for update
  to anon
  using (true)
  with check (true);

create policy "anon can delete own progress"
  on public.mathketeers_progress
  for delete
  to anon
  using (true);
