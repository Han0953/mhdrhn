"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { restoreLanguageDisclosure } from "@/i18n/language-context";
import { Plus } from "lucide-react";
import { mountDisclosure } from "@/lib/motion/disclosure";

export function AnimatedDetails({ summary, children, className = "context-disclosure" }: { summary: ReactNode; children: ReactNode; className?: string }) {
  const root = useRef<HTMLDetailsElement>(null);
  const locale=useLocale();
  useLayoutEffect(() => {
    if(!root.current)return;
    restoreLanguageDisclosure(root.current);
    return mountDisclosure(root.current);
  }, [locale]);
  return <details ref={root} className={`${className} motion-disclosure`} data-motion-owner="disclosure">
    <summary>{summary}<Plus size={16} aria-hidden="true"/></summary>
    <div className="disclosure-content"><div className="disclosure-body">{children}</div></div>
  </details>;
}
