import { motionTokens } from "./motion/tokens";
import type { NavigationDirection } from "./navigation";

/** Navigation owns its lifetime. This controller only covers, waits, and reveals. */
export function createRouteWipe(getLayer: () => HTMLElement | null, prefersReduced: () => boolean,
  onActive: (active: boolean, completed: boolean) => void = () => {}) {
  let animation: Animation | null = null;
  let segment: ReturnType<typeof setTimeout> | null = null;
  let stall: ReturnType<typeof setTimeout> | null = null;
  let feedback: ReturnType<typeof setTimeout> | null = null;
  let covered: ((id: number) => void) | undefined;
  let generation = 0, current = 0, direction = 1, readyToReveal = false;
  let phase: "idle" | "entering" | "holding" | "leaving" = "idle";
  function cancelSegment() {
    if (animation) { animation.onfinish = null; animation.cancel(); }
    animation = null;
    if (segment !== null) clearTimeout(segment);
    segment = null;
  }
  function clear(completed = false) {
    cancelSegment();
    if (stall !== null) clearTimeout(stall);
    if (feedback !== null) clearTimeout(feedback);
    stall = null;
    feedback = null; covered = undefined;
    const wasActive = phase !== "idle";
    phase = "idle"; current = 0;
    const layer = getLayer();
    if (layer) {
      layer.dataset.phase = phase; delete layer.dataset.stalled; delete layer.dataset.pending;
      layer.style.transform = "translateX(-101%)";
      layer.parentElement?.setAttribute("aria-hidden", "true");
      if (layer.parentElement) layer.parentElement.dataset.active = "false";
    }
    if (wasActive) onActive(false, completed);
  }
  function animate(from: string, to: string, duration: number, done: () => void) {
    const layer = getLayer();
    if (!layer) { clear(); return; }
    cancelSegment(); layer.style.transform = to;
    if (prefersReduced() || !layer.animate) { done(); return; }
    let finished = false;
    const token = current;
    const finish = () => { if (finished || current !== token) return; finished = true; cancelSegment(); done(); };
    try {
      animation = layer.animate([{ transform: from }, { transform: to }], { duration, easing: "cubic-bezier(.76,0,.24,1)" });
      animation.onfinish = finish;
      // Only recover missing animation events. Network loading has no automatic reveal timeout.
      segment = setTimeout(finish, duration + 120);
    } catch { finish(); }
  }
  function reveal() {
    if (phase !== "holding" || !readyToReveal) return;
    phase = "leaving";
    const layer = getLayer(); if (layer) layer.dataset.phase = phase;
    animate("translateX(0)", `translateX(${-direction * 101}%)`, motionTokens.duration.routeReveal, () => clear(true));
  }
  function play(nextDirection: NavigationDirection, history = false, label = "", onCovered?: (id: number) => void) {
    clear(); const layer = getLayer();
    if (!nextDirection || !layer) return false;
    const token = ++generation;
    current = token; direction = nextDirection; readyToReveal = false; phase = "entering";
    covered = onCovered;
    layer.dataset.direction = direction > 0 ? "right" : "left";
    layer.dataset.navigation = history ? "history" : "link"; layer.dataset.phase = phase;
    const title = layer.querySelector(".route-title"); if (title) title.textContent = label;
    const status = layer.querySelector("[role=status]"); if (status) status.textContent = layer.dataset.locale === "en" ? `Opening ${label}.` : `Membuka halaman ${label}.`;
    if (layer.parentElement) { layer.parentElement.dataset.active = "true"; layer.parentElement.setAttribute("aria-hidden", "false"); }
    onActive(true, false);
    feedback = setTimeout(() => { if (current === token) layer.dataset.pending = "true"; }, 1500);
    stall = setTimeout(() => { if (current === token) layer.dataset.stalled = "true"; }, 8000);
    animate(`translateX(${direction * 101}%)`, "translateX(0)", history ? 320 : motionTokens.duration.routeCover, () => {
      if (current !== token) return;
      phase = "holding"; layer.dataset.phase = phase;
      const handoff = covered; covered = undefined; handoff?.(token);
      if (current === token) reveal();
    });
    return token;
  }
  function ready(token: number) {
    if (token !== current) return;
    readyToReveal = true;
    if (stall !== null) clearTimeout(stall);
    if (feedback !== null) clearTimeout(feedback);
    stall = null;
    feedback = null;
    const layer = getLayer(); if (layer) { delete layer.dataset.stalled; delete layer.dataset.pending; }
    reveal();
  }
  function preferenceChanged() {
    if (!prefersReduced()) return;
    if (phase === "leaving") clear(true);
    else if (phase === "entering") {
      cancelSegment(); phase = "holding";
      const layer = getLayer(); if (layer) { layer.dataset.phase = phase; layer.style.transform = "translateX(0)"; }
      const handoff = covered; covered = undefined; handoff?.(current);
      reveal();
    }
  }
  function label(value: string) { const title = getLayer()?.querySelector(".route-title"); if (title) title.textContent = value; }
  return { play, ready, clear, preferenceChanged, label };
}
