import type { NavigationDirection } from "./navigation";

/** Owns only this wipe's animation and watchdog. It never owns navigation. */
export function createRouteWipe(getLayer: () => HTMLElement | null, prefersReduced: () => boolean) {
  let animation: Animation | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function clear() {
    if (animation) { animation.onfinish = null; animation.cancel(); }
    animation = null;
    if (timer !== null) clearTimeout(timer);
    timer = null;
  }

  function play(direction: NavigationDirection, history = false) {
    clear();
    const layer = getLayer();
    if (!direction || prefersReduced() || !layer?.animate) return false;
    layer.dataset.direction = direction > 0 ? "right" : "left";
    layer.dataset.navigation = history ? "history" : "link";
    try {
      // Travelling right reveals from the right; travelling left mirrors the wipe.
      animation = layer.animate([
        { transform: `translateX(${direction * 101}%)` },
        { transform: "translateX(0)", offset: 0.45 },
        { transform: `translateX(${-direction * 101}%)` },
      ], { duration: history ? 260 : 360, easing: "cubic-bezier(.76,0,.24,1)" });
      animation.onfinish = clear;
      timer = setTimeout(clear, 600);
      return true;
    } catch {
      clear();
      return false;
    }
  }

  return { play, clear };
}
