import { prefersReducedMotion, subscribeMotion } from "@/lib/motion/preferences";

type Bubble = {
  node: HTMLElement; body: HTMLElement; height: string; overflow: string;
  padding: number; target: number; animation?: Animation;
};

/** Only active during an explicit panel resize. Observe text wrapping, then
 * animate the surrounding bubble's real height so subsequent messages flow
 * smoothly. Never scale or push the text, panel, or right-hand controls. */
export function mountChatResizeMotion(dialog: HTMLDialogElement) {
  const bubbles: Bubble[] = [];
  let observer: ResizeObserver | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let frame = 0;
  function cancel(bubble: Bubble) {
    if (!bubble.animation) return;
    bubble.animation.onfinish = null; bubble.animation.oncancel = null;
    bubble.animation.cancel(); bubble.animation = undefined;
  }
  function stop() {
    observer?.disconnect(); observer = undefined;
    clearTimeout(timer); timer = undefined;
    cancelAnimationFrame(frame); frame = 0;
    for (const bubble of bubbles.splice(0)) {
      cancel(bubble);
      bubble.node.style.height = bubble.height;
      bubble.node.style.overflow = bubble.overflow;
    }
  }
  function update() {
    frame = 0;
    if (!dialog.open || document.hidden || prefersReducedMotion()) { stop(); return; }
    // Read all sizes before applying styles. Text bodies are not height-locked,
    // so observing them cannot loop on our bubble-height animation.
    const measurements = bubbles.map(bubble => ({
      bubble, target: bubble.body.offsetHeight + bubble.padding,
      from: bubble.node.getBoundingClientRect().height,
    }));
    for (const { bubble, target, from } of measurements) {
      if (Math.abs(target - bubble.target) < .5 && (bubble.animation || Math.abs(target - from) < .5)) continue;
      cancel(bubble); bubble.target = target;
      bubble.node.style.height = `${target}px`;
      if (Math.abs(target - from) < .5) continue;
      try {
        const animation = bubble.node.animate([{ height: `${from}px` }, { height: `${target}px` }], {
          duration: 360, easing: "cubic-bezier(.22,1,.36,1)", fill: "both",
        });
        bubble.animation = animation;
        const done = () => {
          if (bubble.animation !== animation) return;
          cancel(bubble);
        };
        animation.onfinish = done; animation.oncancel = done;
      } catch { /* Keep the natural target height if WAAPI is unavailable. */ }
    }
  }
  function queue() { if (!frame) frame = requestAnimationFrame(update); }
  function play() {
    const current = new Map(bubbles.map(bubble => [bubble.node, bubble.node.getBoundingClientRect().height]));
    stop();
    if (!dialog.open || dialog.dataset.motionState || document.hidden || prefersReducedMotion() || typeof ResizeObserver === "undefined") return;
    const bounds = dialog.getBoundingClientRect();
    for (const node of Array.from(dialog.querySelectorAll<HTMLElement>(".chat-reply,.chat-question")).slice(0, 60)) {
      const box = node.getBoundingClientRect();
      const body = node.querySelector<HTMLElement>("p,[data-no-translate]");
      if (!body || typeof node.animate !== "function" || !box.width || !box.height || box.bottom <= bounds.top || box.top >= bounds.bottom) continue;
      const style = getComputedStyle(node);
      const padding = [style.paddingTop, style.paddingBottom, style.borderTopWidth, style.borderBottomWidth].reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
      bubbles.push({ node, body, height: node.style.height, overflow: node.style.overflow, padding, target: body.offsetHeight + padding });
      node.style.height = `${current.get(node) ?? box.height}px`;
      node.style.overflow = "hidden";
    }
    if (!bubbles.length) return;
    const bodies = new Map(bubbles.map(bubble => [bubble.body, bubble]));
    observer = new ResizeObserver(entries => {
      // The panel changes width every frame. Only a real line-wrap/height
      // change needs another measurement pass; ignore subpixel rounding.
      if (entries.some(entry => {
        const bubble = bodies.get(entry.target as HTMLElement);
        return bubble && Math.abs(entry.contentRect.height - (bubble.target - bubble.padding)) > 1;
      })) queue();
    });
    bubbles.forEach(bubble => observer?.observe(bubble.body));
    queue();
    // Panel width settles at 640 ms; a final line-wrap has 360 ms to settle.
    timer = setTimeout(stop, 1120);
  }
  const preference = () => { if (prefersReducedMotion() || document.hidden) stop(); };
  const unsubscribe = subscribeMotion(preference);
  dialog.addEventListener("close", stop);
  document.addEventListener("visibilitychange", preference);
  return { play, stop, dispose() {
    stop(); unsubscribe(); dialog.removeEventListener("close", stop); document.removeEventListener("visibilitychange", preference);
  } };
}
