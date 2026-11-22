import type { Metadata } from "next";
import Link from "next/link";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

const font = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Leave Desk",
  description: "Apply for leave and approve requests",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={font.variable}>
      <body>
        <header className="bg-brand text-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight">
              <span className="flex gap-1" aria-hidden="true">
                <span className="h-3.5 w-3.5 rounded-sm bg-sky-300" />
                <span className="h-3.5 w-3.5 rounded-sm bg-violet-300" />
                <span className="h-3.5 w-3.5 rounded-sm bg-rose-300" />
              </span>
              Leave Desk
            </Link>
            <nav className="flex gap-2 text-sm font-medium">
              <Link href="/" className="rounded-full px-4 py-2 hover:bg-white/15">
                My leave
              </Link>
              <Link href="/manager" className="rounded-full px-4 py-2 hover:bg-white/15">
                Approvals
              </Link>
            </nav>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-6 py-8">{children}</div>
      </body>
    </html>
  );
}