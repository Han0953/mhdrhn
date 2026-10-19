"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Selective, once-only movement. Text remains visible even without JS or WAAPI. */
export function EditorialEntrance({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animation: Animation | undefined;
    const stop = () => animation?.cancel();
    const onPreference = () => { if (media.matches) stop(); };
    const observer = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer?.disconnect();
      if (!media.matches && element?.animate) {
        try { animation = element.animate([{ transform: "translateY(8px)" }, { transform: "translateY(0)" }], { duration: 280, easing: "ease-out" }); }
        catch { /* Visible, static content is the default. */ }
      }
    }, { threshold: 0.25 }) : null;
    if (element) observer?.observe(element);
    media.addEventListener("change", onPreference);
    return () => { stop(); observer?.disconnect(); media.removeEventListener("change", onPreference); };
  }, []);
  return <div ref={root} className="editorial-entrance">{children}</div>;
}
