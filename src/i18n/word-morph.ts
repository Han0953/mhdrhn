import { animate } from "framer-motion";
import { motionElementKey } from "@/lib/motion/language-checkpoint";
import { disclosureTextHidden } from "./language-context";

type Word = { text: string; offset: number; x: number; y: number; height: number; font: string; color: string; spacing: string; transform: string; features: string; chrome: "main" | "popup" | null };
type Block = { text: string; ranges: Range[]; words: Word[] };
export type TextSnapshot = Map<string, Block>;
type PaintedWord = { word: Word; x: number; y: number; mode: "enter" | "exit" | "move" };
const excluded = "script,style,noscript,svg,textarea,select,option,.sr-only,[hidden],[data-language-overlay],.language-options,.language-trigger,.route-transition-viewport,nextjs-portal";

/** Read ranges rather than wrapping/mutating text owned by React. Viewport only. */
export function captureVisibleWords(): TextSnapshot {
  const blocks: TextSnapshot = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let current: Node | null;
  let count = 0;
  while ((current = walker.nextNode()) && count < 650) {
    const node = current as Text, parent = node.parentElement;
    if (!parent || !node.data.trim() || parent.closest(excluded) || disclosureTextHidden(parent)) continue;
    const rect = parent.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= innerHeight || rect.right <= 0 || rect.left >= innerWidth) continue;
    const style = getComputedStyle(parent);
    if (style.visibility === "hidden" || style.display === "none") continue;
    // Hidden role labels, queued reveal ancestors and closed dialogs have boxes too.
    let hidden = false;
    for (let ancestor: Element | null = parent; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
      if (Number(getComputedStyle(ancestor).opacity) < .01 || ancestor.matches('dialog:not([open]),[data-reveal="queued"],[data-reveal="prepared"],.role-reserve,.role-leaving')) { hidden = true; break; }
    }
    if (hidden) continue;
    const scope = parent.closest<HTMLElement>('[data-motion-profile],main,.site-header,.site-footer,dialog[open]') ?? document.body;
    const key = (scope.dataset.motionProfile ?? scope.tagName + "." + scope.className) + ":" + motionElementKey(parent, scope) + ":" + Array.prototype.indexOf.call(parent.childNodes, node);
    const ranges: Range[] = [], words: Word[] = [];
    for (const match of node.data.matchAll(/\S+/gu)) {
      if (count >= 650) break;
      const range = document.createRange();
      range.setStart(node, match.index); range.setEnd(node, match.index + match[0].length);
      const box = range.getBoundingClientRect();
      if (!box.width || !box.height || box.bottom <= 0 || box.top >= innerHeight || box.right <= 0 || box.left >= innerWidth) continue;
      ranges.push(range); words.push({text:match[0],offset:match.index,x:box.left,y:box.top,height:box.height,font:style.font,color:style.color,spacing:style.letterSpacing,transform:style.textTransform,features:style.fontFeatureSettings,chrome:parent.closest('.popup-header')?'popup':parent.closest('.site-header')?'main':null}); count++;
    }
    if (words.length) blocks.set(key,{text:node.data,ranges,words});
  }
  return blocks;
}

