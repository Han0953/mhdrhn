"use client";
import {logicalPath} from "@/i18n/config";
import {LanguageSwitcher} from "@/i18n/LanguageSwitcher";
import { useTranslation } from "@/i18n/LocaleProvider";
import { translateTree } from "@/i18n/translate";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PageMotion } from "@/components/motion/PageMotion";
import { prefersReducedMotion, subscribeMotion } from "@/lib/motion/preferences";
import { usePathname } from "next/navigation";
import { X, MessageCircle, Send, RotateCcw, ArrowUpRight, ArrowDown, Maximize2, Minimize2 } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SiteLink } from "./RouteTransition";
import { navigation } from "@/lib/navigation";
import { mountDialog } from "@/lib/motion/dialog";
import { createChatHistory, conversationTurns } from "@/lib/azura/history";
import { requestAnswer } from "@/lib/azura/client";
import { AI_ERRORS } from "@/lib/azura/protocol";
import { ProgressiveAnswer } from "@/components/chat/ProgressiveAnswer";
import { mountChatViewport } from "@/lib/azura/viewport";
import { mountChatResizeMotion } from "@/lib/azura/resize-motion";
import { mountInputModality } from "@/lib/ui/input-modality";

function containDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== "Tab") return;
  const targets = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), [tabindex="0"]')).filter(element => element.getClientRects().length > 0 && !element.closest("[inert]") && getComputedStyle(element).visibility !== "hidden");
  const first = targets[0];
  const last = targets.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
}

/** Same header in the modal top layer: visible and operable, with native focus isolation. */
function ChromeHeader({ pathname, menuOpen, onMenu, onNavigate, onKeyDown, popup = false }: {
  pathname: string; menuOpen: boolean; onMenu: () => void; onNavigate?: () => void; onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void; popup?: boolean;
}) {
  const {locale,t}=useTranslation();
  const active = (href: string) => href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return translateTree(<header className={popup ? "site-header popup-header" : "site-header"} data-menu-open={menuOpen} onKeyDown={onKeyDown}><div className="header-inner wrap">
    {!popup && <PageMotion profile="chrome"/>}
    <SiteLink className="wordmark" href="/" aria-label="Rehan — Home" onNavigate={onNavigate}><span className="accent">{"<"}</span>Rehan/<span className="accent">{">"}</span></SiteLink>
    {!popup && <nav className="desktop-nav" aria-label="Navigasi utama">{navigation.map(item => <SiteLink key={item.href} href={item.href} prefetch={true} aria-current={active(item.href) ? "page" : undefined}>{item.label}</SiteLink>)}</nav>}
    <div className="header-controls-entry"><div className="header-controls" data-motion-static><LanguageSwitcher/><ThemeToggle/><button className="icon-button menu-trigger" type="button" onClick={onMenu} aria-label={menuOpen ? "Tutup menu" : "Buka menu"} aria-expanded={menuOpen} aria-controls="site-menu"><span className="menu-glyph" data-open={menuOpen} aria-hidden="true"><span/><span/><span/></span></button></div></div>
  </div></header>,t,locale);
}
const chatHistory = createChatHistory();

