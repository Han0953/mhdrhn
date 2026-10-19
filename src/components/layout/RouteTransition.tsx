"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, type ComponentProps, type ReactNode } from "react";
const TransitionContext = createContext<(href: string) => void>(() => {});
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const layer = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<string | null>(null);
  const previous = useRef(pathname);
  const clear = useCallback(() => {
    animation.current?.cancel(); animation.current = null;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const begin = useCallback((href: string) => {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname === window.location.pathname || url.hash) return;
    clear(); pending.current = url.pathname;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !layer.current?.animate) return;
    animation.current = layer.current.animate([
      { transform: "translateX(-101%)" }, { transform: "translateX(0)", offset: 0.45 }, { transform: "translateX(101%)" },
    ], { duration: 360, easing: "cubic-bezier(.76,0,.24,1)" });
    animation.current.onfinish = clear;
    timer.current = setTimeout(clear, 600);
  }, [clear]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreference = () => { if (media.matches) clear(); };
    const onHistory = () => { pending.current = null; clear(); };
    media.addEventListener("change", onPreference); window.addEventListener("popstate", onHistory);
    return () => { clear(); media.removeEventListener("change", onPreference); window.removeEventListener("popstate", onHistory); };
  }, [clear]);
  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    const requested = pending.current === pathname;
    pending.current = null;
    if (requested && !document.querySelector("main")?.contains(document.activeElement)) {
      document.querySelector<HTMLElement>("main h1, main")?.focus({ preventScroll: true });
    }
  }, [pathname]);
  return <TransitionContext value={begin}>{children}<div className="route-transition-viewport" aria-hidden="true"><div className="route-wipe" ref={layer}/></div></TransitionContext>;
}
export function SiteLink({ href, onNavigate, ...props }: ComponentProps<typeof Link>) {
  const begin = useContext(TransitionContext);
  return <Link href={href} {...props} onNavigate={event => { onNavigate?.(event); if (typeof href === "string") begin(href); }} />;
}
