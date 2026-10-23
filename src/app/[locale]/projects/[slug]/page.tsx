import {localizedMetadata} from "@/i18n/metadata";
import { serverTranslator } from "@/i18n/server";
import { translateTree } from "@/i18n/translate";
import { requireLocale } from "@/i18n/config";
import type { Metadata } from "next";
import { PageMotion } from "@/components/motion/PageMotion";
import { notFound } from "next/navigation";
import { SiteLink } from "@/components/layout/RouteTransition";
import { CopyProjectLink } from "@/components/ui/CopyProjectLink";
import { Arrow, PageHeading } from "@/components/ui/Editorial";
import { ProjectCover } from "@/components/media/ProjectCover";
import { MediaGallery } from "@/components/media/MediaGallery";
import { getProjectMedia, getAchievementMedia } from "@/lib/media";
import { achievements, getProjectBySlug, getPublishedProjects, getRelatedProjects } from "@/lib/content";

export const dynamicParams=false;
type Props = { params: Promise<{ slug: string; locale: string }> };

export function generateStaticParams() { return getPublishedProjects().map(project => ({ slug: project.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProjectBySlug((await params).slug);
  return localizedMetadata(requireLocale((await params).locale),`/projects/${(await params).slug}`,{ title: project?.title ?? "Proyek tidak ditemukan", description: project?.summary });
}
export default async function ProjectDetail({ params }: Props) {
  const locale=requireLocale((await params).locale); const t=serverTranslator(locale);
  const project = getProjectBySlug((await params).slug);
  if (!project) notFound();
  const catalog = getPublishedProjects();
  const index = catalog.findIndex(item => item.slug === project.slug);
  const previous = catalog[index - 1];
  const next = catalog[index + 1];
  const related = getRelatedProjects(project);
  const awards = achievements.filter(award => award.projectSlug === project.slug);
  const media = getProjectMedia(project.slug);
  return translateTree(<div className="wrap"><PageMotion profile="detail"/><nav className="breadcrumb" aria-label="Jejak navigasi"><SiteLink href="/">Home</SiteLink><span aria-hidden="true"> / </span><SiteLink href="/projects">Projects</SiteLink><span aria-hidden="true"> / </span><span aria-current="page">{project.title}</span></nav><PageHeading locale={locale} eyebrow={project.categories.join(" / ")} description={project.subtitle}>{project.title}</PageHeading>
    {media.length ? <MediaGallery items={media} label={`Dokumentasi ${project.title}`}/> : <ProjectCover locale={locale} project={project}/>}
    <dl className="project-facts"><div><dt>Lingkup proyek</dt><dd>{project.context}</dd></div>{project.year && <div><dt>Tahun</dt><dd>{project.year}</dd></div>}{project.role && <div><dt>Peran Rehan</dt><dd>{project.role}</dd></div>}{project.status && <div><dt>Status</dt><dd>{project.status}</dd></div>}</dl>
    <section className="detail-section"><p className="eyebrow accent">{project.format === "summary" ? "Tentang proyek" : "01 / Tentang proyek"}</p><div className="reading"><h2>{project.subtitle}</h2><p>{project.summary}</p><p>{project.approach}</p></div></section>
    {!!project.technologies.length && <section className="detail-section"><p className="eyebrow accent">Teknologi</p><div className="reading"><h2>Teknologi yang digunakan.</h2><ul className="technology-list">{project.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul><p className="meta">Teknologi yang digunakan pada proyek ini, termasuk pengembangan bersama tim.</p></div></section>}
    {!!awards.length && <section className="detail-section"><p className="eyebrow accent">Penghargaan tim</p><div className="reading">{awards.map(award => <div key={award.id}><h2>{award.result}</h2><p>{award.additional} · {award.event} {award.year}</p><p>Tim {award.team}</p><MediaGallery items={getAchievementMedia(award.id)} label={`Penghargaan ${project.title}`} compact/><a href={award.source} target="_blank" rel="noopener noreferrer" className="text-link">Baca liputan <Arrow/></a></div>)}</div></section>}
    <section className="detail-section"><p className="eyebrow accent">Informasi tambahan</p><div className="reading"><p>{project.limitation}</p>{project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-link">Buka website proyek <Arrow/></a>}<CopyProjectLink/></div></section>
    {!!related.length && <section className="section" aria-labelledby="related-heading"><p className="eyebrow accent">Related projects</p><h2 id="related-heading">Karya terkait.</h2><ul className="related-projects">{related.map(item => <li key={item.slug}><SiteLink href={`/projects/${item.slug}`} prefetch={false} className="text-link">{item.title} <Arrow/></SiteLink></li>)}</ul></section>}
    <nav className="project-pagination section" aria-label="Urutan proyek">{previous && <SiteLink href={`/projects/${previous.slug}`} prefetch={false} className="text-link"><span><small>Sebelumnya</small>{previous.title}</span><Arrow/></SiteLink>}{next && <SiteLink href={`/projects/${next.slug}`} prefetch={false} className="text-link"><span><small>Berikutnya</small>{next.title}</span><Arrow/></SiteLink>}<SiteLink href="/projects" className="text-link">Semua proyek <Arrow/></SiteLink></nav>
  </div>,t,locale);
}
