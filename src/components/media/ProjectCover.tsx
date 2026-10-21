import type { Project } from "@/lib/content";
import { getProjectMedia } from "@/lib/media";
import { MediaImage } from "./MediaImage";

function EditorialCover({ project }: { project: Project }) {
  return <div className="editorial-cover"><span className="eyebrow">{project.categories.join(" / ")}</span><strong>{project.title}</strong><span className="cover-signal" aria-hidden="true"/></div>;
}
export function ProjectCover({ project, preview = false, sizes }: { project: Project; preview?: boolean; sizes?: string }) {
  const media = getProjectMedia(project.slug)[0];
  return <figure className={`project-media${preview ? " project-media--preview" : ""}`} data-media-project={project.slug} data-media-status={media ? "available" : "fallback"}>
    <div className="media-frame">{media ? <MediaImage media={media} sizes={sizes ?? (preview ? "(max-width: 767px) 100vw, 520px" : "(max-width: 767px) 100vw, 65vw")} fallback={<EditorialCover project={project}/>}/> : <EditorialCover project={project}/>}</div>
    {!preview && <figcaption>{media ? media.caption : "Visual editorial"}</figcaption>}
  </figure>;
}
