# Testing: can two users see each other's data?

`e2e/isolation.spec.ts` is the Playwright test for BetterReads' core promise: **a person only ever sees
their own data.**

What it does:

1. Signed-out visitors are redirected to `/sign-in` from every page, and the database refuses the `anon` role.
2. Reader A signs in, starts a book, and logs pages with a private note.
3. Reader B (a separate browser, a separate Clerk user) signs in and checks, through the UI **and** by
   calling Supabase's REST API directly with B's own valid token, that none of A's rows are visible,
   and that B can't delete them.
4. Reader A signs in again in a brand-new browser context ("another device") and finds everything still there.

Run it with `npm run test:e2e` (needs the keys and two Clerk test users in `.env.local`, see `.env.example`).

## Watching it fail first

A test that has never failed proves nothing. To see this one fail, row-level security was **deliberately
switched off** on both tables of the development Supabase project (with the owner's approval), the test was
run, and RLS was switched back on in the same shell command.

```
Running 2 tests using 1 worker

  ✓  1 [chromium] › e2e/isolation.spec.ts:11:7 › privacy: people only ever see their own data › a signed-out visitor is sent to sign in and sees no one's data (1.0s)
  ✘  2 [chromium] › e2e/isolation.spec.ts:23:7 › privacy: people only ever see their own data › reader B cannot see reader A's shelves, journal, or rows (14.8s)


  1) [chromium] › e2e/isolation.spec.ts:23:7 › privacy: people only ever see their own data › reader B cannot see reader A's shelves, journal, or rows 

    Error: expect(locator).toHaveCount(expected) failed

    Locator:  getByText('e2e-secret-note-for-reader-a-only')
    Expected: 0
    Received: 1
    Timeout:  5000ms

    Call log:
      - Expect "toHaveCount" getByText('e2e-secret-note-for-reader-a-only') with timeout 5000ms
      - waiting for getByText('e2e-secret-note-for-reader-a-only')
        14 × locator resolved to 1 element
           - unexpected value "1"


      53 |     // Through the app...
      54 |     await b.goto("/library?shelf=reading");
    > 55 |     await expect(b.getByText(SECRET_NOTE)).toHaveCount(0);
         |                                            ^
      56 |     await expect(b.getByText("Nothing in progress")).toBeVisible();
      57 |
      58 |     await b.goto(`/book/${WORK}`);
        at e2e/isolation.spec.ts:55:44
    test-results/isolation-privacy-people-o-19c66-A-s-shelves-journal-or-rows-chromium/trace.zip
    Usage:

        npx playwright show-trace test-results/isolation-privacy-people-o-19c66-A-s-shelves-journal-or-rows-chromium/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  1 failed
    [chromium] › e2e/isolation.spec.ts:23:7 › privacy: people only ever see their own data › reader B cannot see reader A's shelves, journal, or rows 
  1 passed (17.8s)
```

With RLS off, reader B's own library page rendered reader A's private note. With RLS restored, the same
test passes:

```
  ✓ a signed-out visitor is sent to sign in and sees no one's data
  ✓ reader B cannot see reader A's shelves, journal, or rows
  2 passed
```

This is also why the app code has no `.eq("user_id", …)` filters: row-level security is the access rule,
and this test is what proves it works.
