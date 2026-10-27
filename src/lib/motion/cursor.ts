import { prefersReducedMotion, subscribeMotion } from "./preferences";

const interactive = 'a[href],button,summary,[role="button"],[role="link"],[role="option"],label[for]';
const native = 'input,textarea,select,[contenteditable]:not([contenteditable="false"]),iframe,video,[data-native-cursor],.hero-scene-surface,:disabled,[aria-disabled="true"],dialog:modal';

/** A finite pointer follower: no React renders, idle ticker or per-link listeners. */
export function mountCursorEffect(root: HTMLElement) {
  const ring = root.querySelector<HTMLElement>(".cursor-ring")!;
  const dot = root.querySelector<HTMLElement>(".cursor-dot")!;
  const desktop = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
  const forced = window.matchMedia("(forced-colors: active)");
  let frame = 0, lastTime = 0, x = 0, y = 0, ringX = 0, ringY = 0;
  let visible = false, hitTest = false, disposed = false;
  let disconnectInput: (() => void) | undefined;

  function hide() {
    visible = false; lastTime = 0;
    cancelAnimationFrame(frame); frame = 0;
    delete root.dataset.visible; delete root.dataset.pressed; delete root.dataset.interactive;
    delete document.documentElement.dataset.customCursor;
  }
  function target(node: EventTarget | null) {
    const element = node instanceof Element ? node : null;
    if (!element || element.closest(native)) { hide(); return false; }
    if (element.closest(interactive)) root.dataset.interactive = "true";
    else delete root.dataset.interactive;
    return true;
  }
  function place(node: HTMLElement, left: number, top: number) {
    node.style.transform = `translate3d(${left}px,${top}px,0)`;
  }
  function draw(time: number) {
    frame = 0;
    if (!visible || disposed) return;
    if (hitTest) { hitTest = false; if (!target(document.elementFromPoint(x,y))) return; }
    const elapsed = lastTime ? Math.min(64, time - lastTime) : 1000 / 60;
    lastTime = time;
    const follow = 1 - Math.exp(-elapsed / 65);
    ringX += (x - ringX) * follow; ringY += (y - ringY) * follow;
    const moving = Math.abs(x-ringX) + Math.abs(y-ringY) > .15;
    if (!moving) { ringX = x; ringY = y; lastTime = 0; }
    place(dot,x,y); place(ring,ringX,ringY);
    if (moving) requestDraw();
  }
  function requestDraw() { if (!frame && visible && !disposed) frame = requestAnimationFrame(draw); }
  function move(event: PointerEvent) {
    if (event.pointerType !== "mouse" || document.hidden || event.clientX < 0 || event.clientX >= document.documentElement.clientWidth) { hide(); return; }
    x = event.clientX; y = event.clientY;
    if (!target(event.target)) return;
    if (!visible) {
      ringX = x; ringY = y; place(ring,x,y); place(dot,x,y);
      visible = true; root.dataset.visible = "true";
      document.documentElement.dataset.customCursor = "active";
    }
    requestDraw();
  }
  function over(event: PointerEvent) { if (visible) target(event.target); }
  function out(event: PointerEvent) { if (!event.relatedTarget) hide(); else if (visible) target(event.relatedTarget); }
  function down(event: PointerEvent) {
    if (event.pointerType !== "mouse" || event.button !== 0) { hide(); return; }
    if (visible) root.dataset.pressed = "true";
  }
  function up() { delete root.dataset.pressed; }
  function scroll() { if (visible) { hitTest = true; requestDraw(); } }
  function visibility() { if (document.hidden) hide(); }
  function sync() {
    if (disposed) return;
    if (!desktop.matches || forced.matches || prefersReducedMotion()) { hide(); disconnectInput?.(); disconnectInput = undefined; return; }
    if (disconnectInput) return;
    document.addEventListener("pointermove",move,{passive:true});
    document.addEventListener("pointerover",over,{passive:true});
    document.addEventListener("pointerout",out,{passive:true});
    document.addEventListener("pointerdown",down,{passive:true});
    document.addEventListener("pointercancel",hide);
    document.addEventListener("keydown",hide);
    document.addEventListener("scroll",scroll,{passive:true,capture:true});
    window.addEventListener("pointerup",up);
    window.addEventListener("blur",hide);
    window.addEventListener("resize",hide);
    disconnectInput = () => {
      document.removeEventListener("pointermove",move);
      document.removeEventListener("pointerover",over);
      document.removeEventListener("pointerout",out);
      document.removeEventListener("pointerdown",down);
      document.removeEventListener("pointercancel",hide);
      document.removeEventListener("keydown",hide);
      document.removeEventListener("scroll",scroll,true);
      window.removeEventListener("pointerup",up);
      window.removeEventListener("blur",hide);
      window.removeEventListener("resize",hide);
    };
  }
  desktop.addEventListener("change",sync); forced.addEventListener("change",sync);
  document.addEventListener("visibilitychange",visibility);
  const unsubscribe = subscribeMotion(sync); sync();
  return () => {
    disposed = true; hide(); disconnectInput?.(); unsubscribe();
    desktop.removeEventListener("change",sync); forced.removeEventListener("change",sync);
    document.removeEventListener("visibilitychange",visibility);
  };
}
