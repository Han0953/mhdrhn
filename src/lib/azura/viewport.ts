/** Follow the visible viewport, including mobile keyboard resize and browser panning. */
export function mountChatViewport(dialog: HTMLElement) {
  const viewport = window.visualViewport;
  let frame = 0;
  function update() {
    dialog.style.setProperty("--chat-viewport-height", `${viewport?.height ?? window.innerHeight}px`);
    dialog.style.setProperty("--chat-viewport-top", `${viewport?.offsetTop ?? 0}px`);
    dialog.dataset.keyboard = viewport && window.innerHeight - viewport.height > 120 ? "true" : "false";
  }
  function queue() { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); }
  update();
  viewport?.addEventListener("resize", queue); viewport?.addEventListener("scroll", queue);
  window.addEventListener("resize", queue);
  return () => { cancelAnimationFrame(frame); viewport?.removeEventListener("resize", queue); viewport?.removeEventListener("scroll", queue); window.removeEventListener("resize", queue); };
}
