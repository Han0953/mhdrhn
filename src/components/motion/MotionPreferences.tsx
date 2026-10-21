"use client";

import { useEffect } from "react";
import { subscribeMotion } from "@/lib/motion/preferences";
import { applyMotionTokens } from "@/lib/motion/tokens";

/** No client wrapper around the server-rendered pages. */
export function MotionPreferences() {
  useEffect(() => {
    applyMotionTokens();
    return subscribeMotion(() => {});
  }, []);
  return null;
}
