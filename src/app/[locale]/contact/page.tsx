import {localizedMetadata} from "@/i18n/metadata";
import { serverTranslator } from "@/i18n/server";
import { translateTree } from "@/i18n/translate";
import { requireLocale } from "@/i18n/config";
import type { Metadata } from "next";
import { PageMotion } from "@/components/motion/PageMotion";
import { PageHeading, Arrow } from "@/components/ui/Editorial";
import { profile } from "@/lib/content";
const pageMetadata: Metadata = { title: "Kontak", description: "Temukan profil GitHub Muhammad Rehan dan telusuri karya yang ia bagikan. Kenali aktivitas pengembangannya sebagai awal untuk menjajaki gagasan atau kolaborasi." };
export default async function Contact({ params: localeParams }: { params: Promise<{locale:string}> }) {
  const locale=requireLocale((await localeParams).locale); const t=serverTranslator(locale);
  return translateTree(<div className="wrap contact-page"><PageMotion profile="contact"/><PageHeading locale={locale} eyebrow="Contact">Mari<br/>terhubung</PageHeading><section className="section contact-layout"><h2>Tentang karya<br/>atau kolaborasi.</h2><div className="reading"><p>Ingin mengenal pekerjaan saya lebih jauh? Kunjungi profil GitHub untuk melihat repositori dan aktivitas pengembangan yang saya bagikan.</p><a className="contact-link" href={profile.github} target="_blank" rel="noopener noreferrer"><span><span className="eyebrow">GitHub</span><strong>Han0953</strong></span><Arrow/></a><p className="meta">{profile.location}</p></div></section></div>,t,locale);
}

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{return localizedMetadata(requireLocale((await params).locale),"/contact",pageMetadata);}
