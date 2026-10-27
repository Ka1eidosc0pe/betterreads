"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createSupabaseClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

const workKey = z.string().regex(/^OL[0-9]{1,12}W$/);
const status = z.enum(["bookmarked", "reading", "finished"]);
const uuid = z.string().uuid();

const saveBookInput = z.object({
  workKey,
  title: z.string().trim().min(1).max(500),
  authors: z.array(z.string().max(200)).max(8),
  coverId: z.number().int().positive().nullable(),
  firstPublishYear: z.number().int().min(0).max(3000).nullable(),
  pageCount: z.number().int().positive().max(100000).nullable(),
  status,
});

const logInput = z.object({
  entryId: uuid,
  pages: z.number().int().min(1).max(5000),
  note: z.string().trim().max(1000).optional(),
});

const finishInput = z.object({
  entryId: uuid,
  rating: z.number().int().min(1).max(5).nullable(),
  review: z.string().trim().max(5000).optional(),
});

function fail(error: unknown): ActionResult {
  console.error(error);
  return { ok: false, error: "Something went wrong. Please try again." };
}

/** Actions are reachable by direct POST, so every one re-checks the session. */
async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
}

function refresh(work?: string) {
  revalidatePath("/library");
  if (work) revalidatePath(`/book/${work}`);
}

/** Bookmark / start / finish a book that may not be on a shelf yet. */
export async function saveBook(input: z.input<typeof saveBookInput>): Promise<ActionResult> {
  try {
    await requireUser();
    const book = saveBookInput.safeParse(input);
    if (!book.success) return { ok: false, error: "That book looks off. Try again?" };
    const b = book.data;
    const now = new Date().toISOString();
    const sb = await createSupabaseClient();

    const { data: existing, error: findError } = await sb
      .from("library_entries")
      .select("id, started_at, page_count")
      .eq("work_key", b.workKey)
      .maybeSingle();
    if (findError) return fail(findError);

    const patch = {
      status: b.status,
      started_at: b.status === "bookmarked" ? null : (existing?.started_at ?? now),
      finished_at: b.status === "finished" ? now : null,
    };

    if (existing) {
      const { error } = await sb.from("library_entries").update(patch).eq("id", existing.id);
      if (error) return fail(error);
    } else {
      const { error } = await sb.from("library_entries").insert({
        work_key: b.workKey,
        title: b.title,
        authors: b.authors,
        cover_id: b.coverId,
        first_publish_year: b.firstPublishYear,
        page_count: b.pageCount,
        progress_page: b.status === "finished" ? (b.pageCount ?? 0) : 0,
        ...patch,
      });
      if (error) return fail(error);
    }
    refresh(b.workKey);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function changeStatus(
  entryId: string,
  next: z.input<typeof status>,
): Promise<ActionResult> {
  try {
    await requireUser();
    const id = uuid.safeParse(entryId);
    const st = status.safeParse(next);
    if (!id.success || !st.success) return { ok: false, error: "Invalid request." };

    const sb = await createSupabaseClient();
    const { data: entry, error: findError } = await sb
      .from("library_entries")
      .select("work_key, started_at, page_count")
      .eq("id", id.data)
      .maybeSingle();
    if (findError) return fail(findError);
    if (!entry) return { ok: false, error: "That book isn't on your shelves." };

    const now = new Date().toISOString();
    const { error } = await sb
      .from("library_entries")
      .update({
        status: st.data,
        started_at: st.data === "bookmarked" ? null : (entry.started_at ?? now),
        finished_at: st.data === "finished" ? now : null,
        // "Read again" starts the page counter over.
        ...(st.data === "reading" ? { progress_page: 0 } : {}),
        ...(st.data === "finished" && entry.page_count
          ? { progress_page: entry.page_count }
          : {}),
      })
      .eq("id", id.data);
    if (error) return fail(error);
    refresh(entry.work_key);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function logProgress(input: z.input<typeof logInput>): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = logInput.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Enter a number of pages (1–5000)." };
    const { entryId, pages, note } = parsed.data;

    const sb = await createSupabaseClient();
    const { data: entry, error: findError } = await sb
      .from("library_entries")
      .select("work_key, progress_page, page_count, started_at")
      .eq("id", entryId)
      .maybeSingle();
    if (findError) return fail(findError);
    if (!entry) return { ok: false, error: "That book isn't on your shelves." };

    const next = entry.page_count
      ? Math.min(entry.progress_page + pages, entry.page_count)
      : entry.progress_page + pages;
    const counted = next - entry.progress_page;
    if (counted < 1) return { ok: false, error: "You're already on the last page!" };

    const { error: logError } = await sb.from("reading_log").insert({
      entry_id: entryId,
      pages_read: counted,
      to_page: next,
      note: note || null,
    });
    if (logError) return fail(logError);

    const { error } = await sb
      .from("library_entries")
      .update({
        progress_page: next,
        status: "reading",
        started_at: entry.started_at ?? new Date().toISOString(),
        finished_at: null,
      })
      .eq("id", entryId);
    if (error) return fail(error);

    refresh(entry.work_key);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function setPageCount(entryId: string, pages: number): Promise<ActionResult> {
  try {
    await requireUser();
    const id = uuid.safeParse(entryId);
    const n = z.number().int().min(1).max(100000).safeParse(pages);
    if (!id.success || !n.success) return { ok: false, error: "Enter a valid page count." };
    const sb = await createSupabaseClient();
    const { data, error } = await sb
      .from("library_entries")
      .update({ page_count: n.data })
      .eq("id", id.data)
      .select("work_key")
      .maybeSingle();
    if (error) return fail(error);
    if (!data) return { ok: false, error: "That book isn't on your shelves." };
    refresh(data.work_key);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function finishBook(input: z.input<typeof finishInput>): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = finishInput.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Pick 1–5 stars and keep the review under 5000 characters." };
    const { entryId, rating, review } = parsed.data;

    const sb = await createSupabaseClient();
    const { data: entry, error: findError } = await sb
      .from("library_entries")
      .select("work_key, page_count, started_at")
      .eq("id", entryId)
      .maybeSingle();
    if (findError) return fail(findError);
    if (!entry) return { ok: false, error: "That book isn't on your shelves." };

    const now = new Date().toISOString();
    const { error } = await sb
      .from("library_entries")
      .update({
        status: "finished",
        rating,
        review: review || null,
        started_at: entry.started_at ?? now,
        finished_at: now,
        ...(entry.page_count ? { progress_page: entry.page_count } : {}),
      })
      .eq("id", entryId);
    if (error) return fail(error);
    refresh(entry.work_key);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function removeBook(entryId: string): Promise<ActionResult> {
  try {
    await requireUser();
    const id = uuid.safeParse(entryId);
    if (!id.success) return { ok: false, error: "Invalid request." };
    const sb = await createSupabaseClient();
    const { data, error } = await sb
      .from("library_entries")
      .delete()
      .eq("id", id.data)
      .select("work_key")
      .maybeSingle();
    if (error) return fail(error);
    refresh(data?.work_key);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
