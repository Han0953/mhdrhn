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
  function move(exit: boolean, from?: string, glyphFrom?: { transform: string; opacity: string }[]) {
    const token = ++generation;
    let trailingContent = false;
    const transform = "translateY(20px)";
    const done = () => {
      if (token !== generation) return;
      if (exit) closeNow();
      else {
        // The panel can settle while its staggered text is still entering.
        if (side && trailingContent) { if (animation) { animation.onfinish = null; animation.oncancel = null; animation.cancel(); animation = undefined; } }
        else stop();
        delete dialog.dataset.motionState;
      }
    };
    if (prefersReducedMotion() || document.hidden || typeof panel.animate !== "function") { done(); return; }
    dialog.dataset.motionState = exit ? "closing" : "opening";
    // An opaque side panel must not expose the dim backdrop through its canvas.
    const frames = side ? [{ transform: from ?? (exit ? "none" : "translateX(100%)") }, { transform: exit ? "translateX(100%)" : "none" }] : [{ opacity: 0, transform }, { opacity: 1, transform: "none" }];
    const duration = side ? (exit ? 460 : 620) : exit ? motionTokens.duration.modalClose : motionTokens.duration.modalOpen;
    let completionDuration = duration;
    try {
      animation = panel.animate(!side && exit ? frames.reverse() : frames, { duration, easing: side ? motionTokens.easing.transfer : motionTokens.easing.response, fill: "both" });
      animation.onfinish = done; animation.oncancel = done;
      if (side) Array.from(dialog.querySelectorAll?.<HTMLElement>(".menu-glyph>span") ?? []).forEach((line, index) => {
        const closed = { transform: index === 1 ? "scaleX(1)" : `translateY(${index === 0 ? -5 : 5}px) rotate(0deg)`, opacity: 1 };
        const opened = { transform: index === 1 ? "scaleX(.2)" : `translateY(0px) rotate(${index === 0 ? 45 : -45}deg)`, opacity: index === 1 ? 0 : 1 };
        const glyphFrames = [glyphFrom?.[index] ?? (exit ? opened : closed), exit ? closed : opened];
        contentAnimations.push(line.animate(glyphFrames, { duration: Math.min(duration, 420), easing: motionTokens.easing.response, fill: "both" }));
      });
      if (!exit) Array.from(dialog.querySelectorAll?.<HTMLElement>(".dialog-top>*,nav a,.menu-note,.chat-log>div,.chat-description,.quick-questions>button,.chat-input-row,.media-dialog-top,.media-dialog-footer") ?? []).slice(0, 18).forEach((child, index) => {
        const childDuration = side ? 360 : duration * .45;
        const delay = side ? duration * .45 + index * 40 : Math.min(index * 45, duration * .5);
        completionDuration = Math.max(completionDuration, delay + childDuration);
        if (side && delay + childDuration > duration) trailingContent = true;
        if (typeof child.animate === "function") contentAnimations.push(child.animate([{ opacity: 0, transform: side ? "translateX(24px)" : "translateY(16px) scale(.97)" }, { opacity: 1, transform: "none" }], { duration: childDuration, delay, easing: motionTokens.easing.editorial, fill: "backwards" }));
      });
      timer = setTimeout(() => { done(); if (side && !exit && token === generation) stop(); }, completionDuration + 120);
    } catch { done(); }
  }
  function nativeClosed() { stop(); closing = false; delete dialog.dataset.motionState; }
  function preference() { if (prefersReducedMotion() || document.hidden) { if (closing) closeNow(); else nativeClosed(); } }
  dialog.addEventListener("close", nativeClosed);
  document.addEventListener("visibilitychange", preference);
  const unsubscribe = subscribeMotion(preference);
  function snapshot() {
    if (!side || !dialog.open || typeof getComputedStyle !== "function") return {};
    return { from: getComputedStyle(panel).transform, glyphFrom: Array.from(dialog.querySelectorAll<HTMLElement>(".menu-glyph>span"), line => ({ transform: getComputedStyle(line).transform, opacity: getComputedStyle(line).opacity })) };
  }
  return {
    open() { const current = snapshot(); stop(); closing = false; if (!dialog.open) { if (side) dialog.show(); else dialog.showModal(); } move(false, current.from, current.glyphFrom); },
    close(immediate = false) { if (!dialog.open || (closing && !immediate)) return; const current = snapshot(); stop(); closing = true; if (immediate) closeNow(); else move(true, current.from, current.glyphFrom); },
    dispose() { stop(); delete dialog.dataset.motionState; unsubscribe(); dialog.removeEventListener("close", nativeClosed); document.removeEventListener("visibilitychange", preference); },
  };
}
