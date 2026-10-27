import "server-only";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

/**
 * A Supabase client that acts *as the signed-in user*.
 *
 * Every request carries the user's Clerk session token, which Supabase
 * verifies (Clerk is registered as a third-party auth provider). Row-level
 * security then decides what that token may touch, so even a bug in this app
 * can't read another person's rows. With no session the request goes out
 * with only the publishable key, and the `anon` role has no table privileges.
 */
export async function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. See .env.example.",
    );
  }

  const { getToken } = await auth();
  return createClient(url, key, {
    accessToken: async () => (await getToken()) ?? null,
  });
}
