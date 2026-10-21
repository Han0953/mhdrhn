import { navigationLabel, resolveInternalHref, resolveNavigation, type NavigationHref, type NavigationProject } from "./navigation";
import type { createRouteWipe } from "./route-motion";

export interface RouteOptions { scroll?: boolean; replace?: boolean; prefetch?: boolean }
export interface RouteRequest {
  generation: number; id: number; path: string; href: string; history: boolean; issued: boolean;
  options: RouteOptions; abort: AbortController; waiting: boolean; focus: HTMLElement | null;
}
interface Dependencies {
  wipe: ReturnType<typeof createRouteWipe>; location: () => string; enabled: () => boolean;
  projects: readonly NavigationProject[];
  navigate: (href: string, options: RouteOptions) => void; fallback: (href: string) => void;
  prefetch: (href: string) => void; captureFocus: () => HTMLElement | null;
  begin: (kind: string, request: RouteRequest) => void;
  assets: (signal: AbortSignal) => Promise<boolean>;
}

/** Tokens cancel visual waits, never server requests. Only public App Router APIs. */
export function createRouteSession(deps: Dependencies) {
  let pending: RouteRequest | null = null, generation = 0, disposed = false;
  function issue(request: RouteRequest) {
    if (request.issued || pending !== request || disposed) return;
    request.issued = true;
    if (!request.history) try { deps.navigate(request.href, request.options); }
    catch { deps.wipe.clear(); deps.fallback(request.href); }
  }
  function start(url: URL, from: string, options: RouteOptions, history: boolean) {
    const movement = resolveNavigation(from, url.pathname, deps.projects);
    if (!movement.direction || !deps.enabled() || disposed) { deps.wipe.clear(); return false; }
    deps.wipe.clear(); pending?.abort.abort();
    const request: RouteRequest = { generation: ++generation, id: 0, path: url.pathname, href: `${url.pathname}${url.search}`, history, issued: history, options, abort: new AbortController(), waiting: false, focus: deps.captureFocus() };
    pending = request;
    deps.begin(movement.kind, request);
    const id = deps.wipe.play(movement.direction, history, navigationLabel(url.pathname, deps.projects), token => {
      if (pending !== request) return;
      request.id = token; issue(request);
    });
    if (!id) { pending = null; return false; }
    request.id = id;
    return true;
  }
  function intent(href: NavigationHref, options: RouteOptions = {}) {
    const url = resolveInternalHref(href, deps.location());
    if (!url || !deps.enabled() || disposed) return false;
    if (options.prefetch !== false) try { deps.prefetch(`${url.pathname}${url.search}`); } catch { /* Warming is optional. */ }
    return start(url, new URL(deps.location()).pathname, options, false);
  }
  function history(from: string) { const url = new URL(deps.location()); return start(url, from, {}, true); }
  function committed(path: string, error = false) {
    const request = pending;
    if (!request || !request.issued || path !== new URL(deps.location()).pathname) return;
    // A redirect/mismatch releases the visual wait; it must not complete a newer
    // transaction using a marker from another URL.
    if (request.path !== path) { deps.wipe.clear(); return; }
    if (error) { request.abort.abort(); deps.wipe.ready(request.id); return; }
    if (request.waiting) return;
    request.waiting = true;
    void deps.assets(request.abort.signal).then(ready => {
      if (ready && pending === request && !request.abort.signal.aborted && !disposed) deps.wipe.ready(request.id);
    }).catch(() => { if (pending === request && !disposed) deps.wipe.ready(request.id); });
  }
  function complete() { const request = pending; pending = null; request?.abort.abort(); return request; }
  function skip() { if (pending) issue(pending); deps.wipe.clear(); }
  return { intent, history, committed, complete, skip, cancel: () => deps.wipe.clear(), current: () => pending,
    dispose() { disposed = true; deps.wipe.clear(); complete(); },
  };
}
