export const locales = ["id", "en"] as const;
export type Locale = typeof locales[number];
export function isLocale(value: string): value is Locale { return value === "id" || value === "en"; }
export function localeFromPath(path: string): Locale { return /^\/en(?:\/|$)/.test(path) ? "en" : "id"; }
export function logicalPath(path: string) { return (path.replace(/^\/(?:en|id)(?=\/|$)/, "") || "/"); }
export function localeHref(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//") || /^\/(?:_next|api)(?:\/|$)/.test(href) || /\.[a-z0-9]+(?:[?#]|$)/i.test(href)) return href;
  const split=href.search(/[?#]/), path=logicalPath(split<0?href:href.slice(0,split)),suffix=split<0?"":href.slice(split);
  return (locale === "en" ? `/en${path === "/" ? "" : path}` : path)+suffix;
}
export function requireLocale(value:string):Locale {if(!isLocale(value))throw new Error("Unsupported locale");return value;}
