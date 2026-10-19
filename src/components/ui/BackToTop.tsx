"use client";

import { ArrowUp } from "lucide-react";

export function BackToTop() {
  return <button type="button" className="footer-back-top" onClick={() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelector<HTMLElement>("main h1, main")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
  }}>Kembali ke atas <ArrowUp size={18} aria-hidden="true"/></button>;
}
