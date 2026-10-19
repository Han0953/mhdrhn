"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { resolveNavigation } from "@/lib/navigation";
import { createRouteWipe } from "@/lib/route-motion";

const TransitionContext = createContext<(href: string) => void>(() => {});

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const layer = useRef<HTMLDivElement>(null);
  const pending = useRef<string | null>(null);
  const previous = useRef(pathname);
  const wipe = useRef<ReturnType<typeof createRouteWipe> | null>(null);

  const begin = useCallback((href: string) => {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname === window.location.pathname || url.hash) return;
    pending.current = url.pathname;
    const movement = resolveNavigation(window.location.pathname, url.pathname);
    if (layer.current) layer.current.dataset.kind = movement.kind;
    wipe.current?.play(movement.direction);
  }, []);

  useEffect(() => {
    const controller = createRouteWipe(() => layer.current, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    wipe.current = controller;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreference = () => { if (media.matches) controller.clear(); };
    const onHidden = () => { if (document.hidden) controller.clear(); };
    const onHistory = () => {
      pending.current = null;
      const movement = resolveNavigation(previous.current, window.location.pathname);
      if (layer.current) layer.current.dataset.kind = movement.kind;
      controller.play(movement.direction, true);
    };
    media.addEventListener("change", onPreference);
    window.addEventListener("popstate", onHistory);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      controller.clear();
      wipe.current = null;
      media.removeEventListener("change", onPreference);
      window.removeEventListener("popstate", onHistory);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, []);

  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    const requested = pending.current === pathname;
    pending.current = null;
    // Router owns history/scroll. Only fill a missing focus target for a new Link navigation.
    if (requested && !document.querySelector("main")?.contains(document.activeElement)) {
      document.querySelector<HTMLElement>("main h1, main")?.focus({ preventScroll: true });
    }
  }, [pathname]);

  return <TransitionContext value={begin}>{children}<div className="route-transition-viewport" aria-hidden="true"><div className="route-wipe" ref={layer}/></div></TransitionContext>;
}

function SlowLinkStatus() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setVisible(true), 1200); return () => clearTimeout(timer); }, []);
  return visible ? <span className="navigation-notice" role="status">Halaman sedang dibuka. Navigasi tetap tersedia.</span> : null;
}
function LinkPendingStatus() {
  const { pending } = useLinkStatus();
  return pending ? <SlowLinkStatus/> : null;
}

export function SiteLink({ href, onNavigate, children, ...props }: ComponentProps<typeof Link>) {
  const begin = useContext(TransitionContext);
  return <Link href={href} {...props} onNavigate={event => {
    let cancelled = false;
    onNavigate?.({ preventDefault() { cancelled = true; event.preventDefault(); } });
    if (!cancelled && typeof href === "string") begin(href);
  }}>{children}<LinkPendingStatus/></Link>;
}
