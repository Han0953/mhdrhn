import { prefersReducedMotion, subscribeMotion } from "./motion/preferences";

/** Native scroll enhancement. No wheel interception, root scroll lock or external animation library. */
export function mountProjectStory(root: HTMLElement) {
  const sticky = root.querySelector<HTMLElement>(".story-sticky")!;
  const overview = root.querySelector<HTMLElement>(".story-overview")!;
  const viewport = root.querySelector<HTMLElement>(".story-viewport")!;
  const track = root.querySelector<HTMLElement>(".story-track")!;
  const cards = Array.from(track.querySelectorAll<HTMLElement>(".story-card"));
  const media = cards.map(card => card.querySelector<HTMLElement>(".story-media-motion"));
  let centers: number[] = [], viewportWidth = 0, inView = true;
  const desktop = window.matchMedia("(min-width: 1024px)");
  let travel = 0, pinned = false, frame = 0, destroyed = false, pinTop = 0;
  const top = () => Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height"));
  function draw() {
    if (!pinned || destroyed || !inView || document.hidden) return;
    const offset = Math.min(travel, Math.max(0, pinTop - root.getBoundingClientRect().top));
    track.style.transform = `translate3d(${-offset}px,0,0)`;
    root.style.setProperty("--story-progress", String(travel ? offset / travel : 0));
    media.forEach((node, index) => node?.style.setProperty("--story-emphasis", String(Math.max(0, 1 - Math.abs(centers[index] - offset - viewportWidth / 2) / (viewportWidth * .7)))));
  }
  function requestDraw() { if (!frame && inView && !document.hidden) frame = requestAnimationFrame(() => { frame = 0; draw(); }); }
  function measure() {
    if (destroyed) return;
    const list = root.dataset.view === "list";
    // Use the layout viewport (without the scrollbar), never 100vw that can spill horizontally.
    const gutter = Math.max(0, root.getBoundingClientRect().left);
    root.style.setProperty("--story-gutter", `${gutter}px`);
    root.style.setProperty("--story-height", `${window.innerHeight - top()}px`);
    pinned = !list && !prefersReducedMotion() && window.innerHeight - top() >= 480;
    root.dataset.mode = pinned ? "pinned" : "native";
    // Let the introduction scroll out before the card stage pins, on every breakpoint.
    const overviewHeight = overview.getBoundingClientRect().height;
    pinTop = top() - overviewHeight;
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
    centers = cards.map(card => card.offsetLeft + card.offsetWidth / 2);
    viewportWidth = viewport.clientWidth;
    if (travel <= 0) { pinned = false; root.dataset.mode = "native"; }
    const endPause = Math.min(160, (window.innerHeight - top()) * .15);
    root.style.height = pinned ? `${sticky.getBoundingClientRect().height + travel + endPause}px` : "";
    if (pinned) { viewport.scrollLeft = 0; draw(); }
    else { track.style.transform = ""; root.style.removeProperty("--story-progress"); media.forEach(node => node?.style.removeProperty("--story-emphasis")); }
  }
  function goTo(index: number) {
    const card = cards[Math.max(0, Math.min(cards.length - 1, index))];
    if (!card || root.dataset.view === "list") return;
    const offset = Math.min(travel, card.offsetLeft - cards[0].offsetLeft);
    if (pinned) window.scrollTo({ top: window.scrollY + root.getBoundingClientRect().top - pinTop + offset, behavior: "instant" });
    else viewport.scrollTo({ left: card.offsetLeft - cards[0].offsetLeft, behavior: "instant" });
  }
  function onFocus(event: FocusEvent) {
    const index = cards.findIndex(card => card.contains(event.target as Node));
    // Make keyboard focus visible even when its card is outside the sticky viewport.
    if (index >= 0 && pinned) {
      const target = (event.target as HTMLElement).getBoundingClientRect();
      const bounds = viewport.getBoundingClientRect();
      if (target.left < bounds.left || target.right > bounds.right) { viewport.scrollLeft = 0; goTo(index); }
    }
  }
  function onClick(event: MouseEvent) {
    const button = (event.target as HTMLElement).closest<HTMLElement>("[data-story-target]");
    if (button && root.contains(button)) goTo(Number(button.dataset.storyTarget));
  }
  let width = -1;
  // Only width can invalidate the layout here; measuring our own height changes would loop.
  const resize = new ResizeObserver(entries => {
    const nextWidth = entries[0].contentRect.width;
    if (nextWidth !== width) { width = nextWidth; measure(); }
  });
  resize.observe(root);
  const view = new MutationObserver(measure);
  view.observe(root, { attributes: true, attributeFilter: ["data-view"] });
  window.addEventListener("scroll", requestDraw, { passive: true });
  window.addEventListener("resize", measure);
  const unsubscribe = subscribeMotion(measure);
  const visibility = () => { if (!document.hidden) requestDraw(); };
  document.addEventListener("visibilitychange", visibility);
  const visible = typeof IntersectionObserver === "undefined" ? undefined : new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; if (inView) requestDraw(); });
  visible?.observe(root);
  desktop.addEventListener("change", measure);
  root.addEventListener("focusin", onFocus); root.addEventListener("click", onClick);
  void document.fonts.ready.then(measure);
  measure();
  return () => {
    destroyed = true; cancelAnimationFrame(frame); resize.disconnect(); view.disconnect();
    visible?.disconnect(); document.removeEventListener("visibilitychange", visibility);
    window.removeEventListener("scroll", requestDraw); window.removeEventListener("resize", measure);
    unsubscribe(); desktop.removeEventListener("change", measure);
    root.removeEventListener("focusin", onFocus); root.removeEventListener("click", onClick);
    delete root.dataset.mode; root.style.height = ""; track.style.transform = "";
    media.forEach(node => node?.style.removeProperty("--story-emphasis"));
    for (const property of ["--story-progress", "--story-gutter", "--story-height", "--story-overview-height", "--story-top"]) root.style.removeProperty(property);
  };
}
