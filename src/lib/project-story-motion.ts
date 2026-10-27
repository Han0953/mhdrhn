import { prefersReducedMotion, subscribeMotion } from "./motion/preferences";
import { scrollToPosition } from "./motion/smooth-scroll";

/** Native scroll enhancement. No wheel interception, root scroll lock or external animation library. */
export function mountProjectStory(root: HTMLElement) {
  const sticky = root.querySelector<HTMLElement>(".story-sticky")!;
  const overview = root.querySelector<HTMLElement>(".story-overview")!;
  const viewport = root.querySelector<HTMLElement>(".story-viewport")!;
  const track = root.querySelector<HTMLElement>(".story-track")!;
  const progress = root.querySelector<HTMLElement>(".story-progress>span");
  const cards = Array.from(track.querySelectorAll<HTMLElement>(".story-card"));
  const media = cards.map(card => card.querySelector<HTMLElement>(".story-media-motion"));
  const controls = Array.from(root.querySelectorAll?.<HTMLElement>("[data-story-target]") ?? []);
  let centers: number[] = [], viewportWidth = 0, inView = true;
  const desktop = window.matchMedia("(min-width: 1024px)");
  let travel = 0, scrollDistance = 0, endPause = 0, activeRange = 1, pinned = false, frame = 0, destroyed = false, pinTop = 0, activeIndex = -1;
  let measuredWidth = window.innerWidth, measuredHeight = window.innerHeight;
  let scrollAnimations: Animation[] = [], lastOffset = Number.NaN;
  const top = () => Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height"));
  function cancelScrollAnimations() {
    scrollAnimations.forEach(animation => animation.cancel()); scrollAnimations = [];
    delete root.dataset.scrollDriver;
  }
  function linkMobileScroll() {
    const Timeline = (window as unknown as {ViewTimeline?:new(options:{subject:Element;axis:"block";inset:string})=>AnimationTimeline}).ViewTimeline;
    if (!pinned) return;
    root.dataset.scrollDriver = "raf";
    if (desktop.matches || typeof Timeline !== "function" || typeof track.animate !== "function" || typeof CSS === "undefined" || !CSS.supports("animation-range","contain 0% contain 100%")) return;
    try {
      // The browser drives transforms with scrolling, independent of JS frame
      // delivery during native touch momentum. Normalize to the actual sticky
      // stage, including when mobile browser chrome changes the scrollport.
      const stageEnd = pinTop + sticky.getBoundingClientRect().height;
      const timeline = new Timeline({subject:root,axis:"block",inset:`${pinTop}px calc(100% - ${stageEnd}px)`});
      const timing:KeyframeAnimationOptions & {rangeStart:string;rangeEnd:string} = {timeline,rangeStart:"contain 0%",rangeEnd:"contain 100%",fill:"both",easing:"linear"};
      activeRange = scrollDistance / (scrollDistance + endPause);
      scrollAnimations.push(track.animate([{offset:0,transform:"translate3d(0px,0,0)"},{offset:activeRange,transform:`translate3d(${-travel}px,0,0)`},{offset:1,transform:`translate3d(${-travel}px,0,0)`}],timing));
      if (progress) scrollAnimations.push(progress.animate([{offset:0,transform:"scaleX(0)"},{offset:activeRange,transform:"scaleX(1)"},{offset:1,transform:"scaleX(1)"}],timing));
      void scrollAnimations[0].ready?.then(requestDraw,()=>{});
      root.dataset.scrollDriver = "timeline";
    } catch { cancelScrollAnimations(); root.dataset.scrollDriver = "raf"; }
  }
  function draw() {
    if (!pinned || destroyed || !inView || document.hidden) return;
    const nativeProgress = scrollAnimations[0]?.effect?.getComputedTiming().progress;
    const position = typeof nativeProgress === "number" ? nativeProgress / activeRange : (pinTop - root.getBoundingClientRect().top) / scrollDistance;
    const offset = travel * Math.min(1, Math.max(0, position));
    if (offset === lastOffset) return;
    lastOffset = offset;
    if (!scrollAnimations.length) {
      track.style.transform = `translate3d(${-offset}px,0,0)`;
      // Keep progress updates off the root: inherited custom-property changes
      // force style work through every card and image on each scroll frame.
      if (progress) progress.style.transform = `scaleX(${travel ? offset / travel : 0})`;
    }
    if (desktop.matches) media.forEach((node, index) => node?.style.setProperty("--story-emphasis", String(Math.max(0, 1 - Math.abs(centers[index] - offset - viewportWidth / 2) / (viewportWidth * .7)))));
    const active = Math.round((travel ? offset / travel : 0) * Math.max(0, cards.length - 1));
    if (active === activeIndex) return;
    activeIndex = active;
    controls.forEach((button, index) => {
      if (index === active) { if (button.getAttribute("aria-current") !== "step") button.setAttribute("aria-current", "step"); }
      else button.removeAttribute("aria-current");
    });
  }
  function requestDraw() { if (!destroyed && !frame && inView && !document.hidden) frame = requestAnimationFrame(() => { frame = 0; draw(); }); }
  function measure() {
    if (destroyed) return;
    cancelScrollAnimations(); lastOffset = Number.NaN;
    const list = root.dataset.view === "list";
    // Use the layout viewport (without the scrollbar), never 100vw that can spill horizontally.
    const gutter = Math.max(0, root.getBoundingClientRect().left);
    root.style.setProperty("--story-gutter", `${gutter}px`);
    root.style.setProperty("--story-height", `${measuredHeight - top()}px`);
    pinned = !list && !prefersReducedMotion() && measuredHeight - top() >= 480;
    root.dataset.mode = pinned ? "pinned" : "native";
    // Mobile keeps the heading in view; desktop lets it scroll away above the rail.
    const overviewHeight = overview.getBoundingClientRect().height;
    pinTop = top() - (desktop.matches ? overviewHeight : 0);
    root.style.setProperty("--story-overview-height", `${overviewHeight}px`);
    root.style.setProperty("--story-top", `${pinTop}px`);
    // Long text, zoom and short windows must remain readable rather than trapped in a crop.
    if (pinned && cards.some(card => card.scrollHeight > card.clientHeight + 1 || card.clientHeight > viewport.clientHeight)) {
      pinned = false;
      root.dataset.mode = "native";
    }
    // Flex overflow can omit the trailing padding. Measure the final card and retain its gutter.
    const lastCard = cards.at(-1);
    travel = lastCard ? Math.max(0, Math.ceil(lastCard.offsetLeft + lastCard.offsetWidth + gutter - viewport.clientWidth)) : 0;
    root.style.setProperty("--story-travel",`${travel}`);
    scrollDistance = desktop.matches ? travel : travel * 1.6;
    root.style.setProperty("--story-scroll-distance",`${scrollDistance}`);
    centers = cards.map(card => card.offsetLeft + card.offsetWidth / 2);
    viewportWidth = viewport.clientWidth;
    if (travel <= 0) { pinned = false; root.dataset.mode = "native"; }
    endPause = desktop.matches ? Math.min(160, (measuredHeight - top()) * .15) : Math.min(80, (measuredHeight - top()) * .08);
    root.style.height = pinned ? `${sticky.getBoundingClientRect().height + scrollDistance + endPause}px` : "";
    linkMobileScroll();
    if (pinned) { viewport.scrollLeft = 0; draw(); }
    else { activeIndex = -1; track.style.transform = ""; if (progress) progress.style.transform = ""; root.style.removeProperty("--story-progress"); media.forEach(node => node?.style.removeProperty("--story-emphasis")); controls.forEach(button => button.removeAttribute("aria-current")); }
  }
  function goTo(index: number) {
    const card = cards[Math.max(0, Math.min(cards.length - 1, index))];
    if (!card || root.dataset.view === "list") return;
    const offset = card === cards.at(-1) ? travel : Math.min(travel, card.offsetLeft - cards[0].offsetLeft);
    if (pinned) scrollToPosition(window.scrollY + root.getBoundingClientRect().top - pinTop + (travel ? offset / travel * scrollDistance : 0),prefersReducedMotion(),{duration:1.25,easing:p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2});
    else viewport.scrollTo({ left: card.offsetLeft - cards[0].offsetLeft, behavior: prefersReducedMotion() ? "instant" : "smooth" });
  }
  function onFocus(event: FocusEvent) {
    const index = cards.findIndex(card => card.contains(event.target as Node));
    // Make keyboard focus visible even when its card is outside the sticky viewport.
    if (index >= 0 && pinned) {
      viewport.scrollLeft = 0;
      const target = (event.target as HTMLElement).getBoundingClientRect();
      const bounds = viewport.getBoundingClientRect();
      if (target.left < bounds.left || target.right > bounds.right) { viewport.scrollLeft = 0; goTo(index); }
    }
  }
  function onClick(event: MouseEvent) {
    const button = (event.target as HTMLElement).closest<HTMLElement>("[data-story-target]");
    if (button && root.contains(button)) goTo(Number(button.dataset.storyTarget));
  }
  const preventNestedScroll = () => { if (pinned && viewport.scrollLeft !== 0) viewport.scrollLeft = 0; };
  let width = -1;
  function onWindowResize() {
    // Mobile browser chrome changes height during a swipe. Keep the measured
    // rail stable; reflow on rotation, desktop resizing or a real large resize.
    const nextWidth = window.innerWidth, nextHeight = window.innerHeight;
    if (desktop.matches || nextWidth !== measuredWidth || Math.abs(nextHeight - measuredHeight) > 160) {
      measuredWidth = nextWidth; measuredHeight = nextHeight; measure();
    }
  }
  // Only width can invalidate the layout here; measuring our own height changes would loop.
  const resize = new ResizeObserver(entries => {
    const nextWidth = entries[0].contentRect.width;
    if (nextWidth !== width) { width = nextWidth; measure(); }
  });
  resize.observe(root);
  const view = new MutationObserver(measure);
  view.observe(root, { attributes: true, attributeFilter: ["data-view"] });
  window.addEventListener("scroll", requestDraw, { passive: true });
  window.addEventListener("resize", onWindowResize);
  const unsubscribe = subscribeMotion(measure);
  const visibility = () => { if (!document.hidden) requestDraw(); };
  document.addEventListener("visibilitychange", visibility);
  document.addEventListener("scrollend", requestDraw);
  const visible = typeof IntersectionObserver === "undefined" ? undefined : new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; if (inView) requestDraw(); });
  visible?.observe(root);
  desktop.addEventListener("change", measure);
  root.addEventListener("focusin", onFocus); root.addEventListener("click", onClick);
  viewport.addEventListener("scroll", preventNestedScroll, {passive:true});
  void document.fonts.ready.then(measure);
  measure();
  return () => {
    destroyed = true; cancelAnimationFrame(frame); cancelScrollAnimations(); resize.disconnect(); view.disconnect();
    visible?.disconnect(); document.removeEventListener("visibilitychange", visibility);
    document.removeEventListener("scrollend", requestDraw);
    window.removeEventListener("scroll", requestDraw); window.removeEventListener("resize", onWindowResize);
    unsubscribe(); desktop.removeEventListener("change", measure);
    root.removeEventListener("focusin", onFocus); root.removeEventListener("click", onClick);
    viewport.removeEventListener("scroll", preventNestedScroll);
    delete root.dataset.mode; root.style.height = ""; track.style.transform = "";
    if (progress) progress.style.transform = "";
    media.forEach(node => node?.style.removeProperty("--story-emphasis"));
    controls.forEach(button => button.removeAttribute("aria-current"));
    for (const property of ["--story-progress", "--story-travel", "--story-scroll-distance", "--story-gutter", "--story-height", "--story-overview-height", "--story-top"]) root.style.removeProperty(property);
  };
}
