"use client";
import {useLocale} from "@/i18n/LocaleProvider";

import { useEffect } from "react";
import { subscribeMotion } from "@/lib/motion/preferences";
import { applyMotionTokens } from "@/lib/motion/tokens";

/** No client wrapper around the server-rendered pages. */
export function MotionPreferences() {
  const locale=useLocale();
  useEffect(() => {
    applyMotionTokens();
    return subscribeMotion(() => {});
  }, [locale]);
  return null;
}
