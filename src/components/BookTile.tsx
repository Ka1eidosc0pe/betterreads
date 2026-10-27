import Link from "next/link";
import { BookCover } from "./BookCover";

export function BookTile({
  workKey,
  title,
  authors,
  coverId,
  year,
  progress,
  badge,
}: {
  workKey: string;
  title: string;
  authors: string[];
  coverId: number | null;
  year?: number | null;
  /** 0–100, shown as a little bar for books you're reading */
  progress?: number;
  badge?: React.ReactNode;
}) {
  return (
    <li className="plank group pb-1">
      <Link
        href={`/book/${workKey}`}
        className="block no-underline outline-offset-8"
        aria-label={`${title}${authors[0] ? ` by ${authors[0]}` : ""}`}
      >
        <div className="relative transition-transform duration-200 group-hover:-translate-y-2 group-hover:-rotate-1">
          <BookCover coverId={coverId} title={title} />
          {badge && <div className="absolute -right-2 -top-2">{badge}</div>}
        </div>
        <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug text-ink">{title}</h3>
        <p className="line-clamp-1 text-sm font-semibold text-ink-soft">
          {authors.length > 0 ? authors.join(", ") : "Unknown author"}
          {year ? ` · ${year}` : ""}
        </p>
        {progress !== undefined && (
          <div
            className="mt-2 h-2.5 overflow-hidden rounded-full border-2 border-edge bg-card-2"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Reading progress"
          >
            <div className="h-full rounded-full bg-teal" style={{ width: `${progress}%` }} />
          </div>
        )}
      </Link>
    </li>
  );
}
