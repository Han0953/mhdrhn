/** Theme tokens interpolate once at the root; descendants inherit the same frame.
 * Suppress local color transitions while it runs, avoiding delayed/double easing.
 */
export function mountThemeMotion(root: HTMLElement) {
  let dark = root.classList.contains("dark");
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  const frame = requestAnimationFrame(() => {
    if (!disposed) root.dataset.themeReady = "true";
  });
  const observer = new MutationObserver(() => {
    const next = root.classList.contains("dark");
    if (next === dark) return;
    dark = next;
    clearTimeout(timer);
    root.dataset.themeChanging = "true";
    timer = setTimeout(() => { delete root.dataset.themeChanging; }, 520);
  });
  observer.observe(root, { attributes: true, attributeFilter: ["class"] });
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    observer.disconnect();
    delete root.dataset.themeReady;
    delete root.dataset.themeChanging;
  };
}
