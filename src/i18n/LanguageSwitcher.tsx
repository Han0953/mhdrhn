"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {usePathname,useRouter} from "next/navigation";
import {AnimatePresence,motion} from "framer-motion";
import {Check} from "lucide-react";
import {useTranslation} from "./LocaleProvider";
import {localeHref,type Locale} from "./config";
import {changeLanguage,cancelLanguageChange,languageChangePending} from "./language-motion";
import {prefersReducedMotion} from "@/lib/motion/preferences";
export function LanguageSwitcher(){const {locale,t}=useTranslation(),router=useRouter(),path=usePathname(),[open,setOpen]=useState(false),root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const leaveTimer=useRef<ReturnType<typeof setTimeout>|null>(null),reason=useRef<'hover'|'control'>('control');
 const cancelLeave=useCallback(()=>{if(leaveTimer.current!==null)clearTimeout(leaveTimer.current);leaveTimer.current=null;},[]);
 const close=useCallback((focus=false)=>{cancelLeave();reason.current='control';setOpen(false);if(focus)trigger.current?.focus({preventScroll:true});},[cancelLeave]);
 useEffect(()=>{const outside=(e:PointerEvent)=>{if(e.target instanceof Node&&!root.current?.contains(e.target))close();};const other=(e:Event)=>{if((e as CustomEvent).detail!=='language')close();};document.addEventListener('pointerdown',outside);window.addEventListener('mhdrhn:popover',other);return()=>{cancelLeave();document.removeEventListener('pointerdown',outside);window.removeEventListener('mhdrhn:popover',other);};},[close,cancelLeave]);
 useEffect(()=>{const frame=requestAnimationFrame(()=>close());return()=>cancelAnimationFrame(frame);},[path,close]);
 function select(next:Locale){close();if(next===locale){if(languageChangePending()){cancelLanguageChange();router.push(localeHref(location.pathname+location.search+location.hash,next),{scroll:false});}return;}const href=localeHref(location.pathname+location.search+location.hash,next);try{router.prefetch(href);}catch{/* Optional warming must not block navigation. */}void changeLanguage(href,to=>router.push(to,{scroll:false}));}
 return <div ref={root} className="language-switcher"
 onPointerEnter={e=>{cancelLeave();if(e.pointerType==='mouse'&&window.matchMedia('(hover: hover)').matches){if(!open){reason.current='hover';window.dispatchEvent(new CustomEvent('mhdrhn:popover',{detail:'language'}));}setOpen(true);}}}
 onPointerLeave={()=>{cancelLeave();if(reason.current==='hover')leaveTimer.current=setTimeout(()=>{leaveTimer.current=null;if(reason.current==='hover'&&!root.current?.contains(document.activeElement))close();},160);}}
 onBlur={e=>{if(e.relatedTarget instanceof Node&&!e.currentTarget.contains(e.relatedTarget))close();}}
 onKeyDown={e=>{if(e.defaultPrevented)return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true);}if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();cancelLeave();reason.current='control';const buttons=Array.from(root.current?.querySelectorAll<HTMLButtonElement>('.language-option')??[]);const index=buttons.indexOf(document.activeElement as HTMLButtonElement);buttons[e.key==='Home'?0:e.key==='End'?buttons.length-1:(index+(e.key==='ArrowUp'?-1:1)+buttons.length)%buttons.length]?.focus({preventScroll:true});}}}>
 <button ref={trigger} type="button" className="icon-button language-trigger" aria-label={t('Pilihan bahasa')} title={`${t('Pilihan bahasa')} · ${locale==='id'?'Indonesia':'English'}`} aria-haspopup="menu" aria-expanded={open} aria-controls="language-options"
 onPointerDown={e=>{if(e.button===0&&e.pointerType==='mouse'){e.preventDefault();e.currentTarget.focus({preventScroll:true});}}}
 onKeyDown={e=>{if(!open&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();cancelLeave();reason.current='control';window.dispatchEvent(new CustomEvent('mhdrhn:popover',{detail:'language'}));setOpen(true);const last=e.key==='ArrowUp';requestAnimationFrame(()=>{const buttons=root.current?.querySelectorAll<HTMLButtonElement>('.language-option');buttons?.[last?buttons.length-1:0]?.focus({preventScroll:true});});}}}
 onClick={()=>{cancelLeave();if(open&&reason.current==='hover'){reason.current='control';return;}reason.current='control';if(!open){window.dispatchEvent(new CustomEvent('mhdrhn:popover',{detail:'language'}));}setOpen(!open);}}>{locale.toUpperCase()}</button>
 <AnimatePresence>{open&&<motion.div id="language-options" className="language-options" role="menu" aria-label={t('Bahasa')} initial={{opacity:0,y:prefersReducedMotion()?0:-6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:prefersReducedMotion()?0:-4}} transition={{duration:prefersReducedMotion()?0:.18}}>{(['id','en'] as const).map(value=><button key={value} type="button" className="language-option" role="menuitemradio" aria-checked={locale===value} lang={value} onClick={()=>select(value)}><span>{value==='id'?'Indonesia':'English'}</span>{value===locale&&<Check size={16} aria-hidden="true"/>}</button>)}</motion.div>}</AnimatePresence>
 </div>;}
