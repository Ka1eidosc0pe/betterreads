import { Suspense } from "react";
import type { Metadata } from "next";
import { Bookie } from "@/components/art/Bookie";
import { BookTile } from "@/components/BookTile";
import { ApiDown, NothingFound, ResultsSkeleton } from "@/components/states";
import { OpenLibraryError, searchBooks } from "@/lib/openlibrary";

export const metadata: Metadata = { title: "Discover" };

const IDEAS = [
  "cozy mystery",
  "space opera",
  "korean literature",
  "poetry",
  "graphic novel",
  "cookbook",
  "fantasy",
  "science",
];

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const q = (typeof params.q === "string" ? params.q : "").trim().slice(0, 200);
  // `?preview=down|empty` lets reviewers see the designed error/empty states on demand.
  const preview = typeof params.preview === "string" ? params.preview : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6">
      <h1 className="text-4xl font-bold sm:text-5xl">Discover</h1>
      <p className="mt-2 font-semibold text-ink-soft">
        Search millions of books by title, author or subject.
      </p>

      <form action="/search" className="mt-6 flex flex-col gap-3 sm:flex-row" role="search">
        <label htmlFor="q" className="sr-only">
          Search for a book
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="The Left Hand of Darkness, Han Kang, …"
          className="field flex-1"
          maxLength={200}
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      <div className="mt-10">
        {q === "" ? (
          <Browse />
        ) : (
          <Suspense key={`${q}|${preview ?? ""}`} fallback={<ResultsSkeleton />}>
            <Results q={q} preview={preview} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

function Browse() {
  return (
    <section className="card flex flex-col items-center gap-4 px-6 py-10 text-center">
      <Bookie mood="curious" size={130} className="float" />
      <h2 className="text-2xl font-bold">What shall we read next?</h2>
      <p className="max-w-md font-semibold text-ink-soft">
        Type a title above, or peek at one of these corners of the library.
      </p>
      <ul className="flex flex-wrap justify-center gap-2.5">
        {IDEAS.map((idea) => (
          <li key={idea}>
            <a href={`/search?q=${encodeURIComponent(idea)}`} className="btn btn-sm">
              {idea}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function Results({ q, preview }: { q: string; preview?: string }) {
  const retry = `/search?q=${encodeURIComponent(q)}`;
  if (preview === "down") return <ApiDown retryHref={retry} />;
  if (preview === "empty") return <NothingFound query={q} />;

  let result;
  try {
    result = await searchBooks(q);
  } catch (error) {
    if (error instanceof OpenLibraryError) return <ApiDown retryHref={retry} />;
    throw error;
  }

  if (result.books.length === 0) return <NothingFound query={q} />;

  return (
    <section aria-label={`Results for ${q}`}>
      <p className="mb-8 font-bold text-ink-soft">
        {result.total.toLocaleString()} {result.total === 1 ? "book" : "books"} for{" "}
        <span className="text-ink">“{q}”</span>
        {result.total > result.books.length && ` — showing the first ${result.books.length}`}
      </p>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {result.books.map((b) => (
          <BookTile
            key={b.workKey}
            workKey={b.workKey}
            title={b.title}
            authors={b.authors}
            coverId={b.coverId}
            year={b.firstPublishYear}
          />
        ))}
      </ul>
    </section>
  );
}
