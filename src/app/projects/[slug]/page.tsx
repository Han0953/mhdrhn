import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteLink } from "@/components/layout/RouteTransition";
import { Arrow, PageHeading, ProjectArt } from "@/components/ui/Editorial";
import { achievements, getProjectBySlug, getPublishedProjects } from "@/lib/content";
type Props = { params: Promise<{ slug: string }> };
// The local catalog is finite: unknown slugs must be rejected before streaming.
export const dynamicParams = false;
export function generateStaticParams() { return getPublishedProjects().map(project => ({ slug: project.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProjectBySlug((await params).slug);
  return { title: project?.title ?? "Proyek tidak ditemukan", description: project?.summary };
}
export default async function ProjectDetail({ params }: Props) {
  const project = getProjectBySlug((await params).slug);
  if (!project) notFound();
  const awards = achievements.filter(award => award.projectSlug === project.slug);
  return <div className="wrap"><div className="breadcrumb"><SiteLink href="/projects">← Indeks karya</SiteLink></div><PageHeading eyebrow={project.categories.join(" / ")} description={project.subtitle}>{project.title}</PageHeading>
    <ProjectArt kind={project.visual} title={project.title}/>
    <dl className="project-facts"><div><dt>Konteks</dt><dd>{project.context}</dd></div>{project.year && <div><dt>Tahun</dt><dd>{project.year}</dd></div>}{project.role && <div><dt>Peran Rehan</dt><dd>{project.role}</dd></div>}</dl>
    <section className="detail-section"><p className="eyebrow accent">01 / Gagasan</p><div className="reading"><h2>{project.subtitle}</h2><p>{project.summary}</p><p>{project.approach}</p></div></section>
    <section className="detail-section"><p className="eyebrow accent">02 / Teknologi</p><div className="reading"><h2>Bagian dari sistem.</h2><ul className="technology-list">{project.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul><p className="meta">Teknologi mengikuti catatan proyek. Daftar ini tidak menyatakan seluruh implementasi dikerjakan secara individu.</p></div></section>
    {!!awards.length && <section className="detail-section"><p className="eyebrow accent">03 / Pengakuan tim</p><div className="reading">{awards.map(award => <div key={award.id}><h2>{award.result}</h2><p>{award.additional} · {award.event} {award.year}</p><p>Tim {award.team}</p><a href={award.source} target="_blank" rel="noopener noreferrer" className="text-link">Baca publikasi <Arrow/></a></div>)}</div></section>}
    <section className="detail-section"><p className="eyebrow accent">Catatan / Batas konteks</p><div className="reading"><p>{project.limitation}</p>{project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-link">Kunjungi website proyek <Arrow/></a>}</div></section>
    <div className="section section-heading"><h2>Masih ada<br/>cerita lainnya.</h2><SiteLink href="/projects" className="text-link">Kembali ke seluruh karya <Arrow/></SiteLink></div>
  </div>;
}
