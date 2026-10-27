import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { LibraryHall } from "@/components/art/LibraryHall";

const FEATURES = [
  {
    title: "Bookmark for later",
    body: "Spot something wonderful? Pin it to your To-Read shelf in one tap.",
    color: "var(--sun)",
    icon: "M7 3h10a1 1 0 0 1 1 1v17l-6-4-6 4V4a1 1 0 0 1 1-1z",
  },
  {
    title: "Log every page",
    body: "A tiny reading journal: how far you got, and what you thought.",
    color: "var(--teal)",
    icon: "M5 4h9l5 5v11H5zM14 4v5h5",
  },
  {
    title: "Finish & rate",
    body: "Close the book, give it stars, and watch your finished shelf grow.",
    color: "var(--primary)",
    icon: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  },
  {
    title: "Yours alone",
    body: "Your shelves are private. Nobody else can see them. Not even by accident.",
    color: "var(--plum)",
    icon: "M6 11V8a6 6 0 1 1 12 0v3M5 11h14v10H5z",
  },
];

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/library");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pt-12">
      <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_1fr]">
        <div className="pop-in">
          <span className="chip mb-5">
            <span aria-hidden>✦</span> A cozier kind of reading tracker
          </span>
          <h1 className="text-5xl font-bold leading-[1.05] text-ink sm:text-6xl">
            Every shelf,
            <br />
            <span className="text-primary">one cozy corner.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg font-semibold text-ink-soft">
            BetterReads is a calm, pretty place to keep the books you want to
            read, the ones you&apos;re in the middle of, and the ones that
            stayed with you.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/sign-up" className="btn btn-primary text-lg">
              Start your shelf
            </Link>
            <Link href="/sign-in" className="btn">
              I already have one
            </Link>
          </div>
        </div>

        <div className="card relative overflow-hidden !rounded-[2.25rem] p-0">
          <LibraryHall className="block h-auto w-full" />
        </div>
      </section>

      <section className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="What you can do">
        {FEATURES.map((f) => (
          <article key={f.title} className="card p-6">
            <div
              className="mb-4 grid size-12 place-items-center rounded-2xl border-[2.5px] border-[var(--ink)]/80"
              style={{ background: f.color }}
            >
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#3a2748" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={f.icon} />
              </svg>
            </div>
            <h2 className="text-xl font-bold">{f.title}</h2>
            <p className="mt-2 font-semibold text-ink-soft">{f.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
