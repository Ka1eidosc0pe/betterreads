import { coverUrl } from "@/lib/openlibrary";

const PALETTE = ["#ff6f59", "#22b3a3", "#8a63d2", "#ffc53d", "#6cc070", "#5db7f0"];

function hash(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/** A cover from Open Library, or a hand-drawn stand-in when there isn't one. */
export function BookCover({
  coverId,
  title,
  size = "M",
  className = "",
}: {
  coverId: number | null;
  title: string;
  size?: "S" | "M" | "L";
  className?: string;
}) {
  const src = coverUrl(coverId, size);
  return (
    <div
      className={`relative aspect-[2/3] overflow-hidden rounded-[0.9rem] border-[2.5px] border-[#3a2748] bg-card-2 shadow-[4px_5px_0_rgb(58_39_72/0.35)] ${className}`}
    >
      {src ? (
        // Open Library redirects covers to archive.org; a plain <img> keeps that simple.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`Cover of ${title}`}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      ) : (
        <div
          className="flex size-full flex-col justify-between p-3 text-[#3a2748]"
          style={{ background: PALETTE[hash(title) % PALETTE.length] }}
          role="img"
          aria-label={`Placeholder cover for ${title}`}
        >
          <div className="h-2 w-8 rounded-full bg-white/60" />
          <p className="font-display text-base font-bold leading-tight">{title}</p>
          <div className="h-1.5 w-12 rounded-full bg-white/50" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/25 to-transparent" />
    </div>
  );
}
