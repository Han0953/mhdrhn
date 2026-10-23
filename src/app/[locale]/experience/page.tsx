import {localizedMetadata} from "@/i18n/metadata";
import { serverTranslator } from "@/i18n/server";
import { translateTree } from "@/i18n/translate";
import { requireLocale } from "@/i18n/config";
import type { Metadata } from "next";
import { PageMotion } from "@/components/motion/PageMotion";
import { AnimatedDetails } from "@/components/motion/AnimatedDetails";
import { PageHeading } from "@/components/ui/Editorial";
import { experiences } from "@/lib/content";
import { SiteLink } from "@/components/layout/RouteTransition";
const pageMetadata: Metadata = { title: "Pengalaman", description: "Pengalaman dan peran Muhammad Rehan. Telusuri perjalanan serta keterlibatan yang membentuk keterampilan dan cara bekerjanya." };
export default async function Experience({ params: localeParams, searchParams }: { params: Promise<{locale:string}>; searchParams: Promise<{ category?: string }> }) {
  const locale=requireLocale((await localeParams).locale); const t=serverTranslator(locale);
  const params = await searchParams;
  const selected = experiences.find(group => group.id === params.category)?.id ?? "semua";
  const groups = experiences.filter(group => selected === "semua" || group.id === selected);
  return translateTree(<div className="wrap"><PageMotion profile="experience"/><PageHeading locale={locale} eyebrow="Experience" description="Saya belajar banyak dari tanggung jawab yang saya jalani dan orang-orang yang bekerja bersama saya. Pengalaman tersebut ikut membentuk keterampilan dan cara saya bekerja.">Peran dan<br/>pengalaman</PageHeading><nav className="filters" aria-label="Filter pengalaman"><SiteLink href="/experience" scroll={false} aria-current={selected === "semua" ? "page" : undefined}>Semua</SiteLink>{experiences.map(group => <SiteLink key={group.id} href={`/experience?category=${group.id}`} scroll={false} aria-current={selected === group.id ? "page" : undefined}>{group.group}</SiteLink>)}</nav><p className="result-count meta" role="status">{groups.reduce((count, group) => count + group.items.length, 0)} pengalaman · {selected === "semua" ? "Semua kategori" : groups[0].group}</p>{groups.map(group => <section className="section experience-group" key={group.id} aria-labelledby={`experience-${group.id}`}><h2 id={`experience-${group.id}`}>{group.group}.</h2>{group.items.map(item => <article key={item.id} id={item.id} className="timeline-row"><span className="meta">{item.period ?? "Periode belum tersedia"}</span><div><h3>{item.role}</h3><p>{item.organization}</p><AnimatedDetails summary="Tentang peran"><p>{item.context}</p></AnimatedDetails></div></article>)}</section>)}</div>,t,locale);
}

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{return localizedMetadata(requireLocale((await params).locale),"/experience",pageMetadata);}
