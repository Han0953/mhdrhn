"use client";

import {usePathname} from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { mountPageMotion, type PageMotionProfile } from "@/lib/motion/choreography";
import { mountScrollScenes } from "@/lib/motion/scroll-scenes";

/** A zero-layout island; route content remains server-rendered children of its own page. */
export function PageMotion({ profile }: { profile: PageMotionProfile }) {
  const pathname=usePathname();
  // Persistent chrome/footer live outside main's route-readiness barrier.
  // Re-preparing them under an active curtain would leave their visible groups
  // paused, because only the destination main receives startRouteEntrance.
  const motionPath=profile === "chrome" || profile === "footer" ? null : pathname;
  const marker = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const root = marker.current?.parentElement;
    if (!root) return;
    const stop = mountPageMotion(root, profile);
    const stopScenes = profile !== "footer" && profile !== "chrome" ? mountScrollScenes(root) : undefined;
    return () => { stopScenes?.(); stop(); };
  }, [profile,motionPath]);
  return <span ref={marker} hidden aria-hidden="true" data-page-motion={profile}/>;
}
