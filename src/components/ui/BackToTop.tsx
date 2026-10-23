"use client";
import { useTranslation } from "@/i18n/LocaleProvider";
import { translateTree } from "@/i18n/translate";


import { ArrowUp } from "lucide-react";
import { prefersReducedMotion } from "@/lib/motion/preferences";
import { scrollToPosition } from "@/lib/motion/smooth-scroll";

export function BackToTop() {
  const {locale,t}=useTranslation();
  return translateTree(<button type="button" className="footer-back-top" onClick={() => {
    const reduced = prefersReducedMotion();
    document.querySelector<HTMLElement>("main h1, main")?.focus({ preventScroll: true });
    scrollToPosition(0,reduced);
  }}>Kembali ke atas <ArrowUp size={18} aria-hidden="true"/></button>,t,locale);
}
