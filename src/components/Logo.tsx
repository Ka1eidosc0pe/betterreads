import Link from "next/link";

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
      <rect x="6" y="5" width="28" height="31" rx="8" fill="var(--primary)" stroke="#3a2748" strokeWidth="3" />
      <path d="M13 5v31" stroke="#3a2748" strokeWidth="3" opacity="0.45" />
      <path d="M26 5v13l4-3 4 3V5z" fill="var(--sun)" stroke="#3a2748" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="19" cy="24" r="2.3" fill="#3a2748" />
      <circle cx="27" cy="24" r="2.3" fill="#3a2748" />
      <path d="M19 29q4 4 8 0" stroke="#3a2748" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 no-underline" aria-label="BetterReads home">
      <LogoMark />
      <span className="font-display text-2xl font-bold tracking-tight text-ink">
        Better<span className="text-primary">Reads</span>
      </span>
    </Link>
  );
}
