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
      // Deferred portraits and collapsed content are not part of the first
      // frame. Waiting for their lazy images holds the curtain until timeout.
      if (img.closest('[data-await-scroll="true"],[hidden],details:not([open])')) return false;
      const rect = img.getBoundingClientRect();
      return img.hasAttribute("data-route-critical") || (rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth && rect.width > 0 && rect.height > 0);
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

/** Home's real canvas must render its first frame, independently of the media budget. */
export function awaitHomeScene(main:HTMLElement|null,signal:AbortSignal,budget=8000):Promise<boolean>{
  const scene=main?.querySelector<HTMLElement>('[data-home-scene]');
  if(signal.aborted)return Promise.resolve(false);
  if(!scene||scene.dataset.sceneState!=='pending')return Promise.resolve(true);
  return new Promise(resolve=>{
    let done=false;
    function finish(value:boolean){if(done)return;done=true;clearTimeout(timer);signal.removeEventListener('abort',abort);scene!.removeEventListener('mhdrhn:scene-state',check);resolve(value);}
    function check(){if(scene!.dataset.sceneState!=='pending')finish(true);}
    function abort(){finish(false);}
    const timer=setTimeout(()=>{scene!.dispatchEvent(new Event('mhdrhn:scene-timeout'));finish(true);},budget);
    scene.addEventListener('mhdrhn:scene-state',check);signal.addEventListener('abort',abort,{once:true});check();
  });
}
