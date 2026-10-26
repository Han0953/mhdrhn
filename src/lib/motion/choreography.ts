import { prefersReducedMotion, subscribeMotion } from "./preferences";
import { prepareReveal, type RevealItem, type RevealKind, type RevealPlayer } from "./engines";
import { registerEntrance } from "./entrance";
import { languageCheckpoint, languageMotionActive, motionElementKey, registerLanguageCheckpoint } from "./language-checkpoint";
import type { SequenceOptions } from "./variants";
import { motionStartupFailed, releaseMotionStartup, claimStartupReveal, settleStartupReveal } from "./startup";
import { revealSelector } from "./selectors";
export { revealSelector } from "./selectors";

export type PageMotionProfile = "home" | "about" | "projects" | "detail" | "experience" | "lab" | "achievements" | "contact" | "footer" | "recovery" | "chrome";
// Retained for the isolated previous sequence module; active runtime uses prepareReveal.
export type MotionBeat = "hero" | "heading" | "row" | "frame" | "results" | "rule" | "copy" | "label" | "logos";
export type PlaySequence = (nodes: HTMLElement[], beat: MotionBeat, mobile: boolean, done: () => void, options?: SequenceOptions) => () => void;

const groupSelector = ".portrait-window,.home-hero,.page-heading,.story-card,.technology-item,.logo-group-heading,.timeline-row,.education-record,.skill-group,.certificate-record,.archive-row,.award-row,.education-award,.project-spread,.home-achievement-list>li,.certificate-title-list>li,.section-heading,.story-heading,.about-intro,.detail-section,.project-facts,.contact-layout,.footer-top,.footer-nav,.footer-bottom,.plain-list,.section-jumps,.catalog-controls,.catalog-feedback,.section,.home-closing";
type Group = { root: HTMLElement; items: RevealItem[]; player?: RevealPlayer; played: boolean; intersecting?: boolean; startupOwned?:boolean };
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
  return { node, kind, from, duration, delay: hero && node.matches('.hero-signal-frame') ? .12 : Math.min(order * (hero ? .09 : .065), hero ? 1 : .7) };
}

