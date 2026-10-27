import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCover } from "@/components/BookCover";
import { ShelfPanel } from "@/components/ShelfPanel";
import { ApiDown } from "@/components/states";
import { getEntryByWork, listLogForEntry, type LogRow } from "@/lib/library";
import { getBook, isWorkKey, OpenLibraryError, type BookDetails } from "@/lib/openlibrary";

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export async function generateMetadata({ params }: PageProps<"/book/[workKey]">) {
  await params;
  return { title: "Book" };
}

export default async function BookPage({ params }: PageProps<"/book/[workKey]">) {
  const { workKey } = await params;
  if (!isWorkKey(workKey)) notFound();

  // Your own shelf data and Open Library load side by side; either can fail alone.
  const [entry, bookResult] = await Promise.all([
    getEntryByWork(workKey),
    getBook(workKey).then(
      (book) => ({ book, error: null as OpenLibraryError | null }),
      (error: unknown) => {
        if (error instanceof OpenLibraryError) return { book: null, error };
        throw error;
      },
    ),
  ]);

  if (bookResult.error?.kind === "not-found") notFound();

  // If Open Library is down but you've saved the book, fall back to what we stored.
  const book: (BookDetails & { description: string | null }) | null =
    bookResult.book ??
    (entry
      ? {
          workKey,
          title: entry.title,
          authors: entry.authors,
          coverId: entry.cover_id,
          firstPublishYear: entry.first_publish_year,
          pageCount: entry.page_count,
          description: null,
          subjects: [],
        }
      : null);

  if (!book) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ApiDown retryHref={`/book/${workKey}`} />
      </div>
    );
  }

  const log = entry ? await listLogForEntry(entry.id) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6">
      <Link href="/search" className="btn btn-ghost btn-sm -ml-3 mb-4">
        ← Back to discover
      </Link>

      <div className="grid gap-10 md:grid-cols-[15rem_1fr]">
        <div className="md:sticky md:top-28 md:self-start">
          <div className="plank mx-auto max-w-[15rem] pb-1">
            <BookCover coverId={book.coverId} title={book.title} size="L" />
          </div>
        </div>

        <div className="grid gap-6">
          <header>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">{book.title}</h1>
            <p className="mt-2 text-xl font-bold text-ink-soft">
              {book.authors.length > 0 ? `by ${book.authors.join(", ")}` : "Author unknown"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {book.firstPublishYear && <span className="chip">First published {book.firstPublishYear}</span>}
              {(entry?.page_count ?? book.pageCount) && (
                <span className="chip">{entry?.page_count ?? book.pageCount} pages</span>
              )}
            </div>
          </header>

          <ShelfPanel
            book={{
              workKey,
              title: book.title,
              authors: book.authors,
              coverId: book.coverId,
              firstPublishYear: book.firstPublishYear,
              pageCount: book.pageCount,
            }}
            entry={entry}
          />

          {entry && <Journal log={log} />}

          <section className="card p-6" aria-labelledby="blurb-heading">
            <h2 id="blurb-heading" className="text-2xl font-bold">
              The blurb
            </h2>
            {bookResult.error ? (
              <p className="mt-3 font-semibold text-ink-soft">
                Open Library isn&apos;t answering right now, so the blurb is hiding. Everything
                you&apos;ve saved is still here.
              </p>
            ) : book.description ? (
              <p className="mt-3 whitespace-pre-line text-lg font-semibold leading-relaxed">
                {book.description}
              </p>
            ) : (
              <p className="mt-3 font-semibold text-ink-soft">
                No blurb on file for this one. Judge it by its cover!
              </p>
            )}
            {book.subjects.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Subjects">
                {book.subjects.map((s) => (
                  <li key={s}>
                    <Link
                      href={`/search?q=${encodeURIComponent(s)}`}
                      className="chip no-underline hover:bg-sun hover:text-[#4a2f00]"
                    >
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Journal({ log }: { log: LogRow[] }) {
  return (
    <section className="card p-6" aria-labelledby="journal-heading">
      <h2 id="journal-heading" className="text-2xl font-bold">
        Reading journal
      </h2>
      {log.length === 0 ? (
        <p className="mt-3 font-semibold text-ink-soft">
          Nothing logged yet. Log a few pages and they&apos;ll show up here.
        </p>
      ) : (
        <ol className="mt-4 grid gap-3">
          {log.map((row) => (
            <li key={row.id} className="card-flat flex gap-4 p-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl border-2 border-teal-edge bg-teal font-display text-lg font-bold text-[#052d29]">
                +{row.pages_read}
              </div>
              <div className="min-w-0">
                <p className="font-bold">
                  {row.to_page ? `Up to page ${row.to_page}` : "Read some pages"}
                  <span className="ml-2 text-sm font-semibold text-ink-soft">
                    {dateFmt.format(new Date(row.logged_at))}
                  </span>
                </p>
                {row.note && <p className="mt-1 break-words font-semibold text-ink-soft">{row.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
