"use client";

import { useEffect, useRef } from "react";
import { mountCursorEffect } from "@/lib/motion/cursor";

export function CursorEffect() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (root.current) return mountCursorEffect(root.current);
  }, []);
  return <div ref={root} className="custom-cursor" data-cursor-style="orbit" aria-hidden="true" data-motion-static>
    <div className="cursor-ring"><span/></div>
    <div className="cursor-dot"><span/></div>
  </div>;
}
