import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { userButtonAppearance } from "@/lib/clerk-appearance";

export async function Header() {
  const { userId } = await auth();

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <div className="card mx-auto flex max-w-6xl items-center gap-2 !rounded-full px-4 py-2 sm:gap-4 sm:px-6">
        <Logo href={userId ? "/library" : "/"} />
        <nav aria-label="Main" className="ml-auto flex items-center gap-1 sm:gap-2">
          {userId ? (
            <>
              <Link href="/search" className="btn btn-ghost btn-sm">
                Discover
              </Link>
              <Link href="/library" className="btn btn-ghost btn-sm">
                My Library
              </Link>
            </>
          ) : (
            <Link href="/sign-in" className="btn btn-ghost btn-sm">
              Sign in
            </Link>
          )}
          <ThemeToggle />
          {userId ? (
            <UserButton appearance={userButtonAppearance} />
          ) : (
            <Link href="/sign-up" className="btn btn-primary btn-sm">
              Join free
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
