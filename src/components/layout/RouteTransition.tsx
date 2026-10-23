"use client";
import { useTranslation } from "@/i18n/LocaleProvider";
import { translateTree } from "@/i18n/translate";


import {cancelLanguageChange,languageChangePending} from "@/i18n/language-motion";
import {localeHref} from "@/i18n/config";
import Link, { useLinkStatus } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import type { NavigationHref, NavigationProject } from "@/lib/navigation";
import { createRouteWipe } from "@/lib/route-motion";
import { createRouteSession, type RouteOptions } from "@/lib/route-session";
import { awaitRouteAssets } from "@/lib/route-readiness";
import { prefersReducedMotion, subscribeMotion } from "@/lib/motion/preferences";
import { prepareRouteEntrance, startRouteEntrance, settleRouteEntrance } from "@/lib/motion/entrance";

const TransitionContext = createContext<(href: NavigationHref, options?: RouteOptions) => boolean>(() => false);
const ReadyContext = createContext<(path: string, error?: boolean) => void>(() => {});
const noProjects: readonly NavigationProject[] = [];

export function RouteReady({ error = false }: { error?: boolean }) {
  const ready = useContext(ReadyContext);
  const pathname = usePathname();
  useEffect(() => ready(pathname, error), [ready, pathname, error]);
  return null;
}

export function RouteTransition({ children, projects = noProjects }: { children: ReactNode; projects?: readonly NavigationProject[] }) {
  const {locale,t}=useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const layer = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDialogElement>(null);
  const previous = useRef(pathname);
  const session = useRef<ReturnType<typeof createRouteSession> | null>(null);
  const begin = useCallback((href: NavigationHref, options?: RouteOptions) => {if(languageChangePending())cancelLanguageChange();return session.current?.intent(href, options) ?? false;}, []);
  const ready = useCallback((path: string, error = false) => session.current?.committed(path, error), []);

  useEffect(() => {
    const controller = createRouteWipe(() => layer.current, prefersReducedMotion, (active, completed) => {
      // A native top-layer curtain covers an open navigation dialog without closing it first.
      if (active && !viewport.current?.open) viewport.current?.showModal();
      if (!active) viewport.current?.close();
      if (content.current) { content.current.inert = active; content.current.setAttribute("aria-busy", String(active)); }
      if (active) viewport.current?.focus({ preventScroll: true });
      else {
        if (completed) startRouteEntrance(document.querySelector("main"));
        else settleRouteEntrance(document.querySelector("main"));
        const request = transaction?.complete();
        if (!request) return;
        if (completed && !request.history) {
          const target = document.querySelector<HTMLElement>("main");
          if (target) { if (!target.hasAttribute("tabindex")) target.tabIndex = -1; target.focus({ preventScroll: true }); }
        } else {
          const source = request.focus;
          const usable = source?.isConnected && source.getClientRects().length > 0 && !source.closest("[inert],dialog:not([open]),[aria-hidden='true']");
          const target = usable ? source : document.querySelector<HTMLElement>("main");
          target?.focus({ preventScroll: true });
        }
      }
    });
    const transaction = createRouteSession({
      wipe: controller, location: () => window.location.href, projects,
      enabled: () => !prefersReducedMotion() && !document.hidden && typeof layer.current?.animate === "function",
      navigate: (href, options) => {
        // Called only once the curtain is fully opaque.
        document.querySelectorAll<HTMLDialogElement>("dialog[open]").forEach(dialog => { if (dialog !== viewport.current) dialog.close(); });
        viewport.current?.focus({ preventScroll: true });
        if (options.replace) router.replace(href, { scroll: options.scroll });
        else router.push(href, { scroll: options.scroll });
      },
      fallback: href => window.location.assign(href), prefetch: href => router.prefetch(href),
      captureFocus: () => document.activeElement instanceof HTMLElement ? document.activeElement : null,
      begin: (kind, request) => {
        if (layer.current) { layer.current.dataset.kind = kind; layer.current.dataset.target = request.path; layer.current.dataset.transaction = String(request.generation); }
      },
      assets: async signal => {
        const main = document.querySelector("main");
        const ready = await awaitRouteAssets(main, signal);
        if (ready && !signal.aborted) { prepareRouteEntrance(main); startRouteEntrance(main); }
        return ready;
      },
    });
    session.current = transaction;
    const onPreference = () => { if (prefersReducedMotion()) transaction?.skip(); };
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { if (viewport.current?.open) event.preventDefault(); settleRouteEntrance(document.querySelector("main")); transaction?.cancel(); } };
    const onHidden = () => { if (document.hidden) transaction?.skip(); };
    const onHistory = () => transaction?.history(previous.current);
    const unsubscribe = subscribeMotion(onPreference);
    window.addEventListener("popstate", onHistory);
    document.addEventListener("keydown", onEscape);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      transaction?.dispose(); session.current = null; unsubscribe();
      window.removeEventListener("popstate", onHistory);
      document.removeEventListener("keydown", onEscape);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [router, projects]);

  useEffect(() => { previous.current = pathname; }, [pathname]);

  // The server has already localized these children. Keep the RSC tree opaque,
  // including Next.js resource/bootstrap nodes that may travel with it.
  return <TransitionContext value={begin}><ReadyContext value={ready}><div ref={content}>{children}</div></ReadyContext>
    <dialog className="route-transition-viewport" ref={viewport} tabIndex={-1} aria-modal="true" aria-hidden="true" aria-label={t("Transisi halaman")} onCancel={event => { event.preventDefault(); session.current?.cancel(); }}
      onKeyDown={event => { if (event.key === "Tab") { event.preventDefault(); viewport.current?.focus({ preventScroll: true }); } }}>
      <div className="route-wipe" ref={layer} data-locale={locale}>
        <span className="route-title" aria-hidden="true"/>
        <span className="sr-only" role="status"/>
      </div>
    </dialog>
  </TransitionContext>;
}

function SlowLinkStatus() {
  const {locale,t}=useTranslation();
  const [visible, setVisible] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setVisible(true), 1200); return () => clearTimeout(timer); }, []);
  return translateTree(visible ? <span className="navigation-notice" role="status">Sedang membuka halaman… Kamu tetap bisa memakai navigasi.</span> : null,t,locale);
}
function LinkPendingStatus() {
  const { pending } = useLinkStatus();
  return pending ? <SlowLinkStatus/> : null;
}

export function SiteLink({ href: requestedHref, onNavigate, children, ...props }: ComponentProps<typeof Link>) {
  const {locale,t}=useTranslation();
  const href=typeof requestedHref==="string"?localeHref(requestedHref,locale):requestedHref.host||requestedHref.hostname||requestedHref.protocol?requestedHref:{...requestedHref,pathname:requestedHref.pathname?localeHref(requestedHref.pathname,locale):requestedHref.pathname};
  const begin = useContext(TransitionContext);
  return translateTree(<Link href={href} {...props} onNavigate={event => {
    let cancelled = false;
    onNavigate?.({ preventDefault() { cancelled = true; event.preventDefault(); } });
    if (!cancelled && !props.as && begin(href, { scroll: props.scroll, replace: props.replace, prefetch: props.prefetch !== false })) event.preventDefault();
  }}>{children}<LinkPendingStatus/></Link>,t,locale);
}
