import { Bookie } from "./Bookie";

/**
 * Hero illustration: a storybook take on the soaring shelves of the COEX
 * (Starfield) library in Seoul. Spines are generated from a seeded PRNG so
 * the server and client always render the same hall.
 */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SPINES = 9;
const ROW_H = 78;
const BOARD = 11;

function ShelfWall({
  x,
  width,
  rows,
  seed,
  top,
}: {
  x: number;
  width: number;
  rows: number;
  seed: number;
  top: number;
}) {
  const rand = mulberry32(seed);
  const rowsOut = [];
  for (let r = 0; r < rows; r++) {
    const baseY = top + (r + 1) * ROW_H - BOARD;
    const spines = [];
    let cx = x + 10;
    // leave a gap in some rows so the shelves feel lived-in
    const gapAt = rand() < 0.5 ? cx + width * (0.3 + rand() * 0.5) : -1;
    while (cx < x + width - 22) {
      const w = 13 + Math.floor(rand() * 17);
      const h = 44 + Math.floor(rand() * 26);
      const color = 1 + Math.floor(rand() * SPINES);
      if (gapAt > 0 && cx > gapAt && cx < gapAt + 46) {
        cx += 46;
        continue;
      }
      const lean = rand() < 0.07;
      spines.push(
        <g
          key={`${r}-${cx}`}
          transform={lean ? `rotate(9 ${cx} ${baseY})` : undefined}
        >
          <rect
            x={cx}
            y={baseY - h}
            width={w}
            height={h}
            rx={4}
            fill={`var(--spine-${color})`}
            stroke="rgb(58 39 72 / 0.55)"
            strokeWidth={1.6}
          />
          <rect x={cx + 2.5} y={baseY - h + 6} width={w - 5} height={5} rx={2} fill="rgb(255 255 255 / 0.45)" />
          <rect x={cx + 2.5} y={baseY - 14} width={w - 5} height={3.5} rx={1.7} fill="rgb(255 255 255 / 0.3)" />
          <rect x={cx + 2} y={baseY - h + 2} width={2.5} height={h - 4} rx={1.2} fill="rgb(255 255 255 / 0.28)" />
        </g>,
      );
      cx += w + 1.5;
    }
    rowsOut.push(
      <g key={r}>
        {spines}
        <rect
          x={x - 4}
          y={baseY}
          width={width + 8}
          height={BOARD}
          rx={3}
          fill="url(#wood)"
        />
      </g>,
    );
  }
  return (
    <g>
      <rect x={x - 4} y={top} width={width + 8} height={rows * ROW_H} fill="var(--hall-shelf-back)" />
      {rowsOut}
    </g>
  );
}

function Lamp({ x, drop, delay }: { x: number; drop: number; delay: string }) {
  return (
    <g className="sway" style={{ animationDelay: delay, transformOrigin: `${x}px 0px` }}>
      <line x1={x} y1={0} x2={x} y2={drop} stroke="#3a2748" strokeWidth={3} />
      <circle cx={x} cy={drop + 18} r={130} fill="url(#lampGlow)" />
      <path
        d={`M${x - 28} ${drop + 34} q0 -34 28 -34 q28 0 28 34 z`}
        fill="var(--sun)"
        stroke="#3a2748"
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <path d={`M${x - 16} ${drop + 12} q6 -10 18 -10`} stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.6} fill="none" />
      <ellipse cx={x} cy={drop + 36} rx={14} ry={5} fill="#fff7d6" />
    </g>
  );
}

function FlyingBook({ x, y, r, delay, color }: { x: number; y: number; r: number; delay: string; color: string }) {
  return (
    <g
      className="float"
      style={{ ["--r" as string]: `${r}deg`, animationDelay: delay, transformOrigin: `${x}px ${y}px` }}
    >
      <g transform={`translate(${x} ${y})`}>
        {/* wings */}
        <path d="M-6 -6 q-26 -20 -34 4 q14 6 30 6 z" fill="#fff" stroke="#3a2748" strokeWidth={3} strokeLinejoin="round" />
        <path d="M30 -6 q26 -20 34 4 q-14 6 -30 6 z" fill="#fff" stroke="#3a2748" strokeWidth={3} strokeLinejoin="round" />
        <rect x={-6} y={-16} width={36} height={28} rx={6} fill={color} stroke="#3a2748" strokeWidth={3.5} />
        <rect x={-6} y={-16} width={8} height={28} rx={4} fill="rgb(0 0 0 / 0.18)" />
        <rect x={10} y={-6} width={14} height={4} rx={2} fill="rgb(255 255 255 / 0.6)" />
      </g>
    </g>
  );
}

