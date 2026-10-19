import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteLink } from "@/components/layout/RouteTransition";
import { CopyProjectLink } from "@/components/ui/CopyProjectLink";
import { Arrow, PageHeading, ProjectArt } from "@/components/ui/Editorial";
import { achievements, getProjectBySlug, getPublishedProjects, getRelatedProjects } from "@/lib/content";
type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return getPublishedProjects().map(project => ({ slug: project.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProjectBySlug((await params).slug);
  return { title: project?.title ?? "Proyek tidak ditemukan", description: project?.summary };
}
export default async function ProjectDetail({ params }: Props) {
  const project = getProjectBySlug((await params).slug);
  if (!project) notFound();
  const catalog = getPublishedProjects();
  const index = catalog.findIndex(item => item.slug === project.slug);
  const previous = catalog[index - 1];
  const next = catalog[index + 1];
  const related = getRelatedProjects(project);
  const awards = achievements.filter(award => award.projectSlug === project.slug);
  return <div className="wrap"><nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href="/">Home</SiteLink><span aria-hidden="true"> / </span><SiteLink href="/projects">Projects</SiteLink><span aria-hidden="true"> / </span><span aria-current="page">{project.title}</span></nav><PageHeading eyebrow={project.categories.join(" / ")} description={project.subtitle}>{project.title}</PageHeading>
    {project.format !== "summary" && <ProjectArt kind={project.visual} title={project.title}/>}
    <dl className="project-facts"><div><dt>Konteks</dt><dd>{project.context}</dd></div>{project.year && <div><dt>Tahun</dt><dd>{project.year}</dd></div>}{project.role && <div><dt>Peran Rehan</dt><dd>{project.role}</dd></div>}{project.status && <div><dt>Status publik</dt><dd>{project.status}</dd></div>}</dl>
    <section className="detail-section"><p className="eyebrow accent">{project.format === "summary" ? "Catatan ringkas" : "01 / Gagasan"}</p><div className="reading"><h2>{project.subtitle}</h2><p>{project.summary}</p><p>{project.approach}</p></div></section>
    {!!project.technologies.length && <section className="detail-section"><p className="eyebrow accent">Teknologi</p><div className="reading"><h2>Bagian dari sistem.</h2><ul className="technology-list">{project.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul><p className="meta">Teknologi mengikuti catatan proyek. Daftar ini tidak menyatakan seluruh implementasi dikerjakan secara individu.</p></div></section>}
    {!!awards.length && <section className="detail-section"><p className="eyebrow accent">Pengakuan tim</p><div className="reading">{awards.map(award => <div key={award.id}><h2>{award.result}</h2><p>{award.additional} · {award.event} {award.year}</p><p>Tim {award.team}</p><a href={award.source} target="_blank" rel="noopener noreferrer" className="text-link">Baca publikasi <Arrow/></a></div>)}</div></section>}
    <section className="detail-section"><p className="eyebrow accent">Batas konteks</p><div className="reading"><p>{project.limitation}</p>{project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-link">Kunjungi website proyek <Arrow/></a>}<CopyProjectLink/></div></section>
    {!!related.length && <section className="section" aria-labelledby="related-heading"><p className="eyebrow accent">Explore the connections</p><h2 id="related-heading">Karya terkait.</h2><ul className="related-projects">{related.map(item => <li key={item.slug}><SiteLink href={`/projects/${item.slug}`} prefetch={false} className="text-link">{item.title} <Arrow/></SiteLink></li>)}</ul></section>}
    <nav className="project-pagination section" aria-label="Urutan proyek">{previous && <SiteLink href={`/projects/${previous.slug}`} prefetch={false} className="text-link"><span><small>Sebelumnya</small>{previous.title}</span><Arrow/></SiteLink>}{next && <SiteLink href={`/projects/${next.slug}`} prefetch={false} className="text-link"><span><small>Berikutnya</small>{next.title}</span><Arrow/></SiteLink>}<SiteLink href="/projects" className="text-link">Kembali ke seluruh karya <Arrow/></SiteLink></nav>
  </div>;
}
