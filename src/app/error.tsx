"use client";

import { Bookie } from "@/components/art/Bookie";

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <div role="alert" className="card pop-in flex flex-col items-center gap-2 px-6 py-10 text-center">
        <Bookie mood="oops" size={150} className="float" />
        <h1 className="mt-2 text-3xl font-bold">Oops, a book fell off the shelf</h1>
        <p className="max-w-sm font-semibold text-ink-soft">
          Something went wrong on our side. Your shelves are safe. Give it another go.
        </p>
        <button onClick={() => retry()} className="btn btn-primary mt-5">
          Try again
        </button>
      </div>
    </div>
  );
}
