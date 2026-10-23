"use client";
import { animate } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion/preferences";
import { settleRouteEntrance } from "@/lib/motion/entrance";
import { refreshSmoothScroll, scrollToPosition } from "@/lib/motion/smooth-scroll";
import { logicalPath } from "./config";
type Snapshot={path:string;href:string;y:number;anchor?:string;ratio:number;offset:number;open:number[];views:{id:string;list:boolean}[]};
let sequence=0,pending:Snapshot|undefined,animation:ReturnType<typeof animate>|undefined,watchdog:ReturnType<typeof setTimeout>|undefined;
function clearVisual(){animation?.stop();animation=undefined;clearTimeout(watchdog);const main=document.querySelector<HTMLElement>('main');if(main){main.style.removeProperty('opacity');main.style.removeProperty('transform');main.inert=false;}delete document.documentElement.dataset.languageChanging;}
export function languageChangePending(){return !!pending;}
export async function changeLanguage(href:string,navigate:(href:string)=>void){
 const token=++sequence;clearVisual();const main=document.querySelector<HTMLElement>('main');if(!main)return navigate(href);
 settleRouteEntrance(main);
 const header=80,anchors=Array.from(main.querySelectorAll<HTMLElement>('section[id],section[data-home-section],section[aria-labelledby]')).filter(n=>{const r=n.getBoundingClientRect();return r.top<innerHeight&&r.bottom>header;});
 const anchor=anchors.sort((a,b)=>Math.abs(a.getBoundingClientRect().top-header)-Math.abs(b.getBoundingClientRect().top-header))[0],r=anchor?.getBoundingClientRect();
 pending={path:logicalPath(location.pathname),href,y:scrollY,anchor:anchor?.id?`#${anchor.id}`:anchor?.dataset.homeSection?`[data-home-section="${anchor.dataset.homeSection}"]`:anchor?.getAttribute("aria-labelledby")?`[aria-labelledby="${anchor.getAttribute("aria-labelledby")}"]`:undefined,ratio:r?Math.max(0,-r.top)/Math.max(1,r.height-innerHeight):0,offset:r?-r.top:0,views:Array.from(main.querySelectorAll<HTMLElement>("[data-home-section] .story-root")).map(node=>({id:node.closest<HTMLElement>("[data-home-section]")!.dataset.homeSection!,list:node.dataset.view==="list"})),open:Array.from(main.querySelectorAll('details')).flatMap((n,i)=>n.open?[i]:[])};
 document.documentElement.dataset.languageChanging='true';main.inert=true;
 watchdog=setTimeout(()=>{pending=undefined;clearVisual();},12000);
 if(!prefersReducedMotion()){animation=animate(main,{opacity:0,y:-8},{duration:.12,ease:[.4,0,.2,1]});await animation;}
 if(token!==sequence)return;
 navigate(href);
}
export async function completeLanguageChange(path:string){
 const snapshot=pending;if(!snapshot||logicalPath(path)!==snapshot.path||path!==new URL(snapshot.href,location.origin).pathname)return;
 const token=sequence;
 const incoming=document.querySelector<HTMLElement>("main");
 document.documentElement.dataset.languageChanging="true";
 if(incoming&&!prefersReducedMotion()){incoming.style.opacity="0";incoming.style.transform="none";incoming.inert=true;}
 await document.fonts.ready;await new Promise<void>(r=>requestAnimationFrame(()=>r()));
 if(token!==sequence)return;
 const main=document.querySelector<HTMLElement>('main');if(!main)return;
 settleRouteEntrance(main);
 Array.from(main.querySelectorAll('details')).forEach((n,i)=>{n.open=snapshot.open.includes(i);});
 for(const view of snapshot.views)window.dispatchEvent(new CustomEvent("mhdrhn:restore-story-view",{detail:view}));
 await new Promise<void>(r=>requestAnimationFrame(()=>r()));
 if(token!==sequence)return;
 window.dispatchEvent(new Event("resize"));refreshSmoothScroll();ScrollTrigger.refresh();
 const anchor=snapshot.anchor?main.querySelector<HTMLElement>(snapshot.anchor):undefined,rect=anchor?.getBoundingClientRect();
 const nextY=rect?scrollY+rect.top+(rect.height>innerHeight?snapshot.ratio*Math.max(0,rect.height-innerHeight):snapshot.offset):snapshot.y;
 scrollToPosition(Math.max(0,nextY),true);main.inert=false;
 if(!prefersReducedMotion()){main.style.opacity='0';main.style.transform='translateY(10px)';animation=animate(main,{opacity:1,y:0},{duration:.28,ease:[.22,1,.36,1]});await animation;}
 if(token===sequence){pending=undefined;clearVisual();document.querySelector<HTMLElement>('.language-trigger')?.focus({preventScroll:true});}
}
export function cancelLanguageChange(){++sequence;pending=undefined;clearVisual();}
