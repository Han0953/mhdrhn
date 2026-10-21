"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion, subscribeMotion } from "@/lib/motion/preferences";
import { motionTokens } from "@/lib/motion/tokens";

/** Selective, once-only movement. Text remains visible even without JS or WAAPI. */
export function EditorialEntrance({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    let animation: Animation | undefined;
    const stop = () => animation?.cancel();
    const onPreference = () => { if (prefersReducedMotion()) stop(); };
    const observer = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer?.disconnect();
      if (!prefersReducedMotion() && element?.animate) {
        try { animation = element.animate([{ transform: "translateY(8px)" }, { transform: "translateY(0)" }], { duration: motionTokens.duration.editorial, easing: "ease-out" }); }
        catch { /* Visible, static content is the default. */ }
      }
    }, { threshold: 0.25 }) : null;
    if (element) observer?.observe(element);
    const unsubscribe = subscribeMotion(onPreference);
    return () => { stop(); observer?.disconnect(); unsubscribe(); };
  }, []);
  return <div ref={root} className="editorial-entrance">{children}</div>;
}
