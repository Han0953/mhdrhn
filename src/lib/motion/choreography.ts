import { prefersReducedMotion, subscribeMotion } from "./preferences";
import { motionTokens } from "./tokens";

export type PageMotionProfile = "home" | "about" | "projects" | "detail" | "experience" | "lab" | "achievements" | "contact" | "footer" | "recovery";
export type MotionBeat = "hero" | "heading" | "row" | "frame" | "results" | "rule";
export type PlaySequence = (nodes: HTMLElement[], beat: MotionBeat, mobile: boolean, done: () => void) => () => void;

/** The informational text/logos and existing transform owners are never targets. */
const targets: Record<PageMotionProfile, string> = {
  home: ".home-hero,[data-editorial-entrance] h2,.section-heading h2,.story-heading h2,.education-record,.logo-group-heading,.home-experience-list .timeline-row,.home-achievement-list>li",
  about: ".page-heading h1,.portrait,.section>h2,.education-record,.logo-group-heading,.inventory-heading,.skill-group h3,.interest-columns h3",
  projects: ".page-heading h1,.catalog-results",
  detail: ".page-heading h1,:scope>.media-gallery>.media-gallery-grid,.project-facts,.detail-section>.eyebrow,.related-projects,.project-pagination",
  experience: ".page-heading h1,.experience-group>h2,.timeline-row",
  lab: ".page-heading h1,.lab-records>h2,.lab-records>.timeline-row",
  achievements: ".page-heading h1,.section>h2,.award-row,.education-award,.certificate-record",
  contact: ".page-heading h1,.contact-layout>h2,.contact-link",
  footer: ".footer-top",
  recovery: ".page-heading",
};

export const sequenceSettings = (beat: MotionBeat, mobile: boolean) => ({
  duration: beat === "hero" ? motionTokens.duration.hero : beat === "results" ? motionTokens.duration.micro : beat === "row" ? motionTokens.duration.panelOpen : motionTokens.duration.reveal,
  distance: beat === "results" ? 4 : beat === "row" || beat === "frame" ? (mobile ? 6 : 12) : (mobile ? motionTokens.distance.mobileHeading : motionTokens.distance.heading),
  stagger: beat === "hero" ? (mobile ? 35 : motionTokens.stagger.heading) : motionTokens.stagger.item,
});

export const playNativeSequence: PlaySequence = (nodes, beat, mobile, done) => {
  const settings = sequenceSettings(beat, mobile);
  const animations: Animation[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  const dispose = () => { clearTimeout(timer); animations.forEach(animation => animation.cancel()); };
  try {
    nodes.forEach((node, index) => {
      animations.push(node.animate([
        { opacity: .72, transform: `translateY(${beat === "rule" ? 0 : settings.distance}px)` },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration: settings.duration, delay: Math.min(index * settings.stagger, motionTokens.stagger.maximum), easing: motionTokens.easing.response }));
    });
    timer = setTimeout(() => { dispose(); done(); }, settings.duration + motionTokens.stagger.maximum + 80);
  } catch { dispose(); done(); }
  return dispose;
};

/** Once-only, visible-by-default enhancement; no scroll handler or hidden SSR state. */
export function mountPageMotion(root: HTMLElement, profile: PageMotionProfile, loadHomeSequence = () => import("./gsap-sequence").then(module => module.playGsapSequence)) {
  const seen = new WeakSet<HTMLElement>();
  const queued = new Set<HTMLElement>();
  const active = new Map<HTMLElement, () => void>();
  let destroyed = false, generation = 0, frame = 0;
  let homeSequence: ReturnType<typeof loadHomeSequence> | undefined;
  const cover = document.querySelector<HTMLElement>(".route-transition-viewport");
  const blocked = () => document.hidden || cover?.dataset.active === "true";
  const available = (node: HTMLElement) => node.isConnected && node.getClientRects().length > 0 && !node.closest("details:not([open]),[inert]");
  function stop() {
    generation++;
    for (const [node, dispose] of active) { dispose(); delete node.dataset.motionBeat; }
    active.clear();
  }
  async function play(node: HTMLElement) {
    if (seen.has(node) || destroyed) return;
    if (blocked()) { queued.add(node); return; }
    if (!available(node)) return;
    queued.delete(node); seen.add(node); observer?.unobserve(node);
    if (prefersReducedMotion() || node.contains(document.activeElement)) return;
    const token = generation;
    const sequence = profile === "home" ? await (homeSequence ??= loadHomeSequence().catch(() => playNativeSequence)) : playNativeSequence;
    if (destroyed || token !== generation || blocked() || prefersReducedMotion() || !available(node) || node.contains(document.activeElement)) return;
    const beat: MotionBeat = node.matches(".home-hero") ? "hero" : node.matches(".catalog-results") ? "results" : node.matches(".portrait,.media-gallery-grid") ? "frame" : node.matches(".footer-top,.detail-section>.eyebrow") ? "rule" : node.matches("h1,h2,h3") ? "heading" : "row";
    const nodes = beat === "hero" ? Array.from(node.querySelectorAll<HTMLElement>(".hero-identity h1>span,.hero-signal-frame")) : [node];
    const done = () => { active.delete(node); delete node.dataset.motionBeat; };
    node.dataset.motionBeat = beat;
    try {
      const dispose = sequence(nodes, beat, window.innerWidth < 768, done);
      // A failed/missing animation implementation may finish synchronously.
      if (node.dataset.motionBeat) active.set(node, dispose);
    } catch { done(); }
  }
  const observer = typeof IntersectionObserver === "undefined" ? undefined : new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) void play(entry.target as HTMLElement);
  }, { threshold: .08 });
  function refresh() {
    if (destroyed) return;
    root.querySelectorAll<HTMLElement>(targets[profile]).forEach(node => {
      if (seen.has(node)) return;
      if (observer) observer.observe(node);
      // Missing IO leaves the complete server-rendered content static.
    });
  }
  const mutation = typeof MutationObserver === "undefined" ? undefined : new MutationObserver(() => {
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; refresh(); });
  });
  mutation?.observe(root, { childList: true, subtree: true });
  const release = () => { if (!blocked()) for (const node of [...queued]) void play(node); };
  const route = typeof MutationObserver === "undefined" ? undefined : new MutationObserver(release);
  if (cover) route?.observe(cover, { attributes: true, attributeFilter: ["data-active"] });
  const preference = () => { if (prefersReducedMotion()) stop(); release(); };
  const visibility = () => { if (document.hidden) stop(); else release(); };
  const focus = (event: FocusEvent) => {
    for (const [node, dispose] of active) if (node.contains(event.target as Node)) { dispose(); active.delete(node); delete node.dataset.motionBeat; }
  };
  const unsubscribe = subscribeMotion(preference);
  document.addEventListener("visibilitychange", visibility);
  root.addEventListener("focusin", focus);
  refresh();
  return () => {
    destroyed = true; stop(); queued.clear(); cancelAnimationFrame(frame);
    observer?.disconnect(); mutation?.disconnect(); route?.disconnect(); unsubscribe();
    document.removeEventListener("visibilitychange", visibility); root.removeEventListener("focusin", focus);
  };
}
