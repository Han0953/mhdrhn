import { prefersReducedMotion, subscribeMotion } from "@/lib/motion/preferences";

const textSelector = "#azura-heading,.dialog-top .eyebrow,.chat-description,.chat-reply p,.chat-question>[data-no-translate],.chat-request-error,.quick-question-label";

/** Finite text feedback on an explicit resize only. Never remount the transcript
 * or disturb progressive answer spans, input focus, selection or scroll. */
export function mountChatResizeMotion(dialog: HTMLDialogElement) {
  const animations = new Map<HTMLElement, Animation>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  function stop() {
    clearTimeout(timer); timer = undefined;
    for (const animation of animations.values()) {
      animation.onfinish = null; animation.oncancel = null; animation.cancel();
    }
    animations.clear();
  }
  function play() {
    const current = new Map(Array.from(animations.keys(), node => {
      const style = getComputedStyle(node);
      return [node, { opacity: style.opacity, transform: style.transform }] as const;
    }));
    stop();
    if (!dialog.open || dialog.dataset.motionState === "closing" || document.hidden || prefersReducedMotion()) return;
    const bounds = dialog.getBoundingClientRect();
    const nodes = Array.from(dialog.querySelectorAll<HTMLElement>(textSelector)).filter(node => {
      const box = node.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && box.bottom > bounds.top && box.top < bounds.bottom;
    }).slice(0, 60);
    nodes.forEach((node, index) => {
      if (typeof node.animate !== "function") return;
      try {
        const animation = node.animate([
          current.get(node) ?? { opacity: .68, transform: "translate3d(0,6px,0)" },
          { opacity: 1, transform: "translate3d(0,0,0)" },
        ], { duration: 640, delay: Math.min(index * 12, 72), easing: "cubic-bezier(.22,1,.36,1)", fill: "both" });
        animations.set(node, animation);
        const done = () => {
          if (animations.get(node) !== animation) return;
          animations.delete(node); animation.onfinish = null; animation.oncancel = null; animation.cancel();
        };
        animation.onfinish = done; animation.oncancel = done;
      } catch { /* A missing animation must not block the size change. */ }
    });
    if (animations.size) timer = setTimeout(stop, 820);
  }
  const preference = () => { if (prefersReducedMotion() || document.hidden) stop(); };
  const unsubscribe = subscribeMotion(preference);
  dialog.addEventListener("close", stop);
  document.addEventListener("visibilitychange", preference);
  return { play, stop, dispose() {
    stop(); unsubscribe(); dialog.removeEventListener("close", stop); document.removeEventListener("visibilitychange", preference);
  } };
}
