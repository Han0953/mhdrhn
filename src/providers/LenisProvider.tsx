"use client";

import { useEffect, type ReactNode } from "react";
import { mountSmoothScroll } from "@/lib/motion/smooth-scroll";

export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(mountSmoothScroll, []);

  return <>{children}</>;
}
