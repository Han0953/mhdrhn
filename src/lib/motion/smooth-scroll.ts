import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion, subscribeMotion } from "./preferences";

let active: Lenis | undefined;
/** Programmatic jumps and wheel smoothing share one position owner. */
export function scrollToPosition(top: number, immediate = false) {
  if (active) active.scrollTo(top,{immediate,force:true,duration:.9});
  else window.scrollTo({top,behavior: immediate || prefersReducedMotion() ? "instant" : "smooth"});
}

export function mountSmoothScroll() {
  gsap.registerPlugin(ScrollTrigger);
  let lenis: Lenis | undefined, disposed = false, locked = false;
  const viewport = document.querySelector<HTMLElement>(".route-transition-viewport");
  function tick(time: number) { lenis?.raf(time * 1000); }
  function release() {
    gsap.ticker.remove(tick);
    lenis?.off("scroll",ScrollTrigger.update); lenis?.destroy();
    if (active === lenis) active = undefined;
    lenis = undefined;
  }
  function lock() {
    if (!lenis) return;
    const next = viewport?.dataset.active === "true" || !!document.querySelector("dialog[open]") || document.body.style.overflow === "hidden";
    if (next !== locked) {
      locked = next;
      if (locked) lenis.stop();
      else { lenis.start(); lenis.scrollTo(window.scrollY,{immediate:true,force:true}); }
    }
    document.documentElement.dataset.smoothScroll = locked ? "paused" : "active";
  }
  function sync() {
    release();
    if (disposed || document.hidden || prefersReducedMotion()) { document.documentElement.dataset.smoothScroll = "native"; return; }
    lenis = new Lenis({autoRaf:false,lerp:.105,smoothWheel:true,syncTouch:false,
      prevent: node => !!node.closest("dialog,[data-lenis-prevent],.status-popup"),
    });
    active = lenis; locked = false;
    lenis.on("scroll",ScrollTrigger.update); gsap.ticker.add(tick); lock();
  }
  const bodyObserver = new MutationObserver(lock);
  bodyObserver.observe(document.body,{attributes:true,attributeFilter:["style"]});
  const coverObserver = new MutationObserver(lock);
  if (viewport) coverObserver.observe(viewport,{attributes:true,attributeFilter:["data-active"]});
  document.addEventListener("toggle",lock,true);
  document.addEventListener("visibilitychange",sync);
  const unsubscribe = subscribeMotion(sync); sync();
  return () => { disposed = true; release(); unsubscribe(); bodyObserver.disconnect(); coverObserver.disconnect(); document.removeEventListener("toggle",lock,true); document.removeEventListener("visibilitychange",sync); delete document.documentElement.dataset.smoothScroll; };
}
