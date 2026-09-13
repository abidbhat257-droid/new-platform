import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl } from "../lib/site";
export const metadata: Metadata = {
  title: {
    default: "HerCalc - Women's health calculators",
    template: "%s | HerCalc",
  },
  description:
    "Private, practical calculators for every stage of women's health.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "HerCalc",
    description: "Evidence-informed women's health calculators",
    type: "website",
    url: siteUrl,
  },
  robots: { index: true, follow: true },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-pink-100 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-pink-700"
            >
              HerCalc<span className="text-pink-300">.</span>
            </Link>
            <nav className="hidden gap-5 text-sm text-slate-600 sm:flex">
              <Link href="/calculators">All calculators</Link>
              <Link href="/about">How it works</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-16 border-t border-pink-100 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500">
            (c) {new Date().getFullYear()} HerCalc - Educational information,
            not medical advice. Talk with your clinician about personal
            decisions.
          </div>
        </footer>
      </body>
    </html>
  );
}