/** The real text stays semantic/selectable; this short-lived, inert layer paints words only. */
export function morphWords(before: TextSnapshot, after: TextSnapshot): { finished: Promise<void>; stop: () => void } {
  const ranges: Range[] = [], painted: PaintedWord[] = [];
  for (const [key, block] of after) {
    const old = before.get(key);
    if (old?.text === block.text) {
      // Untranslated names/labels also follow the reflow of surrounding copy.
      // Match by source offset even if reflow changes the viewport's crop:
      // React may have replaced the entire locale subtree.
      const previousWords = new Map(old.words.map(word => [word.offset, word]));
      block.words.forEach((word, i) => {
        const previous = previousWords.get(word.offset);
        if (!previous) return;
        const x = previous.x - word.x, y = previous.y - word.y;
        if (Math.abs(x) < .5 && Math.abs(y) < .5) return;
        ranges.push(block.ranges[i]); painted.push({word, x, y, mode:"move"});
      });
      continue;
    }
    ranges.push(...block.ranges);
    const x = old ? old.words[0].x - block.words[0].x : 0;
    const y = old ? old.words[0].y - block.words[0].y : 0;
    // Crossfade both languages while their block moves to its new baseline.
    // Transform only the disposable word layer, leaving entrance controllers
    // and the reading-position anchor in sole control of the real page.
    if (old) old.words.forEach(word => painted.push({word, x:-x, y:-y, mode:"exit"}));
    block.words.forEach(word => painted.push({word, x, y, mode:"enter"}));
  }
  if (!ranges.length || !("highlights" in CSS) || typeof Highlight === "undefined") return {finished:Promise.resolve(),stop:()=>{}};
  const layer = document.createElement("div");
  const headerLayers = new Map<HTMLElement, HTMLElement>();
  const header = Array.from(document.querySelectorAll<HTMLElement>('.site-header:not(.popup-header)')).find(node=>node.getClientRects().length);
  // Content words cannot paint across the compact header's actual lower edge.
  if (header) layer.style.clipPath=`inset(${Math.max(0,header.getBoundingClientRect().bottom)}px 0 0)`;
  // Next's bundled CSS optimizer predates ::highlight; let the supporting
  // browser parse this one rule, and release it together with the ranges.
  const highlightStyle = document.createElement("style");
  highlightStyle.textContent = "::highlight(language-morph){color:transparent;text-shadow:none}";
  layer.dataset.languageOverlay = "content"; layer.setAttribute("aria-hidden","true"); layer.inert = true;
  const controls: ReturnType<typeof animate>[] = [];
  let stopped = false;
  let resolveFinished: () => void = () => {};
  const finished = new Promise<void>(resolve => { resolveFinished = resolve; });
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const stop = () => {
    if (stopped) return; stopped = true;
    clearTimeout(timeout);
    controls.forEach(control => control.stop()); layer.remove(); highlightStyle.remove(); CSS.highlights.delete("language-morph");
    headerLayers.forEach(node=>node.remove()); headerLayers.clear();
    window.removeEventListener("wheel",stop); window.removeEventListener("touchstart",stop); window.removeEventListener("resize",stop);
    resolveFinished();
  };
  function paint({word, x, y, mode}: PaintedWord, index: number) {
    const enter = mode === "enter", move = mode === "move";
    const span = document.createElement("span"); span.textContent = word.text;
    Object.assign(span.style,{left:`${word.x}px`,top:`${word.y}px`,height:`${word.height}px`,font:word.font,lineHeight:`${word.height}px`,color:word.color,letterSpacing:word.spacing,textTransform:word.transform,fontFeatureSettings:word.features,opacity:enter?"0":"1"});
    const host = word.chrome === 'popup' ? document.querySelector<HTMLElement>('dialog[open] .popup-header') : word.chrome === 'main' ? header : undefined;
    if (host) {
      let overlay=headerLayers.get(host);
      if (!overlay) { overlay=document.createElement('div');overlay.dataset.languageOverlay='header';overlay.setAttribute('aria-hidden','true');overlay.inert=true;host.append(overlay);headerLayers.set(host,overlay); }
      overlay.append(span);
    } else layer.append(span);
    // A complete transform lets Motion use the browser's native animation
    // driver instead of updating hundreds of individual x/y values per frame.
    const from = mode==="exit" ? "translate(0px, 0px)" : `translate(${x}px, ${y+(enter?5:0)}px)`;
    const to = mode==="exit" ? `translate(${x}px, ${y-4}px)` : "translate(0px, 0px)";
    controls.push(animate(span,{
      opacity:move?[1,1]:enter?[0,1]:[1,0],
      transform:[from,to],
    },{
      duration:mode==="exit"?.3:.48,
      // Reflow starts together; only the word crossfade gets a small stagger.
      delay:move?0:Math.min(index*.007,.14),
      ease:[.22,1,.36,1],
    }));
  }
  try {
    document.head.append(highlightStyle);
    CSS.highlights.set("language-morph",new Highlight(...ranges));
    document.body.append(layer);
    window.addEventListener("wheel",stop,{passive:true}); window.addEventListener("touchstart",stop,{passive:true}); window.addEventListener("resize",stop);
    painted.forEach(paint);
    timeout=setTimeout(stop,1000);
    void Promise.all(controls).then(stop);
    return {finished,stop};
  } catch { stop(); return {finished:Promise.resolve(),stop}; }
}
