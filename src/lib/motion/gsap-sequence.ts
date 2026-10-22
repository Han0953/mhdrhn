import { gsap } from "gsap";
import { sequenceSettings, type PlaySequence } from "./choreography";

/** Loaded only for Home beats. Context restores every temporary inline property. */
export const playGsapSequence: PlaySequence = (nodes, beat, mobile, done) => {
  const settings = sequenceSettings(beat, mobile);
  const context = gsap.context(() => {
    const timeline = gsap.timeline();
    nodes.forEach((node, index) => timeline.fromTo(node,
      { y: settings.distance, opacity: .72 },
      { y: 0, opacity: 1, duration: settings.duration / 1000, ease: "power3.out", immediateRender: false },
      Math.min(index * settings.stagger, 180) / 1000));
  }, nodes[0]);
  const dispose = () => { clearTimeout(timer); context.revert(); };
  // Bounded cleanup also restores the visible state when a tab suspends the ticker.
  const timer = setTimeout(() => { dispose(); done(); }, settings.duration + 260);
  return dispose;
};
