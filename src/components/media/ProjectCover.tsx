import { serverTranslator } from "@/i18n/server";
import { translateTree } from "@/i18n/translate";
import { type Locale } from "@/i18n/config";
import type { Project } from "@/lib/content";
import { getMediaDimensions, getProjectMedia } from "@/lib/media";
import { MediaImage } from "./MediaImage";
import { ProjectGraphic } from "./ProjectGraphic";

function EditorialCover({ locale="id", project }: { locale?:Locale; project: Project }) {
  const t=serverTranslator(locale);
  return translateTree(<div className="editorial-cover"><span className="eyebrow">{project.categories.join(" / ")}</span><strong>{project.title}</strong><span className="cover-signal" aria-hidden="true"/></div>,t,locale);
}
export function ProjectCover({ locale="id", project, preview = false, graphicFallback = false, landscapePreview = false, sizes }: { locale?:Locale; project: Project; preview?: boolean; graphicFallback?: boolean; landscapePreview?: boolean; sizes?: string }) {
  const t=serverTranslator(locale);
  const media = getProjectMedia(project.slug)[0];
  const fallback = graphicFallback ? <ProjectGraphic project={project}/> : <EditorialCover locale={locale} project={project}/>;
  const dimensions = media ? getMediaDimensions(media) : undefined;
  const portrait = !!dimensions && dimensions.height > dimensions.width;
  return translateTree(<figure className={`project-media${preview ? " project-media--preview" : ""}${landscapePreview ? " project-media--landscape-preview" : ""}`} data-media-project={project.slug} data-media-status={media ? "available" : "fallback"} data-media-orientation={portrait ? "portrait" : "landscape"}>
    <div className="media-frame" style={portrait && !landscapePreview ? { aspectRatio: dimensions.width / dimensions.height } : undefined}>{media ? <MediaImage media={media} sizes={sizes ?? (preview ? "(max-width: 767px) 100vw, 560px" : "(max-width: 767px) 100vw, 65vw")} fallback={fallback}/> : fallback}</div>
    {!preview && <figcaption>{media ? media.caption : "Visual editorial"}</figcaption>}
  </figure>,t,locale);
}
