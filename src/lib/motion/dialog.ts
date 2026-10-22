import { prefersReducedMotion, subscribeMotion } from "./preferences";
import { motionTokens } from "./tokens";

/** Native dialog owns focus/top-layer semantics; navigation can close immediately. */
export function mountDialog(dialog: HTMLDialogElement, side = false) {
  // Keep the mobile header stationary in the native modal top layer.
  const panel = dialog.querySelector?.<HTMLElement>("[data-dialog-panel]") ?? dialog;
  let animation: Animation | undefined, timer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0, closing = false;
  const contentAnimations: Animation[] = [];
  function stop() {
    generation++;
    if (animation) { animation.onfinish = null; animation.oncancel = null; animation.cancel(); }
    animation = undefined; clearTimeout(timer); timer = undefined;
    contentAnimations.splice(0).forEach(item => item.cancel());
  }
  function closeNow() { stop(); closing = false; delete dialog.dataset.motionState; if (dialog.open) dialog.close(); }
  function move(exit: boolean) {
    const token = ++generation;
    const transform = side ? "translateX(40px)" : "translateY(20px)";
    const done = () => { if (token !== generation) return; if (exit) closeNow(); else { stop(); delete dialog.dataset.motionState; } };
    if (prefersReducedMotion() || document.hidden || typeof panel.animate !== "function") { done(); return; }
    dialog.dataset.motionState = exit ? "closing" : "opening";
    const frames = [{ opacity: 0, transform }, { opacity: 1, transform: "none" }];
    const duration = exit ? motionTokens.duration.modalClose : motionTokens.duration.modalOpen;
    try {
      animation = panel.animate(exit ? frames.reverse() : frames, { duration, easing: motionTokens.easing.response });
      animation.onfinish = done; animation.oncancel = done;
      if (!exit) Array.from(dialog.querySelectorAll?.<HTMLElement>(".dialog-top>*,nav a,.chat-log>div,.chat-description,.quick-questions>button,.chat-input-row,.media-dialog-top,.media-dialog-footer") ?? []).slice(0, 18).forEach((child, index) => {
        if (typeof child.animate === "function") contentAnimations.push(child.animate([{ opacity: 0, transform: side ? "translateX(24px)" : "translateY(16px) scale(.97)" }, { opacity: 1, transform: "none" }], { duration: duration * .45, delay: Math.min(index * 45, duration * .5), easing: motionTokens.easing.editorial, fill: "backwards" }));
      });
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
