"use client";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion/preferences";
import { captureLanguageCheckpoints, releaseLanguageCheckpoints } from "@/lib/motion/language-checkpoint";
import { refreshSmoothScroll, scrollToPosition } from "@/lib/motion/smooth-scroll";
import { captureVisibleWords, morphWords, type TextSnapshot } from "./word-morph";
import { logicalPath } from "./config";
import { captureLanguageTheme, releaseLanguageTheme, restoreThemeBeforePaint } from "@/lib/motion/theme";
import { captureLanguageContext, clearLanguageContext, restoreLanguageDisclosure } from "./language-context";
import { captureViewportAnchor, maintainViewportAnchor, type ViewportAnchor } from "./viewport-anchor";

type Snapshot = {path:string;href:string;anchor:ViewportAnchor;words:TextSnapshot;completing?:boolean};
let sequence=0, pending:Snapshot|undefined, visual:ReturnType<typeof morphWords>|undefined;
let watchdog:ReturnType<typeof setTimeout>|undefined;
let stopPosition:(()=>void)|undefined;
const currentMain=()=>Array.from(document.querySelectorAll<HTMLElement>('main')).find(node=>node.getClientRects().length>0);
function clearVisual(){stopPosition?.();stopPosition=undefined;visual?.stop();visual=undefined;clearTimeout(watchdog);delete document.documentElement.dataset.languageChanging;releaseLanguageCheckpoints();clearLanguageContext();releaseLanguageTheme();}
export function languageChangePending(){return !!pending;}

export async function changeLanguage(href:string,navigate:(href:string)=>void){
  ++sequence; clearVisual();
  const main=currentMain(); if(!main)return navigate(href);
  captureLanguageTheme();
  captureLanguageCheckpoints();
  captureLanguageContext(main);
  pending={path:logicalPath(location.pathname),href,anchor:captureViewportAnchor(main),words:captureVisibleWords()};
  document.documentElement.dataset.languageChanging='true';
  watchdog=setTimeout(()=>{pending=undefined;clearVisual();},12000);
  // Keep the source page fully painted and interactive while RSC is pending.
  navigate(href);
}

export async function completeLanguageChange(path:string){
  const snapshot=pending;
  if(!snapshot||snapshot.completing||logicalPath(path)!==snapshot.path||path!==new URL(snapshot.href,location.origin).pathname)return;
  snapshot.completing=true;
  const token=sequence,main=currentMain(); if(!main)return;
  restoreThemeBeforePaint(document.documentElement);
  main.querySelectorAll('details').forEach(restoreLanguageDisclosure);
  refreshSmoothScroll(); ScrollTrigger.refresh();
  stopPosition=maintainViewportAnchor(main,snapshot.anchor,top=>{visual?.stop();scrollToPosition(top,true);});
  // Layout effects of incoming motion islands have restored their checkpoint.
  // Words crossfade and follow copy reflow; entrance animations never replay.
  if(!prefersReducedMotion()){
    visual=morphWords(snapshot.words,captureVisibleWords()); await visual.finished;
  }
  await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
  if(token===sequence&&pending===snapshot){pending=undefined;clearVisual();document.querySelector<HTMLElement>('.language-trigger')?.focus({preventScroll:true});}
}
export function cancelLanguageChange(){++sequence;pending=undefined;clearVisual();}
