export type BookieMood = "happy" | "curious" | "sleepy" | "oops" | "cheer";

/**
 * Bookie, the BetterReads mascot: a chunky little book with opinions.
 * Mood changes the face (and a prop or two) so empty / error / loading
 * states all feel like the same friendly character.
 */
export function Bookie({
  mood = "happy",
  size = 160,
  className = "",
  title,
}: {
  mood?: BookieMood;
  size?: number;
  className?: string;
  title?: string;
}) {
  const closedEyes = mood === "sleepy";
  return (
    <svg
      viewBox="0 0 200 210"
      width={size}
      height={(size * 210) / 200}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {/* ground shadow */}
      <ellipse cx="100" cy="196" rx="58" ry="9" fill="#000" opacity="0.14" />

      {/* legs */}
      <rect x="64" y="166" width="26" height="28" rx="12" fill="#3a2748" />
      <rect x="110" y="166" width="26" height="28" rx="12" fill="#3a2748" />
      <ellipse cx="73" cy="192" rx="17" ry="9" fill="#ffc53d" stroke="#3a2748" strokeWidth="5" />
      <ellipse cx="127" cy="192" rx="17" ry="9" fill="#ffc53d" stroke="#3a2748" strokeWidth="5" />

      {/* pages peeking out */}
      <rect x="44" y="30" width="122" height="142" rx="22" fill="#fff6dc" stroke="#3a2748" strokeWidth="5" />
      <path d="M52 168 H158" stroke="#e8c998" strokeWidth="4" strokeLinecap="round" />
      <path d="M54 160 H156" stroke="#e8c998" strokeWidth="3" strokeLinecap="round" />

      {/* cover */}
      <rect x="34" y="22" width="128" height="140" rx="24" fill="var(--primary)" stroke="#3a2748" strokeWidth="5" />
      {/* spine */}
      <path d="M34 46 q0 -24 24 -24 h10 v140 h-10 q-24 0 -24 -24 z" fill="var(--primary-edge)" opacity="0.55" />
      <path d="M68 24 V160" stroke="#3a2748" strokeWidth="4" opacity="0.5" />
      {/* cover shine */}
      <path d="M82 36 q30 -6 62 4" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.45" fill="none" />
      {/* bookmark ribbon */}
      <path d="M138 22 v34 l11 -9 l11 9 v-34 z" fill="var(--sun)" stroke="#3a2748" strokeWidth="4" strokeLinejoin="round" />

      {/* arms */}
      {mood === "cheer" ? (
        <>
          <path d="M36 100 q-24 -10 -22 -38" stroke="#3a2748" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M160 100 q24 -10 22 -38" stroke="#3a2748" strokeWidth="9" strokeLinecap="round" fill="none" />
          <circle cx="14" cy="60" r="9" fill="#ffc53d" stroke="#3a2748" strokeWidth="4" />
          <circle cx="182" cy="60" r="9" fill="#ffc53d" stroke="#3a2748" strokeWidth="4" />
        </>
      ) : (
        <>
          <path d="M36 112 q-20 10 -16 30" stroke="#3a2748" strokeWidth="9" strokeLinecap="round" fill="none" />
          <circle cx="20" cy="144" r="9" fill="#ffc53d" stroke="#3a2748" strokeWidth="4" />
          {mood === "curious" ? (
            <>
              <path d="M160 112 q26 -6 32 -34" stroke="#3a2748" strokeWidth="9" strokeLinecap="round" fill="none" />
              <g transform="translate(160 40) rotate(20)">
                <circle cx="22" cy="22" r="20" fill="rgb(255 255 255 / 0.55)" stroke="#3a2748" strokeWidth="5" />
                <path d="M36 38 l18 18" stroke="#3a2748" strokeWidth="8" strokeLinecap="round" />
                <path d="M12 16 q4 -6 11 -6" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" />
              </g>
            </>
          ) : (
            <>
              <path d="M160 112 q20 10 16 30" stroke="#3a2748" strokeWidth="9" strokeLinecap="round" fill="none" />
              <circle cx="180" cy="144" r="9" fill="#ffc53d" stroke="#3a2748" strokeWidth="4" />
            </>
          )}
        </>
      )}

      {/* eyes */}
      {closedEyes ? (
        <g stroke="#3a2748" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M80 92 q10 9 20 0" />
          <path d="M116 92 q10 9 20 0" />
        </g>
      ) : (
        <g className="blink">
          <ellipse cx="90" cy="90" rx="13" ry="16" fill="#fff" stroke="#3a2748" strokeWidth="4" />
          <ellipse cx="126" cy="90" rx="13" ry="16" fill="#fff" stroke="#3a2748" strokeWidth="4" />
          <circle cx={mood === "curious" ? 95 : 91} cy={mood === "oops" ? 96 : 92} r="7" fill="#3a2748" />
          <circle cx={mood === "curious" ? 131 : 127} cy={mood === "oops" ? 96 : 92} r="7" fill="#3a2748" />
          <circle cx={mood === "curious" ? 97 : 93} cy="89" r="2.6" fill="#fff" />
          <circle cx={mood === "curious" ? 133 : 129} cy="89" r="2.6" fill="#fff" />
        </g>
      )}

      {/* brows */}
      {mood === "oops" && (
        <g stroke="#3a2748" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M78 68 l20 -6" />
          <path d="M138 68 l-20 -6" />
        </g>
      )}
      {mood === "curious" && (
        <g stroke="#3a2748" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M78 66 q12 -8 24 -2" />
          <path d="M114 64 q12 -6 24 2" />
        </g>
      )}

      {/* cheeks */}
      <ellipse cx="72" cy="116" rx="9" ry="6" fill="#ff9fb5" opacity="0.85" />
      <ellipse cx="144" cy="116" rx="9" ry="6" fill="#ff9fb5" opacity="0.85" />

      {/* mouth */}
      {mood === "oops" ? (
        <path d="M98 128 q10 -10 20 0" stroke="#3a2748" strokeWidth="5" strokeLinecap="round" fill="none" />
      ) : mood === "sleepy" ? (
        <ellipse cx="108" cy="126" rx="6" ry="7" fill="#3a2748" />
      ) : mood === "curious" ? (
        <ellipse cx="108" cy="126" rx="7" ry="5" fill="#3a2748" />
      ) : (
        <path d="M94 122 q14 18 28 0 q-14 5 -28 0 z" fill="#3a2748" stroke="#3a2748" strokeWidth="3" strokeLinejoin="round" />
      )}

      {/* extras */}
      {mood === "sleepy" && (
        <g fontFamily="var(--font-display)" fontWeight="700" fill="var(--plum)">
          <text x="150" y="30" fontSize="26">z</text>
          <text x="166" y="14" fontSize="20">z</text>
          <text x="178" y="2" fontSize="14">z</text>
        </g>
      )}
      {mood === "oops" && (
        <path d="M150 62 q8 12 0 18 q-8 -6 0 -18 z" fill="#8fd3f4" stroke="#3a2748" strokeWidth="3" />
      )}
      {mood === "cheer" && (
        <g fill="var(--sun)" stroke="#3a2748" strokeWidth="3" strokeLinejoin="round">
          <path d="M12 20 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4 l9 -4 z" />
          <path d="M184 24 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" />
        </g>
      )}
    </svg>
  );
}
