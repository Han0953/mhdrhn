"use client";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle, Send, RotateCcw, ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SiteLink } from "./RouteTransition";
import { navigation } from "@/lib/content";

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
  if (/vircuit/.test(text)) return { text: "Vircuit adalah laboratorium elektronika virtual berbasis web, dikembangkan oleh tim Trio Hengker Enjoyer. Tim meraih Juara 3 Web Development FESTRA UNRI 2026.", href: "/projects/vircuit", label: "Jelajahi Vircuit" };
  if (/aura/.test(text)) return { text: "AURA POD adalah inovasi tim ALGA NOVA yang menghubungkan fotobioreaktor mikroalga dengan elektronika dan IoT. Penghargaannya adalah hasil tim.", href: "/projects/aura-pod", label: "Jelajahi AURA POD" };
  if (/kontak|hubung|contact|email|kolaborasi/.test(text)) return { text: "Kanal publik Rehan yang tersedia saat ini adalah GitHub. Kamu bisa menemukannya di halaman Contact.", href: "/contact", label: "Buka Contact" };
  if (/riset|research|iot|lab|inkubator/.test(text)) return { text: "Rehan mengeksplorasi IoT dan embedded systems. Ada penelitian inkubator berbasis MQTT serta proyek Blynk yang berbeda. Hasil pengujian yang belum tersedia tidak aku simpulkan.", href: "/lab", label: "Buka Lab & Research" };
  if (/siapa|profil|tentang|rehan/.test(text)) return { text: "Rehan adalah mahasiswa Pendidikan Vokasional Teknik Elektronika di Universitas Muhammadiyah Riau, dengan minat pada elektronika, software, dan riset.", href: "/about", label: "Tentang Rehan" };
  if (/pengalaman|experience/.test(text)) return { text: "Pengalaman Rehan mencakup organisasi HIMPTEKA UMRI, laboratorium elektronika, kepanitiaan, dan pengujian aplikasi mobile.", href: "/experience", label: "Lihat pengalaman" };
  if (/proyek|project|karya/.test(text)) return { text: "Mulai dari Vircuit, AURA POD, atau website PVTE + HIMPTEKA. Ringkasan dan konteks tiap karya tersedia di indeks Projects.", href: "/projects", label: "Jelajahi karya" };
  return { text: "Aku belum punya jawaban untuk pertanyaan itu. Demo lokal ini hanya mengenali beberapa topik portfolio, tanpa model AI atau pencarian internet. Coba tanya tentang Vircuit, IoT, profil, atau kontak.", href: "/projects", label: "Lihat indeks karya" };
}

