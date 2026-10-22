import { motionTokens } from "./tokens";
import type { MotionBeat, PageMotionProfile } from "./choreography";

export type SequenceOptions = { profile?: PageMotionProfile; delay?: number; closing?: boolean };

/** Named editorial variants share timing, not an identical fade-up trajectory. */
export function motionPlan(beat: MotionBeat, mobile: boolean, index: number, options: SequenceOptions = {}) {
  const profile = options.profile ?? "home";
  const technical = profile === "lab" || profile === "experience";
  const closing = options.closing || profile === "contact";
  const distance = mobile ? 26 : 40;
  const duration = beat === "hero" ? motionTokens.duration.hero : beat === "copy" ? motionTokens.duration.copy : beat === "results" ? 360 : beat === "frame" ? motionTokens.duration.media : beat === "row" || beat === "logos" ? motionTokens.duration.card : beat === "label" ? 650 : motionTokens.duration.reveal;
  const delay = (options.delay ?? 0) + Math.min(index * (beat === "hero" ? 130 : 65), beat === "hero" ? 520 : 360);
  const x = closing ? (mobile ? -14 : -30) : technical ? (mobile ? 12 : 24) : profile === "about" ? -distance * .5 : 0;
  const y = technical || closing ? 0 : beat === "copy" ? 10 : beat === "label" ? 6 : beat === "results" ? 8 : distance;
  const scale = beat === "frame" ? .97 : beat === "logos" ? .86 : 1;
  const rotation = beat === "hero" ? (mobile ? -.5 : -1.2) : 0;
  const opacity = beat === "copy" ? .6 : beat === "results" ? .65 : beat === "label" ? .4 : .2;
  return { duration, delay, x, y, scale, rotation, opacity, easing: technical ? motionTokens.easing.mechanical : closing ? motionTokens.easing.settle : motionTokens.easing.editorial };
}
