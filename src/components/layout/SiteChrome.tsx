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
import { X, MessageCircle, Send, RotateCcw, ArrowUpRight, Maximize2, Minimize2 } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SiteLink } from "./RouteTransition";
import { navigation } from "@/lib/navigation";
import { mountDialog } from "@/lib/motion/dialog";
import { createChatHistory, type Reply } from "@/lib/azura/history";
import { mountChatViewport } from "@/lib/azura/viewport";

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
    <div className="header-controls" data-motion-static><LanguageSwitcher/><ThemeToggle/><button className="icon-button menu-trigger" type="button" onClick={onMenu} aria-label={menuOpen ? "Tutup menu" : "Buka menu"} aria-expanded={menuOpen} aria-controls="site-menu"><span className="menu-glyph" data-open={menuOpen} aria-hidden="true"><span/><span/><span/></span></button></div>
  </div></header>,t,locale);
}
function replyTo(question: string): Reply {
  const text = question.toLocaleLowerCase("id");
  if (/vircuit/.test(text)) return { text: "Vircuit adalah laboratorium virtual untuk belajar elektronika, mikrokontroler, dan IoT. Proyek tim Trio Hengker Enjoyer ini meraih Juara 3 Web Development FESTRA UNRI 2026.", href: "/projects/vircuit", label: "Jelajahi Vircuit" };
  if (/aura/.test(text)) return { text: "AURA POD merupakan inovasi fotobioreaktor mikroalga dari tim ALGA NOVA dengan dukungan elektronika dan IoT. Tim meraih Juara 1 dan Most Favorite BPDC SiCheCo UNSRI 2026.", href: "/projects/aura-pod", label: "Jelajahi AURA POD" };
  if (/kontak|hubung|contact|email|kolaborasi|collaborat/.test(text)) return { text: "Profil GitHub Rehan tersedia di halaman Contact. Dari sana, kamu bisa membuka repositori dan melihat aktivitas pengembangannya.", href: "/contact", label: "Buka Contact" };
  if (/riset|research|iot|lab|inkubator|incubator/.test(text)) return { text: "Halaman Lab merangkum penelitian dan praktik yang Rehan ikuti. Kamu bisa melihat topik yang dikerjakan, perkembangannya, dan dokumentasi yang tersedia.", href: "/lab", label: "Buka Lab & Research" };
  if (/siapa|profil|tentang|rehan|about|who/.test(text)) return { text: "Rehan adalah mahasiswa S1 Pendidikan Vokasional Teknik Elektronika di Universitas Muhammadiyah Riau. Minatnya mencakup elektronika, embedded systems, IoT, dan pengembangan software.", href: "/about", label: "Tentang Rehan" };
  if (/skill|kompetensi|kemampuan|technolog/.test(text)) return { text: "Di halaman About, kamu bisa mengenal kemampuan yang Rehan kembangkan dan teknologi yang digunakan. Label Learning menunjukkan yang masih dipelajari.", href: "/about#skills-heading", label: "Jelajahi kompetensi" };
  if (/pengalaman|experience/.test(text)) return { text: "Halaman Experience merangkum peran yang pernah Rehan jalani beserta latar kegiatannya. Pilih kategori untuk menelusuri pengalaman yang ingin kamu kenal lebih jauh.", href: "/experience", label: "Lihat pengalaman" };
  if (/proyek|project|karya/.test(text)) return { text: "Di Projects, kamu bisa menjelajahi karya Rehan dan membaca informasi yang tersedia pada setiap proyek. Gunakan pencarian atau kategori untuk menemukan yang ingin kamu lihat.", href: "/projects", label: "Jelajahi karya" };
  return { text: "Aku belum punya informasi tentang topik itu. Kamu bisa bertanya tentang profil Rehan, karya, kemampuan, pengalaman, atau cara menghubunginya.", href: "/projects", label: "Jelajahi karya" };
}
const chatHistory = createChatHistory(replyTo);

