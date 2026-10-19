import type { Metadata } from "next";
import { PageHeading, Arrow } from "@/components/ui/Editorial";
import { SiteLink } from "@/components/layout/RouteTransition";
import { achievements, getProjectBySlug } from "@/lib/content";
export const metadata: Metadata = { title: "Achievements", description: "Pengakuan untuk karya bersama tim: AURA POD dan Vircuit." };
export default function Achievements() {
  return <div className="wrap"><PageHeading eyebrow="Achievements" description="Setiap pengakuan punya cerita, konteks karya, dan orang-orang di baliknya.">Hasil bersama,<br/>dicatat di sini</PageHeading><section className="section awards" aria-label="Penghargaan tim">{achievements.map(award => <article className="award-row" key={award.id}><div><p className="award-result">{award.result}</p><p className="meta">{award.additional}</p></div><div><h2>{getProjectBySlug(award.projectSlug)?.title}</h2><p>{award.event}</p><p className="meta">Penghargaan tim · {award.team}</p><div className="actions"><SiteLink href={`/projects/${award.projectSlug}`} className="text-link">Lihat karya <Arrow/></SiteLink><a href={award.source} className="text-link" target="_blank" rel="noopener noreferrer">Publikasi <Arrow/></a></div></div><span className="meta">{award.year}</span></article>)}</section></div>;
}
