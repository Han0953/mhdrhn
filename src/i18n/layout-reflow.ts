import { motionElementKey } from "@/lib/motion/language-checkpoint";
import { disclosureTextHidden } from "./language-context";

type LayoutNode = HTMLElement | SVGSVGElement;
type Box = { node: LayoutNode; x: number; y: number };
export type LayoutSnapshot = Map<string, Box>;
const excluded = 'script,style,noscript,[hidden],.sr-only,[data-language-overlay],.site-header,dialog,.azura-panel,.role-stage,[data-reveal="queued"],[data-reveal="prepared"]';

/** Read final geometry before applying any temporary presentation transforms. */
export function captureLanguageLayout(): LayoutSnapshot {
  const boxes: LayoutSnapshot = new Map();
  const styles = new Map<Element, CSSStyleDeclaration>();
  const styleOf = (node: Element) => {
    let style = styles.get(node);
    if (!style) { style = getComputedStyle(node); styles.set(node, style); }
    return style;
  };
  for (const node of document.querySelectorAll('main *, .site-footer *')) {
    if (boxes.size >= 1000) break;
    if (!(node instanceof HTMLElement || node instanceof SVGSVGElement) || node.closest(excluded) || disclosureTextHidden(node)) continue;
    const rect = node.getBoundingClientRect();
    // One viewport of overscan also covers content entering after copy shrinks.
    if (!rect.width || !rect.height || rect.bottom <= -innerHeight || rect.top >= innerHeight * 2 || rect.right <= 0 || rect.left >= innerWidth || rect.height > innerHeight * 2) continue;
    const nodeStyle = styleOf(node);
    if (nodeStyle.position === 'sticky' || (nodeStyle.display === 'inline' && !(node instanceof SVGSVGElement) && !node.matches('img,video,canvas,iframe'))) continue;
    let hidden = false;
    for (let parent: Element | null = node; parent && parent !== document.body; parent = parent.parentElement) {
      const style = styleOf(parent);
      if (Number(style.opacity) < .01 || style.display === 'none' || style.visibility === 'hidden' || style.position === 'fixed') { hidden = true; break; }
    }
    if (hidden) continue;
    const scope = node.closest<HTMLElement>('[data-motion-profile],main,.site-footer') ?? document.body;
    const key = (scope.dataset.motionProfile ?? scope.tagName + '.' + scope.className) + ':' + motionElementKey(node, scope);
    boxes.set(key, {node, x:rect.left, y:rect.top});
  }
  return boxes;
}

/** FLIP translation only: never alter flow, scale text, or overwrite GSAP transform. */
export function animateLanguageLayout(before: LayoutSnapshot, after: LayoutSnapshot) {
  const animations: Animation[] = [];
  const moved = new Map<Element, {x:number;y:number}>();
  let stopped = false;
  let resolveFinished: () => void = () => {};
  const finished = new Promise<void>(resolve => { resolveFinished = resolve; });
  const timeout = setTimeout(() => stop(),1000);
  const stop = () => {
    if (stopped) return;
    stopped = true; clearTimeout(timeout);
    animations.forEach(animation => animation.cancel());
    window.removeEventListener('wheel',stop); window.removeEventListener('touchstart',stop); window.removeEventListener('resize',stop);
    resolveFinished();
  };
  // Snapshot order is document order, so a parent is always planned first.
  for (const [key, box] of after) {
    const previous = before.get(key);
    if (!previous || typeof box.node.animate !== 'function') continue;
    const delta = {x:previous.x-box.x, y:previous.y-box.y};
    let inherited = {x:0,y:0};
    for (let parent = box.node.parentElement; parent; parent = parent.parentElement) {
      const motion = moved.get(parent);
      if (motion) { inherited = motion; break; }
    }
    const x = delta.x-inherited.x, y = delta.y-inherited.y;
    if (Math.abs(x) < .5 && Math.abs(y) < .5) continue;
    try {
      // Additive individual translate preserves hover transforms and entrance
      // styles. Children compensate only their residual shift, never twice.
      const animation = box.node.animate([{translate:`${x}px ${y}px`},{translate:'0px 0px'}], {
        duration:480, easing:'cubic-bezier(.22,1,.36,1)', composite:'add', fill:'both',
      });
      animations.push(animation); moved.set(box.node, delta);
    } catch { /* Unsupported animation keeps the final semantic layout visible. */ }
  }
  if (!animations.length) { stop(); return {finished,stop}; }
  window.addEventListener('wheel',stop,{passive:true}); window.addEventListener('touchstart',stop,{passive:true}); window.addEventListener('resize',stop);
  void Promise.all(animations.map(animation=>animation.finished.catch(()=>{}))).then(stop);
  return {finished,stop};
}
