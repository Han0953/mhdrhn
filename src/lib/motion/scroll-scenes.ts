import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion, subscribeMotion } from "./preferences";

gsap.registerPlugin(ScrollTrigger);

/** Decorative progress only: never pin, translate a track, or own the document scroll. */
export function mountScrollScenes(root: HTMLElement) {
  let destroyed = false, refreshFrame = 0, rebuild = false;
  let scenes: HTMLElement[] = [];
  let triggers: ScrollTrigger[] = [];
  function clear() {
    triggers.forEach(trigger => trigger.kill()); triggers = [];
    scenes.forEach(scene => { scene.classList.remove("motion-scene"); scene.style.removeProperty("--scene-progress"); });
  }
  function sync() {
    clear();
    if (destroyed || prefersReducedMotion() || document.hidden) return;
    scenes = Array.from(root.querySelectorAll<HTMLElement>(".home-education,.home-experience,.home-recognition,.about-education,.experience-group,.lab-records,#featured-achievements,#education-achievements,.home-closing,.contact-layout"));
    scenes.forEach(scene => {
      scene.classList.add("motion-scene");
      const update = (self: ScrollTrigger) => scene.style.setProperty("--scene-progress", String(self.progress));
      triggers.push(ScrollTrigger.create({ trigger: scene, start: "top 85%", end: "bottom 45%", onUpdate: update, onRefresh: update, invalidateOnRefresh: true }));
    });
  }
  function refresh() {
    if (!refreshFrame) refreshFrame = requestAnimationFrame(() => {
      refreshFrame = 0;
      if (destroyed || document.hidden) return;
      if (rebuild) { rebuild = false; sync(); }
      else triggers.forEach(trigger => trigger.refresh());
    });
  }
  const mutation = typeof MutationObserver === "undefined" ? undefined : new MutationObserver(() => { rebuild = true; refresh(); });
  mutation?.observe(root, { childList: true, subtree: true });
  const unsubscribe = subscribeMotion(sync);
  document.addEventListener("visibilitychange", sync);
  root.addEventListener("toggle", refresh, true);
  root.addEventListener("load", refresh, true);
  void document.fonts.ready.then(() => { if (!destroyed) refresh(); });
  sync();
  return () => { destroyed = true; clear(); mutation?.disconnect(); cancelAnimationFrame(refreshFrame); unsubscribe(); document.removeEventListener("visibilitychange", sync); root.removeEventListener("toggle", refresh, true); root.removeEventListener("load", refresh, true); };
}