/** Layout effects stage hydrated frames; the parser-time guard covers the SSR gap. */
export function mountPageMotion(root: HTMLElement, profile: PageMotionProfile) {
  let disposed = false, frame = 0, initialFrame = 0, released = false;
  let collected = false;
  let lastScroll = window.scrollY, downTravel = 0, portraitUnlocked = false;
  const seen = new WeakSet<HTMLElement>();
  const groups = new Map<HTMLElement, Group>();
  const checkpoint = languageCheckpoint(profile);
  const restoredGroups = new WeakSet<HTMLElement>();
  portraitUnlocked = checkpoint?.portraitUnlocked ?? false;
  const cover = document.querySelector<HTMLElement>(".route-transition-viewport");
  const activeCover = () => cover?.dataset.active === "true";
  const startupFallback = motionStartupFailed() && !activeCover();
  const visible = (node: HTMLElement) => {
    const rect = node.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
  };
  // IO includes edge-adjacent intersections. Never reject its one-shot entry using
  // a second, narrower viewport: that entry may be the only event before scrolling out.
  const inViewport = (group: Group) => group.intersecting || visible(group.root);
  const scrollPortrait = (group: Group) => profile === "about" && group.items.some(item => item.kind === "portrait");
  const portraitFrame = (group: Group) => group.root.closest<HTMLElement>(".portrait");
  function stage(item: RevealItem) {
    item.node.style.setProperty("--reveal-from",item.from);
    item.node.dataset.reveal = "queued";
  }
  function settleGroup(group: Group) {
    // React's development cleanup/remount must not finish an already visible
    // CSS entrance; its finite browser animation owns its natural completion.
    if(group.startupOwned&&!disposed)group.items.forEach(({node})=>settleStartupReveal(node));
    if (scrollPortrait(group)) { const figure = portraitFrame(group); if (figure) delete figure.dataset.awaitScroll; }
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
    if (languageMotionActive()) return;
    if (scrollPortrait(group) && !portraitUnlocked && !prefersReducedMotion()) return;
    if (prefersReducedMotion() || document.hidden) { settleGroup(group); return; }
    if (!released && activeCover()) return;
    if (scrollPortrait(group)) {
      const figure = portraitFrame(group); if (figure) delete figure.dataset.awaitScroll;
    }
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
      if (seen.has(node) || node.closest("dialog,.sr-only,.role-stage,[hidden],.signal-diagram,[data-motion-static]")) return;
      if (node.closest("details:not([open])") && !node.matches("summary") && !node.closest("summary")) return;
      if (node.closest("summary") && !node.matches("summary")) return;
      if (node.matches("p") && node.closest(".rotating-roles")) return;
      if (!node.getClientRects().length) return;
      const lines = node.matches("h1,h2") ? Array.from(node.querySelectorAll<HTMLElement>(".display-line-content")) : [];
      const leaves = lines.length ? lines : node.matches(".hero-identity h1") ? Array.from(node.children) as HTMLElement[] : [node];
      const owner = node.closest<HTMLElement>(groupSelector) ?? node;
      let group = groups.get(owner);
      if (group?.played && !(!collected && group.startupOwned) && !(languageMotionActive() && restoredGroups.has(owner))) {
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
      // A failed/slow enhancement already exposed the readable server HTML.
      // Never hide it again when late hydration finally arrives.
      if(startupFallback){group.played=true;group.root.dataset.sequence='complete';return;}
      if(!collected&&!activeCover()&&!languageMotionActive()&&!scrollPortrait(group)&&inViewport(group)){
        const ownerGroup=group;
        const complete=()=>{if(!disposed&&!ownerGroup.root.matches('[data-startup-reveal="owned"]')&&!ownerGroup.root.querySelector('[data-startup-reveal="owned"]'))ownerGroup.root.dataset.sequence='complete';};
        const claimed=leaves.map(leaf=>claimStartupReveal(leaf,complete));
        if(group.startupOwned||claimed.some(Boolean)){
          group.startupOwned=true;group.played=true;group.root.dataset.engine='css-startup';group.root.dataset.sequence='startup';
          leaves.forEach((leaf,index)=>{if(!claimed[index])leaf.dataset.startupReveal='done';group.items.push(revealPlan(leaf,profile,group.items.length));});
          complete();
          return;
        }
      }
      // Only already revealed/currently visible groups stay still on a language
      // swap. Unseen groups retain their observer and their future entrance.
      if (checkpoint && languageMotionActive() && (checkpoint.played.has(motionElementKey(group.root, root)) ||
          visible(group.root) && (!scrollPortrait(group) || portraitUnlocked) && !node.matches(".portrait-photo"))) {
        group.played = true; group.root.dataset.sequence = "complete";
        restoredGroups.add(group.root);
      }
      if (group.played) return;
      leaves.forEach(leaf => {
        if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
        const plan = revealPlan(leaf,profile,group.items.length); group.items.push(plan);
        stage(plan);
      });
    });
    groups.forEach(group => {
      if (!group.played && group.items.length) {
        if (scrollPortrait(group) && !prefersReducedMotion()) {
          const figure = portraitFrame(group); if (figure) figure.dataset.awaitScroll = "true";
        }
        observer?.observe(group.root);
      }
    });
    root.dataset.motionProfile = profile;
    collected = true;
  }
  function prepare() {
    if (profile === "about" && (prefersReducedMotion() || typeof IntersectionObserver === "undefined")) {
      root.querySelectorAll<HTMLElement>(".portrait").forEach(figure => { delete figure.dataset.awaitScroll; });
    }
    collect(); groups.forEach(group => { if (!group.played && inViewport(group)) prepareGroup(group); });
    root.dataset.motionReady = "true";
    root.dataset.startupClaimed = "true";
    releaseMotionStartup(root);
  }
  function start(lead = 0) {
    if (!released) { lastScroll = window.scrollY; downTravel = 0; }
    released = true; prepare(); let order = 0;
    groups.forEach(group => { if (!group.played && inViewport(group)) play(group, Math.min(order++ * .05,.25),lead); });
  }
  function settle() { groups.forEach(settleGroup); }
  function refresh() {
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; collect(); if (released || !activeCover()) start(); });
  }
  function onScroll() {
    const current = window.scrollY, delta = current - lastScroll;
    lastScroll = current;
    // Ignore route restoration while the red curtain owns the viewport.
    if (!released || activeCover()) { downTravel = 0; return; }
    downTravel = delta > 0 ? downTravel + delta : 0;
    if (portraitUnlocked || downTravel < 12) return;
    portraitUnlocked = true;
    window.removeEventListener("scroll", onScroll);
    groups.forEach(group => { if (scrollPortrait(group)) play(group); });
  }
  const mutation = new MutationObserver(refresh); mutation.observe(root,{childList:true,subtree:true});
  const focus = (event: FocusEvent) => { for (const group of groups.values()) if (group.items.some(item => item.node.contains(event.target as Node))) settleGroup(group); };
  const preference = () => {
    if (prefersReducedMotion()) settle();
    else if (document.hidden) groups.forEach(group => { if (!scrollPortrait(group) || portraitUnlocked) settleGroup(group); });
    else refresh();
  };
  const unsubscribe = subscribeMotion(preference);
  const unregister = registerEntrance({root,prepare,start,settle});
  const unregisterCheckpoint = registerLanguageCheckpoint(root, profile, () => {
    groups.forEach(group => { if (group.played) settleGroup(group); });
    return { played: new Set(Array.from(groups.values()).filter(group => group.played).map(group => motionElementKey(group.root,root))), portraitUnlocked };
  });
  const resumeLanguage = () => {
    // No replay at the restored viewport; leave offscreen observers armed.
    groups.forEach(group => { if (inViewport(group) && (!scrollPortrait(group) || portraitUnlocked)) settleGroup(group); });
    start();
  };
  window.addEventListener("mhdrhn:language-complete",resumeLanguage);
  if (profile === "about") window.addEventListener("scroll", onScroll, { passive: true });
  root.addEventListener("focusin",focus); root.addEventListener("toggle",refresh,true); document.addEventListener("visibilitychange",preference);
  prepare(); initialFrame = requestAnimationFrame(() => { if (!activeCover()) start(); });
  return () => {
    disposed = true; cancelAnimationFrame(frame); cancelAnimationFrame(initialFrame); settle();
    observer?.disconnect(); mutation.disconnect(); unsubscribe(); unregister(); unregisterCheckpoint();
    window.removeEventListener("mhdrhn:language-complete",resumeLanguage);
    if (profile === "about") window.removeEventListener("scroll", onScroll);
    root.removeEventListener("focusin",focus); root.removeEventListener("toggle",refresh,true); document.removeEventListener("visibilitychange",preference);
    groups.forEach(group => { delete group.root.dataset.sequence; delete group.root.dataset.engine; }); groups.clear();
    delete root.dataset.motionReady; delete root.dataset.motionProfile;
  };
}
