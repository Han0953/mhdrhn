"use client";

import { ArrowUp } from "lucide-react";
import { prefersReducedMotion } from "@/lib/motion/preferences";
import { scrollToPosition } from "@/lib/motion/smooth-scroll";

export function BackToTop() {
  return <button type="button" className="footer-back-top" onClick={() => {
    const reduced = prefersReducedMotion();
    document.querySelector<HTMLElement>("main h1, main")?.focus({ preventScroll: true });
    scrollToPosition(0,reduced);
  }}>Kembali ke atas <ArrowUp size={18} aria-hidden="true"/></button>;
}
