/** Critical, visible media only. On budget expiry the readable shell is explicitly
 * used as fallback, without pretending unfinished images/fonts have loaded. */
export function awaitRouteAssets(main: HTMLElement | null, signal: AbortSignal, budget = 1800): Promise<boolean> {
  return new Promise(resolve => {
    if (signal.aborted) { resolve(false); return; }
    let finished = false, frame = 0;
    const cleanups: (() => void)[] = [];
    const finish = (ready: boolean, fallback = false) => {
      if (finished) return;
      finished = true; cancelAnimationFrame(frame); clearTimeout(timeout); cleanups.forEach(cleanup => cleanup());
      if (main) main.dataset.routeAssets = ready ? (fallback ? "fallback" : "ready") : "cancelled";
      signal.removeEventListener("abort", abort); resolve(ready);
    };
    const abort = () => finish(false);
    const timeout = setTimeout(() => finish(true, true), budget);
    signal.addEventListener("abort", abort, { once: true });
    if (main) main.dataset.routeAssets = "pending";
    const images = Array.from(main?.querySelectorAll<HTMLImageElement>("img") ?? []).filter(img => {
      const rect = img.getBoundingClientRect();
      return img.hasAttribute("data-route-critical") || (rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0);
    });
    const settled = images.map(img => new Promise<void>(done => {
      const cleanup = () => { img.removeEventListener("load", complete); img.removeEventListener("error", failed); };
      const complete = () => { cleanup(); if (typeof img.decode === "function") void img.decode().catch(() => {}).then(done); else done(); };
      const failed = () => { cleanup(); done(); };
      cleanups.push(cleanup);
      if (img.complete) { complete(); return; }
      img.addEventListener("load", complete, { once: true }); img.addEventListener("error", failed, { once: true });
      if (img.complete) complete();
    }));
    let font: Promise<unknown> = Promise.resolve();
    const heading = main?.querySelector("h1");
    if (heading && document.fonts?.load) try {
      const style = getComputedStyle(heading);
      font = document.fonts.load(`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`, heading.textContent ?? "");
    } catch { /* Visible fallback font is available. */ }
    void Promise.allSettled([font, ...settled]).then(() => {
      if (finished) return;
      frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => finish(true)); });
    });
  });
}
