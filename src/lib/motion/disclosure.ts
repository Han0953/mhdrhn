import { createMotionLifetime } from "./lifecycle";
import { prefersReducedMotion, subscribeMotion } from "./preferences";
import { motionTokens } from "./tokens";

/** Native details remains usable before hydration, without WAAPI, and after teardown. */
export function mountDisclosure(details: HTMLDetailsElement) {
  const summary = details.querySelector<HTMLElement>("summary")!;
  const content = details.querySelector<HTMLElement>(".disclosure-content")!;
  const body = details.querySelector<HTMLElement>(".disclosure-body")!;
  const lifetime = createMotionLifetime();
  let target = details.open;
  let animation: Animation | undefined;
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  let frame = 0;
  let naturalHeight = target ? body.getBoundingClientRect().height : 0;

  function cancel() {
    if (animation) { animation.onfinish = null; animation.oncancel = null; animation.cancel(); }
    animation = undefined;
    clearTimeout(watchdog); watchdog = undefined;
  }
  function settle() {
    lifetime.advance(); cancel();
    details.open = target;
    content.style.removeProperty("height");
    content.style.removeProperty("overflow");
    content.inert = false;
    details.dataset.motionState = "idle";
    naturalHeight = target ? body.getBoundingClientRect().height : 0;
  }
  function animateTo(open: boolean, from?: number) {
    const start = from ?? (details.open ? content.getBoundingClientRect().height : 0);
    cancel();
    const token = lifetime.advance();
    target = open;
    if (!open && content.contains(document.activeElement)) summary.focus({ preventScroll: true });
    if (open) details.open = true;
    content.inert = !open;
    const end = open ? body.getBoundingClientRect().height : 0;
    naturalHeight = end;
    if (prefersReducedMotion() || document.hidden || typeof content.animate !== "function" || Math.abs(end - start) < .5) { settle(); return; }
    content.style.height = `${end}px`;
    content.style.overflow = "hidden";
    details.dataset.motionState = open ? "opening" : "closing";
    const duration = open ? motionTokens.duration.panelOpen : motionTokens.duration.panelClose;
    const finish = () => { if (lifetime.current(token)) settle(); };
    try {
      animation = content.animate([{ height: `${start}px` }, { height: `${end}px` }], { duration, easing: motionTokens.easing.response });
      animation.onfinish = finish;
      animation.oncancel = finish;
      // Recover a missing animation event, never use this timer as data readiness.
      watchdog = setTimeout(finish, duration + 120);
    } catch { settle(); }
  }
  function onClick(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0 || prefersReducedMotion() || typeof content.animate !== "function") return;
    event.preventDefault(); animateTo(!target);
  }
  function onToggle() {
    // Our closing animation temporarily keeps native details open. A native close,
    // or a toggle while idle (e.g. browser Find), must still take precedence.
    if (!animation || !details.open) { target = details.open; settle(); }
  }
  function onPreference() { if (prefersReducedMotion()) settle(); }
  function onVisibility() { if (document.hidden) settle(); }
  const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!target || !details.open) return;
      const next = body.getBoundingClientRect().height;
      if (Math.abs(next - naturalHeight) >= .5) animateTo(true, animation ? undefined : naturalHeight);
    });
  });
  observer?.observe(body);
  summary.addEventListener("click", onClick);
  details.addEventListener("toggle", onToggle);
  document.addEventListener("visibilitychange", onVisibility);
  lifetime.onCleanup(subscribeMotion(onPreference));
  lifetime.onCleanup(() => {
    cancelAnimationFrame(frame); observer?.disconnect();
    summary.removeEventListener("click", onClick);
    details.removeEventListener("toggle", onToggle);
    document.removeEventListener("visibilitychange", onVisibility);
  });
  details.dataset.motionState = "idle";
  return () => { settle(); lifetime.dispose(); delete details.dataset.motionState; };
}
