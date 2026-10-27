import Link from "next/link";
import { Bookie } from "./art/Bookie";

/** Shared shell for the "nothing to show" family of screens. */
function StateCard({
  mood,
  title,
  children,
  role,
}: {
  mood: "curious" | "oops" | "sleepy" | "happy";
  title: string;
  children: React.ReactNode;
  role?: "status" | "alert";
}) {
  return (
    <div
      role={role}
      className="card pop-in mx-auto flex max-w-xl flex-col items-center gap-2 px-6 py-10 text-center"
    >
      <Bookie mood={mood} size={140} className="float" />
      <h2 className="mt-2 text-2xl font-bold">{title}</h2>
      <div className="max-w-md font-semibold text-ink-soft">{children}</div>
    </div>
  );
}

/** Loading: a row of shimmering covers on a shelf. */
export function ResultsSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Searching the stacks…</span>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" aria-hidden>
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className="plank pb-1">
            <div className="skeleton aspect-[2/3] !rounded-[0.9rem]" style={{ animationDelay: `${i * 90}ms` }} />
            <div className="skeleton mt-3 h-4 w-5/6" />
            <div className="skeleton mt-2 h-3 w-1/2" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Nothing found: the search worked, there's just no match. */
export function NothingFound({ query }: { query: string }) {
  return (
    <StateCard mood="curious" title="Hmm, nothing on the shelves" role="status">
      <p>
        Bookie looked high and low for <strong className="text-ink">“{query}”</strong> and
        came up empty. Try a different spelling, an author&apos;s name, or fewer words.
      </p>
    </StateCard>
  );
}

/** The API is down, slow or sent garbage. Our fault is ruled out in the copy. */
export function ApiDown({ retryHref }: { retryHref: string }) {
  return (
    <StateCard mood="oops" title="The library lights are out" role="alert">
      <p>
        We can&apos;t reach Open Library right now, so there are no books to show.
        Your own shelves are safe. Give it a moment and try again.
      </p>
      <Link href={retryHref} className="btn btn-primary mt-5">
        Try again
      </Link>
    </StateCard>
  );
}

/** A shelf with nothing on it yet. */
export function ShelfEmpty({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <StateCard mood="sleepy" title={title}>
      {children}
    </StateCard>
  );
}
