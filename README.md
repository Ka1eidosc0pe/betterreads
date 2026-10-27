# BetterReads

Goodreads, but cozier. Search millions of books, bookmark what you want to read, log every reading
session, and rate what you finish, in a storybook-style library inspired by Seoul's COEX Starfield
Library, with light and dark modes.

**Stack:** Next.js 16 (App Router) · Tailwind CSS 4 · Clerk (auth) · Supabase (Postgres + RLS) ·
Open Library API · Playwright · Vercel

## How it fits together

```
Browser ──► Next.js (Vercel)
              │  proxy.ts: Clerk session required for everything except /, /sign-in, /sign-up
              │  Server Components + Server Actions (zod-validated, re-check the session)
              ├──► Open Library   search, blurbs, covers (timeouts + designed error states)
              └──► Supabase REST  carries the user's *Clerk session JWT*
                                  └─ Postgres row-level security: user_id = auth.jwt()->>'sub'
```

- **Accounts:** sign up / sign in / sign out with Clerk. Signed-out visitors only ever see the landing
  page; every other route redirects to `/sign-in`.
- **Data:** two tables, `library_entries` (one row per user + book, with status, progress, rating,
  review) and `reading_log` (journal of reading sessions). Both have RLS **enabled and forced**,
  policies scoped to the Clerk user id, and no privileges for the `anon` role.
  See [`supabase/migrations`](supabase/migrations).
- **No server-side user filtering on purpose:** the app never passes `user_id` to queries. Supabase
  verifies the Clerk token (Clerk is a Supabase *third-party auth* provider), so the database itself
  decides what each person may see. The only key shipped to the browser/server is Supabase's
  publishable key, which is useless without a valid token. There is no service-role key in this app.
- **External API:** [Open Library](https://openlibrary.org/developers/api). Loading (skeleton shelf),
  nothing found, and API down/timeout each have their own designed state. Add `?preview=down` or
  `?preview=empty` to a search URL to see those states on demand.
- **Persistence:** everything is stored in Supabase keyed by your Clerk user id, so it's there after
  you sign out and back in, on any device.

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

| Variable | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk dashboard → API keys (or `clerk env pull`) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project settings → API |
| `SUPABASE_DB_PASSWORD` | only for `supabase link` / `db push` from your machine |

Keys live only in `.env.local` (gitignored) and Vercel's environment settings. `.env*` files are also
denied to Claude Code in [`.claude/settings.json`](.claude/settings.json).

### One-time setup for a fresh Supabase + Clerk pair

1. Clerk: add a `role: "authenticated"` claim to session tokens
   (`clerk config patch --json '{"session":{"claims":{"role":"authenticated"}}}'`).
2. Supabase: Authentication → Third-Party Auth → add **Clerk** with your Clerk Frontend API URL
   (`https://<your-instance>.clerk.accounts.dev`).
3. `supabase link --project-ref <ref> && supabase db push` to create the tables and policies.

## Tests

```bash
npm run test:e2e
```

[`e2e/isolation.spec.ts`](e2e/isolation.spec.ts) proves two users can't see each other's data, through
the UI and through Supabase's REST API with a real token. [`docs/TESTING.md`](docs/TESTING.md) shows it
failing (with RLS deliberately off) before it passed.

## Design

Tokens live in [`src/app/globals.css`](src/app/globals.css): *Sunlit Hall* (light) and *Starfield Night*
(dark), chunky "pillow" cards and buttons, Fredoka + Nunito. The hero is a procedurally generated SVG
library hall ([`LibraryHall.tsx`](src/components/art/LibraryHall.tsx)); [`Bookie`](src/components/art/Bookie.tsx)
is the mascot who shows up in empty and error states. Motion respects `prefers-reduced-motion`.
