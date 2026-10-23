import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "lenis/dist/lenis.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { RouteTransition } from "@/components/layout/RouteTransition";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { Footer } from "@/components/layout/Footer";
import { MotionPreferences } from "@/components/motion/MotionPreferences";
import { LenisProvider } from "@/providers/LenisProvider";
import { getPublishedProjects } from "@/lib/content";
// Owner-approved pairing: Clash Display Semibold for display text; Manrope for body.
const brand = localFont({ src: "./fonts/ClashDisplay-Semibold.woff2", variable: "--font-brand", weight: "600", style: "normal", display: "swap" });
const body = Manrope({ variable: "--font-body", subsets: ["latin"], display: "swap" });
export const metadata: Metadata = {
  title: { default: "Muhammad Rehan — Creative Engineering | mhdrhn.", template: "%s | mhdrhn." },
  description: "Website personal Muhammad Rehan dari Pekanbaru. Kenali perjalanan, karya, dan hal-hal yang dipelajarinya melalui pengalaman serta praktik.",
  authors: [{ name: "Muhammad Rehan" }],
  // Release hostname and indexing are intentionally deferred to the release gate.
  robots: { index: false, follow: true },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id" suppressHydrationWarning className={`${brand.variable} ${body.variable}`}>
    <body><ThemeProvider><MotionPreferences/><LenisProvider><RouteTransition projects={getPublishedProjects().map(({ slug, title }) => ({ slug, title }))}><a className="skip-link" href="#main-content">Lewati ke konten</a><SiteChrome/><main id="main-content" tabIndex={-1}>{children}</main><Footer/></RouteTransition></LenisProvider></ThemeProvider></body>
  </html>;
}
