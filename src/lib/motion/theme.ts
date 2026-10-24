let languageTheme: "dark" | "light" | undefined;
let languageThemeStyle: HTMLStyleElement | undefined;

export function captureLanguageTheme() {
  languageTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
  languageThemeStyle?.remove();
  languageThemeStyle=document.createElement("style");
  languageThemeStyle.textContent="html{transition:none!important}";
  document.head.append(languageThemeStyle);
}
export function releaseLanguageTheme() { languageTheme = undefined; languageThemeStyle?.remove(); languageThemeStyle=undefined; }

/** A locale root can replace html's font classes before next-themes' passive
 * effect. Restore the resolved theme in the layout phase, before paint/text capture. */
export function restoreThemeBeforePaint(root: HTMLElement) {
  if(languageThemeStyle&&!languageThemeStyle.isConnected)document.head.append(languageThemeStyle);
  let theme = languageTheme;
  if (!theme) {
    let preference: string | null = null;
    try { preference = localStorage.getItem("theme"); } catch { /* Preserve an existing bootstrap theme when storage is unavailable. */ }
    theme = preference === "dark" || preference === "light" ? preference :
      preference === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") :
      root.classList.contains("dark") ? "dark" : root.classList.contains("light") ? "light" :
      matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  root.classList.toggle("dark",theme === "dark");
  root.classList.toggle("light",theme === "light");
  root.style.colorScheme = theme;
}

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
