"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { getNavigationIndex, navigation, resolveNavigation } from "@/lib/navigation";
import { createRouteWipe } from "@/lib/route-motion";
import { awaitRouteAssets } from "@/lib/route-readiness";

const TransitionContext = createContext<(href: string) => void>(() => {});
const ReadyContext = createContext<(path: string) => void>(() => {});

export function RouteReady() {
  const ready = useContext(ReadyContext);
  const pathname = usePathname();
  useEffect(() => ready(pathname), [ready, pathname]);
  return null;
}

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const layer = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const pending = useRef<{ id: number; path: string; abort: AbortController; focus: HTMLElement | null } | null>(null);
  const previous = useRef(pathname);
  const wipe = useRef<ReturnType<typeof createRouteWipe> | null>(null);

  const start = useCallback((path: string, from: string, history = false) => {
    pending.current?.abort.abort();
    pending.current = null;
    document.querySelectorAll<HTMLDialogElement>("#site-menu[open], #azura-dialog[open]").forEach(dialog => dialog.close());
    const movement = resolveNavigation(from, path);
    if (layer.current) layer.current.dataset.kind = movement.kind;
    const focus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const id = wipe.current?.play(movement.direction, history, navigation[getNavigationIndex(path)]?.label ?? "Halaman");
    if (id) pending.current = { id, path, abort: new AbortController(), focus };
  }, []);
  const begin = useCallback((href: string) => {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
    start(url.pathname, window.location.pathname);
  }, [start]);
  const ready = useCallback((path: string) => {
    const request = pending.current;
    if (!request || request.path !== path) return;
    void awaitRouteAssets(document.querySelector("main"), request.abort.signal).then(settled => {
      if (settled && pending.current === request) wipe.current?.ready(request.id);
    });
  }, []);

  useEffect(() => {
    const controller = createRouteWipe(() => layer.current, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, (active, completed) => {
      if (content.current) content.current.inert = active;
      if (active) viewport.current?.focus({ preventScroll: true });
      else {
        const request = pending.current;
        pending.current = null;
        request?.abort.abort();
        if (completed) document.querySelector<HTMLElement>("main h1, main")?.focus({ preventScroll: true });
        else if (request?.focus?.isConnected) request.focus.focus({ preventScroll: true });
      }
    });
    wipe.current = controller;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreference = () => controller.preferenceChanged();
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") controller.clear(); };
    const onHistory = () => {
      start(window.location.pathname, previous.current, true);
    };
    media.addEventListener("change", onPreference);
    window.addEventListener("popstate", onHistory);
    document.addEventListener("keydown", onEscape);
    return () => {
      controller.clear();
      wipe.current = null;
      media.removeEventListener("change", onPreference);
      window.removeEventListener("popstate", onHistory);
      document.removeEventListener("keydown", onEscape);
      pending.current?.abort.abort();
    };
  }, [start]);

  useEffect(() => {
    previous.current = pathname;
  }, [pathname]);

  return <TransitionContext value={begin}><ReadyContext value={ready}><div ref={content}>{children}</div></ReadyContext>
    <div className="route-transition-viewport" ref={viewport} tabIndex={-1} aria-hidden="true" aria-label="Transisi halaman">
      <div className="route-wipe" ref={layer}>
        <span className="route-title" aria-hidden="true"/>
        <span className="sr-only" role="status"/>
        <div className="route-recovery">Halaman membutuhkan waktu lebih lama. Tekan Escape atau tutup tampilan ini untuk kembali ke navigasi.
          <button type="button" onClick={() => wipe.current?.clear()}>Kembali ke navigasi</button>
        </div>
      </div>
    </div>
  </TransitionContext>;
}

function SlowLinkStatus() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setVisible(true), 1200); return () => clearTimeout(timer); }, []);
  return visible ? <span className="navigation-notice" role="status">Sedang membuka halaman… Kamu tetap bisa memakai navigasi.</span> : null;
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
