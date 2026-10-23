"use client";
import {useLocale} from "@/i18n/LocaleProvider";

import { useEffect, type ReactNode } from "react";
import { mountSmoothScroll } from "@/lib/motion/smooth-scroll";

export function LenisProvider({ children }: { children: ReactNode }) {
  const locale=useLocale();
  useEffect(mountSmoothScroll, [locale]);

  return <>{children}</>;
}
