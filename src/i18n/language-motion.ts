"use client";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion/preferences";
import { captureLanguageCheckpoints, releaseLanguageCheckpoints } from "@/lib/motion/language-checkpoint";
import { refreshSmoothScroll, scrollToPosition } from "@/lib/motion/smooth-scroll";
import { captureVisibleWords, morphWords, type TextSnapshot } from "./word-morph";
import { logicalPath } from "./config";
import { captureLanguageTheme, releaseLanguageTheme, restoreThemeBeforePaint } from "@/lib/motion/theme";

type Snapshot = {path:string;href:string;y:number;anchor?:string;ratio:number;offset:number;open:number[];views:{id:string;list:boolean}[];words:TextSnapshot;completing?:boolean};
let sequence=0, pending:Snapshot|undefined, visual:ReturnType<typeof morphWords>|undefined;
let watchdog:ReturnType<typeof setTimeout>|undefined;
const currentMain=()=>Array.from(document.querySelectorAll<HTMLElement>('main')).find(node=>node.getClientRects().length>0);
function clearVisual(){visual?.stop();visual=undefined;clearTimeout(watchdog);delete document.documentElement.dataset.languageChanging;releaseLanguageCheckpoints();releaseLanguageTheme();}
export function languageChangePending(){return !!pending;}

export async function changeLanguage(href:string,navigate:(href:string)=>void){
  ++sequence; clearVisual();
  const main=currentMain(); if(!main)return navigate(href);
  captureLanguageTheme();
  captureLanguageCheckpoints();
  const header=document.querySelector('header')?.getBoundingClientRect().bottom ?? 68;
  const anchors=Array.from(main.querySelectorAll<HTMLElement>('section[id],section[data-home-section],section[aria-labelledby]')).filter(n=>{const r=n.getBoundingClientRect();return r.top<innerHeight&&r.bottom>header;});
  const anchor=anchors.sort((a,b)=>Math.abs(a.getBoundingClientRect().top-header)-Math.abs(b.getBoundingClientRect().top-header))[0],r=anchor?.getBoundingClientRect();
  pending={path:logicalPath(location.pathname),href,y:scrollY,anchor:anchor?.id?`#${anchor.id}`:anchor?.dataset.homeSection?`[data-home-section="${anchor.dataset.homeSection}"]`:anchor?.getAttribute('aria-labelledby')?`[aria-labelledby="${anchor.getAttribute('aria-labelledby')}"]`:undefined,ratio:r?Math.max(0,-r.top)/Math.max(1,r.height-innerHeight):0,offset:r?-r.top:0,views:Array.from(main.querySelectorAll<HTMLElement>('[data-home-section] .story-root')).map(node=>({id:node.closest<HTMLElement>('[data-home-section]')!.dataset.homeSection!,list:node.dataset.view==='list'})),open:Array.from(main.querySelectorAll('details')).flatMap((n,i)=>n.open?[i]:[]),words:captureVisibleWords()};
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
  Array.from(main.querySelectorAll('details')).forEach((n,i)=>{n.open=snapshot.open.includes(i);});
  for(const view of snapshot.views)window.dispatchEvent(new CustomEvent('mhdrhn:restore-story-view',{detail:view}));
  refreshSmoothScroll(); ScrollTrigger.refresh();
  const anchor=snapshot.anchor?main.querySelector<HTMLElement>(snapshot.anchor):undefined,rect=anchor?.getBoundingClientRect();
  const nextY=rect?scrollY+rect.top+(rect.height>innerHeight?snapshot.ratio*Math.max(0,rect.height-innerHeight):snapshot.offset):snapshot.y;
  scrollToPosition(Math.max(0,nextY),true);
  // Layout effects of incoming motion islands have restored their checkpoint.
  // Only changed words crossfade; main/media/cards never fade or translate.
  if(!prefersReducedMotion()){
    visual=morphWords(snapshot.words,captureVisibleWords()); await visual.finished;
  }
  if(token===sequence){pending=undefined;clearVisual();document.querySelector<HTMLElement>('.language-trigger')?.focus({preventScroll:true});}
}
export function cancelLanguageChange(){++sequence;pending=undefined;clearVisual();}
