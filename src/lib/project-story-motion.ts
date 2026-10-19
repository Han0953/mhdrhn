/** Native scroll enhancement. No wheel interception, root scroll lock or external animation library. */
export function mountProjectStory(root: HTMLElement) {
  const sticky = root.querySelector<HTMLElement>(".story-sticky")!;
  const viewport = root.querySelector<HTMLElement>(".story-viewport")!;
  const track = root.querySelector<HTMLElement>(".story-track")!;
  const cards = Array.from(track.querySelectorAll<HTMLElement>(".story-card"));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia("(min-width: 1024px)");
  let travel = 0, pinned = false, frame = 0, destroyed = false;
  const top = () => Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) + 12;
  function draw() {
    if (!pinned || destroyed) return;
    const offset = Math.min(travel, Math.max(0, top() - root.getBoundingClientRect().top));
    track.style.transform = `translate3d(${-offset}px,0,0)`;
    root.style.setProperty("--story-progress", String(travel ? offset / travel : 0));
  }
  function requestDraw() { if (!frame) frame = requestAnimationFrame(() => { frame = 0; draw(); }); }
  function measure() {
    if (destroyed) return;
    const list = root.dataset.view === "list";
    travel = Math.max(0, track.scrollWidth - viewport.clientWidth);
    pinned = !list && desktop.matches && !reduced.matches && travel > 0 && sticky.getBoundingClientRect().height <= window.innerHeight - top() - 16;
    root.dataset.mode = pinned ? "pinned" : "native";
    root.style.height = pinned ? `${sticky.getBoundingClientRect().height + travel}px` : "";
    if (pinned) { viewport.scrollLeft = 0; draw(); }
    else { track.style.transform = ""; root.style.removeProperty("--story-progress"); }
  }
  function goTo(index: number) {
    const card = cards[Math.max(0, Math.min(cards.length - 1, index))];
    if (!card || root.dataset.view === "list") return;
    const offset = Math.min(travel, card.offsetLeft - cards[0].offsetLeft);
    if (pinned) window.scrollTo({ top: window.scrollY + root.getBoundingClientRect().top - top() + offset, behavior: "instant" });
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
  const resize = new ResizeObserver(measure);
  resize.observe(sticky); resize.observe(viewport);
  const view = new MutationObserver(measure);
  view.observe(root, { attributes: true, attributeFilter: ["data-view"] });
  window.addEventListener("scroll", requestDraw, { passive: true });
  window.addEventListener("resize", measure);
  reduced.addEventListener("change", measure); desktop.addEventListener("change", measure);
  root.addEventListener("focusin", onFocus); root.addEventListener("click", onClick);
  void document.fonts.ready.then(measure);
  measure();
  return () => {
    destroyed = true; cancelAnimationFrame(frame); resize.disconnect(); view.disconnect();
    window.removeEventListener("scroll", requestDraw); window.removeEventListener("resize", measure);
    reduced.removeEventListener("change", measure); desktop.removeEventListener("change", measure);
    root.removeEventListener("focusin", onFocus); root.removeEventListener("click", onClick);
    delete root.dataset.mode; root.style.height = ""; track.style.transform = ""; root.style.removeProperty("--story-progress");
  };
}
