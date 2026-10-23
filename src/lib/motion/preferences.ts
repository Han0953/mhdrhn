export type MotionPreference = "system" | "minimal";
export const motionPreferenceKey = "mhdrhn-motion";
const listeners = new Set<() => void>();
let fallback: MotionPreference = "system";
let sessionOverride = false;
let media: MediaQueryList | undefined;
let disconnect: (() => void) | undefined;

export function getMotionPreference(): MotionPreference {
  if (typeof window === "undefined") return "system";
  if (sessionOverride) return fallback;
  try {
    const stored = window.localStorage.getItem(motionPreferenceKey);
    return stored === "minimal" ? "minimal" : "system";
  } catch { return fallback; }
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return getMotionPreference() === "minimal" || (media ?? window.matchMedia("(prefers-reduced-motion: reduce)")).matches;
}

function publish() {
  document.documentElement.dataset.motion = getMotionPreference();
  for (const listener of listeners) listener();
}

export function setMotionPreference(preference: MotionPreference) {
  fallback = preference;
  try { window.localStorage.setItem(motionPreferenceKey, preference); sessionOverride = false; }
  catch { sessionOverride = true; }
  publish();
}

/** One OS/storage subscription, released when the last mounted owner leaves. */
export function subscribeMotion(listener: () => void) {
  document.documentElement.dataset.motion = getMotionPreference();
  listeners.add(listener);
  if (!disconnect) {
    media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onStorage = (event: StorageEvent) => { if (event.key === motionPreferenceKey || event.key === null) publish(); };
    media.addEventListener("change", publish);
    window.addEventListener("storage", onStorage);
    disconnect = () => {
      media?.removeEventListener("change", publish);
      window.removeEventListener("storage", onStorage);
      media = undefined;
      disconnect = undefined;
    };
  }
  return () => { listeners.delete(listener); if (!listeners.size) disconnect?.(); };
}
