import { OriginLink } from "@/components/ui/OriginAction";
import {localizedMetadata} from "@/i18n/metadata";
import { serverTranslator } from "@/i18n/server";
import { translateTree } from "@/i18n/translate";
import { requireLocale } from "@/i18n/config";
import type { Metadata } from "next";
import { PageMotion } from "@/components/motion/PageMotion";
import Link from "next/link";
import { ProjectFilters } from "@/components/projects/ProjectFilters";
import { PageHeading, ProjectSpread, Arrow } from "@/components/ui/Editorial";
import { SiteLink } from "@/components/layout/RouteTransition";
import { categories, filterProjectList, getLiveProjects, projectStatuses, projectStatusLabels } from "@/lib/content";
import { ProjectCover } from "@/components/media/ProjectCover";
const pageMetadata: Metadata = { title: "Proyek", description: "Jelajahi karya Muhammad Rehan beserta gagasan dan proses yang menyertainya. Temukan proyek yang ingin dikenal lebih jauh melalui pencarian dan kategori." };
export default async function Projects({ params: localeParams, searchParams }: { params: Promise<{locale:string}>; searchParams: Promise<{ category?: string; q?: string; status?: string }> }) {
  const locale=requireLocale((await localeParams).locale); const t=serverTranslator(locale);
  const params = await searchParams;
  const category = categories.find(item => item === params.category) ?? "Semua";
  const query = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const status = projectStatuses.find(item => item === params.status) ?? "Semua";
  const projectList = await getLiveProjects();
  const projects = filterProjectList(projectList, category, query, status, t);
  const featured = projects.filter(project => project.featured !== undefined);
  const archive = projects.filter(project => project.featured === undefined);
  return translateTree(<div className="wrap"><PageMotion profile="projects"/><PageHeading locale={locale} eyebrow="Project index" description="Tempat saya membagikan karya beserta gagasan dan proses yang menyertainya. Gunakan kategori dan pencarian untuk menjelajahi proyek yang ingin kamu kenal lebih jauh.">Proyek &amp;<br/>eksperimen</PageHeading>
    <section aria-label="Katalog karya" className="project-index">
      <div className="catalog-controls"><nav className="filters" aria-label="Filter kategori proyek">{categories.map(item => <Link key={item} href={{ pathname: "/projects", query: { ...(item !== "Semua" ? { category: item } : {}), ...(query ? { q: query } : {}), ...(status !== "Semua" ? { status } : {}) } }} scroll={false} aria-current={category === item ? "page" : undefined}>{item}</Link>)}</nav><ProjectFilters category={category} query={query} status={status}/></div>
      <div className="catalog-feedback"><p className="meta result-count" role="status">{projects.length} proyek ditemukan{query ? ` ${t("untuk")} “${query}”` : ""}{category !== "Semua" ? ` · ${category}` : ""}{status !== "Semua" ? ` · ${t(projectStatusLabels[status])}` : ""}</p>{(category !== "Semua" || query || status !== "Semua") && <Link href="/projects" scroll={false} className="text-link">Hapus semua filter</Link>}</div>
      <div className="catalog-results" key={`${category}:${query}:${status}`} data-results-key={`${category}:${query}:${status}`}>
      {!!featured.length && <section aria-labelledby="featured-projects"><h2 id="featured-projects" className="sr-only">Karya pilihan</h2>{featured.map((project, i) => <ProjectSpread locale={locale} key={project.slug} project={project} number={i + 1}/>)}</section>}
      {!!archive.length && <section className="project-archive" aria-labelledby="archive-heading"><p className="eyebrow accent">Project archive</p><h2 id="archive-heading">Proyek lainnya.</h2>{archive.map((project, i) => <article className="archive-row archive-row--media" key={project.slug}><span className="meta archive-number">{String(i + 1).padStart(2, "0")}</span><div className="archive-thumbnail"><ProjectCover locale={locale} project={project} preview sizes="(max-width: 767px) 64px, 144px"/></div><div><h3><SiteLink href={`/projects/${project.slug}`}>{project.title}</SiteLink></h3><p className="meta">{project.categories.join(" / ")}{project.year ? ` · ${project.year}` : ""}</p></div><SiteLink href={`/projects/${project.slug}`} className="icon-button" aria-label={`Lihat proyek ${project.title}`}><Arrow/></SiteLink></article>)}</section>}
      {!projects.length && <div className="empty-state"><h2>Proyek tidak ditemukan.</h2><p>Coba kata kunci lain, ubah kategori, atau hapus filter untuk melihat semua proyek.</p><OriginLink href="/projects" transition={false}>Hapus filter</OriginLink></div>}
      </div>
    </section></div>,t,locale);
}

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{return localizedMetadata(requireLocale((await params).locale),"/projects",pageMetadata);}
