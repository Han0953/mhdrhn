import { prefersReducedMotion, subscribeMotion } from "./preferences";
import { prepareReveal, type RevealItem, type RevealKind, type RevealPlayer } from "./engines";
import { registerEntrance } from "./entrance";
import type { SequenceOptions } from "./variants";

export type PageMotionProfile = "home" | "about" | "projects" | "detail" | "experience" | "lab" | "achievements" | "contact" | "footer" | "recovery" | "chrome";
// Retained for the isolated previous sequence module; active runtime uses prepareReveal.
export type MotionBeat = "hero" | "heading" | "row" | "frame" | "results" | "rule" | "copy" | "label" | "logos";
export type PlaySequence = (nodes: HTMLElement[], beat: MotionBeat, mobile: boolean, done: () => void, options?: SequenceOptions) => () => void;

/** Actual content leaves; media images and diagram coordinates keep their own transforms. */
export const revealSelector = [
  "h1,h2,h3,h4,p,figcaption,dt,dd,summary,button",
  ".technology-item,.technology-mark,.technology-label,.technology-badge",
  ".plain-list>li,.home-domain-list>li,.tags>span,.tag-list>li",
  ".timeline-row,.education-record,.skill-group,.certificate-record,.archive-row,.award-row,.education-award,.project-spread",
  ".home-achievement-list>li,.certificate-title-list>li,.search-field,.status-field",
  ".home-entry-year,.archive-number,.project-number,.award-row>span,.education-award>span,.timeline-row>.meta,.footer-bottom>span",
  ".text-link,.button-primary,.footer-cta,.footer-wordmark,.contact-link,nav>a",
  ".portrait-photo,.media-gallery-grid .media-frame,.project-spread .media-frame,.archive-thumbnail,.story-media",
  ".wordmark,.media-enlarge",
  ".text-link>svg,.button-primary>svg,.contact-link>svg,.footer-cta>svg,.icon-button>svg",
  ".hero-signal-frame,.rotating-roles,.hero-top>.meta,.project-facts>div",
].join(",");
const groupSelector = ".portrait-window,.home-hero,.page-heading,.story-card,.technology-item,.logo-group-heading,.timeline-row,.education-record,.skill-group,.certificate-record,.archive-row,.award-row,.education-award,.project-spread,.home-achievement-list>li,.certificate-title-list>li,.section-heading,.story-heading,.about-intro,.detail-section,.project-facts,.contact-layout,.footer-top,.footer-nav,.footer-bottom,.plain-list,.section-jumps,.catalog-controls,.catalog-feedback,.section,.home-closing";
type Group = { root: HTMLElement; items: RevealItem[]; player?: RevealPlayer; played: boolean; intersecting?: boolean };
function kindOf(node: HTMLElement): RevealKind {
  if (node.matches(".portrait-photo")) return "portrait";
  if (node.matches("svg,.technology-mark,.technology-badge,.media-enlarge")) return "icon";
  if (node.matches("h1,h2,h3,h4,.display-line-content,.footer-wordmark")) return "title";
  if (node.matches(".portrait,.media-frame,.archive-thumbnail,.story-media,.hero-signal-frame")) return "media";
  if (node.matches(".technology-item,.timeline-row,.education-record,.skill-group,.certificate-record,.archive-row,.award-row,.education-award,.project-spread,.home-achievement-list>li,.certificate-title-list>li")) return "card";
  if (node.matches("a,button,summary")) return "action";
  if (node.matches(".eyebrow,.meta,.home-entry-year,.technology-label,dt")) return "label";
  return "copy";
}
export function revealPlan(node: HTMLElement, profile: PageMotionProfile, order: number): RevealItem {
  const mobile = window.innerWidth < 768, kind = kindOf(node);
  const technical = profile === "lab" || profile === "experience" || !!node.closest(".story-electronics");
  const closing = profile === "contact" || !!node.closest(".home-closing");
  const distance = mobile ? 24 : 44;
  const x = technical ? (mobile ? -9 : -18) : closing ? (mobile ? -8 : -18) : 0;
  const y = kind === "portrait" ? (mobile ? 64 : 96) : kind === "title" ? distance : kind === "media" ? 18 : kind === "card" ? 12 : 10;
  const scale = kind === "icon" ? .48 : kind === "media" ? .94 : kind === "card" ? .97 : 1;
  const rotation = kind === "icon" ? -24 : kind === "title" ? (mobile ? .4 : .7) : 0;
  const from = `perspective(900px) translate3d(${x}px,${y}px,0) rotate(${rotation}deg) rotateX(${kind === "card" ? 6 : 0}deg) scale(${scale})`;
  const hero = !!node.closest(".home-hero");
  const duration = kind === "portrait" ? 1.35 : kind === "title" ? (hero ? 1.35 : 1.05) : kind === "media" ? 1.1 : kind === "card" ? .85 : kind === "icon" ? .75 : .65;
  return { node, kind, from, duration, delay: Math.min(order * (hero ? .09 : .065), hero ? 1 : .7) };
}

