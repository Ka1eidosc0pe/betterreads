/** Shape of a book page while it loads: cover on the left, title and panels on the right. */
export default function BookLoading() {
  return (
    <div role="status" className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6">
      <span className="sr-only">Opening the book…</span>
      <div className="skeleton mb-4 h-9 w-44 !rounded-full" aria-hidden />
      <div className="grid gap-10 md:grid-cols-[15rem_1fr]" aria-hidden>
        <div className="skeleton mx-auto aspect-[2/3] w-full max-w-[15rem] !rounded-[0.9rem]" />
        <div className="grid content-start gap-6">
          <div>
            <div className="skeleton h-12 w-3/4" />
            <div className="skeleton mt-3 h-6 w-48" />
          </div>
          <div className="skeleton h-56 !rounded-[1.75rem]" />
          <div className="skeleton h-72 !rounded-[1.75rem]" />
        </div>
      </div>
    </div>
  );
}
