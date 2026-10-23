import {logicalPath} from "../i18n/config";
/** The shared order for header, footer, and directional navigation. */
export const navigation = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/lab", label: "Lab" },
  { href: "/achievements", label: "Achievements" },
  { href: "/contact", label: "Contact" },
] as const;

export type NavigationDirection = -1 | 0 | 1;
export type NavigationKind = "section" | "detail" | "return" | "peer" | "none";
export interface NavigationProject { slug: string; title: string }
export type NavigationHref = string | { pathname?: string | null; query?: string | Record<string, unknown> | null; hash?: string | null; host?: string | null; hostname?: string | null; protocol?: string | null };

/** URL objects requiring host formatting stay with native Next Link. */
export function resolveInternalHref(href: NavigationHref, current: string): URL | null {
  try {
    let value: string;
    if (typeof href === "string") value = href;
    else {
      if (href.host || href.hostname || href.protocol) return null;
      const query = new URLSearchParams(typeof href.query === "string" ? href.query : undefined);
      if (href.query && typeof href.query !== "string") for (const [key, item] of Object.entries(href.query)) {
        for (const entry of Array.isArray(item) ? item : [item]) if (entry !== undefined && entry !== null) query.append(key, String(entry));
      }
      value = `${href.pathname ?? ""}${query.size ? `?${query}` : ""}${href.hash ? `#${href.hash.replace(/^#/, "")}` : ""}`;
    }
    const from = new URL(current), to = new URL(value, from);
    return to.origin === from.origin && to.pathname !== from.pathname && !to.hash ? to : null;
  } catch { return null; }
}

export function navigationLabel(path: string, projects: readonly NavigationProject[] = []) {
  const project = projects.find(item => normalize(path) === `/projects/${item.slug}`);
  return project?.title ?? navigation[getNavigationIndex(path)]?.label ?? "Halaman";
}

function normalize(path: string) {
  return logicalPath(path.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/");
}

export function getNavigationIndex(path: string): number {
  const pathname = normalize(path);
  return navigation.findIndex(route => pathname === route.href || (route.href !== "/" && pathname.startsWith(`${route.href}/`)));
}

export function resolveNavigation(from: string, to: string, projects: readonly NavigationProject[] = []): { direction: NavigationDirection; kind: NavigationKind } {
  const source = normalize(from);
  const target = normalize(to);
  if (source === target) return { direction: 0, kind: "none" };
  const sourceIndex = getNavigationIndex(source);
  const targetIndex = getNavigationIndex(target);
  if (sourceIndex < 0 || targetIndex < 0) return { direction: 0, kind: "none" };
  if (sourceIndex !== targetIndex) return { direction: targetIndex > sourceIndex ? 1 : -1, kind: "section" };
  if (source === "/projects") return { direction: 1, kind: "detail" };
  if (target === "/projects") return { direction: -1, kind: "return" };
  const sourceProject = projects.findIndex(item => source === `/projects/${item.slug}`);
  const targetProject = projects.findIndex(item => target === `/projects/${item.slug}`);
  return { direction: sourceProject >= 0 && targetProject >= 0 ? (targetProject > sourceProject ? 1 : -1) : 0, kind: "peer" };
}