export function SiteChrome() {
  const {locale,t}=useTranslation();
  const reduced = useSyncExternalStore(subscribeMotion,prefersReducedMotion,() => true);
  const pathname = logicalPath(usePathname());
  const menu = useRef<HTMLDialogElement>(null);
  const chat = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const followLatest = useRef(true);
  const [chatAwayFromBottom, setChatAwayFromBottom] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatWide, setChatWide] = useState(false);
  const messages = useSyncExternalStore(chatHistory.subscribe, chatHistory.getSnapshot, chatHistory.getServerSnapshot);
  const [resetVersion, setResetVersion] = useState(0);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const nextId = useRef(0);
  const pendingReply = useRef<{ controller:AbortController; id:number } | null>(null);
  const resetChatSize = useRef(false);
  const menuMotion = useRef<ReturnType<typeof mountDialog> | null>(null);
  const chatMotion = useRef<ReturnType<typeof mountDialog> | null>(null);
  const chatResizeMotion = useRef<ReturnType<typeof mountChatResizeMotion> | null>(null);
  const typing = messages.some(message => !message.ready);
  const finishReply = useCallback(() => {
    const pending = pendingReply.current;
    if (pending) { pendingReply.current=null;pending.controller.abort();chatHistory.fail(pending.id,'interrupted'); }
    chatHistory.settle();
  }, []);
  useEffect(() => {
    const unsubscribe = subscribeMotion(() => { if (prefersReducedMotion()) chatHistory.settle(); });
    return () => { unsubscribe(); finishReply(); };
  }, [finishReply]);
  useEffect(()=>{const pending=pendingReply.current;if(pending&&!messages.some(message=>message.id===pending.id)){pendingReply.current=null;pending.controller.abort();}},[messages]);
  const settleReply=useCallback((id:number)=>chatHistory.settle(id),[]);
  const scrollReply=useCallback(()=>{if(followLatest.current&&log.current&&chat.current?.open)log.current.scrollTo({top:log.current.scrollHeight,behavior:'instant'});},[]);
  function chatScrolled() {
    const viewport=log.current;if(!viewport)return;
    const away=viewport.scrollHeight-viewport.scrollTop-viewport.clientHeight>32;
    followLatest.current=!away;setChatAwayFromBottom(away);
  }
  function jumpToLatest() {
    const viewport=log.current;if(!viewport)return;
    followLatest.current=true;
    viewport.focus({preventScroll:true});
    viewport.scrollTo({top:viewport.scrollHeight,behavior:reduced?'instant':'smooth'});
  }
  useEffect(()=>{
    const viewport=log.current,content=viewport?.querySelector('.chat-log-content');if(!viewport||!content)return;
    const update=()=>{
      if(!chat.current?.open)return;
      if(followLatest.current)viewport.scrollTo({top:viewport.scrollHeight,behavior:'instant'});
      setChatAwayFromBottom(viewport.scrollHeight-viewport.scrollTop-viewport.clientHeight>32);
    };
    const observer=new ResizeObserver(update);observer.observe(viewport);observer.observe(content);
    const frame=requestAnimationFrame(update);
    return()=>{observer.disconnect();cancelAnimationFrame(frame);};
  },[]);

  useEffect(() => {
    const stopInput = mountInputModality(document.documentElement);
    if (menu.current) menuMotion.current = mountDialog(menu.current, true);
    const cleanViewport = chat.current ? mountChatViewport(chat.current) : undefined;
    if (chat.current) {
      chatMotion.current = mountDialog(chat.current, false, () => launcher.current);
      chatResizeMotion.current = mountChatResizeMotion(chat.current);
    }
    return () => { stopInput(); cleanViewport?.(); menuMotion.current?.dispose(); chatMotion.current?.dispose(); chatResizeMotion.current?.dispose(); menuMotion.current = null; chatMotion.current = null; chatResizeMotion.current = null; };
  }, []);

  useEffect(() => { menu.current?.close(); chat.current?.close(); }, [pathname]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => { if (media.matches) menu.current?.close(); };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const blocked = Array.from(document.querySelectorAll<HTMLElement>("main,.site-footer,.azura-launcher,.skip-link"));
    const previous = blocked.map(node => node.inert);
    blocked.forEach(node => { node.inert = true; });
    return () => { blocked.forEach((node, index) => { node.inert = previous[index]; }); };
  }, [menuOpen]);
  useEffect(() => {
    if (!menuOpen && !chatOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [menuOpen, chatOpen]);
  useEffect(() => {
    scrollReply();
  }, [messages, scrollReply]);

  function openMenu() {
    chat.current?.close();
    if (menuMotion.current) menuMotion.current.open(); else menu.current?.show();
    // show() runs native autofocus. Keep focus on the stationary trigger rather
    // than scrolling an entering link into view (especially on iOS).
    document.querySelector<HTMLButtonElement>('.site-header:not(.popup-header) .menu-trigger')?.focus({preventScroll:true});
    setMenuOpen(true);
  }
  function openChat() { resetChatSize.current = false; menu.current?.close(); if (chatMotion.current) chatMotion.current.open(); else chat.current?.showModal(); setChatOpen(true); }
  async function send(question: string) {
    if (pendingReply.current) return;
    const value = question.trim();
    if (!value) { setError("Tulis pertanyaan terlebih dahulu."); return; }
    if (value.length > 500) { setError("Batasi pertanyaan hingga 500 karakter."); return; }
    const currentMessages=chatHistory.getSnapshot();
    if (currentMessages.length >= 20) { setError("Percakapan ini sudah memuat 20 pertanyaan. Mulai ulang percakapan untuk bertanya lagi."); return; }
    const id = Math.max(nextId.current, ...currentMessages.map(message => message.id + 1));
    nextId.current = id + 1;
    const history=conversationTurns(currentMessages);
    const controller=new AbortController(),pending={id,controller};pendingReply.current=pending;
    followLatest.current=true;setChatAwayFromBottom(false);
    if(document.activeElement?.closest('.quick-questions'))chat.current?.querySelector<HTMLInputElement>('#azura-input')?.focus({preventScroll:true});
    chatHistory.append({ id, question: value, reply:{text:''}, ready:false });
    setDraft(""); setError("");
    const result=await requestAnswer({question:value,locale,history},controller.signal);
    if(pendingReply.current!==pending)return;
    pendingReply.current=null;
    if('error' in result)chatHistory.fail(id,result.error);else chatHistory.finish(id,{text:result.text});
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); send(draft); }
  function closeMenu() { if (menuMotion.current) menuMotion.current.close(); else menu.current?.close(); }
  function menuKeyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); closeMenu(); return; }
    if (event.key !== "Tab") return;
    const targets = Array.from(document.querySelectorAll<HTMLElement>('.site-header:not(.popup-header) a[href],.site-header:not(.popup-header) button,#site-menu a[href],#site-menu button')).filter(node => node.getClientRects().length && !node.closest('[inert]') && getComputedStyle(node).visibility !== "hidden");
    const first = targets[0], last = targets.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus({ preventScroll: true }); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus({ preventScroll: true }); }
  }
  // A new route keeps the menu in place until the route curtain covers it.
  function navigateMenu(href: string) { if (href === pathname) closeMenu(); }
  function resizeChat() { chatResizeMotion.current?.play(); setChatWide(value => !value); }
  function closeChat() { chatResizeMotion.current?.stop(); finishReply();resetChatSize.current = true; if (chatMotion.current) chatMotion.current.close(); else chat.current?.close(); }
  function resetChat() {
    chatResizeMotion.current?.stop();
    followLatest.current=true;setChatAwayFromBottom(false);
    if (pendingReply.current) pendingReply.current.controller.abort();
    pendingReply.current = null; chatHistory.reset(); setDraft(""); setError(""); setResetVersion(value => value + 1);
    // Reset disappears with the conversation; keep focus on a stable control.
    chat.current?.querySelector<HTMLButtonElement>('.dialog-actions [aria-pressed]')?.focus({preventScroll:true});
  }
  function active(href: string) { return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`); }

  return translateTree(<>
    <ChromeHeader pathname={pathname} menuOpen={menuOpen} onMenu={menuOpen ? closeMenu : openMenu} onNavigate={menuOpen ? () => navigateMenu("/") : undefined} onKeyDown={menuOpen ? menuKeyboard : undefined}/>
    <div className="header-space" aria-hidden="true" data-motion-static/>
    <dialog ref={menu} id="site-menu" className="chrome-dialog menu-dialog" aria-labelledby="menu-heading" onKeyDown={menuKeyboard} onCancel={event => { event.preventDefault(); closeMenu(); }} onClose={() => { setMenuOpen(false); if (!document.querySelector('.route-transition-viewport[data-active="true"]')) { const trigger = document.querySelector<HTMLElement>('.site-header:not(.popup-header) .menu-trigger'); if (trigger?.getClientRects().length && document.activeElement !== trigger) trigger.focus({ preventScroll: true }); } }} onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}>
      <div className="menu-panel" data-dialog-panel="menu" tabIndex={-1} autoFocus>
      <div className="dialog-top"><h2 id="menu-heading">Jelajahi.</h2></div>
      <nav aria-label="Menu navigasi">{navigation.map((item, index) => <SiteLink key={item.href} href={item.href} prefetch={true} aria-current={active(item.href) ? "page" : undefined} onNavigate={() => navigateMenu(item.href)}><span className="meta">0{index + 1}</span>{item.label}<ArrowUpRight size={24} aria-hidden="true"/></SiteLink>)}</nav>
      <p className="meta menu-note">Electronics · Code · Research</p>
      </div>
    </dialog>
    <motion.button ref={launcher} className="azura-launcher" type="button" initial={false} whileHover={reduced ? undefined : {scale:1.1,rotate:-6}} whileTap={reduced ? undefined : {scale:.88,rotate:0}} transition={{type:"spring",stiffness:360,damping:18}} onClick={openChat} aria-label="Buka Azura" title="Azura" aria-expanded={chatOpen} aria-controls="azura-dialog"><MessageCircle size={18} aria-hidden="true"/></motion.button>
    <dialog ref={chat} id="azura-dialog" className="chrome-dialog azura-dialog" data-size={chatWide ? "wide" : "normal"} aria-labelledby="azura-heading" aria-describedby="azura-description" onKeyDown={containDialogFocus} onCancel={event => { event.preventDefault(); closeChat(); }} onClose={() => { finishReply(); setChatOpen(false); if (resetChatSize.current) setChatWide(false); resetChatSize.current = false; }}>
      <div className="azura-panel" data-dialog-panel="azura">
      <div className="dialog-top"><div><p className="eyebrow accent">Asisten portofolio</p><h2 id="azura-heading">Azura.</h2></div><div className="dialog-actions">
        <button className="icon-button" type="button" onClick={resizeChat} aria-label={chatWide ? "Kecilkan panel Azura" : "Lebarkan panel Azura"} title={chatWide ? "Kecilkan panel" : "Lebarkan panel"} aria-pressed={chatWide}>{chatWide ? <Minimize2 size={19} aria-hidden="true"/> : <Maximize2 size={19} aria-hidden="true"/>}</button>
        <div className="chat-reset-slot" data-active={messages.length > 0}><AnimatePresence initial={false}>{messages.length > 0 && <motion.button key="reset" className="icon-button reset-chat" type="button" onClick={resetChat} aria-label="Reset chat" title="Reset chat" initial={reduced ? false : {opacity:0,scale:.8}} animate={{opacity:1,scale:1,rotate:0}} exit={{opacity:0,scale:.8,rotate:-90}} transition={{duration:reduced ? 0 : .18}}><RotateCcw size={18} aria-hidden="true"/></motion.button>}</AnimatePresence></div>
        <button className="icon-button" type="button" onClick={closeChat} aria-label="Tutup Azura" title="Tutup"><X size={20} aria-hidden="true"/></button>
      </div></div>
      <p id="azura-description" className="meta chat-description">Tanyakan tentang Rehan dan karyanya.</p>
      <div className="chat-log-region">
      <div className="chat-log" ref={log} onScroll={chatScrolled} tabIndex={-1} role="log" aria-label="Percakapan dengan Azura" aria-live="polite" aria-relevant="additions text" aria-busy={typing}>
        <div className="chat-log-content">
        <AnimatePresence mode="wait"><motion.div key={resetVersion} className="chat-transcript" initial={reduced || resetVersion === 0 ? false : {opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:reduced ? 0 : .2}}>
        <div className="chat-reply"><p>Halo, aku Azura. Apa yang ingin kamu ketahui tentang Rehan dan karyanya?</p></div>
        {messages.map(message => <div className="chat-exchange" key={message.id}>
          <motion.div className="chat-question" initial={reduced || message.ready ? false : { opacity: 0, y: 28, x: 16, scale: .86 }} animate={{ opacity: 1, y: 0, x: 0, scale: 1 }} transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 26, mass: .8, opacity: { duration: .18 } }}><span className="sr-only">Kamu: </span><span data-no-translate>{message.question}</span></motion.div>
          <AnimatePresence initial={false} mode="wait">
            {message.ready ? message.error ? <motion.p key="error" className="chat-request-error" role="status" initial={{opacity:0}} animate={{opacity:1}}>{AI_ERRORS[message.error]}</motion.p> : <motion.div key="reply" className="chat-reply" initial={reduced || !message.animate ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .24, ease: [.22, 1, .36, 1] }}><ProgressiveAnswer id={message.id} text={message.reply.text} animate={!!message.animate} reduced={reduced} onDone={settleReply} onProgress={scrollReply}/></motion.div>
            : <motion.div key="typing" className="chat-typing" data-reduced={reduced} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: reduced ? 0 : .18 }}><span className="sr-only">Azura sedang mengetik</span><span aria-hidden="true">{[0, 1, 2].map(dot => <i key={dot}/>)}</span></motion.div>}
          </AnimatePresence>
        </div>)}
        </motion.div></AnimatePresence>
        </div>
      </div>
      <AnimatePresence initial={false}>{chatAwayFromBottom && <motion.button key="latest" className="icon-button chat-jump-latest" type="button" onClick={jumpToLatest} aria-label="Ke pesan terbaru" title="Ke pesan terbaru" initial={reduced?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}} transition={{duration:reduced?0:.2}}><ArrowDown size={15} aria-hidden="true"/></motion.button>}</AnimatePresence>
      </div>
      <div className="quick-questions-region" inert={messages.length>0}>
        <AnimatePresence initial={false}>{messages.length===0 && <motion.div key="suggestions" className="quick-questions" role="group" aria-label="Pertanyaan cepat" initial={reduced ? false : {height:0,opacity:0,marginTop:0,marginBottom:0}} animate={{height:'auto',opacity:1,marginTop:8,marginBottom:8}} exit={{height:0,opacity:0,marginTop:0,marginBottom:0}} transition={{duration:reduced ? 0 : .48,ease:[.25,.1,.25,1]}}>{["Tentang Rehan", "Karya & proyek", "Kompetensi", "Pengalaman", "Kontak"].map(question => <button type="button" key={question} onClick={() => send(t(question))}><span className="quick-question-label">{question}</span></button>)}</motion.div>}</AnimatePresence>
      </div>
      <form onSubmit={submit} className="chat-form" autoComplete="off"><label htmlFor="azura-input" className="sr-only">Pertanyaanmu</label><div className="chat-input-row"><input id="azura-input" name="azura-message" autoComplete="off" value={draft} onChange={event => setDraft(event.target.value)} maxLength={500} placeholder="Tanya tentang karya…" aria-describedby="chat-error" aria-invalid={!!error} disabled={messages.length >= 20}/><button type="submit" className="icon-button" aria-label="Kirim pertanyaan" disabled={typing || messages.length >= 20}><Send size={18} aria-hidden="true"/></button></div><p id="chat-error" className="form-error" role="alert">{error}</p></form>
      </div>
    </dialog>
  </>,t,locale);
}
