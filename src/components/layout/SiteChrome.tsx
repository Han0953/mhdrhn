"use client";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { PageMotion } from "@/components/motion/PageMotion";
import { prefersReducedMotion, subscribeMotion } from "@/lib/motion/preferences";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle, Send, RotateCcw, ArrowUpRight, Maximize2, Minimize2, Minus } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SiteLink } from "./RouteTransition";
import { navigation } from "@/lib/navigation";
import { mountDialog } from "@/lib/motion/dialog";

interface Reply { text: string; href: string; label: string }
interface Exchange { id: number; question: string; reply: Reply }
function containDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== "Tab") return;
  const targets = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), [tabindex="0"]')).filter(element => element.getClientRects().length > 0);
  const first = targets[0];
  const last = targets.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
}
function replyTo(question: string): Reply {
  const text = question.toLocaleLowerCase("id");
  if (/vircuit/.test(text)) return { text: "Vircuit adalah laboratorium virtual untuk belajar elektronika, mikrokontroler, dan IoT. Proyek tim Trio Hengker Enjoyer ini meraih Juara 3 Web Development FESTRA UNRI 2026.", href: "/projects/vircuit", label: "Jelajahi Vircuit" };
  if (/aura/.test(text)) return { text: "AURA POD merupakan inovasi fotobioreaktor mikroalga dari tim ALGA NOVA dengan dukungan elektronika dan IoT. Tim meraih Juara 1 dan Most Favorite BPDC SiCheCo UNSRI 2026.", href: "/projects/aura-pod", label: "Jelajahi AURA POD" };
  if (/kontak|hubung|contact|email|kolaborasi/.test(text)) return { text: "Profil GitHub Rehan tersedia di halaman Contact. Dari sana, kamu bisa membuka repositori dan melihat aktivitas pengembangannya.", href: "/contact", label: "Buka Contact" };
  if (/riset|research|iot|lab|inkubator/.test(text)) return { text: "Halaman Lab merangkum penelitian dan praktik yang Rehan ikuti. Kamu bisa melihat topik yang dikerjakan, perkembangannya, dan dokumentasi yang tersedia.", href: "/lab", label: "Buka Lab & Research" };
  if (/siapa|profil|tentang|rehan/.test(text)) return { text: "Rehan adalah mahasiswa S1 Pendidikan Vokasional Teknik Elektronika di Universitas Muhammadiyah Riau. Minatnya mencakup elektronika, embedded systems, IoT, dan pengembangan software.", href: "/about", label: "Tentang Rehan" };
  if (/skill|kompetensi|kemampuan/.test(text)) return { text: "Di halaman About, kamu bisa mengenal kemampuan yang Rehan kembangkan dan teknologi yang digunakan. Label Learning menunjukkan yang masih dipelajari.", href: "/about#skills-heading", label: "Jelajahi kompetensi" };
  if (/pengalaman|experience/.test(text)) return { text: "Halaman Experience merangkum peran yang pernah Rehan jalani beserta latar kegiatannya. Pilih kategori untuk menelusuri pengalaman yang ingin kamu kenal lebih jauh.", href: "/experience", label: "Lihat pengalaman" };
  if (/proyek|project|karya/.test(text)) return { text: "Di Projects, kamu bisa menjelajahi karya Rehan dan membaca informasi yang tersedia pada setiap proyek. Gunakan pencarian atau kategori untuk menemukan yang ingin kamu lihat.", href: "/projects", label: "Jelajahi karya" };
  return { text: "Aku belum bisa menjawab topik itu di demo ini. Coba tanyakan tentang profil Rehan, karya, kemampuan, pengalaman, atau cara menghubunginya.", href: "/projects", label: "Jelajahi karya" };
}

