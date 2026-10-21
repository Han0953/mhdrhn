"use client";

import { ArrowUp } from "lucide-react";
import { prefersReducedMotion } from "@/lib/motion/preferences";

export function BackToTop() {
  return <button type="button" className="footer-back-top" onClick={() => {
    const reduced = prefersReducedMotion();
    document.querySelector<HTMLElement>("main h1, main")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
  }}>Kembali ke atas <ArrowUp size={18} aria-hidden="true"/></button>;
}
