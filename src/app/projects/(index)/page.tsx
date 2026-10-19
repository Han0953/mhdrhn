import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading, ProjectSpread, Arrow } from "@/components/ui/Editorial";
import { SiteLink } from "@/components/layout/RouteTransition";
import { categories, filterProjects } from "@/lib/content";
export const metadata: Metadata = { title: "Projects", description: "Karya pilihan Muhammad Rehan: web, IoT, dan penelitian teknologi." };
export default async function Projects({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const params = await searchParams;
  const category = categories.find(item => item === params.category) ?? "Semua";
  const query = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const projects = filterProjects(category, query);
  const featured = projects.filter(project => project.featured !== undefined);
  const archive = projects.filter(project => project.featured === undefined);
  return <div className="wrap"><PageHeading eyebrow="Project index" description="Berbagai cara mempertemukan benda, kode, dan kebutuhan nyata.">Selected<br/>works</PageHeading>
    <section aria-label="Katalog karya" className="project-index">
      <div className="catalog-controls"><nav className="filters" aria-label="Filter kategori proyek">{categories.map(item => <Link key={item} href={{ pathname: "/projects", query: { ...(item !== "Semua" ? { category: item } : {}), ...(query ? { q: query } : {}) } }} scroll={false} aria-current={category === item ? "page" : undefined}>{item}</Link>)}</nav><form action="/projects" className="search-form"><label htmlFor="project-search" className="sr-only">Cari proyek</label>{category !== "Semua" && <input type="hidden" name="category" value={category}/>}<input id="project-search" name="q" placeholder="Cari karya…" defaultValue={query} key={query} maxLength={100} type="search"/><button type="submit">Cari</button></form></div>
      <p className="meta result-count" role="status">{projects.length} karya ditampilkan{query ? ` untuk “${query}”` : ""}</p>
      {!!featured.length && <section aria-labelledby="featured-projects"><h2 id="featured-projects" className="sr-only">Karya pilihan</h2>{featured.map((project, i) => <ProjectSpread key={project.slug} project={project} number={i + 1}/>)}</section>}
      {!!archive.length && <section className="project-archive" aria-labelledby="archive-heading"><p className="eyebrow accent">Project notes</p><h2 id="archive-heading">Catatan karya lainnya.</h2>{archive.map((project, i) => <article className="archive-row" key={project.slug}><span className="meta">{String(i + 1).padStart(2, "0")}</span><div><h3><SiteLink href={`/projects/${project.slug}`}>{project.title}</SiteLink></h3><p className="meta">{project.categories.join(" / ")}{project.year ? ` · ${project.year}` : ""}</p></div><SiteLink href={`/projects/${project.slug}`} className="icon-button" aria-label={`Lihat proyek ${project.title}`}><Arrow/></SiteLink></article>)}</section>}
      {!projects.length && <div className="empty-state"><h2>Belum ada yang cocok.</h2><p>Coba kata lain atau tampilkan kembali seluruh karya.</p><Link href="/projects" className="button-primary">Reset pencarian</Link></div>}
    </section></div>;
}
