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

function normalize(path: string) {
  return path.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
}

export function getNavigationIndex(path: string): number {
  const pathname = normalize(path);
  return navigation.findIndex(route => pathname === route.href || (route.href !== "/" && pathname.startsWith(`${route.href}/`)));
}

export function resolveNavigation(from: string, to: string): { direction: NavigationDirection; kind: NavigationKind } {
  const source = normalize(from);
  const target = normalize(to);
  if (source === target) return { direction: 0, kind: "none" };
  const sourceIndex = getNavigationIndex(source);
  const targetIndex = getNavigationIndex(target);
  if (sourceIndex < 0 || targetIndex < 0) return { direction: 0, kind: "none" };
  if (sourceIndex !== targetIndex) return { direction: targetIndex > sourceIndex ? 1 : -1, kind: "section" };
  if (source === "/projects") return { direction: 1, kind: "detail" };
  if (target === "/projects") return { direction: -1, kind: "return" };
  return { direction: 0, kind: "peer" };
}
