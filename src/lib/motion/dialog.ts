import { prefersReducedMotion, subscribeMotion } from "./preferences";
import { motionTokens } from "./tokens";

/** Native dialog owns focus/top-layer semantics; navigation can close immediately. */
export function mountDialog(dialog: HTMLDialogElement, side = false) {
  let animation: Animation | undefined, timer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0, closing = false;
  function stop() {
    generation++;
    if (animation) { animation.onfinish = null; animation.oncancel = null; animation.cancel(); }
    animation = undefined; clearTimeout(timer); timer = undefined;
  }
  function closeNow() { stop(); closing = false; delete dialog.dataset.motionState; if (dialog.open) dialog.close(); }
  function move(exit: boolean) {
    const token = ++generation;
    const transform = side ? "translateX(16px)" : "translateY(8px)";
    const done = () => { if (token !== generation) return; if (exit) closeNow(); else { stop(); delete dialog.dataset.motionState; } };
    if (prefersReducedMotion() || document.hidden || typeof dialog.animate !== "function") { done(); return; }
    dialog.dataset.motionState = exit ? "closing" : "opening";
    const frames = [{ opacity: 0, transform }, { opacity: 1, transform: "none" }];
    const duration = exit ? motionTokens.duration.panelClose : motionTokens.duration.panelOpen;
    try {
      animation = dialog.animate(exit ? frames.reverse() : frames, { duration, easing: motionTokens.easing.response });
      animation.onfinish = done; animation.oncancel = done;
      timer = setTimeout(done, duration + 120);
    } catch { done(); }
  }
  function nativeClosed() { stop(); closing = false; delete dialog.dataset.motionState; }
  function preference() { if (prefersReducedMotion() || document.hidden) { if (closing) closeNow(); else nativeClosed(); } }
  dialog.addEventListener("close", nativeClosed);
  document.addEventListener("visibilitychange", preference);
  const unsubscribe = subscribeMotion(preference);
  return {
    open() { stop(); closing = false; if (!dialog.open) dialog.showModal(); move(false); },
    close(immediate = false) { stop(); if (!dialog.open) return; closing = true; if (immediate) closeNow(); else move(true); },
    dispose() { stop(); delete dialog.dataset.motionState; unsubscribe(); dialog.removeEventListener("close", nativeClosed); document.removeEventListener("visibilitychange", preference); },
  };
}
