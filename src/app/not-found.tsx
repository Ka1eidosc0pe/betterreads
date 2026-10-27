import Link from "next/link";
import { Bookie } from "@/components/art/Bookie";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <div className="card pop-in flex flex-col items-center gap-2 px-6 py-10 text-center">
        <Bookie mood="curious" size={150} className="float" />
        <h1 className="mt-2 text-3xl font-bold">This page wandered off</h1>
        <p className="max-w-sm font-semibold text-ink-soft">
          Bookie checked every shelf and the page you wanted isn&apos;t in the building.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            Back to the lobby
          </Link>
          <Link href="/search" className="btn">
            Browse books
          </Link>
        </div>
      </div>
    </div>
  );
}
