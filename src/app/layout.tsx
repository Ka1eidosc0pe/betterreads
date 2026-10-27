import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { Header } from "@/components/Header";
import { themeScript } from "@/components/ThemeToggle";
import { appearance } from "@/lib/clerk-appearance";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BetterReads — your cozy corner of the library",
    template: "%s · BetterReads",
  },
  description:
    "Track what you read, bookmark what you want to read next, and keep a tiny journal of every page. Goodreads, but cozier.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff5e1" },
    { media: "(prefers-color-scheme: dark)", color: "#181330" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${nunito.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ClerkProvider appearance={appearance}>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="px-6 py-10 text-center text-sm font-semibold text-ink-soft">
            Made with care for people who love a good shelf. Book data from{" "}
            <a
              href="https://openlibrary.org"
              className="underline decoration-2 underline-offset-4"
              target="_blank"
              rel="noreferrer"
            >
              Open Library
            </a>
            .
          </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}