export function SiteChrome() {
  const pathname = usePathname();
  const menu = useRef<HTMLDialogElement>(null);
  const chat = useRef<HTMLDialogElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Exchange[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const nextId = useRef(0);

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

  function openMenu() { chat.current?.close(); menu.current?.showModal(); setMenuOpen(true); }
  function openChat() { menu.current?.close(); chat.current?.showModal(); setChatOpen(true); }
  function send(question: string) {
    const value = question.trim();
    if (!value) { setError("Tulis pertanyaan terlebih dahulu."); return; }
    if (value.length > 500) { setError("Batasi pertanyaan hingga 500 karakter."); return; }
    if (messages.length >= 20) { setError("Batas 20 pertanyaan tercapai. Reset percakapan untuk mulai lagi."); return; }
    setMessages(previous => [...previous, { id: nextId.current++, question: value, reply: replyTo(value) }]);
    setDraft(""); setError("");
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); send(draft); }
  function closeMenu() { menu.current?.close(); }
  function closeChat() { chat.current?.close(); }
  function active(href: string) { return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`); }

  return <>
    <header className="site-header"><div className="header-inner wrap">
      <SiteLink className="wordmark" href="/" aria-label="mhdrhn. — Home">mhdrhn<span className="accent">.</span></SiteLink>
      <nav className="desktop-nav" aria-label="Navigasi utama">{navigation.map(item => <SiteLink key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined}>{item.label}</SiteLink>)}</nav>
      <div className="header-controls"><ThemeToggle/><button className="icon-button menu-trigger" type="button" onClick={openMenu} aria-label="Buka menu" aria-expanded={menuOpen} aria-controls="site-menu"><Menu size={21} aria-hidden="true"/></button></div>
    </div></header>
    <dialog ref={menu} id="site-menu" className="menu-dialog" aria-labelledby="menu-heading" onKeyDown={containDialogFocus} onClose={() => setMenuOpen(false)} onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}>
      <div className="dialog-top"><h2 id="menu-heading">Jelajahi.</h2><button className="icon-button" type="button" aria-label="Tutup menu" onClick={closeMenu}><X aria-hidden="true"/></button></div>
      <nav aria-label="Menu mobile">{navigation.map((item, index) => <SiteLink key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} onNavigate={closeMenu}><span className="meta">0{index + 1}</span>{item.label}<ArrowUpRight size={24} aria-hidden="true"/></SiteLink>)}</nav>
      <p className="meta menu-note">Electronics · Code · Research</p>
    </dialog>
    <button className="azura-launcher" type="button" onClick={openChat} aria-label="Buka Azura — demo lokal" aria-expanded={chatOpen} aria-controls="azura-dialog"><MessageCircle size={21} aria-hidden="true"/><span>Azura<span className="launcher-note">Demo lokal</span></span></button>
    <dialog ref={chat} id="azura-dialog" className="azura-dialog" aria-labelledby="azura-heading" aria-describedby="azura-description" onKeyDown={containDialogFocus} onClose={() => setChatOpen(false)}>
      <div className="dialog-top"><div><p className="eyebrow accent">Demo lokal</p><h2 id="azura-heading">Azura.</h2></div><button className="icon-button" type="button" onClick={closeChat} aria-label="Tutup Azura"><X aria-hidden="true"/></button></div>
      <p id="azura-description" className="meta chat-description">Panduan portfolio dengan jawaban statis. Pesan hanya tersimpan selama halaman ini terbuka dan tidak dikirim ke layanan AI.</p>
      <div className="chat-log" ref={log} role="log" aria-label="Percakapan dengan Azura" aria-live="polite" aria-relevant="additions">
        <div className="chat-reply"><p>Aku Azura. Mau mulai dari karya, eksperimen IoT, atau mengenal Rehan?</p></div>
        {messages.map(message => <div className="chat-exchange" key={message.id}><div className="chat-question"><span className="sr-only">Kamu: </span>{message.question}</div><div className="chat-reply"><p><span className="sr-only">Azura: </span>{message.reply.text}</p><SiteLink href={message.reply.href} className="text-link" onNavigate={closeChat}>{message.reply.label}<ArrowUpRight size={16} aria-hidden="true"/></SiteLink></div></div>)}
      </div>
      <div className="quick-questions" role="group" aria-label="Pertanyaan cepat">{["Tentang Rehan", "Proyek Vircuit", "Kontak"].map(question => <button type="button" key={question} onClick={() => send(question)} disabled={messages.length >= 20}>{question}</button>)}</div>
      <form onSubmit={submit} className="chat-form"><label htmlFor="azura-input">Pertanyaanmu</label><div className="chat-input-row"><input id="azura-input" value={draft} onChange={event => setDraft(event.target.value)} maxLength={500} placeholder="Tanya tentang portfolio…" aria-describedby="chat-error chat-limit" aria-invalid={!!error} disabled={messages.length >= 20}/><button type="submit" className="icon-button" aria-label="Kirim pertanyaan" disabled={messages.length >= 20}><Send size={20} aria-hidden="true"/></button></div><p id="chat-error" className="form-error" role="alert">{error}</p><div className="chat-form-footer"><span id="chat-limit" className="meta">{draft.length}/500 · {messages.length}/20 pertanyaan</span><button type="button" className="reset-chat" onClick={() => { setMessages([]); setDraft(""); setError(""); }}><RotateCcw size={14} aria-hidden="true"/> Reset</button></div></form>
    </dialog>
  </>;
}