export function SiteChrome() {
  const {locale,t}=useTranslation();
  const reduced = useSyncExternalStore(subscribeMotion,prefersReducedMotion,() => true);
  const pathname = logicalPath(usePathname());
  const menu = useRef<HTMLDialogElement>(null);
  const chat = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatWide, setChatWide] = useState(false);
  const messages = useSyncExternalStore(chatHistory.subscribe, chatHistory.getSnapshot, chatHistory.getServerSnapshot);
  const [resetVersion, setResetVersion] = useState(0);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const nextId = useRef(0);
  const pendingReply = useRef<{ timer: ReturnType<typeof setTimeout>; id: number } | null>(null);
  const resetChatSize = useRef(false);
  const menuMotion = useRef<ReturnType<typeof mountDialog> | null>(null);
  const chatMotion = useRef<ReturnType<typeof mountDialog> | null>(null);
  const typing = messages.some(message => !message.ready);
  const finishReply = useCallback(() => {
    const pending = pendingReply.current;
    if (!pending) return;
    clearTimeout(pending.timer);
    pendingReply.current = null;
    chatHistory.finish(pending.id);
  }, []);
  useEffect(() => {
    const unsubscribe = subscribeMotion(() => { if (prefersReducedMotion()) finishReply(); });
    return () => { unsubscribe(); finishReply(); };
  }, [finishReply]);

  useEffect(() => {
    if (menu.current) menuMotion.current = mountDialog(menu.current, true);
    const cleanViewport = chat.current ? mountChatViewport(chat.current) : undefined;
    if (chat.current) chatMotion.current = mountDialog(chat.current, false, () => launcher.current);
    return () => { cleanViewport?.(); menuMotion.current?.dispose(); chatMotion.current?.dispose(); menuMotion.current = null; chatMotion.current = null; };
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
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: reduced ? "instant" : "smooth" });
  }, [messages, reduced]);

  function openMenu() { chat.current?.close(); if (menuMotion.current) menuMotion.current.open(); else menu.current?.show(); setMenuOpen(true); }
  function openChat() { resetChatSize.current = false; menu.current?.close(); if (chatMotion.current) chatMotion.current.open(); else chat.current?.showModal(); setChatOpen(true); }
  function send(question: string) {
    if (pendingReply.current) return;
    const value = question.trim();
    if (!value) { setError("Tulis pertanyaan terlebih dahulu."); return; }
    if (value.length > 500) { setError("Batasi pertanyaan hingga 500 karakter."); return; }
    if (messages.length >= 20) { setError("Percakapan ini sudah memuat 20 pertanyaan. Mulai ulang percakapan untuk bertanya lagi."); return; }
    const id = Math.max(nextId.current, ...messages.map(message => message.id + 1));
    nextId.current = id + 1;
    chatHistory.append({ id, question: value, reply: replyTo(value), ready: reduced });
    if (!reduced) pendingReply.current = { id, timer: setTimeout(finishReply, 640) };
    setDraft(""); setError("");
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
  function closeChat() { resetChatSize.current = true; if (chatMotion.current) chatMotion.current.close(); else chat.current?.close(); }
  function resetChat() {
    if (pendingReply.current) clearTimeout(pendingReply.current.timer);
    pendingReply.current = null; chatHistory.reset(); setDraft(""); setError(""); setResetVersion(value => value + 1);
  }
  function active(href: string) { return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`); }

  return translateTree(<>
    <ChromeHeader pathname={pathname} menuOpen={menuOpen} onMenu={menuOpen ? closeMenu : openMenu} onNavigate={menuOpen ? () => navigateMenu("/") : undefined} onKeyDown={menuOpen ? menuKeyboard : undefined}/>
    <div className="header-space" aria-hidden="true" data-motion-static/>
    <dialog ref={menu} id="site-menu" className="chrome-dialog menu-dialog" aria-labelledby="menu-heading" onKeyDown={menuKeyboard} onCancel={event => { event.preventDefault(); closeMenu(); }} onClose={() => { setMenuOpen(false); if (!document.querySelector('.route-transition-viewport[data-active="true"]')) { const trigger = document.querySelector<HTMLElement>('.site-header:not(.popup-header) .menu-trigger'); if (trigger?.getClientRects().length && document.activeElement !== trigger) trigger.focus({ preventScroll: true }); } }} onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}>
      <div className="menu-panel" data-dialog-panel="menu">
      <div className="dialog-top"><h2 id="menu-heading">Jelajahi.</h2></div>
      <nav aria-label="Menu navigasi">{navigation.map((item, index) => <SiteLink key={item.href} href={item.href} prefetch={true} aria-current={active(item.href) ? "page" : undefined} onNavigate={() => navigateMenu(item.href)}><span className="meta">0{index + 1}</span>{item.label}<ArrowUpRight size={24} aria-hidden="true"/></SiteLink>)}</nav>
      <p className="meta menu-note">Electronics · Code · Research</p>
      </div>
    </dialog>
    <motion.button ref={launcher} className="azura-launcher" type="button" initial={false} whileHover={reduced ? undefined : {scale:1.1,rotate:-6}} whileTap={reduced ? undefined : {scale:.88,rotate:0}} transition={{type:"spring",stiffness:360,damping:18}} onClick={openChat} aria-label="Buka Azura" title="Azura" aria-expanded={chatOpen} aria-controls="azura-dialog"><MessageCircle size={18} aria-hidden="true"/></motion.button>
    <dialog ref={chat} id="azura-dialog" className="chrome-dialog azura-dialog" data-size={chatWide ? "wide" : "normal"} aria-labelledby="azura-heading" aria-describedby="azura-description" onKeyDown={containDialogFocus} onCancel={event => { event.preventDefault(); closeChat(); }} onClose={() => { finishReply(); setChatOpen(false); if (resetChatSize.current) setChatWide(false); resetChatSize.current = false; }}>
      <div className="azura-panel" data-dialog-panel="azura">
      <div className="dialog-top"><div><p className="eyebrow accent">Asisten portofolio</p><h2 id="azura-heading">Azura.</h2></div><div className="dialog-actions">
        <button className="icon-button" type="button" onClick={() => setChatWide(value => !value)} aria-label={chatWide ? "Kecilkan panel Azura" : "Lebarkan panel Azura"} title={chatWide ? "Kecilkan panel" : "Lebarkan panel"} aria-pressed={chatWide}>{chatWide ? <Minimize2 size={19} aria-hidden="true"/> : <Maximize2 size={19} aria-hidden="true"/>}</button>
        <button className="icon-button" type="button" onClick={closeChat} aria-label="Tutup Azura" title="Tutup"><X size={20} aria-hidden="true"/></button>
      </div></div>
      <p id="azura-description" className="meta chat-description">Tanyakan tentang Rehan dan karyanya.</p>
      <div className="chat-log" ref={log} role="log" aria-label="Percakapan dengan Azura" aria-live="polite" aria-relevant="additions text" aria-busy={typing}>
        <AnimatePresence mode="wait"><motion.div key={resetVersion} className="chat-transcript" initial={reduced || resetVersion === 0 ? false : {opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:reduced ? 0 : .2}}>
        <div className="chat-reply"><p>Aku Azura. Mau tahu tentang Rehan, proyek, atau pengalamannya?</p></div>
        {messages.map(message => <div className="chat-exchange" key={message.id}>
          <motion.div className="chat-question" initial={reduced || message.ready ? false : { opacity: 0, y: 28, x: 16, scale: .86 }} animate={{ opacity: 1, y: 0, x: 0, scale: 1 }} transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 26, mass: .8, opacity: { duration: .18 } }}><span className="sr-only">Kamu: </span><span data-no-translate>{message.question}</span></motion.div>
          <AnimatePresence initial={false} mode="wait">
            {message.ready ? <motion.div key="reply" className="chat-reply" initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .46, ease: [.22, 1, .36, 1] }} onAnimationComplete={() => { if (log.current && chat.current?.open) log.current.scrollTo({ top: log.current.scrollHeight, behavior: reduced ? "instant" : "smooth" }); }}><p><span className="sr-only">Azura: </span>{message.reply.text}</p><SiteLink href={message.reply.href} className="text-link" onNavigate={closeChat}>{message.reply.label}<ArrowUpRight size={16} aria-hidden="true"/></SiteLink></motion.div>
            : <motion.div key="typing" className="chat-typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: reduced ? 0 : .18 }}><span className="sr-only">Azura sedang mengetik</span><span aria-hidden="true">{[0, 1, 2].map(dot => <motion.i key={dot} animate={reduced ? undefined : { y: [0, -4, 0], opacity: [.4, 1, .4] }} transition={{ duration: .9, repeat: Infinity, delay: dot * .12 }}/>)}</span></motion.div>}
          </AnimatePresence>
        </div>)}
        </motion.div></AnimatePresence>
      </div>
      <div className="quick-questions" role="group" aria-label="Pertanyaan cepat">{["Tentang Rehan", "Proyek Vircuit", "Kompetensi", "Kontak"].map(question => <button type="button" key={question} onClick={() => send(t(question))} disabled={typing || messages.length >= 20}>{question}</button>)}</div>
      <form onSubmit={submit} className="chat-form" autoComplete="off"><label htmlFor="azura-input" className="sr-only">Pertanyaanmu</label><div className="chat-input-row"><input id="azura-input" name="azura-message" autoComplete="off" value={draft} onChange={event => setDraft(event.target.value)} maxLength={500} placeholder="Tanya tentang karya…" aria-describedby="chat-error" aria-invalid={!!error} disabled={messages.length >= 20}/><button type="submit" className="icon-button" aria-label="Kirim pertanyaan" disabled={typing || messages.length >= 20}><Send size={18} aria-hidden="true"/></button></div><p id="chat-error" className="form-error" role="alert">{error}</p><div className="chat-form-footer"><button type="button" className="reset-chat" onClick={resetChat}><motion.span initial={false} animate={{rotate:resetVersion * -360}} transition={{duration:reduced ? 0 : .4}}><RotateCcw size={14} aria-hidden="true"/></motion.span> Reset chat</button></div><p className="chat-retention">Percakapan disimpan di perangkat ini selama 1 jam.</p></form>
      </div>
    </dialog>
  </>,t,locale);
}
