import { serverTranslator } from "@/i18n/server";
import { translateTree } from "@/i18n/translate";
import { type Locale } from "@/i18n/config";
import { DisplayLines } from "@/components/motion/DisplayLines";
import { ArrowUpRight } from "lucide-react";
import { SiteLink } from "@/components/layout/RouteTransition";
import type { Project } from "@/lib/content";
import type { ReactNode } from "react";
import { ProjectCover } from "@/components/media/ProjectCover";
export function Arrow() { return <ArrowUpRight size={20} aria-hidden="true" />; }
export function PageHeading({ locale="id", eyebrow, children, description }: { locale?:Locale; eyebrow: string; children: ReactNode; description?: string }) {
  const t=serverTranslator(locale);
  const hasPunctuation = typeof children === "string" && /[.!?]$/.test(children.trim());
  return translateTree(<header className="page-heading"><p className="eyebrow accent">{eyebrow}</p><h1 tabIndex={-1}><DisplayLines>{children}{!hasPunctuation && <span className="accent">.</span>}</DisplayLines></h1>{description && <p className="page-description">{description}</p>}</header>,t,locale);
}
export function ProjectArt({ locale="id", kind, title, variant = "documented" }: { locale?:Locale; kind: Project["visual"]; title: string; variant?: "documented" | "preview" }) {
  const t=serverTranslator(locale);
  const preview = variant === "preview";
  return translateTree(<figure className={`project-art art-${kind}${preview ? " project-art--preview" : ""}`} aria-hidden={preview || undefined}>
    {!preview && <div className="art-top"><span>FIELD NOTES / {kind === "aura" ? "02" : kind === "portal" ? "03" : "01"}</span><span>mhdrhn.</span></div>}
    <svg viewBox="0 0 700 390" aria-hidden="true" focusable="false">
      {kind === "aura" ? <>
        <g fill="none" stroke="currentColor" strokeWidth="1.5"><ellipse cx="350" cy="90" rx="125" ry="38"/><path d="M225 90V280C225 330 475 330 475 280V90M225 160C225 210 475 210 475 160M225 225C225 275 475 275 475 225M350 50V330M150 330H550"/></g>
        <path className="diagram-line" d="M100 240H200V115H350V280H590" strokeWidth="11"/><g className="diagram-dot"><circle cx="100" cy="240" r="12"/><circle cx="590" cy="280" r="12"/></g>
      </> : kind === "portal" ? <>
        <g fill="none" stroke="currentColor" strokeWidth="2"><rect x="80" y="65" width="430" height="250"/><path d="M80 110H510M110 150H270M110 175H225M110 225H270M110 250H225"/><rect x="350" y="150" width="265" height="190"/></g>
        <path className="diagram-line" d="M145 290H310V190H550" strokeWidth="12"/>{!preview && <text x="400" y="280" className="art-letter">PV.</text>}
      </> : <>
        <path d="M80 65H620V325H80ZM80 130H620M80 195H620M80 260H620M170 65V325M260 65V325M350 65V325M440 65V325M530 65V325" fill="none" stroke="currentColor" opacity=".18"/>
        <path className="diagram-line" d="M115 275H210V110H390V235H580" strokeWidth="14"/>
        <g className="diagram-components" strokeWidth="3"><rect x="285" y="145" width="130" height="130"/><circle cx="115" cy="275" r="18"/><circle cx="580" cy="235" r="18"/></g>{!preview && <text x="310" y="227" className="art-letter">{kind === "research" ? "IoT" : "V."}</text>}
      </>}
    </svg>{!preview && <figcaption>{title} · Visual konsep · dokumentasi produk belum tersedia</figcaption>}
  </figure>,t,locale);
}
export function ProjectSpread({ locale="id", project, number, className = "", showRole = false }: { locale?:Locale; project: Project; number: number; className?: string; showRole?: boolean }) {
  const t=serverTranslator(locale);
  return translateTree(<article className={`project-spread ${className}`}><SiteLink href={`/projects/${project.slug}`} className="art-link" aria-label={`Lihat proyek ${project.title}`}><ProjectCover locale={locale} project={project}/></SiteLink><div className="project-copy"><span className="project-number">{String(number).padStart(2, "0")}</span><p className="eyebrow">{project.categories.join(" / ")}</p><h3><SiteLink href={`/projects/${project.slug}`}>{project.title}</SiteLink></h3><p className="meta">{[project.year, project.context].filter(Boolean).join(" · ")}</p><p>{project.summary}</p>{showRole && project.role && <p className="meta project-role">Peran Rehan · {project.role}</p>}<SiteLink className="text-link" href={`/projects/${project.slug}`}>Jelajahi proyek <Arrow/></SiteLink></div></article>,t,locale);
}
