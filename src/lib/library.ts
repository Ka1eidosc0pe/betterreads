import "server-only";
import { createSupabaseClient } from "@/lib/supabase/server";

export type ReadingStatus = "bookmarked" | "reading" | "finished";

export type LibraryEntry = {
  id: string;
  work_key: string;
  title: string;
  authors: string[];
  cover_id: number | null;
  first_publish_year: number | null;
  page_count: number | null;
  status: ReadingStatus;
  progress_page: number;
  rating: number | null;
  review: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LogRow = {
  id: string;
  entry_id: string;
  pages_read: number;
  to_page: number | null;
  note: string | null;
  logged_at: string;
};

export type LogRowWithBook = LogRow & {
  library_entries: Pick<LibraryEntry, "title" | "work_key" | "cover_id"> | null;
};

// No `.eq("user_id", ...)` anywhere below on purpose: row-level security is the
// access rule. The database only ever returns the caller's own rows.

export async function listEntries(): Promise<LibraryEntry[]> {
  const sb = await createSupabaseClient();
  const { data, error } = await sb
    .from("library_entries")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`Could not load your library: ${error.message}`);
  return data as LibraryEntry[];
}

export async function getEntryByWork(workKey: string): Promise<LibraryEntry | null> {
  const sb = await createSupabaseClient();
  const { data, error } = await sb
    .from("library_entries")
    .select("*")
    .eq("work_key", workKey)
    .maybeSingle();
  if (error) throw new Error(`Could not load this book: ${error.message}`);
  return data as LibraryEntry | null;
}

export async function listLogForEntry(entryId: string, limit = 12): Promise<LogRow[]> {
  const sb = await createSupabaseClient();
  const { data, error } = await sb
    .from("reading_log")
    .select("id, entry_id, pages_read, to_page, note, logged_at")
    .eq("entry_id", entryId)
    .order("logged_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Could not load your journal: ${error.message}`);
  return data as LogRow[];
}

export async function listRecentLog(limit = 6): Promise<LogRowWithBook[]> {
  const sb = await createSupabaseClient();
  const { data, error } = await sb
    .from("reading_log")
    .select(
      "id, entry_id, pages_read, to_page, note, logged_at, library_entries(title, work_key, cover_id)",
    )
    .order("logged_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Could not load your journal: ${error.message}`);
  return data as unknown as LogRowWithBook[];
}

export async function totalPagesRead(): Promise<number> {
  const sb = await createSupabaseClient();
  const { data, error } = await sb.from("reading_log").select("pages_read");
  if (error) throw new Error(`Could not load your stats: ${error.message}`);
  return (data ?? []).reduce((sum, row) => sum + (row.pages_read as number), 0);
}
