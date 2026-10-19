import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { RouteTransition } from "@/components/layout/RouteTransition";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { Footer } from "@/components/layout/Footer";
// Original pairing: Syne for display text and the wordmark, Manrope for body text.
const brand = localFont({ src: "./fonts/Syne-Variable.ttf", variable: "--font-brand", weight: "400 800", display: "swap" });
const body = Manrope({ variable: "--font-body", subsets: ["latin"], display: "swap" });
export const metadata: Metadata = {
  title: { default: "Muhammad Rehan — Creative Engineering | mhdrhn.", template: "%s | mhdrhn." },
  description: "Muhammad Rehan. Elektronika, kode, dan riset. Jelajahi karya IoT, pengembangan web, dan eksperimen teknologi dari Pekanbaru.",
  authors: [{ name: "Muhammad Rehan" }],
  // Release hostname and indexing are intentionally deferred to the release gate.
  robots: { index: false, follow: true },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id" suppressHydrationWarning className={`${brand.variable} ${body.variable}`}>
    <body><ThemeProvider><RouteTransition><a className="skip-link" href="#main-content">Lewati ke konten</a><SiteChrome/><main id="main-content" tabIndex={-1}>{children}</main><Footer/></RouteTransition></ThemeProvider></body>
  </html>;
}
