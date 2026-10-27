"use client";

const STORAGE_KEY = "br-theme";

/**
 * Sun/moon switch. The icons swap with CSS (not React state) so the right one
 * is shown on first paint, before hydration, with no flash.
 */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode: the choice just won't persist */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="btn btn-ghost btn-sm !px-2.5"
      aria-label="Switch between light and dark mode"
      title="Switch between light and dark mode"
    >
      {/* sun (shown in dark mode, tap to brighten) */}
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden className="hidden dark:block">
        <circle cx="12" cy="12" r="5" fill="var(--sun)" stroke="currentColor" strokeWidth="2" />
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
        </g>
      </svg>
      {/* moon (shown in light mode) */}
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden className="block dark:hidden">
        <path
          d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"
          fill="var(--plum)"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/** Runs before first paint so the saved / system theme is applied with no flash. */
export const themeScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(!t){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})()`;
