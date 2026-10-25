import {localizedMetadata} from "@/i18n/metadata";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { messages as englishUI } from "@/i18n/messages/en-ui";
import { serverTranslator } from "@/i18n/server";
import { LanguageTransition } from "@/i18n/LanguageTransition";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";
import "lenis/dist/lenis.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { RouteTransition } from "@/components/layout/RouteTransition";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { Footer } from "@/components/layout/Footer";
import { MotionPreferences } from "@/components/motion/MotionPreferences";
import { LenisProvider } from "@/providers/LenisProvider";
import { getPublishedProjects } from "@/lib/content";
import { motionStartupScript, motionStartupStyle } from "@/lib/motion/startup";
import {VisitIntro} from "@/components/motion/VisitIntro";
import {StartupBootstrap} from "@/components/motion/StartupBootstrap";
import {visitIntroScript,visitIntroStyle} from "@/lib/motion/visit-intro";
import {homeSceneStartupScript,homeSceneStartupStyle} from "@/lib/motion/home-scene-startup";
// Owner-approved pairing: Clash Display Semibold for display text; Manrope for body.
const brand = localFont({ src: "../fonts/ClashDisplay-Semibold.woff2", variable: "--font-brand", weight: "600", style: "normal", display: "swap" });
const body = Manrope({ variable: "--font-body", subsets: ["latin"], display: "swap" });
const baseMetadata: Metadata = {
  title: { default: "Muhammad Rehan | Creative Engineering", template: "%s | mhdrhn." },
  description: "Website personal Muhammad Rehan dari Pekanbaru. Kenali perjalanan, karya, dan hal-hal yang dipelajarinya melalui pengalaman serta praktik.",
  authors: [{ name: "Muhammad Rehan" }],
  // Release hostname and indexing are intentionally deferred to the release gate.
  robots: { index: false, follow: true },
};
export function generateStaticParams(){return [{locale:"id"},{locale:"en"}];}

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!isLocale(locale))return {};return localizedMetadata(locale,"/",baseMetadata);}
export default async function RootLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{locale:string}> }>) {
 const {locale}=await params;if(!isLocale(locale))notFound();const t=serverTranslator(locale);
  return <html lang={locale} suppressHydrationWarning className={`${brand.variable} ${body.variable}`}>
    <head><style id="mhdrhn-motion-startup-style" dangerouslySetInnerHTML={{__html:motionStartupStyle+visitIntroStyle+homeSceneStartupStyle}}/><StartupBootstrap source={homeSceneStartupScript+visitIntroScript+motionStartupScript}/></head>
    <body><VisitIntro/><LocaleProvider locale={locale} messages={locale==="en"?englishUI:{}}><ThemeProvider><MotionPreferences/><LanguageTransition/><LenisProvider><RouteTransition projects={getPublishedProjects().map(({ slug, title }) => ({ slug, title }))}><a className="skip-link" href="#main-content">{t("Lewati ke konten")}</a><SiteChrome/><main id="main-content" tabIndex={-1}>{children}</main><Footer locale={locale}/></RouteTransition></LenisProvider></ThemeProvider></LocaleProvider></body>
  </html>;
}
