/** Wait for fonts and visible/eager images, including failure, without waiting for offscreen lazy media. */
export function awaitRouteAssets(main: HTMLElement | null, signal: AbortSignal): Promise<boolean> {
  return new Promise(resolve => {
    let finished = false, frame = 0;
    const cleanups: (() => void)[] = [];
    const finish = (ready: boolean) => {
      if (finished) return;
      finished = true; cancelAnimationFrame(frame); cleanups.forEach(cleanup => cleanup());
      signal.removeEventListener("abort", abort); resolve(ready);
    };
    const abort = () => finish(false);
    if (signal.aborted) { finish(false); return; }
    signal.addEventListener("abort", abort, { once: true });
    const images = Array.from(main?.querySelectorAll<HTMLImageElement>("img") ?? []).filter(img => {
      const rect = img.getBoundingClientRect();
      return img.loading !== "lazy" || img.fetchPriority === "high" || (rect.bottom > 0 && rect.top < window.innerHeight);
    });
    const settled = images.map(img => img.complete ? Promise.resolve() : new Promise<void>(done => {
      const cleanup = () => { img.removeEventListener("load", complete); img.removeEventListener("error", complete); };
      const complete = () => { cleanup(); done(); };
      cleanups.push(cleanup);
      img.addEventListener("load", complete, { once: true }); img.addEventListener("error", complete, { once: true });
      if (img.complete) complete();
    }));
    void Promise.allSettled([document.fonts.ready, ...settled]).then(() => {
      if (finished) return;
      frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => finish(true)); });
    });
  });
}
