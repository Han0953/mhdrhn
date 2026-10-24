import { motionElementKey } from "@/lib/motion/language-checkpoint";
import { disclosureTextHidden } from "./language-context";

export type ViewportAnchor = { scope:string; path:string; top:number; y:number; story?:{section:string;progress:number} };
const scopes='[id],[data-home-section],[data-education-id],[data-certificate-id]';
function selector(node: HTMLElement) {
  if(node.id)return `#${CSS.escape(node.id)}`;
  for(const name of ['data-home-section','data-education-id','data-certificate-id']){
    const value=node.getAttribute(name);if(value)return `[${name}="${CSS.escape(value)}"]`;
  }
  return '';
}
export function captureViewportAnchor(main: HTMLElement): ViewportAnchor {
  const header=document.querySelector('.site-header')?.getBoundingClientRect().bottom??68;
  const candidates=Array.from(main.querySelectorAll<HTMLElement>('h1,h2,h3,p,summary,[data-education-id],[data-certificate-id],article[id]')).filter(node=>{
    if(node.closest('.sr-only,[hidden],.role-stage,[data-language-overlay],[data-reveal="queued"],[data-reveal="prepared"]')||disclosureTextHidden(node))return false;
    const r=node.getBoundingClientRect();return r.height>0&&r.width>0&&r.bottom>header&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;
  });
  // Keep an actual reading landmark at the same viewport pixel. A section's
  // total height is not reading progress (especially after pinned project rails).
  const score=(node:HTMLElement)=>{const top=node.getBoundingClientRect().top;return top>=header-1?top-header:innerHeight+header-top;};
  candidates.sort((a,b)=>score(a)-score(b));
  const node=candidates[0],closest=node?.closest<HTMLElement>(scopes),scope=closest===main?null:closest;
  const rail=node?.closest<HTMLElement>('.story-root[data-mode="pinned"]'),section=rail?.closest<HTMLElement>('[data-home-section]')?.dataset.homeSection;
  const travel=rail?Number.parseFloat(rail.style.getPropertyValue('--story-travel')):0;
  const pinTop=rail?Number.parseFloat(rail.style.getPropertyValue('--story-top')):0;
  const progress=rail&&travel>0?(pinTop-rail.getBoundingClientRect().top)/travel:-1;
  const story=rail&&section&&progress>=0&&progress<=1?{section,progress}:undefined;
  return {scope:scope?selector(scope):'',path:node?motionElementKey(node,scope??main):'',top:node?.getBoundingClientRect().top??0,y:scrollY,story};
}
export function resolveViewportAnchor(main: HTMLElement, anchor: ViewportAnchor) {
  if(anchor.story){const rail=main.querySelector<HTMLElement>(`[data-home-section="${CSS.escape(anchor.story.section)}"] .story-root[data-mode="pinned"]`);if(rail){const travel=Number.parseFloat(rail.style.getPropertyValue('--story-travel')),pinTop=Number.parseFloat(rail.style.getPropertyValue('--story-top'));if(Number.isFinite(travel)&&Number.isFinite(pinTop))return Math.max(0,scrollY+rail.getBoundingClientRect().top-pinTop+anchor.story.progress*travel);}}
  if(!anchor.scope&&!anchor.path)return anchor.y;
  let node: Element | null=anchor.scope?main.querySelector(anchor.scope):main;
  if(anchor.path)for(const index of anchor.path.split('.'))node=node?.children.item(Number(index))??null;
  return node instanceof HTMLElement ? Math.max(0,scrollY+node.getBoundingClientRect().top-anchor.top) : anchor.y;
}

/** Own only the short locale-layout settling window, never the user's next scroll. */
export function maintainViewportAnchor(main: HTMLElement, anchor: ViewportAnchor, apply:(top:number)=>void) {
  let disposed=false,frame=0,remaining=2;
  const correct=()=>{if(disposed)return;const next=resolveViewportAnchor(main,anchor);if(Math.abs(next-scrollY)>.5)apply(next);};
  const observer=typeof ResizeObserver==='undefined'?undefined:new ResizeObserver(correct);
  const stop=()=>{if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer?.disconnect();window.removeEventListener('scroll',onScroll);window.removeEventListener('wheel',stop);window.removeEventListener('touchstart',stop);window.removeEventListener('pointerdown',stop);window.removeEventListener('keydown',keyboard);};
  const keyboard=(event:KeyboardEvent)=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))stop();};
  const tick=()=>{frame=0;correct();if(!disposed&&--remaining>0)frame=requestAnimationFrame(tick);};
  // App Router's cached scroll restoration can run after locale layout effects
  // without resizing main. Reconcile that scroll too, until the user takes over.
  const onScroll=()=>{if(!disposed&&!frame)frame=requestAnimationFrame(tick);};
  correct();observer?.observe(main);frame=requestAnimationFrame(tick);
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('wheel',stop,{passive:true});window.addEventListener('touchstart',stop,{passive:true});window.addEventListener('pointerdown',stop,{passive:true});window.addEventListener('keydown',keyboard);
  return stop;
}
