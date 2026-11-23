import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import Header from "@/components/Header";
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
        <Header />
        <div className="mx-auto max-w-4xl px-6 py-8">{children}</div>
      </body>
    </html>
  );
}