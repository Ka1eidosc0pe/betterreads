"use client";

function Star({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path
        d="m12 2.8 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.6 6.1 20.8l1.2-6.5L2.5 9.7l6.6-.9z"
        fill={filled ? "var(--sun)" : "var(--card-2)"}
        stroke="#3a2748"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Read-only stars. */
export function StarsDisplay({ value, size = 22 }: { value: number | null; size?: number }) {
  if (!value) return <span className="font-semibold text-ink-soft">Not rated</span>;
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} filled={n <= value} size={size} />
      ))}
    </span>
  );
}

/** Pick 1–5 stars. Tap the current rating again to clear it. */
export function StarsInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (next: number | null) => void;
}) {
  return (
    <div className="inline-flex gap-1" role="group" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          aria-pressed={value === n}
          onClick={() => onChange(value === n ? null : n)}
          className="rounded-lg p-0.5 transition-transform hover:scale-125 active:scale-95"
        >
          <Star filled={value !== null && n <= value} size={34} />
        </button>
      ))}
    </div>
  );
}