/** useLayoutEffect prepares before paint. Navigation primes under the red curtain. */
export function mountPageMotion(root: HTMLElement, profile: PageMotionProfile) {
  let disposed = false, frame = 0, initialFrame = 0, released = false;
  const seen = new WeakSet<HTMLElement>();
  const groups = new Map<HTMLElement, Group>();
  const cover = document.querySelector<HTMLElement>(".route-transition-viewport");
  const activeCover = () => cover?.dataset.active === "true";
  const visible = (node: HTMLElement) => {
    const rect = node.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
  };
  // IO includes edge-adjacent intersections. Never reject its one-shot entry using
  // a second, narrower viewport: that entry may be the only event before scrolling out.
  const inViewport = (group: Group) => group.intersecting || visible(group.root);
  function stage(item: RevealItem) {
    item.node.style.setProperty("--reveal-from",item.from);
    item.node.dataset.reveal = "queued";
  }
  function settleGroup(group: Group) {
    group.player?.finish(); group.played = true;
    group.items.forEach(({node}) => { if (!group.player) { node.style.removeProperty("--reveal-from"); delete node.dataset.reveal; } });
    observer?.unobserve(group.root);
  }
  function prepareGroup(group: Group) {
    if (group.player || group.played || disposed) return;
    const engine = group.root.matches(".home-hero,.page-heading,.section-heading,.story-heading") || group.items.some(item => item.node.matches("h1,h2,.display-line-content,.footer-wordmark")) ? "gsap" : "motion";
    group.player = prepareReveal(group.items, engine, () => { group.root.dataset.sequence = "complete"; });
    group.root.dataset.engine = engine; group.root.dataset.sequence = "prepared";
  }
  function play(group: Group, wave = 0, lead = 0) {
    if (disposed || group.played || !group.root.isConnected || !inViewport(group)) return;
    if (prefersReducedMotion() || document.hidden) { settleGroup(group); return; }
    if (!released && activeCover()) return;
    group.items.forEach(item => { item.delay += wave; });
    prepareGroup(group); group.played = true; group.root.dataset.sequence = "playing";
    observer?.unobserve(group.root); group.player?.play(lead);
  }
  const observer = typeof IntersectionObserver === "undefined" ? undefined : new IntersectionObserver(entries => {
    const incoming: Group[] = [];
    for (const entry of entries) {
      const group = groups.get(entry.target as HTMLElement);
      if (!group) continue;
      group.intersecting = entry.isIntersecting;
      if (entry.isIntersecting && !group.played) incoming.push(group);
    }
    incoming.sort((a,b) => a.root === b.root ? 0 : a.root.compareDocumentPosition(b.root) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
    incoming.forEach((group,index) => play(group, Math.min(index * .07, .42)));
  }, { threshold: 0 });
  function collect() {
    if (disposed) return;
    for (const [node,group] of groups) if (!node.isConnected) { settleGroup(group); groups.delete(node); }
    root.querySelectorAll<HTMLElement>(revealSelector).forEach(node => {
      if (seen.has(node) || node.closest("dialog,.sr-only,.role-stage,[hidden],.signal-diagram")) return;
      if (node.closest("details:not([open])") && !node.matches("summary") && !node.closest("summary")) return;
      if (node.closest("summary") && !node.matches("summary")) return;
      if (node.matches("p") && node.closest(".rotating-roles")) return;
      if (!node.getClientRects().length) return;
      const lines = node.matches("h1,h2") ? Array.from(node.querySelectorAll<HTMLElement>(".display-line-content")) : [];
      const leaves = lines.length ? lines : node.matches(".hero-identity h1") ? Array.from(node.children) as HTMLElement[] : [node];
      const owner = node.closest<HTMLElement>(groupSelector) ?? node;
      let group = groups.get(owner);
      if (group?.played) {
        group = groups.get(node);
        if (!group) { group = {root:node,items:[],played:false}; groups.set(node,group); }
      }
      if (!group) { group = {root:owner,items:[],played:false}; groups.set(owner,group); }
      if (group.player && !group.played) {
        // A paused timeline owns a fixed snapshot. Rebuild it when streamed/query
        // content arrives, instead of hiding a leaf the old player cannot restore.
        group.player.finish(); group.player = undefined;
        delete group.root.dataset.sequence; delete group.root.dataset.engine;
        group.items.forEach(stage);
      }
      seen.add(node);
      leaves.forEach(leaf => {
        if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
        const plan = revealPlan(leaf,profile,group.items.length); group.items.push(plan);
        stage(plan);
      });
    });
    groups.forEach(group => { if (!group.played && group.items.length) observer?.observe(group.root); });
    root.dataset.motionProfile = profile;
  }
  function prepare() {
    collect(); groups.forEach(group => { if (!group.played && inViewport(group)) prepareGroup(group); });
    root.dataset.motionReady = "true";
  }
  function start(lead = 0) {
    released = true; prepare(); let order = 0;
    groups.forEach(group => { if (!group.played && inViewport(group)) play(group, Math.min(order++ * .05,.25),lead); });
  }
  function settle() { groups.forEach(settleGroup); }
  function refresh() {
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; collect(); if (released || !activeCover()) start(); });
  }
  const mutation = new MutationObserver(refresh); mutation.observe(root,{childList:true,subtree:true});
  const focus = (event: FocusEvent) => { for (const group of groups.values()) if (group.items.some(item => item.node.contains(event.target as Node))) settleGroup(group); };
  const preference = () => { if (prefersReducedMotion() || document.hidden) settle(); else refresh(); };
  const unsubscribe = subscribeMotion(preference);
  const unregister = registerEntrance({root,prepare,start,settle});
  root.addEventListener("focusin",focus); root.addEventListener("toggle",refresh,true); document.addEventListener("visibilitychange",preference);
  prepare(); initialFrame = requestAnimationFrame(() => { if (!activeCover()) start(); });
  return () => {
    disposed = true; cancelAnimationFrame(frame); cancelAnimationFrame(initialFrame); settle();
    observer?.disconnect(); mutation.disconnect(); unsubscribe(); unregister();
    root.removeEventListener("focusin",focus); root.removeEventListener("toggle",refresh,true); document.removeEventListener("visibilitychange",preference);
    groups.forEach(group => { delete group.root.dataset.sequence; delete group.root.dataset.engine; }); groups.clear();
    delete root.dataset.motionReady; delete root.dataset.motionProfile;
  };
}
