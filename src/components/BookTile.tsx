import Link from "next/link";
import { BookCover } from "./BookCover";

/**
 * One book standing on a shelf. Every part has a fixed-height slot (two title
 * lines, one author line, an optional progress line) so a long title never
 * changes the card's size, and every card in a row lines up with its plank.
 */
export function BookTile({
  workKey,
  title,
  authors,
  coverId,
  year,
  progress,
  progressLabel,
  reserveProgress = false,
  badge,
}: {
  workKey: string;
  title: string;
  authors: string[];
  coverId: number | null;
  year?: number | null;
  /** 0–100, shown as a little bar for books you're reading */
  progress?: number;
  /** Shown instead of the bar when the book's page count isn't known */
  progressLabel?: string;
  /** Keep the progress line's space even when this card has none, so a shelf stays even */
  reserveProgress?: boolean;
  badge?: React.ReactNode;
}) {
  const author = authors.length > 0 ? authors.join(", ") : "Unknown author";
  const showProgressRow = reserveProgress || progress !== undefined || progressLabel !== undefined;

  return (
    <li className="plank group flex flex-col pb-1">
      <Link
        href={`/book/${workKey}`}
        className="flex flex-1 flex-col no-underline outline-offset-8"
        aria-label={`${title}${authors[0] ? ` by ${authors[0]}` : ""}`}
      >
        <div className="relative transition-transform duration-200 group-hover:-translate-y-2 group-hover:-rotate-1">
          <BookCover coverId={coverId} title={title} />
          {badge && <div className="absolute -right-2 -top-2">{badge}</div>}
        </div>
        <h3 className="mt-3 line-clamp-2 h-11 text-base font-bold leading-snug text-ink" title={title}>
          {title}
        </h3>
        <p className="h-5 truncate text-sm font-semibold leading-5 text-ink-soft" title={author}>
          {author}
          {year ? ` · ${year}` : ""}
        </p>
        {showProgressRow && (
          <div className="mt-2 flex h-5 items-center">
            {progress !== undefined ? (
              <div
                className="h-2.5 w-full overflow-hidden rounded-full border-2 border-edge bg-card-2"
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Reading progress"
              >
                <div className="h-full rounded-full bg-teal" style={{ width: `${progress}%` }} />
              </div>
            ) : progressLabel ? (
              <span className="text-xs font-bold text-ink-soft">{progressLabel}</span>
            ) : null}
          </div>
        )}
      </Link>
    </li>
  );
}
