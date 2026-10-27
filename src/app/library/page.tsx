import Link from "next/link";
import type { Metadata } from "next";
import { Bookie } from "@/components/art/Bookie";
import { BookCover } from "@/components/BookCover";
import { BookTile } from "@/components/BookTile";
import { ShelfEmpty } from "@/components/states";
import {
  listEntries,
  listRecentLog,
  totalPagesRead,
  type LibraryEntry,
  type ReadingStatus,
} from "@/lib/library";

export const metadata: Metadata = { title: "My Library" };

const SHELVES: {
  id: ReadingStatus;
  label: string;
  emoji: string;
  emptyTitle: string;
  emptyBody: string;
}[] = [
  {
    id: "reading",
    label: "Reading",
    emoji: "📖",
    emptyTitle: "Nothing in progress",
    emptyBody: "Pick up a book from your To-Read shelf, or find a new one to dive into.",
  },
  {
    id: "bookmarked",
    label: "To-Read",
    emoji: "🔖",
    emptyTitle: "Your To-Read shelf is empty",
    emptyBody: "Bookmark anything that catches your eye and it'll wait for you here.",
  },
  {
    id: "finished",
    label: "Finished",
    emoji: "✓",
    emptyTitle: "No finished books yet",
    emptyBody: "When you close a book, it lands here with your stars and thoughts.",
  },
];

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export default async function LibraryPage({ searchParams }: PageProps<"/library">) {
  const params = await searchParams;
  const [entries, recent, pagesRead] = await Promise.all([
    listEntries(),
    listRecentLog(5),
    totalPagesRead(),
  ]);

  const byShelf = (id: ReadingStatus) => entries.filter((e) => e.status === id);
  const requested = typeof params.shelf === "string" ? params.shelf : undefined;
  const fallback: ReadingStatus = byShelf("reading").length > 0 ? "reading" : "bookmarked";
  const active =
    SHELVES.find((s) => s.id === requested)?.id ?? (entries.length ? fallback : "reading");
  const shelf = SHELVES.find((s) => s.id === active)!;
  const books = byShelf(active);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold sm:text-5xl">My Library</h1>
          <p className="mt-2 font-semibold text-ink-soft">Just yours. Nobody else can see these shelves.</p>
        </div>
        <Link href="/search" className="btn btn-primary">
          + Find a book
        </Link>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Reading now" value={byShelf("reading").length} color="var(--teal)" />
        <Stat label="To-Read" value={byShelf("bookmarked").length} color="var(--sun)" />
        <Stat label="Finished" value={byShelf("finished").length} color="var(--leaf)" />
        <Stat label="Pages read" value={pagesRead} color="var(--plum)" />
      </dl>

      <nav aria-label="Shelves" className="mt-10 flex flex-wrap gap-3">
        {SHELVES.map((s) => {
          const selected = s.id === active;
          return (
            <Link
              key={s.id}
              href={`/library?shelf=${s.id}`}
              aria-current={selected ? "page" : undefined}
              className={`btn ${selected ? "btn-primary" : ""}`}
            >
              <span aria-hidden>{s.emoji}</span> {s.label}
              <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">{byShelf(s.id).length}</span>
            </Link>
          );
        })}
      </nav>

      <section className="mt-10" aria-label={`${shelf.label} shelf`}>
        {books.length === 0 ? (
          <ShelfEmpty title={shelf.emptyTitle}>
            <p>{shelf.emptyBody}</p>
            <Link href="/search" className="btn btn-primary mt-5">
              Discover books
            </Link>
          </ShelfEmpty>
        ) : (
          <ul className="grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {books.map((e) => (
              <BookTile
                key={e.id}
                workKey={e.work_key}
                title={e.title}
                authors={e.authors}
                coverId={e.cover_id}
                year={e.first_publish_year}
                progress={progressOf(e)}
                badge={e.status === "finished" && e.rating ? <RatingBadge rating={e.rating} /> : undefined}
              />
            ))}
          </ul>
        )}
      </section>

      {recent.length > 0 && (
        <section className="mt-16" aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="text-3xl font-bold">
            Lately in your journal
          </h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-2">
            {recent.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/book/${row.library_entries?.work_key ?? ""}`}
                  className="card-flat flex items-center gap-4 p-4 no-underline transition-transform hover:-translate-y-0.5"
                >
                  <BookCover
                    coverId={row.library_entries?.cover_id ?? null}
                    title={row.library_entries?.title ?? "Book"}
                    size="S"
                    className="w-12 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-bold">{row.library_entries?.title}</p>
                    <p className="font-semibold text-ink-soft">
                      +{row.pages_read} pages · {dateFmt.format(new Date(row.logged_at))}
                    </p>
                    {row.note && <p className="truncate text-sm font-semibold text-ink-soft">“{row.note}”</p>}
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {entries.length === 0 && (
        <div className="mt-10 flex justify-center">
          <Bookie mood="cheer" size={120} className="float" />
        </div>
      )}
    </div>
  );
}

function progressOf(e: LibraryEntry) {
  if (e.status !== "reading" || !e.page_count) return undefined;
  return Math.min(100, (e.progress_page / e.page_count) * 100);
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card-flat flex items-center gap-4 p-4">
      <div className="size-3 shrink-0 self-stretch rounded-full" style={{ background: color }} />
      <div>
        <dd className="font-display text-3xl font-bold leading-none">{value.toLocaleString()}</dd>
        <dt className="mt-1 text-sm font-bold text-ink-soft">{label}</dt>
      </div>
    </div>
  );
}

function RatingBadge({ rating }: { rating: number }) {
  return (
    <span
      className="grid size-9 place-items-center rounded-full border-[2.5px] border-[#3a2748] bg-sun font-display text-sm font-bold text-[#4a2f00]"
      aria-label={`Rated ${rating} out of 5`}
    >
      {rating}★
    </span>
  );
}
