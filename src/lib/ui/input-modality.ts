/** Keep touch-triggered programmatic focus from drawing a keyboard ring on iOS.
 * Focus itself remains intact; Tab/keyboard input restores visible focus. */
export function mountInputModality(root: HTMLElement) {
  const previous = root.dataset.inputMode;
  const pointer = (event: PointerEvent) => {
    root.dataset.inputMode = event.pointerType === "touch" || event.pointerType === "pen" ? "touch" : "pointer";
  };
  const keyboard = (event: KeyboardEvent) => {
    if (!event.metaKey && !event.ctrlKey && !event.altKey && !["Shift", "Control", "Alt", "Meta"].includes(event.key)) root.dataset.inputMode = "keyboard";
  };
  document.addEventListener("pointerdown", pointer, { capture: true, passive: true });
  document.addEventListener("keydown", keyboard, true);
  return () => {
    document.removeEventListener("pointerdown", pointer, true);
    document.removeEventListener("keydown", keyboard, true);
    if (previous === undefined) delete root.dataset.inputMode; else root.dataset.inputMode = previous;
  };
}