export function SiteChrome() {
  const reduced = useSyncExternalStore(subscribeMotion,prefersReducedMotion,() => true);
  const pathname = usePathname();
  const menu = useRef<HTMLDialogElement>(null);
  const chat = useRef<HTMLDialogElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatWide, setChatWide] = useState(false);
  const [messages, setMessages] = useState<Exchange[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const nextId = useRef(0);
  const resetChatSize = useRef(false);
  const menuMotion = useRef<ReturnType<typeof mountDialog> | null>(null);
  const chatMotion = useRef<ReturnType<typeof mountDialog> | null>(null);

  useEffect(() => {
    if (menu.current) menuMotion.current = mountDialog(menu.current, true);
    if (chat.current) chatMotion.current = mountDialog(chat.current);
    return () => { menuMotion.current?.dispose(); chatMotion.current?.dispose(); menuMotion.current = null; chatMotion.current = null; };
  }, []);

  useEffect(() => { menu.current?.close(); chat.current?.close(); }, [pathname]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => { if (media.matches) menu.current?.close(); };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);
  useEffect(() => {
    if (!menuOpen && !chatOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [menuOpen, chatOpen]);
  useEffect(() => { if (log.current) log.current.scrollTop = log.current.scrollHeight; }, [messages]);

  function openMenu() { chat.current?.close(); if (menuMotion.current) menuMotion.current.open(); else menu.current?.showModal(); setMenuOpen(true); }
  function openChat() { resetChatSize.current = false; menu.current?.close(); if (chatMotion.current) chatMotion.current.open(); else chat.current?.showModal(); setChatOpen(true); }
  function send(question: string) {
    const value = question.trim();
    if (!value) { setError("Tulis pertanyaan terlebih dahulu."); return; }
    if (value.length > 500) { setError("Batasi pertanyaan hingga 500 karakter."); return; }
    if (messages.length >= 20) { setError("Percakapan ini sudah memuat 20 pertanyaan. Mulai ulang percakapan untuk bertanya lagi."); return; }
    setMessages(previous => [...previous, { id: nextId.current++, question: value, reply: replyTo(value) }]);
    setDraft(""); setError("");
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); send(draft); }
  function closeMenu() { if (menuMotion.current) menuMotion.current.close(); else menu.current?.close(); }
  function closeChat() { resetChatSize.current = true; if (chatMotion.current) chatMotion.current.close(); else chat.current?.close(); }
  function minimizeChat() { resetChatSize.current = false; if (chatMotion.current) chatMotion.current.close(); else chat.current?.close(); }
  function active(href: string) { return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`); }

  return <>
    <header className="site-header"><div className="header-inner wrap">
      <PageMotion profile="chrome"/>
      <SiteLink className="wordmark" href="/" aria-label="mhdrhn. — Home">mhdrhn<span className="accent">.</span></SiteLink>
      <nav className="desktop-nav" aria-label="Navigasi utama">{navigation.map(item => <SiteLink key={item.href} href={item.href} prefetch={true} aria-current={active(item.href) ? "page" : undefined}>{item.label}</SiteLink>)}</nav>
      <div className="header-controls"><ThemeToggle/><button className="icon-button menu-trigger" type="button" onClick={openMenu} aria-label="Buka menu" aria-expanded={menuOpen} aria-controls="site-menu"><Menu size={21} aria-hidden="true"/></button></div>
    </div></header>
    <dialog ref={menu} id="site-menu" className="menu-dialog" aria-labelledby="menu-heading" onKeyDown={containDialogFocus} onCancel={event => { event.preventDefault(); closeMenu(); }} onClose={() => setMenuOpen(false)} onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}>
      <div className="dialog-top"><h2 id="menu-heading">Jelajahi.</h2><button className="icon-button" type="button" aria-label="Tutup menu" onClick={closeMenu}><X aria-hidden="true"/></button></div>
      <nav aria-label="Menu navigasi">{navigation.map((item, index) => <SiteLink key={item.href} href={item.href} prefetch={true} aria-current={active(item.href) ? "page" : undefined} onNavigate={closeMenu}><span className="meta">0{index + 1}</span>{item.label}<ArrowUpRight size={24} aria-hidden="true"/></SiteLink>)}</nav>
      <p className="meta menu-note">Electronics · Code · Research</p>
    </dialog>
    <motion.button className="azura-launcher" type="button" initial={false} whileHover={reduced ? undefined : {scale:1.1,rotate:-6}} whileTap={reduced ? undefined : {scale:.88,rotate:0}} transition={{type:"spring",stiffness:360,damping:18}} onClick={openChat} aria-label="Buka Azura — demo lokal" title="Azura · Demo lokal" aria-expanded={chatOpen} aria-controls="azura-dialog"><MessageCircle size={21} aria-hidden="true"/></motion.button>
    <dialog ref={chat} id="azura-dialog" className="azura-dialog" data-size={chatWide ? "wide" : "normal"} aria-labelledby="azura-heading" aria-describedby="azura-description" onKeyDown={containDialogFocus} onCancel={event => { event.preventDefault(); closeChat(); }} onClose={() => { setChatOpen(false); if (resetChatSize.current) setChatWide(false); resetChatSize.current = false; }}>
      <div className="dialog-top"><div><p className="eyebrow accent">Demo lokal</p><h2 id="azura-heading">Azura.</h2></div><div className="dialog-actions">
        <button className="icon-button" type="button" onClick={() => setChatWide(value => !value)} aria-label={chatWide ? "Kecilkan panel Azura" : "Lebarkan panel Azura"} title={chatWide ? "Kecilkan panel" : "Lebarkan panel"} aria-pressed={chatWide}>{chatWide ? <Minimize2 size={19} aria-hidden="true"/> : <Maximize2 size={19} aria-hidden="true"/>}</button>
        <button className="icon-button" type="button" onClick={minimizeChat} aria-label="Minimalkan Azura" title="Minimalkan"><Minus size={19} aria-hidden="true"/></button>
        <button className="icon-button" type="button" onClick={closeChat} aria-label="Tutup Azura" title="Tutup"><X size={20} aria-hidden="true"/></button>
      </div></div>
      <p id="azura-description" className="meta chat-description">Aku menggunakan jawaban contoh untuk membantumu menjelajahi portofolio ini. Percakapan tetap di halaman ini dan tidak dikirim ke layanan AI.</p>
      <div className="chat-log" ref={log} role="log" aria-label="Percakapan dengan Azura" aria-live="polite" aria-relevant="additions">
        <div className="chat-reply"><p>Aku Azura. Aku bisa membantumu menemukan proyek, pengalaman, dan informasi tentang Rehan. Mau mulai dari mana?</p></div>
        {messages.map(message => <div className="chat-exchange" key={message.id}><div className="chat-question"><span className="sr-only">Kamu: </span>{message.question}</div><div className="chat-reply"><p><span className="sr-only">Azura: </span>{message.reply.text}</p><SiteLink href={message.reply.href} className="text-link" onNavigate={closeChat}>{message.reply.label}<ArrowUpRight size={16} aria-hidden="true"/></SiteLink></div></div>)}
      </div>
      <div className="quick-questions" role="group" aria-label="Pertanyaan cepat">{["Tentang Rehan", "Proyek Vircuit", "Kompetensi", "Kontak"].map(question => <button type="button" key={question} onClick={() => send(question)} disabled={messages.length >= 20}>{question}</button>)}</div>
      <form onSubmit={submit} className="chat-form"><label htmlFor="azura-input">Pertanyaanmu</label><div className="chat-input-row"><input id="azura-input" value={draft} onChange={event => setDraft(event.target.value)} maxLength={500} placeholder="Tanya tentang karya…" aria-describedby="chat-error chat-limit" aria-invalid={!!error} disabled={messages.length >= 20}/><button type="submit" className="icon-button" aria-label="Kirim pertanyaan" disabled={messages.length >= 20}><Send size={20} aria-hidden="true"/></button></div><p id="chat-error" className="form-error" role="alert">{error}</p><div className="chat-form-footer"><span id="chat-limit" className="meta">{draft.length}/500 · {messages.length}/20 pertanyaan</span><button type="button" className="reset-chat" onClick={() => { setMessages([]); setDraft(""); setError(""); }}><RotateCcw size={14} aria-hidden="true"/> Mulai ulang</button></div></form>
    </dialog>
  </>;
}
