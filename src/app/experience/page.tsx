import type { Metadata } from "next";
import { PageHeading } from "@/components/ui/Editorial";
import { experiences } from "@/lib/content";
import { SiteLink } from "@/components/layout/RouteTransition";
export const metadata: Metadata = { title: "Experience", description: "Pengalaman organisasi, laboratorium, kepanitiaan, dan pengujian aplikasi mobile Muhammad Rehan." };
export default async function Experience({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const selected = experiences.find(group => group.id === params.category)?.id ?? "semua";
  const groups = experiences.filter(group => selected === "semua" || group.id === selected);
  return <div className="wrap"><PageHeading eyebrow="Experience" description="Pengalaman tumbuh lewat keterlibatan: di organisasi, laboratorium, acara, dan pengujian aplikasi.">Belajar, terlibat,<br/>bertumbuh</PageHeading><nav className="filters" aria-label="Filter pengalaman"><SiteLink href="/experience" scroll={false} aria-current={selected === "semua" ? "page" : undefined}>Semua</SiteLink>{experiences.map(group => <SiteLink key={group.id} href={`/experience?category=${group.id}`} scroll={false} aria-current={selected === group.id ? "page" : undefined}>{group.group}</SiteLink>)}</nav><p className="result-count meta" role="status">{groups.reduce((count, group) => count + group.items.length, 0)} pengalaman · {selected === "semua" ? "Semua kategori" : groups[0].group}</p>{groups.map(group => <section className="section experience-group" key={group.id} aria-labelledby={`experience-${group.id}`}><h2 id={`experience-${group.id}`}>{group.group}.</h2>{group.items.map(item => <article key={item.id} id={item.id} className="timeline-row"><span className="meta">{item.period ?? "Periode belum dicantumkan"}</span><div><h3>{item.role}</h3><p>{item.organization}</p><details className="context-disclosure"><summary>Catatan konteks</summary><p>{item.context}</p></details></div></article>)}</section>)}</div>;
}
