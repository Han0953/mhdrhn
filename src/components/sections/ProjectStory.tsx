import { SiteLink } from "@/components/layout/RouteTransition";
import { Arrow, ProjectArt } from "@/components/ui/Editorial";
import { Cpu, Radio, CircuitBoard, Wind, House } from "lucide-react";
import type { Project } from "@/lib/content";
import { ProjectStoryViewport } from "./ProjectStoryViewport";
import { projectPreviewSummaries } from "@/lib/home-content";

export function ProjectStory({ id, number, title, intro, projects, href, linkLabel }: {
  id: "latest" | "electronics"; number: string; title: string; intro: string;
  projects: readonly Project[]; href: string; linkLabel: string;
}) {
  return <section className={`section home-project-story story-${id}`} data-home-section={id === "latest" ? "latest-projects" : "electronics-projects"} aria-labelledby={`${id}-heading`}>
    <ProjectStoryViewport id={id} titles={projects.map(project => project.title)} overview={<>
      <div className="story-heading"><div><p className="eyebrow accent">{number} / {id === "latest" ? "Latest projects" : "Electronics & IoT"}</p><h2 id={`${id}-heading`}>{title}</h2></div><SiteLink href={href} className="text-link">{linkLabel} <Arrow/></SiteLink></div>
      <p className="story-intro meta">{intro}</p>
    </>}>
      <div className="story-viewport" tabIndex={0} role="region" aria-label={`Lima proyek ${id === "latest" ? "terbaru" : "elektronika"}; geser atau gunakan tombol nomor`}>
        <ol className="story-track">{projects.map((project, index) => {
          const Icon = [Radio, Wind, House, CircuitBoard, Cpu][index];
          return <li className="story-card" id={`${id}-project-${index}`} key={project.slug} data-project-slug={project.slug}>
            <div className="story-card-top"><span className="eyebrow accent">{String(index + 1).padStart(2, "0")} / 05</span></div>
            {id === "latest" ? <ProjectArt kind={project.visual} title={project.title} variant="preview"/> : <figure className="electronics-mark" aria-hidden="true"><Icon size={64} strokeWidth={1} aria-hidden="true"/></figure>}
            <div className="story-copy">
            <p className="eyebrow story-category">{project.categories.join(" / ")}</p>
            <h3><SiteLink href={`/projects/${project.slug}`}>{project.title}</SiteLink></h3>
            <p className="story-summary">{projectPreviewSummaries[project.slug] ?? project.summary}</p>
            {project.role && <p className="meta story-context">{project.context}</p>}
            <SiteLink className="text-link" href={`/projects/${project.slug}`} aria-label={`Jelajahi proyek ${project.title}`}>Jelajahi proyek <Arrow/></SiteLink>
            </div>
          </li>;
        })}</ol>
      </div>
    </ProjectStoryViewport>
  </section>;
}
