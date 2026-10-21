"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { mountDisclosure } from "@/lib/motion/disclosure";

export function AnimatedDetails({ summary, children }: { summary: string; children: ReactNode }) {
  const root = useRef<HTMLDetailsElement>(null);
  useEffect(() => root.current ? mountDisclosure(root.current) : undefined, []);
  return <details ref={root} className="context-disclosure motion-disclosure" data-motion-owner="disclosure">
    <summary>{summary}<Plus size={16} aria-hidden="true"/></summary>
    <div className="disclosure-content"><div className="disclosure-body">{children}</div></div>
  </details>;
}
