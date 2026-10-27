import { expect, test } from "@playwright/test";
import { rest, signInAs, supabaseToken, USER_A, USER_B } from "./helpers";

// Harry Potter and the Philosopher's Stone — a stable Open Library work.
const WORK = "OL82563W";
const SECRET_NOTE = "e2e-secret-note-for-reader-a-only";

test.skip(!USER_A || !USER_B, "Set E2E_USER_A_EMAIL / E2E_USER_B_EMAIL in .env.local");

test.describe("privacy: people only ever see their own data", () => {
  test("a signed-out visitor is sent to sign in and sees no one's data", async ({ page, request }) => {
    for (const path of ["/library", `/book/${WORK}`, "/search"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/sign-in/);
    }

    // And the database itself refuses the anonymous role.
    const anon = await rest(request, "library_entries?select=*");
    expect(anon.status === 401 || anon.status === 403 || (Array.isArray(anon.body) && anon.body.length === 0)).toBe(true);
    expect(JSON.stringify(anon.body)).not.toContain(SECRET_NOTE);
  });

  test("reader B cannot see reader A's shelves, journal, or rows", async ({ browser, request }) => {
    // ---- Reader A saves a book and writes a private journal entry. ----
    const ctxA = await browser.newContext();
    const a = await ctxA.newPage();
    await signInAs(a, USER_A!);
    const tokenA = await supabaseToken(a);

    // Start from a clean slate so the test is repeatable.
    await rest(request, `library_entries?work_key=eq.${WORK}`, tokenA, { method: "DELETE" });

    await a.goto(`/book/${WORK}`);
    await a.getByRole("button", { name: /start reading/i }).click();
    await expect(a.getByText("Currently reading")).toBeVisible();
    await a.getByLabel("Pages read").fill("25");
    await a.getByLabel(/thoughts/i).fill(SECRET_NOTE);
    await a.getByRole("button", { name: "Log reading" }).click();
    await expect(a.getByText(SECRET_NOTE)).toBeVisible();

    await a.goto("/library");
    await expect(a.getByRole("heading", { name: "My Library" })).toBeVisible();
    await expect(a.getByText("Pages read")).toBeVisible();
    const aRows = await rest(request, "library_entries?select=work_key,user_id", tokenA);
    expect(aRows.body).toEqual([expect.objectContaining({ work_key: WORK })]);

    // ---- Reader B, in a completely separate browser, sees none of it. ----
    const ctxB = await browser.newContext();
    const b = await ctxB.newPage();
    await signInAs(b, USER_B!);
    const tokenB = await supabaseToken(b);

    // Through the app...
    await b.goto("/library?shelf=reading");
    await expect(b.getByText(SECRET_NOTE)).toHaveCount(0);
    await expect(b.getByText("Nothing in progress")).toBeVisible();

    await b.goto(`/book/${WORK}`);
    await expect(b.getByText("This book isn't on your shelves yet.")).toBeVisible();
    await expect(b.getByText(SECRET_NOTE)).toHaveCount(0);

    // ...and straight at the database with B's own valid token.
    for (const table of ["library_entries", "reading_log"]) {
      const res = await rest(request, `${table}?select=*`, tokenB);
      expect(res.status, `${table} status`).toBe(200);
      expect(res.body, `${table} rows visible to B`).toEqual([]);
    }
    // Asking for A's row by key still returns nothing.
    const targeted = await rest(request, `library_entries?work_key=eq.${WORK}&select=*`, tokenB);
    expect(targeted.body).toEqual([]);

    // B can't delete A's row either — the delete simply matches nothing.
    await rest(request, `library_entries?work_key=eq.${WORK}`, tokenB, { method: "DELETE" });
    const stillThere = await rest(request, `library_entries?work_key=eq.${WORK}&select=work_key`, tokenA);
    expect(stillThere.body).toEqual([{ work_key: WORK }]);

    // ---- Persistence: A signs out and back in on a "different device". ----
    const ctxA2 = await browser.newContext();
    const a2 = await ctxA2.newPage();
    await signInAs(a2, USER_A!);
    await a2.goto(`/book/${WORK}`);
    await expect(a2.getByText("Currently reading")).toBeVisible();
    await expect(a2.getByText(SECRET_NOTE)).toBeVisible();

    // Clean up.
    await rest(request, `library_entries?work_key=eq.${WORK}`, tokenA, { method: "DELETE" });
    await Promise.all([ctxA.close(), ctxB.close(), ctxA2.close()]);
  });
});
