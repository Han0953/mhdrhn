import { animate } from "framer-motion";
import { gsap } from "gsap";

export type RevealKind = "title" | "copy" | "card" | "media" | "icon" | "label" | "action";
export type RevealItem = { node: HTMLElement; kind: RevealKind; delay: number; from: string; duration: number };
export interface RevealPlayer { play: (lead?: number) => void; finish: () => void }
const restingTransform = "perspective(900px) translate3d(0px,0px,0) rotate(0deg) rotateX(0deg) scale(1)";

/** Both engines are in the route bundle. First-frame values are applied synchronously. */
export function prepareReveal(entries: RevealItem[], engine: "gsap" | "motion", done: () => void): RevealPlayer {
  const items = [...entries];
  let ended = false, playing = false;
  const snapshots = items.map(({ node }) => ({ node, style: node.getAttribute("style") }));
  const controls: { stop: () => void }[] = [];
  let timeline: gsap.core.Timeline | undefined;
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  let launch: ReturnType<typeof setTimeout> | undefined;
  function finish() {
    if (ended) return;
    ended = true;
    clearTimeout(watchdog);
    clearTimeout(launch);
    timeline?.kill(); controls.forEach(control => control.stop());
    // Only restore the properties this controller owns, preserving scroll/media custom properties.
    snapshots.forEach(({node, style}) => {
      const original = document.createElement("span");
      if (style) original.setAttribute("style", style);
      for (const prop of ["opacity", "transform", "will-change", "clip-path"]) {
        const value = original.style.getPropertyValue(prop);
        if (value) node.style.setProperty(prop, value); else node.style.removeProperty(prop);
      }
      delete node.dataset.reveal;
      node.style.removeProperty("--reveal-from");
    });
    done();
  }
  items.forEach(({ node, from, kind }) => {
    node.dataset.reveal = "prepared";
    node.style.opacity = "0";
    node.style.transform = from;
    if (kind === "media") node.style.clipPath = "inset(6% 0% 12% 0%)";
  });
  if (engine === "gsap") {
    try {
      timeline = gsap.timeline({ paused: true, onComplete: finish });
      items.forEach(({ node, kind, duration, delay }) => timeline!.to(node, {
        opacity: 1, transform: restingTransform, ...(kind === "media" ? {clipPath:"inset(0% 0% 0% 0%)"} : {}), duration,
        ease: kind === "icon" ? "back.out(1.5)" : kind === "title" ? "power2.inOut" : "power3.out",
      }, delay));
    } catch { finish(); }
  }
  return {
    play(lead = 0) {
      if (playing || ended) return;
      playing = true;
      items.forEach(({node}) => { node.dataset.reveal = "playing"; node.style.willChange = "transform, opacity"; });
      const total = Math.max(0, ...items.map(item => item.delay + item.duration));
      watchdog = setTimeout(finish, (total + lead + .6) * 1000);
      const begin = () => {
        if (ended) return;
        if (timeline) { timeline.play(0); return; }
        if (!items.length) { finish(); return; }
        let left = items.length;
        try { items.forEach(({ node, from, duration, delay, kind }) => {
        const control = animate(node, {
          opacity: [0, 1], transform: [from, restingTransform], ...(kind === "media" ? {clipPath:["inset(6% 0% 12% 0%)","inset(0% 0% 0% 0%)"]} : {}),
        }, { type: "spring", visualDuration: duration * .8, bounce: kind === "icon" ? .22 : kind === "card" ? .12 : .035, delay,
          onComplete: () => { if (--left === 0) finish(); } });
        controls.push(control);
        }); } catch { finish(); }
      };
      if (lead) launch = setTimeout(begin,lead * 1000); else begin();
    },
    finish,
  };
}
