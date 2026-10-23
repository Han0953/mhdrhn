import type { MetadataRoute } from "next";
import { configuredOrigin } from "@/i18n/metadata";
import { localeHref } from "@/i18n/config";
import { getPublishedProjects } from "@/lib/content";
/** Remains empty until the owner supplies a production origin. */
export default function sitemap(): MetadataRoute.Sitemap {
 const origin=configuredOrigin();if(!origin)return [];
 const paths=['/','/about','/projects','/experience','/lab','/achievements','/contact',...getPublishedProjects().map(p=>`/projects/${p.slug}`)];
 return paths.flatMap(path=>(['id','en'] as const).map(locale=>({url:new URL(localeHref(path,locale),origin).href,alternates:{languages:{id:new URL(localeHref(path,'id'),origin).href,en:new URL(localeHref(path,'en'),origin).href}}})));
}
