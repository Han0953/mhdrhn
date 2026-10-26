import {localizedMetadata} from "@/i18n/metadata";
import { serverTranslator } from "@/i18n/server";
import { translateTree } from "@/i18n/translate";
import { requireLocale } from "@/i18n/config";
import type { Metadata } from "next";
import { PageMotion } from "@/components/motion/PageMotion";
import { PageHeading, Arrow } from "@/components/ui/Editorial";
import { profile } from "@/lib/content";
import { contactChannels } from "@/lib/contact";
const pageMetadata: Metadata = { title: "Kontak", description: "Kenali Muhammad Rehan melalui karya, aktivitas, dan kanal kontaknya. Temukan ruang untuk bertukar gagasan dan menjajaki kolaborasi." };
export default async function Contact({ params: localeParams }: { params: Promise<{locale:string}> }) {
  const locale=requireLocale((await localeParams).locale); const t=serverTranslator(locale);
  return translateTree(<div className="wrap contact-page"><PageMotion profile="contact"/><PageHeading locale={locale} eyebrow="Contact">Mari<br/>terhubung</PageHeading><section className="section contact-layout"><h2>Tentang karya<br/>atau kolaborasi.</h2><div className="reading"><p>Ingin membahas karya, bertukar gagasan, atau menjajaki kolaborasi? Temukan saya melalui kanal berikut.</p><ul className="contact-channels">{contactChannels.map(channel=><li key={channel.id} id={channel.id} data-contact-channel={channel.id}>{channel.href?<a className="contact-link contact-channel" href={channel.href} target="_blank" rel="noopener noreferrer"><span><span className="eyebrow">{channel.label}</span><strong data-no-translate>{channel.detail}</strong></span><Arrow/></a>:<div className="contact-channel"><span><span className="eyebrow">{channel.label}</span><strong>{channel.detail}</strong></span></div>}</li>)}</ul><p className="meta">{profile.location}</p></div></section></div>,t,locale);
}

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{return localizedMetadata(requireLocale((await params).locale),"/contact",pageMetadata);}