export function LibraryHall({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 620"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label="A cartoon illustration of a grand library hall with towering bookshelves, hanging lamps, a starry skylight and Bookie the book mascot"
    >
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--hall-wall-top)" />
          <stop offset="1" stopColor="var(--hall-wall-bottom)" />
        </linearGradient>
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--wood-light)" />
          <stop offset="0.5" stopColor="var(--wood)" />
          <stop offset="1" stopColor="var(--wood-dark)" />
        </linearGradient>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--sky-top)" />
          <stop offset="1" stopColor="var(--sky-bottom)" />
        </linearGradient>
        <radialGradient id="lampGlow">
          <stop offset="0" style={{ stopColor: "rgb(var(--glow))", stopOpacity: "var(--glow-strength)" }} />
          <stop offset="1" style={{ stopColor: "rgb(var(--glow))", stopOpacity: 0 }} />
        </radialGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="skyArch">
          <path d="M470 470 V190 q0 -150 130 -150 q130 0 130 150 V470 z" />
        </clipPath>
      </defs>

      {/* back wall */}
      <rect width="1200" height="620" fill="url(#wall)" />

      {/* skylight arch */}
      <g>
        <path d="M452 480 V190 q0 -168 148 -168 q148 0 148 168 V480 z" fill="var(--wood-dark)" opacity="0.9" />
        <path d="M470 470 V190 q0 -150 130 -150 q130 0 130 150 V470 z" fill="url(#sky)" />
        <g clipPath="url(#skyArch)">
          <g style={{ opacity: "var(--star-opacity)" }} fill="#fff">
            <circle cx="520" cy="110" r="2.4" />
            <circle cx="580" cy="70" r="1.8" />
            <circle cx="650" cy="120" r="2.6" />
            <circle cx="690" cy="180" r="1.8" />
            <circle cx="540" cy="220" r="1.8" />
            <circle cx="620" cy="250" r="2.2" />
            <circle cx="500" cy="320" r="1.6" />
            <circle cx="700" cy="330" r="2" />
          </g>
          {/* sun by day, moon by night */}
          <circle cx="640" cy="160" r="34" fill="var(--sun)" stroke="#3a2748" strokeWidth="4" />
          <circle cx="652" cy="152" r="28" fill="var(--sky-top)" style={{ opacity: "var(--star-opacity)" }} />
          {/* fluffy clouds */}
          <g fill="#fff" opacity="0.9" stroke="#3a2748" strokeWidth="3" style={{ opacity: "calc(1 - var(--star-opacity) * 0.7)" }}>
            <path d="M486 290 q0 -22 22 -22 q8 -18 28 -8 q22 -6 26 18 q18 2 14 18 h-90 z" />
            <path d="M610 360 q0 -18 18 -18 q6 -14 22 -6 q18 -4 20 14 q14 2 10 16 h-72 z" />
          </g>
          {/* mullions */}
          <g stroke="var(--wood-dark)" strokeWidth="8">
            <line x1="600" y1="40" x2="600" y2="470" />
            <line x1="470" y1="260" x2="730" y2="260" />
          </g>
        </g>
        {/* light beam into hall */}
        <path d="M470 470 L330 620 H870 L730 470 z" fill="url(#beam)" opacity="0.5" />
      </g>

      {/* shelf walls */}
      <ShelfWall x={30} width={380} rows={6} seed={7} top={0} />
      <ShelfWall x={790} width={380} rows={6} seed={21} top={0} />

      {/* rolling ladder */}
      <g transform="translate(360 40) rotate(8 20 200)">
        <rect x="0" y="0" width="9" height="440" rx="4" fill="url(#wood)" stroke="#3a2748" strokeWidth="2" />
        <rect x="46" y="0" width="9" height="440" rx="4" fill="url(#wood)" stroke="#3a2748" strokeWidth="2" />
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x="6" y={36 + i * 46} width="44" height="8" rx="3" fill="url(#wood)" stroke="#3a2748" strokeWidth="1.5" />
        ))}
      </g>

      {/* floor */}
      <path d="M0 470 H1200 V620 H0 z" fill="var(--hall-floor)" />
      <path d="M0 470 H1200" stroke="var(--wood-dark)" strokeWidth="6" />
      <g stroke="rgb(0 0 0 / 0.1)" strokeWidth="3">
        <line x1="0" y1="520" x2="1200" y2="520" />
        <line x1="0" y1="575" x2="1200" y2="575" />
        <line x1="300" y1="470" x2="150" y2="620" />
        <line x1="600" y1="470" x2="600" y2="620" />
        <line x1="900" y1="470" x2="1050" y2="620" />
      </g>

      {/* rug */}
      <ellipse cx="600" cy="560" rx="200" ry="36" fill="var(--plum)" stroke="#3a2748" strokeWidth="4" />
      <ellipse cx="600" cy="560" rx="150" ry="24" fill="none" stroke="var(--sun)" strokeWidth="4" strokeDasharray="10 8" />

      {/* hanging lamps */}
      <Lamp x={250} drop={120} delay="0s" />
      <Lamp x={600} drop={200} delay="-2s" />
      <Lamp x={950} drop={120} delay="-4s" />

      {/* flying books */}
      <FlyingBook x={430} y={330} r={-8} delay="0s" color="var(--spine-3)" />
      <FlyingBook x={760} y={280} r={8} delay="-1.6s" color="var(--spine-7)" />
      <FlyingBook x={540} y={430} r={-4} delay="-3s" color="var(--spine-2)" />

      {/* reading pile + Bookie */}
      <g>
        <rect x="520" y="506" width="120" height="22" rx="8" fill="var(--spine-4)" stroke="#3a2748" strokeWidth="4" />
        <rect x="532" y="486" width="96" height="22" rx="8" fill="var(--spine-1)" stroke="#3a2748" strokeWidth="4" />
        <rect x="544" y="468" width="76" height="20" rx="8" fill="var(--spine-3)" stroke="#3a2748" strokeWidth="4" />
        <g transform="translate(496 380) scale(0.62)">
          <Bookie mood="happy" size={200} />
        </g>
      </g>
    </svg>
  );
}
