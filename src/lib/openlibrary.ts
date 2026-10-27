import "server-only";

const BASE = "https://openlibrary.org";
const COVERS = "https://covers.openlibrary.org";
const WORK_KEY = /^OL[0-9]{1,12}W$/;

export type BookSummary = {
  workKey: string;
  title: string;
  authors: string[];
  coverId: number | null;
  firstPublishYear: number | null;
  pageCount: number | null;
};

export type BookDetails = BookSummary & {
  description: string | null;
  subjects: string[];
};

/** Why a call failed, so the UI can say something useful. */
export class OpenLibraryError extends Error {
  constructor(
    message: string,
    public readonly kind: "unavailable" | "timeout" | "bad-response" | "not-found",
  ) {
    super(message);
    this.name = "OpenLibraryError";
  }
}

export function isWorkKey(value: string): boolean {
  return WORK_KEY.test(value);
}

export function coverUrl(coverId: number | null, size: "S" | "M" | "L" = "M") {
  return coverId ? `${COVERS}/b/id/${coverId}-${size}.jpg` : null;
}

async function olFetch<T>(path: string, revalidateSeconds: number): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "BetterReads/1.0 (student project)",
      },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: revalidateSeconds },
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    throw new OpenLibraryError(
      timedOut ? "Open Library took too long to answer" : "Open Library is unreachable",
      timedOut ? "timeout" : "unavailable",
    );
  }

  if (res.status === 404) throw new OpenLibraryError("Not found", "not-found");
  if (!res.ok) {
    throw new OpenLibraryError(`Open Library returned ${res.status}`, "unavailable");
  }
  try {
    return (await res.json()) as T;
  } catch {
    throw new OpenLibraryError("Open Library sent something unreadable", "bad-response");
  }
}

type SearchDoc = {
  key: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  number_of_pages_median?: number;
};

const SEARCH_FIELDS =
  "key,title,author_name,cover_i,first_publish_year,number_of_pages_median";

function toSummary(doc: SearchDoc): BookSummary | null {
  const workKey = doc.key?.replace("/works/", "");
  if (!workKey || !isWorkKey(workKey) || !doc.title) return null;
  return {
    workKey,
    title: doc.title,
    authors: doc.author_name?.slice(0, 4) ?? [],
    coverId: doc.cover_i ?? null,
    firstPublishYear: doc.first_publish_year ?? null,
    pageCount: doc.number_of_pages_median ?? null,
  };
}

export async function searchBooks(
  query: string,
  limit = 24,
): Promise<{ total: number; books: BookSummary[] }> {
  const params = new URLSearchParams({
    q: query.slice(0, 200),
    limit: String(limit),
    fields: SEARCH_FIELDS,
  });
  const data = await olFetch<{ numFound: number; docs: SearchDoc[] }>(
    `/search.json?${params}`,
    3600,
  );
  const books = data.docs.map(toSummary).filter((b): b is BookSummary => b !== null);
  return { total: data.numFound, books };
}

/** Open Library descriptions are markdown-ish and often end in link dumps. */
function cleanDescription(raw: unknown): string | null {
  const text =
    typeof raw === "string"
      ? raw
      : raw && typeof raw === "object" && "value" in raw
        ? String((raw as { value: unknown }).value)
        : "";
  const cleaned = text
    .split(/\r?\n-{5,}/)[0]
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s*\[\d+\]:.*$/gm, "")
    .replace(/\*\*|__/g, "")
    .trim();
  return cleaned.length > 0 ? cleaned : null;
}

export async function getBook(workKey: string): Promise<BookDetails> {
  if (!isWorkKey(workKey)) throw new OpenLibraryError("Not found", "not-found");

  const params = new URLSearchParams({
    q: `key:/works/${workKey}`,
    limit: "1",
    fields: SEARCH_FIELDS,
  });
  const [work, search] = await Promise.all([
    olFetch<{
      title?: string;
      description?: unknown;
      subjects?: string[];
      covers?: number[];
      first_publish_date?: string;
    }>(`/works/${workKey}.json`, 86400),
    olFetch<{ docs: SearchDoc[] }>(`/search.json?${params}`, 86400).catch(
      () => ({ docs: [] as SearchDoc[] }),
    ),
  ]);

  const doc = search.docs[0];
  const summary = doc ? toSummary(doc) : null;
  const year = work.first_publish_date?.match(/\d{4}/)?.[0];

  return {
    workKey,
    title: summary?.title ?? work.title ?? "Untitled",
    authors: summary?.authors ?? [],
    coverId: summary?.coverId ?? work.covers?.find((c) => c > 0) ?? null,
    firstPublishYear: summary?.firstPublishYear ?? (year ? Number(year) : null),
    pageCount: summary?.pageCount ?? null,
    description: cleanDescription(work.description),
    subjects: (work.subjects ?? []).slice(0, 8),
  };
}
