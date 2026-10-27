import { ResultsSkeleton } from "@/components/states";

/** Shown while any signed-in page is fetching its data. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6">
      <div className="skeleton h-12 w-64" />
      <div className="skeleton mt-3 h-5 w-80 max-w-full" />
      <div className="mt-12">
        <ResultsSkeleton count={6} />
      </div>
    </div>
  );
}
