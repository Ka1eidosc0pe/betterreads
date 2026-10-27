import { clerk } from "@clerk/testing/playwright";
import type { APIRequestContext, Page } from "@playwright/test";

export const USER_A = process.env.E2E_USER_A_EMAIL;
export const USER_B = process.env.E2E_USER_B_EMAIL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Signs in through Clerk (backend sign-in token, no password / email code). */
export async function signInAs(page: Page, emailAddress: string) {
  await page.goto("/");
  await clerk.signIn({ page, emailAddress });
}

/** The same JWT the app sends to Supabase on this user's behalf. */
export async function supabaseToken(page: Page): Promise<string> {
  await page.goto("/library");
  await page.waitForFunction(() => Boolean(window.Clerk?.session));
  const token = await page.evaluate(() => window.Clerk?.session?.getToken());
  if (!token) throw new Error("No Clerk session token — is the user signed in?");
  return token;
}

/** Calls Supabase's REST API directly (bypassing the app) with an optional user token. */
export async function rest(
  request: APIRequestContext,
  path: string,
  token?: string,
  init: { method?: "GET" | "DELETE"; } = {},
) {
  const res = await request.fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: init.method ?? "GET",
    headers: {
      apikey: SUPABASE_KEY!,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* leave as text */
  }
  return { status: res.status(), body };
}
