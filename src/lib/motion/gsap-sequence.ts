import { gsap } from "gsap";
import type { PlaySequence } from "./choreography";
import { motionPlan } from "./variants";

/** Loaded only for Home beats. Context restores every temporary inline property. */
export const playGsapSequence: PlaySequence = (nodes, beat, mobile, done, options) => {
  let total = 0;
  const context = gsap.context(() => {
    const timeline = gsap.timeline();
    nodes.forEach((node, index) => {
      const kind = node.matches("p,.rotating-roles,.actions") ? "copy" : beat;
      const plan = motionPlan(kind, mobile, index, options);
      total = Math.max(total, plan.duration + plan.delay);
      timeline.fromTo(node,
        { x: plan.x, y: plan.y, scale: plan.scale, rotation: plan.rotation, opacity: plan.opacity },
        { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, duration: plan.duration / 1000, ease: options?.closing ? "expo.out" : kind === "hero" ? "power4.out" : "power3.out", immediateRender: true },
        plan.delay / 1000);
    });
  }, nodes[0]);
  const dispose = () => { clearTimeout(timer); context.revert(); };
  // Bounded cleanup also restores the visible state when a tab suspends the ticker.
  const timer = setTimeout(() => { dispose(); done(); }, total + 100);
  return dispose;
};
