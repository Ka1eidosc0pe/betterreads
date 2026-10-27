import { ResultsSkeleton } from "@/components/states";

/** Shape of My Library while it loads: title, stat cards, shelf tabs, a row of books. */
export default function LibraryLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6">
      <div className="skeleton h-12 w-64 max-w-full" />
      <div className="skeleton mt-3 h-5 w-80 max-w-full" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-[5.5rem]" />
        ))}
      </div>
      <div className="mt-10 flex gap-3" aria-hidden>
        <div className="skeleton h-12 w-36 !rounded-full" />
        <div className="skeleton h-12 w-32 !rounded-full" />
        <div className="skeleton h-12 w-32 !rounded-full" />
      </div>
      <div className="mt-10">
        <ResultsSkeleton count={6} />
      </div>
    </div>
  );
}
