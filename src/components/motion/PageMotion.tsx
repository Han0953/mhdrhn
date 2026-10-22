"use client";

import { useEffect, useRef } from "react";
import { mountPageMotion, type PageMotionProfile } from "@/lib/motion/choreography";

/** A zero-layout island; route content remains server-rendered children of its own page. */
export function PageMotion({ profile }: { profile: PageMotionProfile }) {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = marker.current?.parentElement;
    return root ? mountPageMotion(root, profile) : undefined;
  }, [profile]);
  return <span ref={marker} hidden aria-hidden="true" data-page-motion={profile}/>;
}
