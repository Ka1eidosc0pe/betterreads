-- BetterReads: personal library + reading log.
--
-- Auth is Clerk (Supabase "third-party auth"). Every request carries the
-- user's Clerk session JWT, so `auth.jwt() ->> 'sub'` is the Clerk user id.
-- Every table below has row-level security: a row is only visible to, and
-- only writable by, the user whose id is stored in `user_id`.

create type public.reading_status as enum ('bookmarked', 'reading', 'finished');

-- ---------------------------------------------------------------------------
-- library_entries: one row per (user, book). Bookmarks are entries whose
-- status is 'bookmarked'; "reading" and "finished" are the other shelves.
-- ---------------------------------------------------------------------------
create table public.library_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default (auth.jwt() ->> 'sub'),
  work_key text not null check (work_key ~ '^OL[0-9]+W$'),
  title text not null check (char_length(title) between 1 and 500),
  authors text[] not null default '{}',
  cover_id integer,
  first_publish_year integer,
  page_count integer check (page_count is null or page_count > 0),
  status public.reading_status not null default 'bookmarked',
  progress_page integer not null default 0 check (progress_page >= 0),
  rating smallint check (rating between 1 and 5),
  review text check (review is null or char_length(review) <= 5000),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, work_key)
);

create index library_entries_user_status_idx
  on public.library_entries (user_id, status, updated_at desc);

-- ---------------------------------------------------------------------------
-- reading_log: a journal of reading sessions for an entry.
-- ---------------------------------------------------------------------------
create table public.reading_log (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default (auth.jwt() ->> 'sub'),
  entry_id uuid not null references public.library_entries (id) on delete cascade,
  pages_read integer not null check (pages_read between 1 and 5000),
  to_page integer check (to_page is null or to_page >= 0),
  note text check (note is null or char_length(note) <= 1000),
  logged_at timestamptz not null default now()
);

create index reading_log_user_logged_idx
  on public.reading_log (user_id, logged_at desc);
create index reading_log_entry_idx on public.reading_log (entry_id);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create function public.touch_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger library_entries_touch_updated_at
  before update on public.library_entries
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Privileges: signed-out (anon) requests get nothing; signed-in requests are
-- further narrowed by the RLS policies below.
-- ---------------------------------------------------------------------------
revoke all on public.library_entries from anon;
revoke all on public.reading_log from anon;
grant select, insert, update, delete on public.library_entries to authenticated;
grant select, insert, update, delete on public.reading_log to authenticated;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.library_entries enable row level security;
alter table public.library_entries force row level security;
alter table public.reading_log enable row level security;
alter table public.reading_log force row level security;

create policy "own library entries: select"
  on public.library_entries for select to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'));

create policy "own library entries: insert"
  on public.library_entries for insert to authenticated
  with check (user_id = (select auth.jwt() ->> 'sub'));

create policy "own library entries: update"
  on public.library_entries for update to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'))
  with check (user_id = (select auth.jwt() ->> 'sub'));

create policy "own library entries: delete"
  on public.library_entries for delete to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'));

create policy "own reading log: select"
  on public.reading_log for select to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'));

-- A log row may only point at an entry the same user owns.
create policy "own reading log: insert"
  on public.reading_log for insert to authenticated
  with check (
    user_id = (select auth.jwt() ->> 'sub')
    and exists (
      select 1 from public.library_entries e
      where e.id = entry_id and e.user_id = (select auth.jwt() ->> 'sub')
    )
  );

create policy "own reading log: update"
  on public.reading_log for update to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'))
  with check (user_id = (select auth.jwt() ->> 'sub'));

create policy "own reading log: delete"
  on public.reading_log for delete to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'));
