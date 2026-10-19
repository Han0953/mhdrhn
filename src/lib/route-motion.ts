import type { NavigationDirection } from "./navigation";

/** Navigation owns its lifetime. This controller only covers, waits, and reveals. */
export function createRouteWipe(getLayer: () => HTMLElement | null, prefersReduced: () => boolean,
  onActive: (active: boolean, completed: boolean) => void = () => {}) {
  let animation: Animation | null = null;
  let segment: ReturnType<typeof setTimeout> | null = null;
  let stall: ReturnType<typeof setTimeout> | null = null;
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
    stall = null;
    const wasActive = phase !== "idle";
    phase = "idle"; current = 0;
    const layer = getLayer();
    if (layer) {
      layer.dataset.phase = phase; delete layer.dataset.stalled;
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
    animate("translateX(0)", `translateX(${-direction * 101}%)`, 220, () => clear(true));
  }
  function play(nextDirection: NavigationDirection, history = false, label = "") {
    clear(); const layer = getLayer();
    if (!nextDirection || !layer) return false;
    const token = ++generation;
    current = token; direction = nextDirection; readyToReveal = false; phase = "entering";
    layer.dataset.direction = direction > 0 ? "right" : "left";
    layer.dataset.navigation = history ? "history" : "link"; layer.dataset.phase = phase;
    const title = layer.querySelector(".route-title"); if (title) title.textContent = label;
    const status = layer.querySelector("[role=status]"); if (status) status.textContent = `Membuka halaman ${label}.`;
    if (layer.parentElement) { layer.parentElement.dataset.active = "true"; layer.parentElement.setAttribute("aria-hidden", "false"); }
    onActive(true, false);
    stall = setTimeout(() => { if (current === token) layer.dataset.stalled = "true"; }, 12000);
    animate(`translateX(${direction * 101}%)`, "translateX(0)", history ? 160 : 220, () => {
      if (current !== token) return;
      phase = "holding"; layer.dataset.phase = phase; reveal();
    });
    return token;
  }
  function ready(token: number) {
    if (token !== current) return;
    readyToReveal = true;
    if (stall !== null) clearTimeout(stall);
    stall = null;
    const layer = getLayer(); if (layer) delete layer.dataset.stalled;
    reveal();
  }
  function preferenceChanged() {
    if (!prefersReduced()) return;
    if (phase === "leaving") clear(true);
    else if (phase === "entering") {
      cancelSegment(); phase = "holding";
      const layer = getLayer(); if (layer) { layer.dataset.phase = phase; layer.style.transform = "translateX(0)"; }
      reveal();
    }
  }
  return { play, ready, clear, preferenceChanged };
}
