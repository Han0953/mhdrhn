"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, Maximize2, Minimize2, X, ZoomIn } from "lucide-react";
import { getMediaDimensions, type MediaAsset } from "@/lib/media";
import { MediaImage } from "./MediaImage";
import { mountDialog } from "@/lib/motion/dialog";
import { prefersReducedMotion, subscribeMotion } from "@/lib/motion/preferences";

export function MediaGallery({ items, label, compact = false, sizes }: { items: readonly MediaAsset[]; label: string; compact?: boolean; sizes?: string }) {
  const publicItems = items.filter(item => item.publication === "PUBLIC");
  const dialog = useRef<HTMLDialogElement>(null);
  const panelMotion = useRef<ReturnType<typeof mountDialog> | null>(null);
  const imageFrame = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [opened, setOpened] = useState(false);
  const id = useId();
  const current = publicItems[active] ?? publicItems[0];

  useEffect(() => {
    if (!opened) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [opened]);
  useEffect(() => {
    const element = dialog.current;
    if (element) panelMotion.current = mountDialog(element);
    return () => { panelMotion.current?.dispose(); panelMotion.current = null; element?.close(); };
  }, []);
  useEffect(() => {
    if (!opened || prefersReducedMotion() || document.hidden || !imageFrame.current?.animate) return;
    let animation: Animation | undefined;
    const stop = () => animation?.cancel();
    try { animation = imageFrame.current.animate([{ opacity: .72 }, { opacity: 1 }], { duration: 120, easing: "ease-out" }); } catch { /* Original photo remains visible. */ }
    const onPreference = () => { if (prefersReducedMotion() || document.hidden) stop(); };
    const unsubscribe = subscribeMotion(onPreference);
    document.addEventListener("visibilitychange", onPreference);
    return () => { stop(); unsubscribe(); document.removeEventListener("visibilitychange", onPreference); };
  }, [active, opened]);

  const close = () => panelMotion.current ? panelMotion.current.close() : dialog.current?.close();

  function open(index: number, button: HTMLButtonElement) {
    opener.current = button;
    setActive(index); setExpanded(false);
    if (panelMotion.current) panelMotion.current.open(); else dialog.current?.showModal();
    setOpened(true);
  }
  function move(delta: number) {
    setActive(index => (index + delta + publicItems.length) % publicItems.length);
    setExpanded(false);
  }
  function keydown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "ArrowRight" && publicItems.length > 1) { event.preventDefault(); move(1); }
    if (event.key === "ArrowLeft" && publicItems.length > 1) { event.preventDefault(); move(-1); }
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
  if (!current) return null;
  const currentDimensions = getMediaDimensions(current);
  return <div className={`media-gallery${compact ? " media-gallery--compact" : ""}`} data-gallery={label}>
    <div className="media-gallery-grid">{publicItems.map((media, index) => {
      const dimensions = getMediaDimensions(media);
      const portrait = dimensions.height > dimensions.width;
      return <figure key={media.id} data-media-orientation={portrait ? "portrait" : "landscape"}>
      <button className="media-open" type="button" onClick={event => open(index, event.currentTarget)} aria-haspopup="dialog" aria-controls={id} aria-label={`Perbesar gambar: ${media.alt}`}>
        <span className="media-frame" style={portrait ? { aspectRatio: dimensions.width / dimensions.height } : undefined}><MediaImage media={media} sizes={sizes ?? "(max-width: 767px) 100vw, 80vw"}/></span>
        <span className="media-enlarge" aria-hidden="true"><ZoomIn size={18}/></span>
      </button><figcaption>{media.caption}</figcaption>
    </figure>; })}</div>
    <dialog ref={dialog} id={id} className="media-dialog" data-media-orientation={currentDimensions.height > currentDimensions.width ? "portrait" : "landscape"} aria-labelledby={`${id}-heading`} aria-describedby={`${id}-caption`} onKeyDown={keydown} onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }} onClose={() => { setOpened(false); setExpanded(false); opener.current?.focus({ preventScroll: true }); }}>
      <div className="media-dialog-content"><header className="media-dialog-top"><h2 id={`${id}-heading`}>{label}</h2><div className="dialog-actions">
        <button type="button" className="icon-button" onClick={() => setExpanded(value => !value)} aria-label={expanded ? "Sesuaikan gambar ke layar" : "Perbesar tampilan gambar"} aria-pressed={expanded}>{expanded ? <Minimize2 size={20}/> : <Maximize2 size={20}/>}</button>
        <button type="button" className="icon-button" onClick={close} aria-label="Tutup penampil gambar"><X/></button>
      </div></header>
      <div ref={imageFrame} className="media-dialog-image" data-expanded={expanded}><MediaImage key={current.id} media={current} sizes="100vw"/></div>
      <footer className="media-dialog-footer"><p id={`${id}-caption`}>{current.caption}</p>{publicItems.length > 1 && <nav aria-label="Navigasi gambar"><button type="button" className="icon-button" onClick={() => move(-1)} aria-label="Gambar sebelumnya"><ArrowLeft/></button><span className="meta" role="status">{active + 1} / {publicItems.length}</span><button type="button" className="icon-button" onClick={() => move(1)} aria-label="Gambar berikutnya"><ArrowRight/></button></nav>}</footer>
      </div>
    </dialog>
  </div>;
}
