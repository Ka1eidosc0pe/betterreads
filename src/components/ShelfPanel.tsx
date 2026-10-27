"use client";

import { useState, useTransition } from "react";
import {
  changeStatus,
  finishBook,
  logProgress,
  removeBook,
  saveBook,
  setPageCount,
  type ActionResult,
} from "@/app/actions";
import type { LibraryEntry } from "@/lib/library";
import { StarsDisplay, StarsInput } from "./Stars";

type BookInfo = {
  workKey: string;
  title: string;
  authors: string[];
  coverId: number | null;
  firstPublishYear: number | null;
  pageCount: number | null;
};

/** Everything you can do with a book once you're signed in. */
export function ShelfPanel({ book, entry }: { book: BookInfo; entry: LibraryEntry | null }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"idle" | "finish" | "confirm-remove">("idle");

  function run(action: () => Promise<ActionResult>, after?: () => void) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setView("idle");
        after?.();
      } else {
        setError(result.error);
      }
    });
  }

  const save = (status: LibraryEntry["status"]) =>
    run(() =>
      saveBook({
        workKey: book.workKey,
        title: book.title,
        authors: book.authors,
        coverId: book.coverId,
        firstPublishYear: book.firstPublishYear,
        pageCount: book.pageCount,
        status,
      }),
    );

  return (
    <section className="card p-6" aria-labelledby="shelf-heading">
      <h2 id="shelf-heading" className="text-2xl font-bold">
        Your shelf
      </h2>

      {!entry && (
        <div className="mt-4">
          <p className="font-semibold text-ink-soft">This book isn&apos;t on your shelves yet.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="btn btn-sun" disabled={pending} onClick={() => save("bookmarked")}>
              🔖 Bookmark for later
            </button>
            <button className="btn btn-teal" disabled={pending} onClick={() => save("reading")}>
              📖 Start reading
            </button>
            <button className="btn btn-plum" disabled={pending} onClick={() => save("finished")}>
              ✓ I&apos;ve read it
            </button>
          </div>
        </div>
      )}

      {entry?.status === "bookmarked" && (
        <div className="mt-4">
          <p className="chip !bg-sun !text-[#4a2f00]">🔖 On your To-Read shelf</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="btn btn-teal"
              disabled={pending}
              onClick={() => run(() => changeStatus(entry.id, "reading"))}
            >
              📖 Start reading
            </button>
          </div>
        </div>
      )}

      {entry?.status === "reading" && (
        <ReadingControls
          entry={entry}
          pending={pending}
          view={view}
          setView={setView}
          run={run}
        />
      )}

      {entry?.status === "finished" && (
        <div className="mt-4">
          <p className="chip !bg-leaf !text-[#143d19]">✓ Finished</p>
          {view === "finish" ? (
            <FinishForm entry={entry} pending={pending} run={run} onCancel={() => setView("idle")} />
          ) : (
            <>
              <div className="mt-4 flex items-center gap-3">
                <StarsDisplay value={entry.rating} />
              </div>
              {entry.review && (
                <blockquote className="mt-3 whitespace-pre-line rounded-2xl border-2 border-edge bg-card-2 p-4 font-semibold">
                  {entry.review}
                </blockquote>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="btn btn-sm" onClick={() => setView("finish")}>
                  Edit rating &amp; review
                </button>
                <button
                  className="btn btn-sm btn-teal"
                  disabled={pending}
                  onClick={() => run(() => changeStatus(entry.id, "reading"))}
                >
                  Read it again
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {entry && (
        <div className="mt-6 border-t-2 border-dashed border-edge pt-4">
          {view === "confirm-remove" ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold">Remove this book and its journal?</span>
              <button
                className="btn btn-sm btn-primary"
                disabled={pending}
                onClick={() => run(() => removeBook(entry.id))}
              >
                Yes, remove it
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => setView("idle")}>
                Keep it
              </button>
            </div>
          ) : (
            <button className="btn btn-sm btn-ghost" onClick={() => setView("confirm-remove")}>
              Remove from my shelves
            </button>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-2xl border-2 border-primary-edge bg-primary/15 px-4 py-3 font-bold">
          {error}
        </p>
      )}
    </section>
  );
}

function ReadingControls({
  entry,
  pending,
  view,
  setView,
  run,
}: {
  entry: LibraryEntry;
  pending: boolean;
  view: "idle" | "finish" | "confirm-remove";
  setView: (v: "idle" | "finish" | "confirm-remove") => void;
  run: (action: () => Promise<ActionResult>, after?: () => void) => void;
}) {
  const [pages, setPages] = useState("");
  const [note, setNote] = useState("");
  const [total, setTotal] = useState("");
  const pct = entry.page_count
    ? Math.min(100, Math.round((entry.progress_page / entry.page_count) * 100))
    : 0;

  return (
    <div className="mt-4">
      <p className="chip !bg-teal !text-[#052d29]">📖 Currently reading</p>

      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-sm font-bold">
          <span>
            Page {entry.progress_page}
            {entry.page_count ? ` of ${entry.page_count}` : ""}
          </span>
          {entry.page_count ? <span>{pct}%</span> : null}
        </div>
        <div
          className="h-4 overflow-hidden rounded-full border-2 border-edge-strong bg-card-2"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Reading progress"
        >
          <div className="h-full rounded-full bg-teal transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {!entry.page_count && (
        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => setPageCount(entry.id, Number(total)), () => setTotal(""));
          }}
        >
          <label className="flex-1 text-sm font-bold">
            How many pages is it? (optional)
            <input
              className="field mt-1"
              type="number"
              inputMode="numeric"
              min={1}
              max={100000}
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="e.g. 320"
            />
          </label>
          <button className="btn btn-sm" disabled={pending || !total}>
            Save
          </button>
        </form>
      )}

      {view === "finish" ? (
        <FinishForm entry={entry} pending={pending} run={run} onCancel={() => setView("idle")} />
      ) : (
        <>
          <form
            className="mt-5 grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              run(
                () => logProgress({ entryId: entry.id, pages: Number(pages), note: note || undefined }),
                () => {
                  setPages("");
                  setNote("");
                },
              );
            }}
          >
            <div className="grid gap-3 sm:grid-cols-[9rem_1fr]">
              <label className="text-sm font-bold">
                Pages read
                <input
                  className="field mt-1"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={5000}
                  required
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  placeholder="25"
                />
              </label>
              <label className="text-sm font-bold">
                Thoughts (optional)
                <input
                  className="field mt-1"
                  type="text"
                  maxLength={1000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="That ending!"
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-teal" disabled={pending || !pages}>
                Log reading
              </button>
              <button type="button" className="btn btn-plum" onClick={() => setView("finish")}>
                🎉 I finished it!
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={pending}
                onClick={() => run(() => changeStatus(entry.id, "bookmarked"))}
              >
                Back to To-Read
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

function FinishForm({
  entry,
  pending,
  run,
  onCancel,
}: {
  entry: LibraryEntry;
  pending: boolean;
  run: (action: () => Promise<ActionResult>, after?: () => void) => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState<number | null>(entry.rating);
  const [review, setReview] = useState(entry.review ?? "");

  return (
    <form
      className="mt-5 grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => finishBook({ entryId: entry.id, rating, review: review || undefined }));
      }}
    >
      <div>
        <p className="mb-1 text-sm font-bold">How was it?</p>
        <StarsInput value={rating} onChange={setRating} />
      </div>
      <label className="text-sm font-bold">
        A few words for future you (optional)
        <textarea
          className="field mt-1 min-h-28 resize-y"
          maxLength={5000}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="What stayed with you?"
        />
      </label>
      <div className="flex gap-3">
        <button className="btn btn-plum" disabled={pending}>
          Close the book
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
