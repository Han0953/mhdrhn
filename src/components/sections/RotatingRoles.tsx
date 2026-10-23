"use client";
import { useTranslation } from "@/i18n/LocaleProvider";
import { translateTree } from "@/i18n/translate";


import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion, subscribeMotion } from "@/lib/motion/preferences";
import { motionTokens } from "@/lib/motion/tokens";

export function RotatingRoles({ roles }: { roles: readonly string[] }) {
  const {locale,t}=useTranslation();
  const [index, setIndex] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let visible = true;
    let hovered = false, focused = false;
    function sync() {
      clearInterval(timer);
      timer = undefined;
      if (!hovered && !focused && !prefersReducedMotion() && !document.hidden && visible && roles.length > 1) {
        timer = setInterval(() => setIndex(current => (current + 1) % roles.length), motionTokens.cadence.role);
      }
    }
    const element = root.current;
    const enter = () => { hovered = true; sync(); };
    const leave = () => { hovered = false; sync(); };
    const focus = () => { focused = true; sync(); };
    const blur = (event: FocusEvent) => { focused = !!element?.contains(event.relatedTarget as Node | null); sync(); };
    element?.addEventListener("pointerenter", enter);
    element?.addEventListener("pointerleave", leave);
    element?.addEventListener("focusin", focus);
    element?.addEventListener("focusout", blur);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    if (root.current) observer.observe(root.current);
    const unsubscribe = subscribeMotion(sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      clearInterval(timer);
      observer.disconnect();
      unsubscribe();
      document.removeEventListener("visibilitychange", sync);
      element?.removeEventListener("pointerenter", enter);
      element?.removeEventListener("pointerleave", leave);
      element?.removeEventListener("focusin", focus);
      element?.removeEventListener("focusout", blur);
    };
  }, [roles.length]);

  return translateTree(<div className="rotating-roles" ref={root} tabIndex={0} role="group" aria-label="Fokus dan peran; pergantian berhenti selama area ini difokuskan atau diarahkan pointer">
    <p className="sr-only">Fokus dan peran: {roles.join(" ")}</p>
    <div className="role-stage" aria-hidden="true">
      {/* All labels reserve the same responsive footprint before hydration. No clipping mask. */}
      {roles.map((role, i) => <span key={role} className={i === index ? "role-visible" : i === (index + roles.length - 1) % roles.length ? "role-leaving" : "role-reserve"}>{role}</span>)}
    </div>
    <span className="role-reduced-note meta">Fokus kreatif & rekayasa</span>
  </div>,t,locale);
}
